-- Sentence analysis report (분석서) payload per project

alter table public.lesson_material_projects
  add column if not exists analysis_report_json jsonb;
