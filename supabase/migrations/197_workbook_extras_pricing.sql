-- 워크북 새 유형(지칭추론·함축의미·바꿔 말하기·도식화·연결어 빈칸·문장 삽입·요약문·직독직해·단어 시험지)의 재료.
-- 1장 자료 재료 + 단어 정리·직독직해를 지문당 한 번 만든다(원가 약 74원). 선생님 2026-10-21: 200크레딧.

begin;

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_workbook_extras', '워크북 지칭·함축·요약 등 재료 (지문당)', 200, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
