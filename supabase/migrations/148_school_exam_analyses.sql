-- 내신 시험지 분석: 학교 시험지(PDF·사진)를 올리면 쪽마다 인쇄된 글자를 읽고,
-- 문항마다 유형·난이도·배점을 정리해 보고서로 보여 준다. 원본 그림은 저장하지 않는다(시험지 저작권).
-- 읽기·쓰기는 서버(서비스 키)에서만 하고, 학원 범위는 코드에서 확인한다.

create table if not exists public.school_exam_analyses (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  school_name text,
  grade text,
  subject text,
  exam_label text,
  status text not null default 'reading' check (status in ('reading', 'analyzing', 'ready', 'failed')),
  page_count int not null default 0,
  missing text,
  note text,
  total_points numeric,
  features jsonb not null default '[]'::jsonb,
  strategy jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists school_exam_analyses_academy_idx
  on public.school_exam_analyses (academy_id, created_at desc);

-- 쪽마다 읽은 글자 (분석이 끝나면 동형모의고사·다시 분석에 쓴다)
create table if not exists public.school_exam_pages (
  analysis_id uuid not null references public.school_exam_analyses(id) on delete cascade,
  page_no int not null,
  text text not null default '',
  primary key (analysis_id, page_no)
);

create table if not exists public.school_exam_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.school_exam_analyses(id) on delete cascade,
  order_index int not null,
  item_no text not null,
  points numeric,
  is_subjective boolean not null default false,
  category text not null default '기타',
  type_key text,
  type_name text not null,
  level text not null default '중' check (level in ('상', '중', '하')),
  difficulty int not null default 3 check (difficulty between 1 and 5),
  difficulty_reason text,
  stem text,
  passage_excerpt text,
  passage_words int,
  grammar_point text,
  conditions text,
  answer_guess text,
  confidence numeric,
  -- 학원 수업자료 지문과 맞은 경우만 (추정 출처는 두지 않는다)
  matched_item_id uuid references public.lesson_material_items(id) on delete set null,
  matched_label text,
  edited boolean not null default false
);
create index if not exists school_exam_items_analysis_idx
  on public.school_exam_items (analysis_id, order_index);

alter table public.school_exam_analyses enable row level security;
alter table public.school_exam_pages enable row level security;
alter table public.school_exam_items enable row level security;

-- 값: 실측(2026-09-20, 고1~고3 시험지 10개, 3~10쪽, gpt-5.5 읽기+분석, 1달러=1,400원)
--   평균 약 800원, 가장 큰 것(10쪽) 약 1,070원 → 원가의 2배 선에서 1회 1,500크레딧.
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values ('school_exam_analysis', '내신 시험지 분석(1회)', 1500, 'per_use', true)
on conflict (feature_key) do update
  set label = excluded.label,
      credit_cost = excluded.credit_cost,
      is_active = true,
      updated_at = now();
