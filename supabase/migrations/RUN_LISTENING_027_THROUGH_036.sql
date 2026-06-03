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

-- 037
alter table listening_questions add column if not exists immediate_action text default '';
alter table listening_questions add column if not exists mentioned_actions jsonb default '[]'::jsonb;

-- 038
alter table listening_questions add column if not exists main_content text default '';
alter table listening_questions add column if not exists content_clues jsonb default '[]'::jsonb;
alter table listening_questions add column if not exists topic_distractor_reasons jsonb default '[]'::jsonb;

-- 039
alter table listening_questions add column if not exists destination text default '';
alter table listening_questions add column if not exists final_transport text default '';
alter table listening_questions add column if not exists mentioned_transport_options jsonb default '[]'::jsonb;

-- 040
alter table listening_questions add column if not exists target_place text default '';
alter table listening_questions add column if not exists reason_for_going text default '';
alter table listening_questions add column if not exists mentioned_possible_reasons jsonb default '[]'::jsonb;

-- 041
alter table listening_questions add column if not exists place_clues jsonb default '[]'::jsonb;
alter table listening_questions add column if not exists distractor_places jsonb default '[]'::jsonb;

-- 042
alter table listening_questions add column if not exists source_facts_from_script jsonb default '[]'::jsonb;

-- 043
alter table listening_questions add column if not exists requester text default '';
alter table listening_questions add column if not exists requested_person text default '';
alter table listening_questions add column if not exists requested_action text default '';
alter table listening_questions add column if not exists request_expression text default '';

-- 044
alter table listening_questions add column if not exists suggester text default '';
alter table listening_questions add column if not exists suggested_to text default '';
alter table listening_questions add column if not exists suggested_action text default '';
alter table listening_questions add column if not exists suggestion_expression text default '';

-- 045
alter table listening_questions add column if not exists target_time text default '';
alter table listening_questions add column if not exists planned_action text default '';
alter table listening_questions add column if not exists mentioned_other_actions jsonb default '[]'::jsonb;

-- 046
alter table listening_questions add column if not exists target_job text default '';
alter table listening_questions add column if not exists job_clues jsonb default '[]'::jsonb;
alter table listening_questions add column if not exists distractor_jobs jsonb default '[]'::jsonb;

-- 047
alter table listening_questions add column if not exists blank_speaker text default '';

-- 048
alter table listening_questions add column if not exists situation_type text default '';

-- 049
alter table listening_sets add column if not exists grade_level text not null default 'middle1'
  check (grade_level in ('middle1', 'middle2'));

-- 050 (see 050_performance_indexes.sql)
