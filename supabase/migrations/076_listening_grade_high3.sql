-- 고3 듣기 세트 학년 옵션 (고1·고2와 동일 수능형 17유형, 대본 수준만 상이)

alter table public.listening_sets
  drop constraint if exists listening_sets_grade_level_check;

alter table public.listening_sets
  add constraint listening_sets_grade_level_check
  check (grade_level in ('middle1', 'middle2', 'middle3', 'high1', 'high2', 'high3'));

comment on column public.listening_sets.grade_level is
  'middle1/2/3=중등 20유형, high1/2/3=고등 전국연합(수능형) 17유형';
