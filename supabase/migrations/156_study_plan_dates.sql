-- 학습일정표: 주차마다 수업 날짜를 고른다(회차별 날짜). { "1": ["2026-09-01", …], "2": [...] }
alter table public.study_plans
  add column if not exists session_dates jsonb not null default '{}'::jsonb;
