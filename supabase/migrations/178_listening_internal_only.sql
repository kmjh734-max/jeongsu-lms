-- 듣기 자료는 앞으로도 내부에서 만든다(선생님 결정 2026-10-01).
--
-- 아래 네 줄은 가격표에 켜져 있어 랜딩 요금 안내에 떴지만, 코드에 그 기능이 아예
-- 없었다. 손님이 보면 있는 기능인 줄 안다. 끈다.
--
-- 듣기 음성(listening_generate_audio)은 그대로 둔다 — 학원 선생님이 쓸 수 있는 길이
-- 열려 있고 실제로 값을 받고 있어서, 끄면 값을 안 받고 나간다.
update public.feature_pricing
  set is_active = false, updated_at = now()
  where feature_key in (
    'listening_generate_questions',
    'listening_generate_image',
    'listening_generate_scene',
    'listening_variant_questions'
  );
