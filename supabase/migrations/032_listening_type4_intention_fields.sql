-- Type 4: last utterance intention metadata

alter table listening_questions
  add column if not exists last_speaker text default '';

alter table listening_questions
  add column if not exists final_utterance text default '';

alter table listening_questions
  add column if not exists target_intention text default '';

alter table listening_questions
  add column if not exists intention_candidates jsonb default '[]'::jsonb;
