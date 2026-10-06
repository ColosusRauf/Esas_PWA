-- Item ke-10 ESAS ("Lainnya"): pasien menuliskan nama gejalanya. Jalankan SETELAH 06_security.sql.
alter table public.assessments add column if not exists other_symptom text;
alter table public.assessments drop constraint if exists assessments_other_symptom_len;
alter table public.assessments add constraint assessments_other_symptom_len
  check (other_symptom is null or char_length(other_symptom) between 1 and 60);
