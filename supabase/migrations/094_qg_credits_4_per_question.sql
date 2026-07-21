-- AI 변형문제: 문항당 5 → 4 크레딧 (학원 체감가 조정)
update public.feature_pricing
set
  credit_cost = 4,
  label = 'AI 변형문제 생성 (문항당)',
  updated_at = now()
where feature_key = 'qg_generate_job';
