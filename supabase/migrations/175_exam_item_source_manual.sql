-- 시험 문항의 지문 출처를 선생님이 손으로 달 수 있게 한다
--
-- 글자로 대조해 잡히는 것만 자동으로 달아 왔다. 학교가 지문을 바꿔 쓰거나
-- 부교재에서 가져오면 잡히지 않는다(현대고 11%, 동성고 29%). 그런 문항을
-- 선생님이 직접 채우면 교과서 적중률이 정확해진다.
alter table public.school_exam_items
  add column if not exists source_edited boolean not null default false,
  add column if not exists source_kind text;

comment on column public.school_exam_items.source_edited is
  '선생님이 출처를 손으로 정한 문항. 다시 대조해도 이 값은 덮어쓰지 않는다.';
comment on column public.school_exam_items.source_kind is
  '손으로 정한 출처의 갈래: textbook | mock | material | outside(교과서 밖). 비어 있으면 자동 대조를 따른다.';
