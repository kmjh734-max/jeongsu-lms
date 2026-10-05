-- 외부지문 모음: 수능특강·부교재처럼 교과서·모의고사가 아닌 지문을 교재·강·번호로 담는다.
--
-- 선생님 요청(2026-10-05): 자료 입력에서 교과서처럼 「외부지문 불러오기」로 골라 넣는다.
-- 정수학원·김철진 선생님만 연다(학원 범위는 src/lib/outside-passages/access.ts 에서 정한다).
-- 읽기·쓰기는 서버(서비스 키)에서만 한다.

create table if not exists public.outside_passages (
  id uuid primary key default gen_random_uuid(),
  book text not null,             -- 수능특강 라이트 영어독해
  unit text not null,             -- 3강
  part text not null,             -- 3번
  label text not null,            -- 수능특강 라이트 영어독해 3강 3번
  english_text text not null,
  korean_text text,               -- 교재에 실린 해석 그대로(새로 번역하지 않는다)
  word_count int not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (book, unit, part)
);

create index if not exists outside_passages_pick_idx
  on public.outside_passages (book, order_index);

alter table public.outside_passages enable row level security;
