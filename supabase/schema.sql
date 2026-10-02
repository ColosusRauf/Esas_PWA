-- Jalankan di Supabase: SQL Editor -> New query -> Run
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.patients (
  id            text primary key,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.assessments (
  id          bigserial primary key,
  patient_id  text not null references public.patients(id) on delete cascade,
  client_id   uuid not null unique,          -- mencegah data ganda saat kirim ulang (offline)
  answers     smallint[] not null check (array_length(answers, 1) = 10),
  created_at  timestamptz not null default now()
);
create index if not exists assessments_patient_idx on public.assessments (patient_id, created_at);

-- Kunci tabel dari akses langsung browser (anon key). Hanya server (service role / n8n) yang boleh.
alter table public.patients    enable row level security;
alter table public.assessments enable row level security;

create or replace function public.esas_login(pid text, pw text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (select 1 from patients where id = pid and password_hash = crypt(pw, password_hash));
$$;
revoke all on function public.esas_login(text, text) from public, anon, authenticated;

-- Contoh akun. GANTI password sebelum dipakai. Petugas membuat akun pasien dengan pola yang sama.
insert into public.patients (id, password_hash)
values ('P001', extensions.crypt('ganti-password-ini', extensions.gen_salt('bf')))
on conflict (id) do nothing;
