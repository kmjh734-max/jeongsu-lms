begin;

alter table public.lesson_material_projects
  add column if not exists illustration_captions jsonb;

commit;
