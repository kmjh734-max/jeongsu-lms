-- Type 11: transport / destination metadata

alter table listening_questions
  add column if not exists destination text default '';

alter table listening_questions
  add column if not exists final_transport text default '';

alter table listening_questions
  add column if not exists mentioned_transport_options jsonb default '[]'::jsonb;
