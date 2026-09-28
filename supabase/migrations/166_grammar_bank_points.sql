-- 문법 은행 두 번째 교재(천일문 중등 GRAMMAR)를 받기 위한 자리.
-- 교재마다 개념(POINT)이 있으므로 개념 표를 따로 두고, 문항은 개념에 걸어 둔다.
create table if not exists public.grammar_bank_points (
  id bigserial primary key,
  book text not null,                 -- 천일문 1권
  chapter_no smallint not null,
  chapter text not null,              -- be동사
  unit_no smallint,
  unit text,                          -- be동사의 긍정문
  point_no smallint not null,
  point text not null,                -- 주어에 따라 변하는 be동사
  frequent boolean not null default false,  -- 교재의 「빈출」 표시
  created_at timestamptz not null default now(),
  unique (book, chapter_no, point_no)
);

alter table public.grammar_bank_points enable row level security;

alter table public.grammar_bank_questions
  add column if not exists source text not null default '족보닷컴',
  add column if not exists book text,
  add column if not exists unit_no smallint,
  add column if not exists unit text,
  add column if not exists point_nos smallint[] not null default '{}',
  add column if not exists point_label text;

drop view if exists public.grammar_bank_chapters;

create view public.grammar_bank_chapters
with (security_invoker = true) as
select
  source,
  book,
  level,
  level_name,
  chapter_no,
  chapter,
  kind,
  round,
  count(*)::int as question_count
from public.grammar_bank_questions
group by source, book, level, level_name, chapter_no, chapter, kind, round;
