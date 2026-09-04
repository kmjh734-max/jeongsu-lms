-- Lesson pack (수업용 자료) payload per project

alter table public.lesson_material_projects
  add column if not exists lesson_pack_json jsonb;

alter table public.lesson_material_projects
  add column if not exists title_en text;
