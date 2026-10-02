-- Jalankan SETELAH schema.sql (Supabase: SQL Editor -> New query -> Run)
alter table public.patients add column if not exists name       text;
alter table public.patients add column if not exists birth_date date;
alter table public.patients add column if not exists sex        text check (sex in ('L','P'));
alter table public.patients add column if not exists active     boolean not null default true;

create table if not exists public.staff (
  username      text primary key,
  password_hash text not null,
  display_name  text not null,
  role          text not null check (role in ('admin','researcher')),
  created_at    timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.esas_staff_login(uname text, pw text)
returns table(username text, display_name text, role text)
language sql security definer set search_path = public, extensions
as $$
  select s.username, s.display_name, s.role from staff s
  where s.username = uname and s.password_hash = crypt(pw, s.password_hash);
$$;
revoke all on function public.esas_staff_login(text, text) from public, anon, authenticated;

create or replace function public.esas_create_patient(pid text, pw text, pname text, pbirth date, psex text)
returns void
language sql security definer set search_path = public, extensions
as $$
  insert into patients(id, password_hash, name, birth_date, sex)
  values (pid, crypt(pw, gen_salt('bf')), pname, pbirth, psex);
$$;
revoke all on function public.esas_create_patient(text, text, text, date, text) from public, anon, authenticated;

-- Akun petugas contoh. GANTI password sebelum dipakai.
--   admin      : melihat nama pasien + boleh menambah pasien
--   researcher : hanya melihat Patient ID (tanpa nama/tanggal lahir) + analitik + ekspor
insert into public.staff (username, password_hash, display_name, role)
values ('admin', extensions.crypt('ganti-password-admin', extensions.gen_salt('bf')), 'Admin ESAS', 'admin')
on conflict (username) do nothing;
