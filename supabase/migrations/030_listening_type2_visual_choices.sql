-- Type 2: visual image choices and purchase condition metadata

alter table listening_questions
  add column if not exists visual_choice_type text default '';

alter table listening_questions
  add column if not exists selected_conditions jsonb default null;
