-- Type 15: request / favor metadata

alter table listening_questions
  add column if not exists requester text default '';

alter table listening_questions
  add column if not exists requested_person text default '';

alter table listening_questions
  add column if not exists requested_action text default '';

alter table listening_questions
  add column if not exists request_expression text default '';
