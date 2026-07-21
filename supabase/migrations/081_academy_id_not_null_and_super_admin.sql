-- Phase 1 마무리:
-- 1) Tier1 테이블 academy_id NOT NULL (profiles 제외 — super_admin은 NULL 허용)
-- 2) profiles.role에 super_admin 추가
-- 3) is_admin()이 super_admin도 포함 (기존 admin RLS 정책과 호환)
-- 4) kmjh734@gmail.com → super_admin 지정

-- ---------------------------------------------------------------------------
-- role CHECK: super_admin 허용
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'teacher', 'student'));

-- ---------------------------------------------------------------------------
-- Tier1 NOT NULL (profiles 제외)
-- ---------------------------------------------------------------------------
alter table public.courses
  alter column academy_id set not null;

alter table public.classes
  alter column academy_id set not null;

alter table public.vocab_folders
  alter column academy_id set not null;

alter table public.vocab_sets
  alter column academy_id set not null;

alter table public.listening_set_folders
  alter column academy_id set not null;

alter table public.listening_sets
  alter column academy_id set not null;

alter table public.english_source_passages
  alter column academy_id set not null;

alter table public.english_question_sets
  alter column academy_id set not null;

alter table public.question_generation_presets
  alter column academy_id set not null;

alter table public.listening_schedule_assignments
  alter column academy_id set not null;

alter table public.shared_reports
  alter column academy_id set not null;

alter table public.shared_student_records
  alter column academy_id set not null;

alter table public.student_record_analyses
  alter column academy_id set not null;

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.current_user_academy_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select academy_id from public.profiles where id = auth.uid();
$$;

-- 기존 admin 정책이 그대로 동작하도록 super_admin도 is_admin()에 포함
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- super_admin bootstrap (이미 존재하는 계정만)
-- ---------------------------------------------------------------------------
update public.profiles
set
  role = 'super_admin',
  academy_id = null
where lower(email) = lower('kmjh734@gmail.com');

-- 계정이 없으면 안내 (Auth에서 먼저 가입 필요)
do $$
begin
  if not exists (
    select 1 from public.profiles
    where lower(email) = lower('kmjh734@gmail.com')
  ) then
    raise notice 'profiles에 kmjh734@gmail.com 이 없습니다. Authentication에서 계정을 만든 뒤 이 스크립트를 다시 실행하세요.';
  end if;
end $$;
