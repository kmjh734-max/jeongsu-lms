-- 학생이 직접 가입하고 학원이 승인하는 길.
-- 학원마다 가입 코드를 두고, 그 코드로 들어온 학생만 그 학원에 붙는다.

alter table public.academies
  add column if not exists join_code text unique,
  add column if not exists join_code_updated_at timestamptz;

-- 승인 시각. 선생님이 만든 계정은 만든 즉시 승인된 것으로 본다.
alter table public.profiles
  add column if not exists approved_at timestamptz default now(),
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

-- 이미 쓰고 있는 계정은 모두 승인 상태로
update public.profiles set approved_at = coalesce(approved_at, created_at, now()) where approved_at is null;

create index if not exists profiles_pending_idx
  on public.profiles (academy_id, approved_at)
  where approved_at is null;
