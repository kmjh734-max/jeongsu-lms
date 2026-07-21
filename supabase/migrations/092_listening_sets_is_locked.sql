-- Curriculum listening banks: teachers view/assign, admins edit
alter table public.listening_sets
  add column if not exists is_locked boolean not null default false;

comment on column public.listening_sets.is_locked is
  'true면 교사 수정·삭제·재생성 불가. 학원 관리자(admin)만 편집 가능.';

create index if not exists listening_sets_is_locked_idx
  on public.listening_sets (is_locked)
  where is_locked = true;

-- Teachers may read own sets OR locked curriculum sets in their academy
create or replace function public.teacher_can_read_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listening_sets s
    join public.profiles p on p.id = auth.uid()
    where s.id = set_uuid
      and (
        s.teacher_id = auth.uid()
        or s.created_by = auth.uid()
        or (
          s.is_locked = true
          and s.academy_id is not null
          and p.academy_id is not null
          and s.academy_id = p.academy_id
        )
      )
  );
$$;

-- Teachers may write only unlocked sets they own/created
create or replace function public.teacher_can_write_listening_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.teacher_can_manage_listening_set(set_uuid)
    and exists (
      select 1
      from public.listening_sets s
      where s.id = set_uuid
        and coalesce(s.is_locked, false) = false
    );
$$;

-- SELECT: read helper
drop policy if exists "Teachers select own listening_sets" on public.listening_sets;
create policy "Teachers select own listening_sets"
  on public.listening_sets for select
  using (public.is_teacher() and public.teacher_can_read_listening_set(id));

-- UPDATE/DELETE: write helper (locked blocked)
drop policy if exists "Teachers update own listening_sets" on public.listening_sets;
create policy "Teachers update own listening_sets"
  on public.listening_sets for update
  using (public.is_teacher() and public.teacher_can_write_listening_set(id))
  with check (
    public.is_teacher()
    and public.teacher_can_write_listening_set(id)
    and (teacher_id is null or teacher_id = auth.uid())
  );

drop policy if exists "Teachers delete own listening_sets" on public.listening_sets;
create policy "Teachers delete own listening_sets"
  on public.listening_sets for delete
  using (public.is_teacher() and public.teacher_can_write_listening_set(id));

-- Questions: select via read, mutate via write
drop policy if exists "Teachers select listening_questions for own sets"
  on public.listening_questions;
create policy "Teachers select listening_questions for own sets"
  on public.listening_questions for select
  using (
    public.is_teacher()
    and public.teacher_can_read_listening_set(set_id)
  );

drop policy if exists "Teachers insert listening_questions for own sets"
  on public.listening_questions;
create policy "Teachers insert listening_questions for own sets"
  on public.listening_questions for insert
  with check (
    public.is_teacher()
    and public.teacher_can_write_listening_set(set_id)
  );

drop policy if exists "Teachers update listening_questions for own sets"
  on public.listening_questions;
create policy "Teachers update listening_questions for own sets"
  on public.listening_questions for update
  using (
    public.is_teacher()
    and public.teacher_can_write_listening_set(set_id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_write_listening_set(set_id)
  );

drop policy if exists "Teachers delete listening_questions for own sets"
  on public.listening_questions;
create policy "Teachers delete listening_questions for own sets"
  on public.listening_questions for delete
  using (
    public.is_teacher()
    and public.teacher_can_write_listening_set(set_id)
  );

-- Assignments: teachers can assign locked curriculum sets they can read
drop policy if exists "Teachers insert listening_assignments for own sets"
  on public.listening_assignments;
create policy "Teachers insert listening_assignments for own sets"
  on public.listening_assignments for insert
  with check (
    public.is_teacher()
    and public.teacher_can_read_listening_set(set_id)
  );

drop policy if exists "Teachers select listening_assignments for own sets"
  on public.listening_assignments;
create policy "Teachers select listening_assignments for own sets"
  on public.listening_assignments for select
  using (
    public.is_teacher()
    and public.teacher_can_read_listening_set(set_id)
  );

drop policy if exists "Teachers delete listening_assignments for own sets"
  on public.listening_assignments;
create policy "Teachers delete listening_assignments for own sets"
  on public.listening_assignments for delete
  using (
    public.is_teacher()
    and public.teacher_can_read_listening_set(set_id)
  );
