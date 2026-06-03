-- Type 18: current job inference metadata



alter table listening_questions

  add column if not exists target_job text default '';



alter table listening_questions

  add column if not exists job_clues jsonb default '[]'::jsonb;



alter table listening_questions

  add column if not exists distractor_jobs jsonb default '[]'::jsonb;


