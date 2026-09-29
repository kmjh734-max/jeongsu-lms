-- 시험 문항이 교과서 본문과 맞는지 적어 둘 칸
--
-- 이득희 선생님 말씀(2026-09-29): 지역 학교 시험이 서술형까지 넣으면 교과서에서
-- 70%가 나왔는데 그 숫자를 낼 자료가 없다. 그때까지는 수업자료와 모의고사만
-- 대조하고 교과서 본문은 보지 않아, 분석한 여덟 시험 모두 교과서 적중이 0건이었다.
alter table public.school_exam_items
  add column if not exists matched_textbook_id uuid,
  add column if not exists matched_textbook_label text;

comment on column public.school_exam_items.matched_textbook_id is
  '맞은 교과서 본문(textbook_passages.id). 글자로 대조해 맞은 것만 둔다 — 짐작한 출처는 넣지 않는다.';
comment on column public.school_exam_items.matched_textbook_label is
  '교과서 출처 표시 (예: 천재(조수경) 영어1 2과 본문3)';
