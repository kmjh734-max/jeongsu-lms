-- Type 13: conversation place metadata

alter table listening_questions
  add column if not exists place_clues jsonb default '[]'::jsonb;

alter table listening_questions
  add column if not exists distractor_places jsonb default '[]'::jsonb;
