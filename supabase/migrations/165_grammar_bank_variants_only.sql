-- 문법 문제 은행에는 변형문제만 둔다. 변형문제가 곧 우리 문항이다.
-- (원본은 교재 것이라 담아 두지 않는다)
delete from public.grammar_bank_questions where is_variant = false;

drop view if exists public.grammar_bank_chapters;

alter table public.grammar_bank_questions
  drop constraint if exists grammar_bank_questions_source_file_number_is_variant_key;
drop index if exists public.grammar_bank_questions_pick_idx;

alter table public.grammar_bank_questions drop column if exists is_variant;

alter table public.grammar_bank_questions
  add constraint grammar_bank_questions_source_file_number_key
  unique (source_file, number);

create index if not exists grammar_bank_questions_pick_idx
  on public.grammar_bank_questions (level, chapter_no, kind, round, number);

create or replace view public.grammar_bank_chapters
with (security_invoker = true) as
select
  level,
  level_name,
  chapter_no,
  chapter,
  kind,
  round,
  count(*)::int as question_count
from public.grammar_bank_questions
group by level, level_name, chapter_no, chapter, kind, round;
