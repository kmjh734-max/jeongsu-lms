-- Type 14 table data and type 19~20 continuation metadata

alter table listening_questions
  add column if not exists table_data jsonb default null;

alter table listening_questions
  add column if not exists previous_turn text default '';

alter table listening_questions
  add column if not exists correct_response_function text default '';

alter table listening_questions
  add column if not exists distractor_reason jsonb default '[]'::jsonb;
