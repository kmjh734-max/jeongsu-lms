-- 중학 문법 문제 은행: 족보닷컴 영문법(기초·기본·심화·완성) 문항과 그 변형문제.
-- 학원 것이 아니라 EngCore가 가진 공용 자료라 academy_id로 묶지 않고,
-- 쓸 수 있는 학원은 academies.settings.features.grammar_bank 로 가른다.
create table if not exists public.grammar_bank_questions (
  id bigserial primary key,
  source_file text not null,          -- 교재 PDF 이름
  number smallint not null,           -- 그 교재에서의 문항 번호
  is_variant boolean not null default false,
  level smallint not null,            -- 1 기초 · 2 기본 · 3 심화 · 4 완성
  level_name text not null,
  chapter_no smallint not null,
  chapter text not null,              -- be동사, 부정사[2] …
  kind text,                          -- 종합문제 · 확인문제 …
  round smallint,                     -- 1회 · 2회
  question_kind text,                 -- 짝찾기 · 배열 …
  difficulty text,                    -- 상 · 중 · 하
  badges jsonb not null default '[]'::jsonb,
  prompt text not null,               -- 발문
  body jsonb not null default '[]'::jsonb,     -- 본문 줄 배열
  choices jsonb not null default '[]'::jsonb,  -- [{no, text}]
  answer text,
  explanation text,
  created_at timestamptz not null default now(),
  unique (source_file, number, is_variant)
);

create index if not exists grammar_bank_questions_pick_idx
  on public.grammar_bank_questions (level, chapter_no, kind, round, is_variant, number);

alter table public.grammar_bank_questions enable row level security;
