-- 지문 분석서 「문장 하나만 다시 만들기」(선생님 2026-10-21). 지문 전체를 다시 뽑으면 맞던 문장까지 바뀌고
-- 지문당 1,000크레딧이 든다. 문장 하나는 원가 약 60원(문장 표시 호출 하나 + 검수) → 2배 넘게 150.

begin;

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_analysis_sentence', '지문 분석서 문장 다시 만들기 (문장당)', 150, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
