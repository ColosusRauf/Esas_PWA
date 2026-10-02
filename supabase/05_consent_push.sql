-- Jalankan SETELAH 04_grants.sql.
-- 1) Catatan persetujuan pasien (A4)
alter table public.patients add column if not exists consented_at timestamptz;
alter table public.patients add column if not exists consent_version text;

-- 2) Langganan notifikasi pengingat harian (B2)
create table if not exists public.push_subscriptions (
  endpoint     text primary key,
  patient_id   text not null references public.patients(id) on delete cascade,
  p256dh       text not null,
  auth         text not null,
  created_at   timestamptz not null default now(),
  last_sent_at timestamptz
);
create index if not exists push_subscriptions_patient_idx on public.push_subscriptions(patient_id);
alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to service_role;
