-- 적중 자료집 (선생님 지시 2026-10-15).
--
-- 「적중 자료집 만들기」를 누르면 시험지와 우리 자료(변형문제·워크북·1장 자료)를 대조해
-- 문항마다 같은 자리를 다룬 근거까지 담아 둔다. 보기·인쇄는 담아 둔 것을 그대로 연다.
-- 자료를 더 만든 뒤 다시 누르면 새로 담긴다. 모델을 부르지 않아 값은 받지 않는다.
alter table public.school_exam_analyses
  add column if not exists hit_book jsonb,
  add column if not exists hit_book_at timestamptz;
