-- Type 16: suggestion metadata

alter table listening_questions
  add column if not exists suggester text default '';

alter table listening_questions
  add column if not exists suggested_to text default '';

alter table listening_questions
  add column if not exists suggested_action text default '';

alter table listening_questions
  add column if not exists suggestion_expression text default '';
