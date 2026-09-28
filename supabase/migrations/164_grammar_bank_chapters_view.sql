-- 단원 고르기 화면에서 쓰는 목록: 레벨·단원·묶음(종합/확인/체크체크)·회차별 문항 수.
-- 7,568줄을 그대로 내려받지 않도록 표로 묶어 둔다.
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
where is_variant = false
group by level, level_name, chapter_no, chapter, kind, round;
