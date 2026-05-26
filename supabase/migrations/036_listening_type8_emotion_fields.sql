-- Type 8: emotion / feeling metadata (target_person shared with type 7)

alter table listening_questions
  add column if not exists target_emotion text default '';

alter table listening_questions
  add column if not exists emotion_clues jsonb default '[]'::jsonb;
