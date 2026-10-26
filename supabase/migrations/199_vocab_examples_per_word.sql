-- 단어 예문 만들기를 1회 20크레딧에서 단어당 1크레딧으로.
-- 원가: 동암중3 외부지문(MBTI) 23단어 2.62원(단어당 약 0.11원) → 단어당 1크레딧은 약 9배. 선생님 2026-10-26.

begin;

update public.feature_pricing set
  credit_cost = 1,
  label = '단어 예문 만들기 (단어당)',
  updated_at = now()
where feature_key = 'vocab_generate_examples';

commit;
