-- Phase 1: 정수학원 seed + 기존 데이터 backfill
-- 이미 SQL Editor에서 실행했다면 재실행해도 안전

insert into public.academies
  (name, slug, primary_color, secondary_color, logo_url, description, status)
values
  (
    '정수학원',
    'jeongsu',
    '#2563EB',
    '#2563EB',
    '/image/logo-jeongsu.png',
    'EngCore LMS - 정수학원 학습/운영',
    'active'
  )
on conflict (slug) do update
set
  name = excluded.name,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  logo_url = excluded.logo_url,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

do $$
declare
  jeongsu_id uuid;
begin
  select id into jeongsu_id
  from public.academies
  where slug = 'jeongsu'
  limit 1;

  if jeongsu_id is null then
    raise exception 'academies에 slug=jeongsu 레코드가 없습니다.';
  end if;

  update public.profiles
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.courses
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.classes
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.vocab_folders
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.vocab_sets
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.listening_set_folders
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.listening_sets
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.english_source_passages
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.english_question_sets
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.question_generation_presets
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.listening_schedule_assignments
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.shared_reports
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.shared_student_records
  set academy_id = jeongsu_id
  where academy_id is null;

  update public.student_record_analyses
  set academy_id = jeongsu_id
  where academy_id is null;
end $$;
