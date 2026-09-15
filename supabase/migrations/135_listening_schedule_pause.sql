-- 듣기 스케줄 과제 일시정지
--  · 과제 전체(반 배정·학생 배정) 또는 반 배정 안의 학생 한 명을 멈춘다.
--  · 멈춘 기간(start_date 이상, end_date 미만)에는 일일 과제가 나가지 않고,
--    현황표·홈·학부모 알림·연속 학습에서 안 한 날로 세지 않는다.
--  · 다시 시작하면 멈춘 곳 다음 문항부터 이어서 나간다 (남은 세트가 쉰 날만큼 뒤로 밀린다).
--  · 예전 「잠시 쉬기」(is_active = false)는 그대로 둔다 — 재개하면 is_active 를 다시 켠다.
-- 여러 번 돌려도 되게 if not exists 로만 만든다.

create table if not exists public.listening_schedule_pauses (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null
    references public.listening_schedule_assignments(id) on delete cascade,
  -- null = 과제 전체, 값이 있으면 반 배정 안의 이 학생만
  student_id uuid references public.profiles(id) on delete cascade,
  -- 멈춘 첫날 (한국 날짜)
  start_date date not null,
  -- 다시 나가는 날 (이날부터 다시 나간다). null = 재개할 때까지
  end_date date,
  paused_by uuid references public.profiles(id) on delete set null,
  paused_at timestamptz not null default now(),
  resumed_by uuid references public.profiles(id) on delete set null,
  resumed_at timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'listening_schedule_pauses_range_check'
  ) then
    alter table public.listening_schedule_pauses
      add constraint listening_schedule_pauses_range_check
      check (end_date is null or end_date > start_date);
  end if;
end $$;

-- 배정 탭·현황표·학생 화면이 배정 id 목록으로 읽는다
create index if not exists listening_schedule_pauses_assignment_idx
  on public.listening_schedule_pauses (assignment_id, start_date);

create index if not exists listening_schedule_pauses_student_idx
  on public.listening_schedule_pauses (student_id)
  where student_id is not null;

-- 정책 없음: 서버(service role)만 읽고 쓴다. 교사·학생 화면은 서버에서 읽어 넘긴다.
alter table public.listening_schedule_pauses enable row level security;
