-- Curriculum vocab banks: teachers view/assign, nobody deletes when locked
alter table public.vocab_sets
  add column if not exists is_locked boolean not null default false;

comment on column public.vocab_sets.is_locked is
  'true면 교사 수정·삭제 불가, 관리자 삭제도 불가. 배정·조회는 가능.';

create index if not exists vocab_sets_is_locked_idx
  on public.vocab_sets (is_locked)
  where is_locked = true;

-- Teachers may read own sets OR locked curriculum sets in their academy
create or replace function public.teacher_can_read_vocab_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vocab_sets s
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
create or replace function public.teacher_can_write_vocab_set(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.teacher_can_manage_vocab_set(set_uuid)
    and exists (
      select 1
      from public.vocab_sets s
      where s.id = set_uuid
        and coalesce(s.is_locked, false) = false
    );
$$;

-- Folders: own OR academy folder that contains locked curriculum sets
create or replace function public.teacher_can_read_vocab_folder(folder_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vocab_folders f
    join public.profiles p on p.id = auth.uid()
    where f.id = folder_uuid
      and (
        f.teacher_id = auth.uid()
        or f.created_by = auth.uid()
        or (
          f.academy_id is not null
          and p.academy_id is not null
          and f.academy_id = p.academy_id
          and exists (
            select 1
            from public.vocab_sets s
            where s.folder_id = f.id
              and s.is_locked = true
              and s.academy_id = f.academy_id
          )
        )
      )
  );
$$;

-- SELECT
drop policy if exists "Teachers select own vocab_sets" on public.vocab_sets;
create policy "Teachers select own vocab_sets"
  on public.vocab_sets for select
  using (public.is_teacher() and public.teacher_can_read_vocab_set(id));

-- UPDATE/DELETE: write helper (locked blocked)
drop policy if exists "Teachers update own vocab_sets" on public.vocab_sets;
create policy "Teachers update own vocab_sets"
  on public.vocab_sets for update
  using (public.is_teacher() and public.teacher_can_write_vocab_set(id))
  with check (
    public.is_teacher()
    and public.teacher_can_write_vocab_set(id)
    and (teacher_id is null or teacher_id = auth.uid())
  );

drop policy if exists "Teachers delete own vocab_sets" on public.vocab_sets;
create policy "Teachers delete own vocab_sets"
  on public.vocab_sets for delete
  using (public.is_teacher() and public.teacher_can_write_vocab_set(id));

-- Admin delete blocked when locked (service role bypasses RLS)
drop policy if exists "Admins delete vocab_sets" on public.vocab_sets;
create policy "Admins delete vocab_sets"
  on public.vocab_sets for delete
  using (
    public.admin_can_access_academy(academy_id)
    and coalesce(is_locked, false) = false
  );

-- Items: select via read, mutate via write
drop policy if exists "Teachers select vocab_items for own sets"
  on public.vocab_items;
create policy "Teachers select vocab_items for own sets"
  on public.vocab_items for select
  using (
    public.is_teacher()
    and public.teacher_can_read_vocab_set(set_id)
  );

drop policy if exists "Teachers insert vocab_items for own sets"
  on public.vocab_items;
create policy "Teachers insert vocab_items for own sets"
  on public.vocab_items for insert
  with check (
    public.is_teacher()
    and public.teacher_can_write_vocab_set(set_id)
  );

drop policy if exists "Teachers update vocab_items for own sets"
  on public.vocab_items;
create policy "Teachers update vocab_items for own sets"
  on public.vocab_items for update
  using (
    public.is_teacher()
    and public.teacher_can_write_vocab_set(set_id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_write_vocab_set(set_id)
  );

drop policy if exists "Teachers delete vocab_items for own sets"
  on public.vocab_items;
create policy "Teachers delete vocab_items for own sets"
  on public.vocab_items for delete
  using (
    public.is_teacher()
    and public.teacher_can_write_vocab_set(set_id)
  );

-- Assignments: teachers can assign locked curriculum sets they can read
drop policy if exists "Teachers select vocab_assignments for own sets"
  on public.vocab_assignments;
create policy "Teachers select vocab_assignments for own sets"
  on public.vocab_assignments for select
  using (
    public.is_teacher()
    and public.teacher_can_read_vocab_set(set_id)
  );

drop policy if exists "Teachers insert vocab_assignments for own sets"
  on public.vocab_assignments;
create policy "Teachers insert vocab_assignments for own sets"
  on public.vocab_assignments for insert
  with check (
    public.is_teacher()
    and public.teacher_can_read_vocab_set(set_id)
  );

drop policy if exists "Teachers delete vocab_assignments for own sets"
  on public.vocab_assignments;
create policy "Teachers delete vocab_assignments for own sets"
  on public.vocab_assignments for delete
  using (
    public.is_teacher()
    and public.teacher_can_read_vocab_set(set_id)
  );

-- Folders: teachers see curriculum folders with locked sets
drop policy if exists "Teachers select own vocab_folders" on public.vocab_folders;
create policy "Teachers select own vocab_folders"
  on public.vocab_folders for select
  using (public.is_teacher() and public.teacher_can_read_vocab_folder(id));
