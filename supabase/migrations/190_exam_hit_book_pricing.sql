-- 적중 자료집 값 (선생님 결정 2026-10-15).
-- 만들기: 문항마다 후보를 모델이 판정해 원문 근거와 까닭을 쓴다. 한 회(약 25문항) 원가 약 1,000원 → 3,000.
-- 문항 재검토: 한 문항만 다시 찾고 다시 판정한다. 원가 약 40원 → 100.
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values
  ('exam_hit_book', '적중 자료집 만들기 (회당)', 3000, 'per_use', true),
  ('exam_hit_book_recheck', '적중 자료집 문항 재검토 (문항당)', 100, 'per_use', true)
on conflict (feature_key) do update
  set label = excluded.label,
      credit_cost = excluded.credit_cost,
      is_active = true,
      updated_at = now();
