-- 1지문 다문항 전용 값(150)을 끈다 (2026-10-11, 선생님 결정).
-- 세트로 만든 문항도 기존 유형과 같은 크레딧으로 받는다(기본 110, 어법추론·어법개수·서술형 150).
-- 줄은 지우지 않는다 — 10-10에 이 값으로 받은 내역(13,500)의 이름을 보여 줘야 한다.
update public.feature_pricing
  set is_active = false, updated_at = now()
  where feature_key = 'qg_generate_set';
