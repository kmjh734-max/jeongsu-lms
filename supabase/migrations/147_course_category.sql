-- 동영상강좌 카테고리(문법·독해·내신 …). 학원마다 자유롭게 적는다.
alter table public.courses add column if not exists category text;
create index if not exists courses_academy_category_idx on public.courses (academy_id, category);
