-- 듣기 세트 대상 학년 (중1 / 중2)

alter table public.listening_sets
  add column if not exists grade_level text not null default 'middle1'
  check (grade_level in ('middle1', 'middle2'));

comment on column public.listening_sets.grade_level is 'middle1=중1 20유형, middle2=중2 20유형';
