-- Type 6: time comprehension metadata

alter table listening_questions
  add column if not exists time_question_target text default '';

alter table listening_questions
  add column if not exists final_time text default '';

alter table listening_questions
  add column if not exists mentioned_times jsonb default '[]'::jsonb;
