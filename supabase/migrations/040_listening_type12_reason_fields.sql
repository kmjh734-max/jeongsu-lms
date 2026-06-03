-- Type 12: reason-for-going metadata

alter table listening_questions
  add column if not exists target_place text default '';

alter table listening_questions
  add column if not exists reason_for_going text default '';

alter table listening_questions
  add column if not exists mentioned_possible_reasons jsonb default '[]'::jsonb;
