-- 객관식 선택지 저장 (정답 여부 재계산·검증용)
alter table public.listening_daily_task_progress
  add column if not exists selected_answer int;

comment on column public.listening_daily_task_progress.selected_answer is
  '학생이 고른 객관식 번호(1-based). null=미제출/구데이터';
