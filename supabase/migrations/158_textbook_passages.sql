-- 교과서 본문 모음: 출판사 교과서 본문을 본문1·본문2…로 나눠 담는다.
-- 모의고사 지문과 달리 학원 것이므로 academy_id로 묶는다(라이선스가 학원에 있다).
create table if not exists public.textbook_passages (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  subject text not null,          -- 공통영어2
  publisher text not null,        -- YBM(박준언)
  lesson text not null,           -- 1과, Special Lesson1
  part text not null,             -- 본문1
  label text not null,            -- 공통영어2 YBM(박준언) 1과 본문1
  english_text text not null,
  korean_text text,               -- 교재에 실린 해석 그대로(새로 번역하지 않는다)
  word_count int not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (academy_id, subject, publisher, lesson, part)
);

create index if not exists textbook_passages_pick_idx
  on public.textbook_passages (academy_id, subject, publisher, order_index);

alter table public.textbook_passages enable row level security;

-- 모의고사 지문에도 교재에 실린 해석을 담는다
alter table public.mock_exam_passages
  add column if not exists korean_text text;
