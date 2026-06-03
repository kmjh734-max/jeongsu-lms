-- 문항별 Dictation 빈칸 미리 생성 (학생 제출 시 즉시 로드)

alter table public.listening_questions
  add column if not exists dictation_blank_items jsonb default null,
  add column if not exists dictation_blank_variants jsonb default '[]'::jsonb,
  add column if not exists dictation_prepared_at timestamptz default null;
