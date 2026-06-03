-- Type 9: immediate next action metadata

alter table listening_questions
  add column if not exists immediate_action text default '';

alter table listening_questions
  add column if not exists mentioned_actions jsonb default '[]'::jsonb;
