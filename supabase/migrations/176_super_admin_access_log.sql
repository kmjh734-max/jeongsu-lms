-- 슈퍼관리자가 어느 학원으로 들어갔는지 남긴다
--
-- 선생님 요청(2026-09-30): 슈퍼관리자에서 각 학원 관리자로 바로 접속하게 해 달라.
-- 남의 학원 자료를 보는 일이라 누가 언제 어디로 들어갔는지 자취가 있어야 한다.
create table if not exists public.super_admin_access_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  academy_id uuid not null references public.academies(id) on delete cascade,
  target_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists super_admin_access_log_actor_idx
  on public.super_admin_access_log (actor_id, created_at desc);
create index if not exists super_admin_access_log_academy_idx
  on public.super_admin_access_log (academy_id, created_at desc);

alter table public.super_admin_access_log enable row level security;

-- 슈퍼관리자만 본다
drop policy if exists super_admin_access_log_read on public.super_admin_access_log;
create policy super_admin_access_log_read on public.super_admin_access_log
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

comment on table public.super_admin_access_log is
  '슈퍼관리자가 학원 관리자로 들어간 자취. 들어간 사람·학원·대상 관리자를 남긴다.';
