-- 학생 등록에 생년월일·연락처 등을 받는다. 학습일정표를 온라인으로 만들려면 반의 수업 시간도 있어야 한다.

alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists phone text,
  add column if not exists parent_phone text,
  add column if not exists school text,
  add column if not exists school_grade text,
  add column if not exists enrolled_on date,
  add column if not exists note text;

alter table public.classes
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists room text;
