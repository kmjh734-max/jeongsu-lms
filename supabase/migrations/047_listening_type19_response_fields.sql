-- Type 19: response continuation metadata



alter table listening_questions

  add column if not exists blank_speaker text default '';


