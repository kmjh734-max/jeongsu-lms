-- Type 1: image choice prompts for picture-based options

alter table listening_questions
  add column if not exists needs_image_choices boolean not null default false;

alter table listening_questions
  add column if not exists choice_image_prompts jsonb not null default '[]'::jsonb;
