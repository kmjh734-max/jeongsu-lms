-- Lesson materials v2 (collection folder + projects + items)
-- For now: only supports saving passage items created from the input wizard.

begin;

create extension if not exists pgcrypto;

create table if not exists public.lesson_material_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  academy_id uuid not null references public.academies(id) on delete cascade,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_material_folders_academy_id_idx
  on public.lesson_material_folders(academy_id);
create index if not exists lesson_material_folders_teacher_id_idx
  on public.lesson_material_folders(teacher_id);
create index if not exists lesson_material_folders_created_by_idx
  on public.lesson_material_folders(created_by);

create table if not exists public.lesson_material_projects (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.lesson_material_folders(id) on delete set null,
  title text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  academy_id uuid not null references public.academies(id) on delete cascade,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_material_projects_academy_id_idx
  on public.lesson_material_projects(academy_id);
create index if not exists lesson_material_projects_folder_id_idx
  on public.lesson_material_projects(folder_id);
create index if not exists lesson_material_projects_updated_at_idx
  on public.lesson_material_projects(updated_at desc);

create table if not exists public.lesson_material_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.lesson_material_projects(id) on delete cascade,
  label text,
  title text not null,
  english_text text not null,
  korean_text text,
  order_index int not null default 0,
  academy_id uuid not null references public.academies(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_material_items_project_id_idx
  on public.lesson_material_items(project_id);
create index if not exists lesson_material_items_updated_at_idx
  on public.lesson_material_items(updated_at desc);

-- Helpers (RLS)
create or replace function public.teacher_owns_lesson_material_folder(folder_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lesson_material_folders
    where id = folder_uuid
      and (teacher_id = auth.uid() or created_by = auth.uid())
  );
$$;

create or replace function public.teacher_can_manage_lesson_material_folder(folder_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.teacher_owns_lesson_material_folder(folder_uuid);
$$;

create or replace function public.teacher_owns_lesson_material_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lesson_material_projects
    where id = project_uuid
      and (teacher_id = auth.uid() or created_by = auth.uid())
  );
$$;

create or replace function public.teacher_can_manage_lesson_material_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.teacher_owns_lesson_material_project(project_uuid);
$$;

-- RLS folders
alter table public.lesson_material_folders enable row level security;

drop policy if exists "Admins select lesson_material_folders" on public.lesson_material_folders;
create policy "Admins select lesson_material_folders"
  on public.lesson_material_folders for select
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins insert lesson_material_folders" on public.lesson_material_folders;
create policy "Admins insert lesson_material_folders"
  on public.lesson_material_folders for insert
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins update lesson_material_folders" on public.lesson_material_folders;
create policy "Admins update lesson_material_folders"
  on public.lesson_material_folders for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins delete lesson_material_folders" on public.lesson_material_folders;
create policy "Admins delete lesson_material_folders"
  on public.lesson_material_folders for delete
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Teachers select own lesson_material_folders" on public.lesson_material_folders;
create policy "Teachers select own lesson_material_folders"
  on public.lesson_material_folders for select
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_folder(id));

drop policy if exists "Teachers insert lesson_material_folders" on public.lesson_material_folders;
create policy "Teachers insert lesson_material_folders"
  on public.lesson_material_folders for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
    and (teacher_id is null or teacher_id = auth.uid())
    and academy_id is not null
  );

drop policy if exists "Teachers update own lesson_material_folders" on public.lesson_material_folders;
create policy "Teachers update own lesson_material_folders"
  on public.lesson_material_folders for update
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_folder(id))
  with check (public.is_teacher() and public.teacher_can_manage_lesson_material_folder(id));

drop policy if exists "Teachers delete own lesson_material_folders" on public.lesson_material_folders;
create policy "Teachers delete own lesson_material_folders"
  on public.lesson_material_folders for delete
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_folder(id));

-- RLS projects
alter table public.lesson_material_projects enable row level security;

drop policy if exists "Admins select lesson_material_projects" on public.lesson_material_projects;
create policy "Admins select lesson_material_projects"
  on public.lesson_material_projects for select
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins insert lesson_material_projects" on public.lesson_material_projects;
create policy "Admins insert lesson_material_projects"
  on public.lesson_material_projects for insert
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins update lesson_material_projects" on public.lesson_material_projects;
create policy "Admins update lesson_material_projects"
  on public.lesson_material_projects for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins delete lesson_material_projects" on public.lesson_material_projects;
create policy "Admins delete lesson_material_projects"
  on public.lesson_material_projects for delete
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Teachers select own lesson_material_projects" on public.lesson_material_projects;
create policy "Teachers select own lesson_material_projects"
  on public.lesson_material_projects for select
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_project(id));

drop policy if exists "Teachers insert lesson_material_projects" on public.lesson_material_projects;
create policy "Teachers insert lesson_material_projects"
  on public.lesson_material_projects for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
    and (teacher_id is null or teacher_id = auth.uid())
    and academy_id is not null
    and (
      folder_id is null
      or public.teacher_can_manage_lesson_material_folder(folder_id)
    )
  );

drop policy if exists "Teachers update own lesson_material_projects" on public.lesson_material_projects;
create policy "Teachers update own lesson_material_projects"
  on public.lesson_material_projects for update
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_project(id))
  with check (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(id)
    and (
      folder_id is null
      or public.teacher_can_manage_lesson_material_folder(folder_id)
    )
  );

drop policy if exists "Teachers delete own lesson_material_projects" on public.lesson_material_projects;
create policy "Teachers delete own lesson_material_projects"
  on public.lesson_material_projects for delete
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_project(id));

-- RLS items
alter table public.lesson_material_items enable row level security;

drop policy if exists "Admins select lesson_material_items" on public.lesson_material_items;
create policy "Admins select lesson_material_items"
  on public.lesson_material_items for select
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins insert lesson_material_items" on public.lesson_material_items;
create policy "Admins insert lesson_material_items"
  on public.lesson_material_items for insert
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins update lesson_material_items" on public.lesson_material_items;
create policy "Admins update lesson_material_items"
  on public.lesson_material_items for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins delete lesson_material_items" on public.lesson_material_items;
create policy "Admins delete lesson_material_items"
  on public.lesson_material_items for delete
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Teachers select own lesson_material_items" on public.lesson_material_items;
create policy "Teachers select own lesson_material_items"
  on public.lesson_material_items for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(project_id)
  );

drop policy if exists "Teachers insert lesson_material_items" on public.lesson_material_items;
create policy "Teachers insert lesson_material_items"
  on public.lesson_material_items for insert
  with check (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(project_id)
    and academy_id is not null
  );

drop policy if exists "Teachers update own lesson_material_items" on public.lesson_material_items;
create policy "Teachers update own lesson_material_items"
  on public.lesson_material_items for update
  using (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(project_id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(project_id)
    and academy_id is not null
  );

drop policy if exists "Teachers delete own lesson_material_items" on public.lesson_material_items;
create policy "Teachers delete own lesson_material_items"
  on public.lesson_material_items for delete
  using (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(project_id)
  );

commit;

