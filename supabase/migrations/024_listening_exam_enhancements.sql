-- 중1 영어듣기평가 유형: 지시문, 5지선다, 음성 속도

alter table public.listening_questions
  add column if not exists instruction text not null default '';

alter table public.listening_sets
  add column if not exists speech_speed real not null default 0.9;

alter table public.listening_questions
  drop constraint if exists listening_questions_correct_answer_check;

alter table public.listening_questions
  add constraint listening_questions_correct_answer_check
  check (correct_answer between 1 and 5);
