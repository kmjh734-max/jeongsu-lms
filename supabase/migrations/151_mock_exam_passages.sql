-- 모의고사 지문 모음: 교육청 학력평가·평가원 모의평가의 영어 지문(원문만, 18~45번).
-- 모든 학원이 같이 쓰는 자료. 변형문제·수업자료 입력에서 불러오고, 내신 시험 분석에서 출처 대조에 쓴다.
-- 읽기·쓰기는 서버(서비스 키)에서만 한다.

create table if not exists public.mock_exam_passages (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null,
  grade int not null check (grade between 1 and 3),
  kind text not null,          -- 학력평가 | 모의평가
  organizer text,              -- 서울특별시 교육청, 한국교육과정평가원 …
  item_no text not null,       -- '18' … '41~42', '43~45'
  sort_no int not null,        -- 번호 순서 (41~42 → 41)
  english_text text not null,
  gloss text,                  -- 시험지 아래 낱말 풀이 (* wobble: 떨리다)
  word_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (year, month, grade, item_no)
);

create index if not exists mock_exam_passages_exam_idx
  on public.mock_exam_passages (grade, year desc, month desc, sort_no);

alter table public.mock_exam_passages enable row level security;

-- 내신 시험 분석: 시험 지문이 모의고사 지문과 같으면 출처로 단다(맞은 것만).
alter table public.school_exam_items
  add column if not exists matched_mock_id uuid references public.mock_exam_passages(id) on delete set null;
alter table public.school_exam_items
  add column if not exists matched_mock_label text;
