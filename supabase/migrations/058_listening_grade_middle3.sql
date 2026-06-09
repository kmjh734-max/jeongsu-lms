-- 중3 듣기 세트 학년 옵션 추가
alter table public.listening_sets
  drop constraint if exists listening_sets_grade_level_check;

alter table public.listening_sets
  add constraint listening_sets_grade_level_check
  check (grade_level in ('middle1', 'middle2', 'middle3'));

comment on column public.listening_sets.grade_level is
  'middle1=중1 20유형, middle2=중2 20유형, middle3=중3 20유형';
