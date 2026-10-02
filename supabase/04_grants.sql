-- Jalankan SETELAH 03_manage.sql.
-- Supabase tidak lagi memberi izin otomatis ke objek baru, sehingga kunci server (service_role)
-- ditolak dengan 403 sampai izin ini diberikan. anon/authenticated sengaja TIDAK diberi akses.
grant execute on function public.esas_login(text, text) to service_role;
grant execute on function public.esas_staff_login(text, text) to service_role;
grant execute on function public.esas_create_patient(text, text, text, date, text) to service_role;
grant execute on function public.esas_reset_password(text, text) to service_role;

grant select, insert, update on public.patients to service_role;
grant select, insert on public.assessments to service_role;
grant select on public.staff to service_role;
grant select, insert on public.activity_logs to service_role;

grant usage on sequence public.assessments_id_seq to service_role;
grant usage on sequence public.activity_logs_id_seq to service_role;
