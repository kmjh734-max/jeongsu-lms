-- 단어 뜻 AI 채점은 학생 학습 흐름 안 과금
update public.feature_pricing
set
  credit_cost = 0,
  is_active = false,
  updated_at = now()
where feature_key = 'vocab_grade_meaning';
