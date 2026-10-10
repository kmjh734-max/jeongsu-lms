-- 변형문제 1지문 다문항(세트) 문항 값 (2026-10-10, 선생님 결정).
--
-- 세트로 만든 문항은 유형과 상관없이 150. 세트마다 문항끼리 답이 새는지 보는 검수가 한 번 더 돌고,
-- 뒤 문항에 앞 문항의 지문·정답 메모를 붙여 만들어 원가가 더 든다(시험 문항당 약 67원, 110이면 1.6배).
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values ('qg_generate_set', '변형문제 1지문 다문항 (문항당)', 150, 'per_use', true)
on conflict (feature_key) do update
  set label = excluded.label,
      credit_cost = excluded.credit_cost,
      is_active = true,
      updated_at = now();
