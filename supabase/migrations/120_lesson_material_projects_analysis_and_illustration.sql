begin;

alter table public.lesson_material_projects
  add column if not exists analysis_json jsonb,
  add column if not exists illustration_prompt text;

commit;

