-- 실측 원가에 맞춰 값을 고친다 (2026-09-29).
--
-- 모델 단가를 짐작으로 잡고 있었다. gpt-5.5는 입력 $1.25·출력 $10이 아니라 $5·$30,
-- gpt-5.6-sol은 $4·$20이다. 이 둘이 주력이라 원가를 절반 아래로 보고 있었고,
-- 지문 분석서와 어법추론은 실제로 원가보다 싸게 팔리고 있었다.
--
-- 지문 13문장 기준 실측 원가: 분석서 711원 · 어법 선택 256원 · 어휘 선택 115원 ·
-- 변형문제 빈칸 32원 / 제시어 배열 53원 / 어법추론 82원.

-- 지문 분석서: 700 → 1000 (원가 711원)
update public.feature_pricing
  set credit_cost = 1000, updated_at = now()
  where feature_key = 'lesson_analysis_report';

-- 워크북 어휘 선택: 150 → 200 (원가 115원)
update public.feature_pricing
  set credit_cost = 200, updated_at = now()
  where feature_key = 'lesson_workbook_vocab_choice';

-- 워크북 어법 선택은 400 그대로 (원가 256원)
-- 변형문제는 80 그대로. 다만 어법추론만 원가가 82원이라 따로 100으로 받는다.
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values ('qg_generate_grammar', '변형문제 어법추론 (문항당)', 100, 'per_use', true)
on conflict (feature_key) do update
  set credit_cost = excluded.credit_cost,
      label = excluded.label,
      is_active = true,
      updated_at = now();
