-- 단어 동의어·반의어 만들기도 단어당 1크레딧(지금까지 무료). 원가 단어당 약 0.04원.
-- 윌링어학원은 예문·동의어/반의어 모두 무료 — 코드(src/lib/credits/academy-free.ts)에서 뺀다. 선생님 2026-10-26.

begin;

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('vocab_generate_related', '단어 동의어·반의어 만들기 (단어당)', 1, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
