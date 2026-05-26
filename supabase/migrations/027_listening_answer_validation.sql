-- Answer clarity validation and persisted quality metadata

alter table listening_questions
  add column if not exists quality_score int default null;

alter table listening_questions
  add column if not exists answer_clarity_score int default null;

alter table listening_questions
  add column if not exists quality_issues jsonb default '[]'::jsonb;

alter table listening_questions
  add column if not exists answer_validation jsonb default '{}'::jsonb;

-- needs_review already exists from 025; ensure default
alter table listening_questions
  alter column needs_review set default false;
