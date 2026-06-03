-- Type 10: main content / topic metadata

alter table listening_questions
  add column if not exists main_content text default '';

alter table listening_questions
  add column if not exists content_clues jsonb default '[]'::jsonb;

alter table listening_questions
  add column if not exists topic_distractor_reasons jsonb default '[]'::jsonb;
