-- Phase 1: academies + academy_id columns (nullable)
-- 이미 SQL Editor에서 실행했다면 재실행해도 안전 (IF NOT EXISTS)

create extension if not exists pgcrypto;

create table if not exists public.academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text,
  secondary_color text,
  phone text,
  address text,
  description text,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'inactive')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.courses
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.classes
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.vocab_folders
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.vocab_sets
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.listening_set_folders
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.listening_sets
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.english_source_passages
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.english_question_sets
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.question_generation_presets
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.listening_schedule_assignments
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.shared_reports
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.shared_student_records
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.student_record_analyses
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

create index if not exists profiles_academy_id_idx on public.profiles(academy_id);
create index if not exists courses_academy_id_idx on public.courses(academy_id);
create index if not exists classes_academy_id_idx on public.classes(academy_id);
create index if not exists vocab_folders_academy_id_idx on public.vocab_folders(academy_id);
create index if not exists vocab_sets_academy_id_idx on public.vocab_sets(academy_id);
create index if not exists listening_set_folders_academy_id_idx on public.listening_set_folders(academy_id);
create index if not exists listening_sets_academy_id_idx on public.listening_sets(academy_id);
create index if not exists english_source_passages_academy_id_idx on public.english_source_passages(academy_id);
create index if not exists english_question_sets_academy_id_idx on public.english_question_sets(academy_id);
create index if not exists question_generation_presets_academy_id_idx on public.question_generation_presets(academy_id);
create index if not exists listening_schedule_assignments_academy_id_idx on public.listening_schedule_assignments(academy_id);
create index if not exists shared_reports_academy_id_idx on public.shared_reports(academy_id);
create index if not exists shared_student_records_academy_id_idx on public.shared_student_records(academy_id);
create index if not exists student_record_analyses_academy_id_idx on public.student_record_analyses(academy_id);
