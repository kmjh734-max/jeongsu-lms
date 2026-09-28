-- 문법 은행은 한 서고다. 교재 구분(족보닷컴/천일문)을 없애고,
-- 들여온 문항은 원래 쓰던 레벨·단원 자리에 그대로 합친다.

-- 1) 들여온 문항을 제자리로 (천일문 1권 Ch01 be동사 → 기초 1과 be동사)
update public.grammar_bank_questions
set level = 1,
    level_name = '기초',
    chapter_no = 1,
    chapter = 'be동사',
    kind = case kind
             when 'Chapter Test' then '실전문제'
             when '워크북 Chapter Test' then '실전문제'
             when '워크북 연습' then '연습문제'
             else kind
           end,
    round = case kind
              when 'Chapter Test' then 1
              when '워크북 Chapter Test' then 2
              else round
            end
where source = '천일문';

-- 2) 구분 칼럼을 없앤다
drop view if exists public.grammar_bank_chapters;

alter table public.grammar_bank_questions
  drop column if exists source,
  drop column if exists book;

create view public.grammar_bank_chapters
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
