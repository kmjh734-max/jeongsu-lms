-- 문법 은행 묶음을 교재 차례 대신 난이도로 바꾼다.
-- 1단계 기본 · 2단계 실력 · 3단계 고난도
alter table public.grammar_bank_questions
  add column if not exists tier smallint;

create index if not exists grammar_bank_questions_tier_idx
  on public.grammar_bank_questions (level, chapter_no, tier, number);

drop view if exists public.grammar_bank_chapters;

create view public.grammar_bank_chapters
with (security_invoker = true) as
select
  level,
  level_name,
  chapter_no,
  chapter,
  tier,
  count(*)::int as question_count
from public.grammar_bank_questions
group by level, level_name, chapter_no, chapter, tier;
