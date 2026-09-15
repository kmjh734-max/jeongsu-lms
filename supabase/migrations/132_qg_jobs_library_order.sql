-- 수업자료 자료함 "변형문제" 칸에서 선생님이 정한 순서를 저장한다.
-- 비어 있으면(새로 만든 변형문제) 맨 위에 최신순으로 보인다.
alter table public.question_generation_jobs
  add column if not exists library_order integer;
