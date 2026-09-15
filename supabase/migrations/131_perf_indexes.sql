-- 느린 화면 조회에 맞춘 색인 (색인만 추가 — 표 구조는 그대로)

-- 듣기 배정 탭 진행률(배정별 오늘까지 과제)과 반 목록(반 스케줄의 이번 주 과제)이
-- assignment_id 목록 + task_date 범위로 읽는다. 기존 색인은 student_id 가 앞이라 쓰지 못해
-- 매 쪽마다 표 전체를 훑었다. (배정 삭제 시 과제 cascade 삭제도 빨라진다)
create index if not exists listening_daily_tasks_assignment_date_idx
  on public.listening_daily_tasks (assignment_id, task_date);

-- 수업자료 자료함: 지문 수를 세는 조회를 학원으로 거르고 created_at 순으로 읽는다.
-- lesson_material_items 에는 학원 색인이 없었다.
create index if not exists lesson_material_items_academy_created_idx
  on public.lesson_material_items (academy_id, created_at);

-- 변형문제 목록(최근 50개)과 자료함 변형문제 탭(최근 100개)이 학원으로 거르고
-- created_at 최신순으로 자른다. 학원 단일 색인으로는 학원 작업을 모두 정렬해야 했다.
create index if not exists question_generation_jobs_academy_created_idx
  on public.question_generation_jobs (academy_id, created_at desc);
