-- Type 14: source facts from script (table mismatch design)

alter table listening_questions
  add column if not exists source_facts_from_script jsonb default '[]'::jsonb;
