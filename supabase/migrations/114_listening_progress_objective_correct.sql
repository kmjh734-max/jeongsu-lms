-- 듣기 일일학습 객관식 정답 여부 (현황표 맞음/응시용)
alter table public.listening_daily_task_progress
  add column if not exists objective_correct boolean;

comment on column public.listening_daily_task_progress.objective_correct is
  '객관식 제출 시 정답 여부. null=미제출/구데이터';
