-- 반 수업 요일(0=월 … 6=일). 학습 리포트 달력에서 '빠진 날'과 '쉬는 날'을 가를 때 쓴다.
-- 비어 있으면 월~금을 수업일로 본다.
alter table public.classes add column if not exists weekdays smallint[];
