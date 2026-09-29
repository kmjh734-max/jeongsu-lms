-- 단어 복습: 틀린 단어를 모아 날짜를 띄워 가며 다시 낸다(졸업할 때까지).
-- 새로 만드는 것은 없다 — 이미 저장된 뜻·철자·예문을 그대로 쓰므로 크레딧이 들지 않는다.

create table if not exists public.vocab_review_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.vocab_items(id) on delete cascade,
  set_id uuid references public.vocab_sets(id) on delete set null,
  -- 어느 단계에서 틀렸는지: 뜻·철자·예문
  stage text not null check (stage in ('meaning', 'spelling', 'example')),
  wrong_count int not null default 1,
  -- 연속 정답 수. 2가 되면 졸업한다.
  correct_streak int not null default 0,
  -- 0:다음날 1:3일 2:7일 3:14일
  box int not null default 0,
  due_at timestamptz not null default now(),
  graduated_at timestamptz,
  last_result_at timestamptz,
  created_at timestamptz not null default now(),
  unique (student_id, item_id, stage)
);

create index if not exists vocab_review_items_due_idx
  on public.vocab_review_items (student_id, graduated_at, due_at);

alter table public.vocab_review_items enable row level security;

-- 선생님이 "이 단어장은 이제 복습에서 빼기"를 할 수 있게
alter table public.vocab_sets
  add column if not exists review_excluded boolean not null default false;
