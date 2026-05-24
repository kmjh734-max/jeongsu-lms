-- Fix infinite recursion: listening_sets <-> listening_assignments cross-references in RLS.
-- Pattern matches vocab_sets / vocab_assignments (012_add_vocab_learning.sql).

-- ---------------------------------------------------------------------------
-- Helpers (bypass RLS)
-- ---------------------------------------------------------------------------
create or replace function public.teacher_owns_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listening_sets
    where id = set_uuid and teacher_id = auth.uid()
  );
$$;

create or replace function public.teacher_created_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listening_sets
    where id = set_uuid and created_by = auth.uid()
  );
$$;

create or replace function public.teacher_can_manage_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.teacher_owns_listening_set(set_uuid)
    or public.teacher_created_listening_set(set_uuid);
$$;

create or replace function public.student_assigned_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listening_assignments la
    where la.set_id = set_uuid
      and (
        la.student_id = auth.uid()
        or exists (
          select 1
          from public.class_students cs
          where cs.class_id = la.class_id
            and cs.student_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.student_can_read_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listening_sets s
    where s.id = set_uuid and s.is_published = true
  )
  and public.student_assigned_listening_set(set_uuid);
$$;

create or replace function public.teacher_can_manage_listening_question(question_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listening_questions q
    where q.id = question_uuid
      and public.teacher_can_manage_listening_set(q.set_id)
  );
$$;

create or replace function public.student_can_read_listening_question(question_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listening_questions q
    where q.id = question_uuid
      and public.student_can_read_listening_set(q.set_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- Drop recursive policies (022)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins manage all listening sets" on public.listening_sets;
drop policy if exists "Teachers manage own listening sets" on public.listening_sets;
drop policy if exists "Students read published assigned listening sets" on public.listening_sets;

drop policy if exists "Admins manage listening questions" on public.listening_questions;
drop policy if exists "Teachers manage listening questions for own sets" on public.listening_questions;
drop policy if exists "Students read listening questions for assigned sets" on public.listening_questions;

drop policy if exists "Admins manage listening segments" on public.listening_question_segments;
drop policy if exists "Teachers manage listening segments for own sets" on public.listening_question_segments;
drop policy if exists "Students read listening segments for assigned sets" on public.listening_question_segments;

drop policy if exists "Admins manage listening assignments" on public.listening_assignments;
drop policy if exists "Teachers manage listening assignments for own sets" on public.listening_assignments;
drop policy if exists "Students read own listening assignments" on public.listening_assignments;

-- ---------------------------------------------------------------------------
-- listening_sets
-- ---------------------------------------------------------------------------
create policy "Admins select listening_sets"
  on public.listening_sets for select using (public.is_admin());

create policy "Admins insert listening_sets"
  on public.listening_sets for insert with check (public.is_admin());

create policy "Admins update listening_sets"
  on public.listening_sets for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete listening_sets"
  on public.listening_sets for delete using (public.is_admin());

create policy "Teachers select own listening_sets"
  on public.listening_sets for select
  using (public.is_teacher() and public.teacher_can_manage_listening_set(id));

create policy "Teachers insert listening_sets"
  on public.listening_sets for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
    and (teacher_id is null or teacher_id = auth.uid())
  );

create policy "Teachers update own listening_sets"
  on public.listening_sets for update
  using (public.is_teacher() and public.teacher_can_manage_listening_set(id))
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(id)
    and (teacher_id is null or teacher_id = auth.uid())
  );

create policy "Teachers delete own listening_sets"
  on public.listening_sets for delete
  using (public.is_teacher() and public.teacher_can_manage_listening_set(id));

create policy "Students select assigned published listening_sets"
  on public.listening_sets for select
  using (
    public.is_student()
    and public.student_can_read_listening_set(id)
  );

-- ---------------------------------------------------------------------------
-- listening_questions
-- ---------------------------------------------------------------------------
create policy "Admins select listening_questions"
  on public.listening_questions for select using (public.is_admin());

create policy "Admins insert listening_questions"
  on public.listening_questions for insert with check (public.is_admin());

create policy "Admins update listening_questions"
  on public.listening_questions for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete listening_questions"
  on public.listening_questions for delete using (public.is_admin());

create policy "Teachers select listening_questions for own sets"
  on public.listening_questions for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

create policy "Teachers insert listening_questions for own sets"
  on public.listening_questions for insert
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

create policy "Teachers update listening_questions for own sets"
  on public.listening_questions for update
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

create policy "Teachers delete listening_questions for own sets"
  on public.listening_questions for delete
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

create policy "Students select listening_questions for assigned sets"
  on public.listening_questions for select
  using (
    public.is_student()
    and public.student_can_read_listening_set(set_id)
  );

-- ---------------------------------------------------------------------------
-- listening_question_segments
-- ---------------------------------------------------------------------------
create policy "Admins select listening_question_segments"
  on public.listening_question_segments for select using (public.is_admin());

create policy "Admins insert listening_question_segments"
  on public.listening_question_segments for insert with check (public.is_admin());

create policy "Admins update listening_question_segments"
  on public.listening_question_segments for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete listening_question_segments"
  on public.listening_question_segments for delete using (public.is_admin());

create policy "Teachers select listening segments for own sets"
  on public.listening_question_segments for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_question(question_id)
  );

create policy "Teachers insert listening segments for own sets"
  on public.listening_question_segments for insert
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_question(question_id)
  );

create policy "Teachers update listening segments for own sets"
  on public.listening_question_segments for update
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_question(question_id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_question(question_id)
  );

create policy "Teachers delete listening segments for own sets"
  on public.listening_question_segments for delete
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_question(question_id)
  );

create policy "Students select listening segments for assigned sets"
  on public.listening_question_segments for select
  using (
    public.is_student()
    and public.student_can_read_listening_question(question_id)
  );

-- ---------------------------------------------------------------------------
-- listening_assignments
-- ---------------------------------------------------------------------------
create policy "Admins select listening_assignments"
  on public.listening_assignments for select using (public.is_admin());

create policy "Admins insert listening_assignments"
  on public.listening_assignments for insert with check (public.is_admin());

create policy "Admins update listening_assignments"
  on public.listening_assignments for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete listening_assignments"
  on public.listening_assignments for delete using (public.is_admin());

create policy "Teachers select listening_assignments for own sets"
  on public.listening_assignments for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

create policy "Teachers insert listening_assignments for own sets"
  on public.listening_assignments for insert
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
    and (
      (student_id is not null and public.teacher_can_assign_vocab_to_student(student_id))
      or (class_id is not null and public.teacher_owns_class(class_id))
    )
  );

create policy "Teachers delete listening_assignments for own sets"
  on public.listening_assignments for delete
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

create policy "Students select own listening_assignments"
  on public.listening_assignments for select
  using (
    public.is_student()
    and (
      student_id = auth.uid()
      or public.student_in_class(class_id)
    )
  );
