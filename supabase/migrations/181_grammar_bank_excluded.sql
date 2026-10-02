-- 검수에서 걸러 낸 문항은 지우지 않고 사유를 적어 숨긴다.
-- 정답이 다른 문항 것으로 밀렸거나, 그림·보기 상자가 빠져 풀 수 없는 문항이 대상이다.
alter table public.grammar_bank_questions
  add column if not exists excluded_reason text;

create index if not exists grammar_bank_questions_excluded_idx
  on public.grammar_bank_questions (excluded_reason)
  where excluded_reason is not null;

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
where excluded_reason is null
group by level, level_name, chapter_no, chapter, tier;
