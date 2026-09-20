-- 교재 목차: 목차를 한 번 올려 두면 학습일정표에서 트리로 골라 진도를 적는다.

create table if not exists public.textbooks (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  title text not null,
  subject text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.textbook_units (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid not null references public.textbooks(id) on delete cascade,
  parent_id uuid references public.textbook_units(id) on delete cascade,
  title text not null,
  -- 쪽 표시("p.42~47" 같은 자유 글자)
  pages text,
  depth int not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists textbook_units_book_idx
  on public.textbook_units (textbook_id, order_index);

create index if not exists textbooks_academy_idx
  on public.textbooks (academy_id, created_at desc);

alter table public.textbooks enable row level security;
alter table public.textbook_units enable row level security;

-- 학습일정표 행이 어떤 교재를 쓰는지
alter table public.study_plan_rows
  add column if not exists textbook_id uuid references public.textbooks(id) on delete set null;
