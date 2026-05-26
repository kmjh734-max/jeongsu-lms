-- Type 3: weather question metadata

alter table listening_questions
  add column if not exists weather_target_location text default '';

alter table listening_questions
  add column if not exists weather_target_time text default '';

alter table listening_questions
  add column if not exists weather_answer text default '';

alter table listening_questions
  add column if not exists mentioned_weather_by_time jsonb default '[]'::jsonb;
