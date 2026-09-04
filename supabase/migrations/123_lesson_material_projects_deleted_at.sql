-- Soft-delete (휴지통) for lesson material projects

alter table public.lesson_material_projects
  add column if not exists deleted_at timestamptz;

create index if not exists lesson_material_projects_deleted_at_idx
  on public.lesson_material_projects(deleted_at);
