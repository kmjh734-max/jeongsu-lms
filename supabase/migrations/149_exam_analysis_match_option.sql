-- 내신 시험 분석: 학원 수업자료와 대조(적중 문항 찾기)를 할지 선생님이 고른다. 기본은 한다.
alter table public.school_exam_analyses
  add column if not exists match_materials boolean not null default true;
