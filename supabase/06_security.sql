-- A1 (ganti password oleh pasien) + D5 (ukuran database). Jalankan SETELAH 05_consent_push.sql.
alter table public.patients add column if not exists must_change_password boolean not null default false;

create or replace function public.esas_change_password(pid text, old_pw text, new_pw text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  update patients set password_hash = crypt(new_pw, gen_salt('bf')), must_change_password = false
   where id = pid and password_hash = crypt(old_pw, password_hash);
  return found;
end $$;

-- akun baru / reset oleh admin => wajib ganti password saat login pertama
create or replace function public.esas_create_patient(pid text, pw text, pname text, pbirth date, psex text)
returns void language sql security definer set search_path = public, extensions as $$
  insert into patients(id, password_hash, name, birth_date, sex, must_change_password)
  values (pid, crypt(pw, gen_salt('bf')), pname, pbirth, psex, true);
$$;

create or replace function public.esas_reset_password(pid text, pw text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  update patients set password_hash = crypt(pw, gen_salt('bf')), must_change_password = true where id = pid;
  return found;
end $$;

create or replace function public.esas_db_size()
returns bigint language sql security definer set search_path = public as $$
  select pg_database_size(current_database());
$$;

revoke all on function public.esas_change_password(text, text, text) from public, anon, authenticated;
revoke all on function public.esas_db_size() from public, anon, authenticated;
grant execute on function public.esas_change_password(text, text, text) to service_role;
grant execute on function public.esas_db_size() to service_role;
grant execute on function public.esas_create_patient(text, text, text, date, text) to service_role;
grant execute on function public.esas_reset_password(text, text) to service_role;
