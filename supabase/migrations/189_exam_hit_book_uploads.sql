-- 적중 자료집에 선생님이 올린 개인 자료(PDF에서 뽑은 글) (선생님 지시 2026-10-15).
-- 다시 만들 때 또 올리지 않아도 되게 담아 둔다. [{ name, text }]
alter table public.school_exam_analyses
  add column if not exists hit_book_uploads jsonb;
