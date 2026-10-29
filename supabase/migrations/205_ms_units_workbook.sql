-- 중학교 수업자료 워크북(선생님 2026-10-29): 내신용·정수학원만이라 과마다 문항을 미리 정해 둔다.
-- 족보닷컴 「본문 10단계 워크북」 문항을 본문1·본문2…에 나눠 담는다(어떤 본문 문장인지 맞춰 둔다).
--   { sets: { <유형>: { direction, items: [{ part, ko?, en?, q?, answer, hint? }] } } }
alter table public.ms_units
  add column if not exists workbook jsonb not null default '{}'::jsonb;
