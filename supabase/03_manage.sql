-- Jalankan SETELAH 02_admin.sql

-- Pasien nonaktif tidak bisa login
create or replace function public.esas_login(pid text, pw text)
returns boolean
language sql security definer set search_path = public, extensions
as $$
  select exists (select 1 from patients where id = pid and active and password_hash = crypt(pw, password_hash));
$$;
revoke all on function public.esas_login(text, text) from public, anon, authenticated;

-- Reset password pasien (hash dibuat di database)
create or replace function public.esas_reset_password(pid text, pw text)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
begin
  update patients set password_hash = crypt(pw, gen_salt('bf')) where id = pid;
  return found;
end;
$$;
revoke all on function public.esas_reset_password(text, text) from public, anon, authenticated;

-- Log aktivitas (tidak pernah memuat password)
create table if not exists public.activity_logs (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  actor      text not null,
  actor_role text not null,
  action     text not null,
  target     text,
  detail     text
);
create index if not exists activity_logs_at_idx on public.activity_logs (at desc);
alter table public.activity_logs enable row level security;
