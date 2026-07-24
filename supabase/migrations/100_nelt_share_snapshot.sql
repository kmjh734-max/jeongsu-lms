-- NELT 학부모 공유: 스냅샷·안내 문구 저장
alter table public.nelt_shared_reports
  add column if not exists parent_message text,
  add column if not exists report_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists student_name_raw text;

alter table public.nelt_growth_reports
  add column if not exists parent_message text;

create index if not exists nelt_shared_reports_student_name_idx
  on public.nelt_shared_reports(academy_id, student_name_raw);
