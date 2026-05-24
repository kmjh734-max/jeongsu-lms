-- 듣기 문항 품질 검수·정답 근거
alter table public.listening_questions
  add column if not exists answer_clue text not null default '',
  add column if not exists needs_review boolean not null default false;
