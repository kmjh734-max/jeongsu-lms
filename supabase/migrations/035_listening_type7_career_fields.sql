-- Type 7: career aspiration metadata

alter table listening_questions
  add column if not exists target_person text default '';

alter table listening_questions
  add column if not exists dream_job text default '';

alter table listening_questions
  add column if not exists interest_clues jsonb default '[]'::jsonb;
