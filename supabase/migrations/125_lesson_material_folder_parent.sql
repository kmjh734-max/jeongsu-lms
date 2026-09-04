-- Nested folders for lesson materials

alter table public.lesson_material_folders
  add column if not exists parent_id uuid
    references public.lesson_material_folders(id) on delete cascade;

create index if not exists lesson_material_folders_parent_id_idx
  on public.lesson_material_folders(parent_id);
