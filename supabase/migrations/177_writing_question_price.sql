-- 변형문제 서술형 문항 값 (2026-10-01).
--
-- 서술형은 run-generation-job 에서 따로 차감하는데 가격표에 줄이 없었다. 가격이 없으면
-- 차감을 건너뛰므로, 서술형 문항은 값을 받지 않고 나가고 있었다.
--
-- 실측(2026-10-01, 지문 셋): 객관식 41원 · 서술형 114원. 호출이 2.3번 들어가고(검수에서
-- 걸려 다시 만드는 일이 잦다) 해설이 길어서다. 원가가 어법 유형과 같으므로 값도 같이 150.
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values ('qg_generate_writing', '변형문제 서술형 (문항당)', 150, 'per_use', true)
on conflict (feature_key) do update
  set label = excluded.label,
      credit_cost = excluded.credit_cost,
      is_active = true,
      updated_at = now();

-- 어법 유형 이름도 맞춘다. 「어법 유형」이라고만 적혀 있어 어법오류수정·제시어배열도
-- 여기 드는 줄 아셨다(2026-10-01 선생님 지적). 실제로 드는 두 유형을 이름에 적는다.
update public.feature_pricing
  set label = '변형문제 어법추론·어법개수 (문항당)', updated_at = now()
  where feature_key = 'qg_generate_grammar';
