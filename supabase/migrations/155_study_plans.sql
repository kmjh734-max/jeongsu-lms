-- 학습일정표(월간 1:1 맞춤 PLAN) — 학생마다 한 달에 한 장.
-- 엑셀 양식 그대로: 주차 × 영역(영단어·문법·독해…) × 수업 회차별 [학습진도 / 숙제 / 특이사항]

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  -- 주당 수업 횟수 2~5회. 칸 수가 이 값을 따른다.
  sessions_per_week int not null default 3 check (sessions_per_week between 1 and 5),
  teacher_id uuid references public.profiles(id) on delete set null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, year, month)
);

create table if not exists public.study_plan_rows (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans(id) on delete cascade,
  week int not null check (week between 1 and 6),
  area text not null,
  textbook text,
  order_index int not null default 0,
  -- 수업 회차마다 {progress, homework, note}
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists study_plan_rows_plan_idx
  on public.study_plan_rows (plan_id, week, order_index);

create index if not exists study_plans_student_idx
  on public.study_plans (student_id, year desc, month desc);

alter table public.study_plans enable row level security;
alter table public.study_plan_rows enable row level security;
