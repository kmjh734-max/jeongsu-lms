-- 비슷한 문항 만들기(이미 검수를 통과한 문항의 소재만 바꾸기)의 값.
-- 새로 만드는 길은 유형 규칙·난이도·오답 설계를 모두 프롬프트로 설명해야 해서 값이 크다.
-- 여기서는 맞는 문항을 그대로 주고 이름·장소·물건·숫자만 바꾸게 하므로 싼 모델로 충분하다.
-- 실측(2026-09-17, gpt-5-mini, 중1 20문항 한 세트, 1달러=1,400원):
--   들어간 글자 20,630 · 나온 글자 34,479 (실패 재시도 4번 포함) = 약 104원, 문항당 약 5.2원.
-- 값은 원가의 2배 선(1크레딧 = 1원)에 재시도 여유를 더해 문항당 15크레딧으로 둔다.
-- (새로 만들기는 문항당 150크레딧이다.)
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values ('listening_variant_questions', '듣기 비슷한 문항 만들기(문항당)', 15, 'per_use', true)
on conflict (feature_key) do update
  set label = excluded.label,
      credit_cost = excluded.credit_cost,
      is_active = true,
      updated_at = now();
