-- 중학교 수업자료 문제 은행(선생님 2026-10-29): 족보닷컴 예상문제(PRE-STEP·1회·2회) 문항을 그대로 담는다.
-- 밑줄은 <u>…</u>, 서술형 빈칸은 <blank/> 로 글 안에 둔다. 자동 점검에 걸린 문항은 review 에 사유를 적고 기본 화면에서 숨긴다.
create table if not exists public.ms_questions (
  id bigserial primary key,
  unit_id uuid not null references public.ms_units(id) on delete cascade,
  source text not null,              -- 예상문제 1회 …
  no smallint not null,              -- 그 자료에서의 차례
  area text not null default '',     -- 단어 · 의사소통 · 어법 · 본문
  kind text not null check (kind in ('mc', 'sa')),
  stem text not null,                -- 발문
  group_lead text,                   -- 「다음 글을 읽고 물음에 답하시오.」
  group_lines jsonb,                 -- 함께 쓰는 지문 줄
  body jsonb not null default '[]'::jsonb,
  choices jsonb not null default '[]'::jsonb,  -- [{no, text}]
  answer text not null default '',
  explanation text not null default '',
  point text not null default '',    -- 문법 포인트(Grammar Build Up)
  needs_image boolean not null default false,
  review text not null default '',   -- 자동 점검 사유(비면 통과)
  created_at timestamptz not null default now(),
  unique (unit_id, source, no)
);

create index if not exists ms_questions_unit_idx on public.ms_questions (unit_id, source, no);

alter table public.ms_questions enable row level security;
