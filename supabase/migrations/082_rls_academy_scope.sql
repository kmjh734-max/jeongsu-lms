-- Multi-tenant RLS Phase 1
-- - academies 테이블 RLS
-- - Tier1 테이블 admin 정책을 academy_id 경계로 교체
-- - profiles admin 조회/수정도 같은 학원만
-- teacher/student 기존 ownership 정책은 유지 (이미 본인 기준)

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_academy_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- super_admin: 전체 / academy_admin: 자기 academy만
create or replace function public.admin_can_access_academy(target_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and target_academy_id is not null
      and target_academy_id = public.current_user_academy_id()
    );
$$;

-- 로그인 사용자가 해당 학원에 속하는지 (teacher/student용, 선택적 강화)
create or replace function public.belongs_to_academy(target_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      target_academy_id is not null
      and target_academy_id = public.current_user_academy_id()
    );
$$;

-- ---------------------------------------------------------------------------
-- academies RLS
-- ---------------------------------------------------------------------------
alter table public.academies enable row level security;

drop policy if exists "Super admins manage academies" on public.academies;
create policy "Super admins manage academies"
  on public.academies for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Members read own academy" on public.academies;
create policy "Members read own academy"
  on public.academies for select
  using (
    public.is_super_admin()
    or id = public.current_user_academy_id()
  );

-- ---------------------------------------------------------------------------
-- profiles: admin은 같은 학원만 (super_admin은 전체)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read academy profiles"
  on public.profiles for select
  using (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and academy_id is not null
      and academy_id = public.current_user_academy_id()
    )
  );

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update academy profiles"
  on public.profiles for update
  using (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and academy_id is not null
      and academy_id = public.current_user_academy_id()
    )
  )
  with check (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and academy_id is not null
      and academy_id = public.current_user_academy_id()
    )
  );

-- 학원 관리자가 같은 학원 계정 생성
drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert academy profiles"
  on public.profiles for insert
  with check (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and academy_id is not null
      and academy_id = public.current_user_academy_id()
    )
  );

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
drop policy if exists "Admins full access courses" on public.courses;
create policy "Admins full access courses"
  on public.courses for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

-- ---------------------------------------------------------------------------
-- classes
-- ---------------------------------------------------------------------------
drop policy if exists "Admins select classes" on public.classes;
drop policy if exists "Admins insert classes" on public.classes;
drop policy if exists "Admins update classes" on public.classes;
drop policy if exists "Admins delete classes" on public.classes;

create policy "Admins select classes"
  on public.classes for select
  using (public.admin_can_access_academy(academy_id));

create policy "Admins insert classes"
  on public.classes for insert
  with check (public.admin_can_access_academy(academy_id));

create policy "Admins update classes"
  on public.classes for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

create policy "Admins delete classes"
  on public.classes for delete
  using (public.admin_can_access_academy(academy_id));

-- ---------------------------------------------------------------------------
-- vocab_folders / vocab_sets
-- ---------------------------------------------------------------------------
drop policy if exists "Admins select vocab_folders" on public.vocab_folders;
drop policy if exists "Admins insert vocab_folders" on public.vocab_folders;
drop policy if exists "Admins update vocab_folders" on public.vocab_folders;
drop policy if exists "Admins delete vocab_folders" on public.vocab_folders;

create policy "Admins select vocab_folders"
  on public.vocab_folders for select
  using (public.admin_can_access_academy(academy_id));
create policy "Admins insert vocab_folders"
  on public.vocab_folders for insert
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins update vocab_folders"
  on public.vocab_folders for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins delete vocab_folders"
  on public.vocab_folders for delete
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins select vocab_sets" on public.vocab_sets;
drop policy if exists "Admins insert vocab_sets" on public.vocab_sets;
drop policy if exists "Admins update vocab_sets" on public.vocab_sets;
drop policy if exists "Admins delete vocab_sets" on public.vocab_sets;
drop policy if exists "Admins full access vocab_sets" on public.vocab_sets;

create policy "Admins select vocab_sets"
  on public.vocab_sets for select
  using (public.admin_can_access_academy(academy_id));
create policy "Admins insert vocab_sets"
  on public.vocab_sets for insert
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins update vocab_sets"
  on public.vocab_sets for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins delete vocab_sets"
  on public.vocab_sets for delete
  using (public.admin_can_access_academy(academy_id));

-- ---------------------------------------------------------------------------
-- listening_set_folders / listening_sets
-- ---------------------------------------------------------------------------
drop policy if exists "Admins select listening_set_folders" on public.listening_set_folders;
drop policy if exists "Admins insert listening_set_folders" on public.listening_set_folders;
drop policy if exists "Admins update listening_set_folders" on public.listening_set_folders;
drop policy if exists "Admins delete listening_set_folders" on public.listening_set_folders;
drop policy if exists "Admins full access listening_set_folders" on public.listening_set_folders;

create policy "Admins select listening_set_folders"
  on public.listening_set_folders for select
  using (public.admin_can_access_academy(academy_id));
create policy "Admins insert listening_set_folders"
  on public.listening_set_folders for insert
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins update listening_set_folders"
  on public.listening_set_folders for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins delete listening_set_folders"
  on public.listening_set_folders for delete
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins select listening_sets" on public.listening_sets;
drop policy if exists "Admins insert listening_sets" on public.listening_sets;
drop policy if exists "Admins update listening_sets" on public.listening_sets;
drop policy if exists "Admins delete listening_sets" on public.listening_sets;
drop policy if exists "Admins full access listening_sets" on public.listening_sets;

create policy "Admins select listening_sets"
  on public.listening_sets for select
  using (public.admin_can_access_academy(academy_id));
create policy "Admins insert listening_sets"
  on public.listening_sets for insert
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins update listening_sets"
  on public.listening_sets for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));
create policy "Admins delete listening_sets"
  on public.listening_sets for delete
  using (public.admin_can_access_academy(academy_id));

-- ---------------------------------------------------------------------------
-- QG roots (기존 정책명 교체 — is_admin() 단독 정책이 남으면 academy 경계가 무력화됨)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins manage english passages" on public.english_source_passages;
create policy "Admins manage english passages"
  on public.english_source_passages for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins manage presets" on public.question_generation_presets;
create policy "Admins manage presets"
  on public.question_generation_presets for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

-- Staff read presets: admin은 academy 범위, teacher는 기존처럼 전체 system/own
drop policy if exists "Staff read presets" on public.question_generation_presets;
create policy "Staff read presets"
  on public.question_generation_presets for select
  using (
    public.admin_can_access_academy(academy_id)
    or public.is_teacher()
  );

drop policy if exists "Admins manage question sets" on public.english_question_sets;
create policy "Admins manage question sets"
  on public.english_question_sets for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

-- ---------------------------------------------------------------------------
-- listening_schedule_assignments
-- ---------------------------------------------------------------------------
drop policy if exists "Admins academy schedule assignments" on public.listening_schedule_assignments;
create policy "Admins academy schedule assignments"
  on public.listening_schedule_assignments for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

-- ---------------------------------------------------------------------------
-- reports / analyses (service-role 위주지만 정책 보강)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins academy shared_reports" on public.shared_reports;
create policy "Admins academy shared_reports"
  on public.shared_reports for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins academy shared_student_records" on public.shared_student_records;
create policy "Admins academy shared_student_records"
  on public.shared_student_records for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins academy student_record_analyses" on public.student_record_analyses;
create policy "Admins academy student_record_analyses"
  on public.student_record_analyses for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));
