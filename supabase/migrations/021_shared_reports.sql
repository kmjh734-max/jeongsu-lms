-- 학부모 공개 리포트 링크 (token 기반, API에서 service role로만 접근)

create table public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  report_data jsonb not null,
  parent_message text not null default '',
  ai_report_text text not null default '',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index shared_reports_token_idx on public.shared_reports(token);
create index shared_reports_student_id_idx on public.shared_reports(student_id);
create index shared_reports_expires_at_idx on public.shared_reports(expires_at);

alter table public.shared_reports enable row level security;

-- 클라이언트 직접 접근 없음 — 서버 API(service role)에서만 insert/select
