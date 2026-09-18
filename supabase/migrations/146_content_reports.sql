-- 문항 오류 신고: 학생·선생님이 듣기 문항·단어에서 "이상해요"를 누르면 쌓이고, 슈퍼관리자가 모아 보고 처리한다.
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid references public.academies(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_role text,
  kind text not null check (kind in ('listening', 'vocab')),
  set_id uuid,
  target_id uuid,
  target_label text,
  reason text not null,
  message text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists content_reports_status_idx on public.content_reports (status, created_at desc);
-- 읽기·쓰기는 서버(서비스 키)에서만 한다
alter table public.content_reports enable row level security;
