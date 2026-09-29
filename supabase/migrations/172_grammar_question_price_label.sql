-- 어법 유형 문항 값 (2026-09-29 실측).
-- 어법추론 77원 · 어법개수 72원으로 원가가 거의 같다. 다른 유형(빈칸추론 32원)의 두 배쯤이라
-- 둘 다 100으로 받는다. 이름도 「어법추론」에서 「어법 유형」으로 넓힌다.
update public.feature_pricing
  set label = '변형문제 어법 유형 (문항당)', credit_cost = 100, updated_at = now()
  where feature_key = 'qg_generate_grammar';
