# ESAS PWA

Alur: **Browser (PWA)** -> **Vercel** (`/api/*`) -> **n8n** (webhook) -> **Supabase Postgres**.
Browser tidak pernah bicara langsung ke n8n/database; rahasia hanya ada di env Vercel.

## 1. Database (Supabase, gratis)
1. supabase.com -> New project (region Singapore).
2. SQL Editor -> tempel isi `supabase/schema.sql` -> ganti password contoh P001 -> Run.

## 2. n8n (3 workflow)
Buat credential **Header Auth**: name `x-esas-secret`, value = `N8N_SECRET` (string acak).
Credential Postgres: Supabase > Connect > **Session pooler** (host IPv4), user `postgres.xxxx`, SSL on.

Setiap workflow: **Webhook** (POST, Authentication: Header Auth, Respond: *Using 'Respond to Webhook' Node*)
-> **Postgres** (Execute Query) -> **Respond to Webhook**. Aktifkan workflow (toggle Active) agar URL `/webhook/...` hidup.

| Path webhook | Query Postgres | Query Parameters | Respond JSON |
|---|---|---|---|
| `esas-login` | `select exists(select 1 from patients where id = $1 and password_hash = extensions.crypt($2, password_hash)) as ok` | `{{ $json.body.patientId }}, {{ $json.body.password }}` | `{{ { ok: $json.ok } }}` |
| `esas-assessments-list` | `select client_id as "clientId", created_at as "createdAt", answers from assessments where patient_id = $1 order by created_at` | `{{ $json.body.patientId }}` | lihat catatan |
| `esas-assessments-create` | `insert into assessments(patient_id, client_id, answers) values ($1, $2::uuid, string_to_array($3, '\|')::smallint[]) on conflict (client_id) do nothing` | `{{ $json.body.patientId }}, {{ $json.body.clientId }}, {{ $json.body.answers.join('\|') }}` | `{ "ok": true }` |

Catatan:
- Pada ketiga node Postgres aktifkan **Settings -> Always Output Data** (agar webhook tetap menjawab saat hasil kosong).
- `esas-assessments-list`: tambahkan node **Aggregate** (All Item Data -> field `items`) sebelum Respond, lalu Respond JSON `{{ { items: $json.items } }}`.
- Pada query create, `\|` di tabel hanyalah escape Markdown; tulis `'|'` biasa di n8n.
- Angka dipisah `|` (bukan koma) karena kolom Query Parameters n8n memecah nilai berdasarkan koma. Dengan alasan yang sama, jika password pasien mengandung koma, login via n8n bisa gagal; pakai password tanpa koma, atau gunakan `STORE=supabase`. Belum diuji pada instance n8n Anda: cek tiap workflow dengan tombol *Execute workflow* sebelum diaktifkan.

## 2b. Dashboard admin / peneliti
1. Supabase SQL Editor: jalankan `supabase/02_admin.sql` (setelah `schema.sql`). Ganti password akun `admin` contoh.
2. Tambah akun peneliti (hanya melihat Patient ID, tanpa nama/tgl lahir, tapi bisa analitik + ekspor):
```sql
insert into staff (username, password_hash, display_name, role)
values ('peneliti1', extensions.crypt('password-kuat-anda', extensions.gen_salt('bf')), 'Peneliti 1', 'researcher');
```
3. Login lewat tautan **"Masuk sebagai petugas / peneliti"** di halaman login. Admin menambah pasien dari menu **Pasien**
   (password awal dibuat acak dan hanya tampil sekali, berikan ke pasien).
4. Mode `STORE=n8n`: tambah 4 workflow (pola sama: Webhook -> Postgres -> Respond to Webhook, Always Output Data aktif):

| Path webhook | Query Postgres | Parameter | Respond JSON |
|---|---|---|---|
| `esas-staff-login` | `select display_name as name, role from staff where username = $1 and password_hash = extensions.crypt($2, password_hash)` | `{{ $json.body.username }}, {{ $json.body.password }}` | `{{ $json.role ? { ok: true, role: $json.role, name: $json.name } : { ok: false } }}` |
| `esas-admin-patients-list` | `select id, name, birth_date as "birthDate", sex, active from patients order by id` + node **Aggregate** | tanpa | `{{ { items: $json.items } }}` |
| `esas-admin-patients-create` | `insert into patients(id, name, birth_date, sex, password_hash) values ($1, $2, $3::date, $4, extensions.crypt($5, extensions.gen_salt('bf'))) on conflict (id) do nothing returning id` | `{{ $json.body.id }}, {{ $json.body.name }}, {{ $json.body.birthDate }}, {{ $json.body.sex }}, {{ $json.body.password }}` | `{{ { created: !!$json.id } }}` |
| `esas-admin-assessments` | `select client_id as "clientId", patient_id as "patientId", created_at as "createdAt", answers from assessments order by created_at` + node **Aggregate** | tanpa | `{{ { items: $json.items } }}` |

Catatan: nama pasien yang mengandung koma (mis. "Budi, S.Kom") bisa merusak pemisahan parameter di n8n. Jika itu terjadi, isi
Query Parameters dengan ekspresi array, misalnya `{{ [ $json.body.id, $json.body.name, ... ] }}` (cek versi n8n Anda),
atau pakai `STORE=supabase` yang tidak punya masalah ini.

Batasan yang perlu diketahui:
- Semua data dimuat ke browser admin lalu dihitung di sana. Nyaman untuk skala penelitian (ratusan pasien, puluhan ribu assessment);
  untuk skala lebih besar, agregasi perlu dipindah ke SQL.
- "Perlu perhatian" = assessment terakhir (14 hari) yang punya gejala bernilai > 6. Ambang ini mengikuti pita "berat" di aplikasi,
  bukan aturan klinis baku; sesuaikan dengan protokol tim Anda.
- Belum ada: hapus pasien, pembuatan/penghapusan akun petugas dari aplikasi (sementara lewat SQL), dan batas percobaan login.

## 2c. Kelola pasien dan log aktivitas
1. Supabase SQL Editor: jalankan `supabase/03_manage.sql` (setelah `02_admin.sql`). Ini membuat tabel `activity_logs`,
   fungsi reset password, dan membuat pasien nonaktif tidak bisa login.
2. Menu baru: di halaman detail pasien (admin) ada **Edit data**, **Reset password**, **Nonaktifkan/Aktifkan**.
   Menu **Log aktivitas** (khusus admin) mencatat: masuk, assessment dikirim, pasien ditambah/diubah, status diubah, password direset, ekspor CSV.
   Password tidak pernah dicatat. Login yang gagal tidak dicatat (agar tabel log tidak bisa dibanjiri dari luar).
3. Pasien yang dinonaktifkan: tidak bisa login, dan token lama langsung ditolak. Data lama tetap ada dan tetap masuk analitik.
4. Mode `STORE=n8n`: ubah 2 workflow lama dan tambah 5 workflow baru.

Ubah yang lama:
- `esas-login`: tambahkan `and active` pada query (`... where id = $1 and active and password_hash = ...`).
- `esas-assessments-create`: akhiri query dengan `... on conflict (client_id) do nothing returning client_id`, lalu Respond JSON
  `{{ { created: !!$json.client_id } }}` (Always Output Data aktif). Tanpa ini, kiriman ganda tetap aman tetapi dicatat dua kali di log.

Workflow baru (pola sama: Webhook -> Postgres -> Respond to Webhook):

| Path webhook | Query Postgres | Parameter | Respond JSON |
|---|---|---|---|
| `esas-patient-active` | `select active from patients where id = $1` | `{{ $json.body.patientId }}` | `{{ { active: $json.active === true } }}` |
| `esas-admin-patients-update` | `update patients set name = coalesce($2, name), birth_date = coalesce($3::date, birth_date), sex = coalesce($4, sex), active = coalesce($5::boolean, active) where id = $1 returning id` | `{{ [ $json.body.id, $json.body.name, $json.body.birthDate, $json.body.sex, $json.body.active ] }}` | `{{ { updated: !!$json.id } }}` |
| `esas-admin-reset-password` | `update patients set password_hash = extensions.crypt($2, extensions.gen_salt('bf')) where id = $1 returning id` | `{{ [ $json.body.id, $json.body.password ] }}` | `{{ { updated: !!$json.id } }}` |
| `esas-log` | `insert into activity_logs(actor, actor_role, action, target, detail) values ($1, $2, $3, $4, $5)` | `{{ [ $json.body.actor, $json.body.role, $json.body.action, $json.body.target, $json.body.detail ] }}` | `{ "ok": true }` |
| `esas-admin-logs` | `select id, at, actor, actor_role as role, action, target, detail from activity_logs order by at desc limit 500` + node **Aggregate** | tanpa | `{{ { items: $json.items } }}` |

Catatan: untuk query dengan parameter opsional (kolom yang tidak diubah dikirim `null`) gunakan bentuk **array** seperti di atas,
bukan daftar dipisah koma. Bentuk array bergantung pada versi n8n Anda, jadi uji tiap workflow dengan *Execute workflow*
sebelum diaktifkan. Jika bermasalah, `STORE=supabase` tidak punya batasan ini.

## 2d. Izin database (wajib)
Jalankan `supabase/04_grants.sql` setelah `03_manage.sql`. Tanpa ini login gagal dengan error 403 dari Supabase,
karena kunci server belum punya izin ke fungsi dan tabel.

## 3. GitHub -> Vercel
```
git init && git add . && git commit -m "ESAS PWA"
git branch -M main && git remote add origin <url-repo-anda> && git push -u origin main
```
Vercel -> Add New Project -> import repo (framework Vite terdeteksi otomatis).
Environment Variables (lihat `.env.example`): `SESSION_SECRET`, `STORE=n8n`, `N8N_BASE_URL`, `N8N_SECRET` -> Deploy.
Jangan pernah commit `.env`.

## 4. Uji lokal
`npm i -g vercel` lalu `vercel dev` (menjalankan frontend dan `/api` bersamaan; `npm run dev` saja tidak menjalankan `/api`).

## Alternatif lebih murah/sederhana: tanpa n8n
Set `STORE=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Langkah 2 dilewati.
Anda bisa pindah ke n8n kapan saja hanya dengan mengubah `STORE`.
