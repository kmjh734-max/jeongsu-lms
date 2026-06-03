-- Type 20: response continuation situation metadata



alter table listening_questions

  add column if not exists situation_type text default '';


