-- Paste and run in Supabase Dashboard → SQL Editor (one shot).
-- Fixes "column ... not found" errors when saving listening questions.

-- 027
alter table listening_questions add column if not exists quality_score int default null;
alter table listening_questions add column if not exists answer_clarity_score int default null;
alter table listening_questions add column if not exists quality_issues jsonb default '[]'::jsonb;
alter table listening_questions add column if not exists answer_validation jsonb default '{}'::jsonb;
alter table listening_questions alter column needs_review set default false;

-- 028
alter table listening_questions add column if not exists table_data jsonb default null;
alter table listening_questions add column if not exists previous_turn text default '';
alter table listening_questions add column if not exists correct_response_function text default '';
alter table listening_questions add column if not exists distractor_reason jsonb default '[]'::jsonb;

-- 029
alter table listening_questions add column if not exists needs_image_choices boolean not null default false;
alter table listening_questions add column if not exists choice_image_prompts jsonb not null default '[]'::jsonb;

-- 030
alter table listening_questions add column if not exists visual_choice_type text default '';
alter table listening_questions add column if not exists selected_conditions jsonb default null;

-- 031
alter table listening_questions add column if not exists weather_target_location text default '';
alter table listening_questions add column if not exists weather_target_time text default '';
alter table listening_questions add column if not exists weather_answer text default '';
alter table listening_questions add column if not exists mentioned_weather_by_time jsonb default '[]'::jsonb;

-- 032
alter table listening_questions add column if not exists last_speaker text default '';
alter table listening_questions add column if not exists final_utterance text default '';
alter table listening_questions add column if not exists target_intention text default '';
alter table listening_questions add column if not exists intention_candidates jsonb default '[]'::jsonb;

-- 033
alter table listening_questions add column if not exists mention_plan jsonb default '{}'::jsonb;

-- 034
alter table listening_questions add column if not exists time_question_target text default '';
alter table listening_questions add column if not exists final_time text default '';
alter table listening_questions add column if not exists mentioned_times jsonb default '[]'::jsonb;

-- 035
alter table listening_questions add column if not exists target_person text default '';
alter table listening_questions add column if not exists dream_job text default '';
alter table listening_questions add column if not exists interest_clues jsonb default '[]'::jsonb;

-- 036
alter table listening_questions add column if not exists target_emotion text default '';
alter table listening_questions add column if not exists emotion_clues jsonb default '[]'::jsonb;
