-- Type 5: mention / unmention plan metadata

alter table listening_questions
  add column if not exists mention_plan jsonb default '{}'::jsonb;
