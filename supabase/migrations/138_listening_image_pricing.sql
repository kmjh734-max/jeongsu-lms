-- 듣기 그림 생성 가격 (1크레딧 = 1원, 원가의 약 2배).
--  · 선택지 그림·라벨 그림: 장당 원가 약 235원 → 500
--  · 그림 상황 문항 장면 그림: 그림 1~2장 + 정답 대화 검수 약 250~500원 → 문항당 700
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('listening_generate_image', '듣기 그림 생성 (장당)', 500, 'per_use', true),
  ('listening_generate_scene', '듣기 그림 상황 그림 (문항당)', 700, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;
