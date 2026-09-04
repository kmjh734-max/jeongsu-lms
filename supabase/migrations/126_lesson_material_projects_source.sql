-- Passage source (출처) for lesson materials

alter table public.lesson_material_projects
  add column if not exists source text;
