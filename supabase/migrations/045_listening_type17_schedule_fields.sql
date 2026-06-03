-- Type 17: scheduled action at specific time metadata



alter table listening_questions

  add column if not exists target_time text default '';



alter table listening_questions

  add column if not exists planned_action text default '';



alter table listening_questions

  add column if not exists mentioned_other_actions jsonb default '[]'::jsonb;


