-- 테스트지 뽑기(테스트 교재): 누를 때마다 값을 받는다(선생님 2026-10-20). 모델을 부르지 않고 저장된 재료로
-- 조립만 하므로 원가는 없다. 뽑은 지문 수 × 고른 유형 수만큼(지문·유형당) 받는다 — 지문 10개·기본 8유형이면 240.

begin;

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_test_draw', '테스트지 뽑기 (지문·유형당)', 3, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
