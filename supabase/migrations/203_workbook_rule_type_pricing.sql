-- 워크북 규칙 유형(빈칸 채우기·문장 순서 배열·연결어·글의 순서·문장 삽입)도 유형마다 지문당 5
-- (선생님 2026-10-28 「무료는 좀 그래」). 모델을 부르지 않아 원가는 없다.

begin;

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_workbook_rule_type', '워크북 빈칸·문장 순서·연결어·글의 순서·문장 삽입 (유형당 지문당)', 5, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
