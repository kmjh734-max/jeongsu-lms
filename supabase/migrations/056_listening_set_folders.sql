-- =============================================================================
-- 듣기 세트 폴더 (listening_set_folders)
--
-- 다른 사이트에 동일 구성을 이식할 때 이 migration 파일만 적용하면 됩니다.
-- - listening_set_folders: 폴더 트리 (parent_id 로 하위 폴더 가능)
-- - listening_sets.folder_id: 세트가 속한 폴더 (null = 미분류)
-- =============================================================================

create table public.listening_set_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  parent_id uuid references public.listening_set_folders(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listening_set_folders_name_check check (char_length(trim(name)) > 0)
);

create index listening_set_folders_teacher_id_idx
  on public.listening_set_folders(teacher_id);

create index listening_set_folders_parent_id_idx
  on public.listening_set_folders(parent_id);

create index listening_set_folders_order_idx
  on public.listening_set_folders(parent_id, order_index, name);

alter table public.listening_sets
  add column if not exists folder_id uuid
    references public.listening_set_folders(id) on delete set null;

create index listening_sets_folder_id_idx
  on public.listening_sets(folder_id);

comment on table public.listening_set_folders is
  '듣기 세트 분류 폴더. 다른 LMS 이식 시 056 migration 과 함께 사용.';

comment on column public.listening_sets.folder_id is
  '소속 폴더. null 이면 미분류.';

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.teacher_can_manage_listening_folder(folder_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listening_set_folders
    where id = folder_uuid
      and (teacher_id = auth.uid() or created_by = auth.uid())
  );
$$;

alter table public.listening_set_folders enable row level security;

create policy "Admins select listening_set_folders"
  on public.listening_set_folders for select
  using (public.is_admin());

create policy "Admins insert listening_set_folders"
  on public.listening_set_folders for insert
  with check (public.is_admin());

create policy "Admins update listening_set_folders"
  on public.listening_set_folders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete listening_set_folders"
  on public.listening_set_folders for delete
  using (public.is_admin());

create policy "Teachers select own listening_set_folders"
  on public.listening_set_folders for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_folder(id)
  );

create policy "Teachers insert listening_set_folders"
  on public.listening_set_folders for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
    and (teacher_id is null or teacher_id = auth.uid())
  );

create policy "Teachers update own listening_set_folders"
  on public.listening_set_folders for update
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_folder(id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_manage_listening_folder(id)
    and (teacher_id is null or teacher_id = auth.uid())
  );

create policy "Teachers delete own listening_set_folders"
  on public.listening_set_folders for delete
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_folder(id)
  );
