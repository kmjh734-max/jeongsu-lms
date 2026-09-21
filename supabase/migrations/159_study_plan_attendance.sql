-- 학습일정표: 회차마다 출결을 적는다. { "1": ["present", "absent", …], "2": [...] }
-- present 출석 / late 지각 / absent 결석 / makeup 보강 / "" 아직 안 적음
alter table public.study_plans
  add column if not exists attendance jsonb not null default '{}'::jsonb;
