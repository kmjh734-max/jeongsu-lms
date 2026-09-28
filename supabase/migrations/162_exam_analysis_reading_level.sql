-- 내신 시험지 분석에 "수준"을 적어 둔다.
--
-- 선생님 요청(2026-09-28): 내신을 분석할 때 수준을 정확하게 파악하면 좋겠다.
-- 보기 문장 수준이라든가 단어 수준을. 그것이 동형모의고사를 만들 때 반영되면 좋겠다.
-- 렉사일 수준으로 파악해도 좋다.
--
-- 재는 것은 두 가지로 나눈다.
--  1) 글에서 바로 셀 수 있는 것(문장 수, 평균 문장 길이, 보기 평균 낱말 수, 긴 낱말 비율)은
--     코드가 세서 넣는다. 부를 때마다 같은 값이 나온다.
--  2) 어휘 등급·렉사일은 추정값이다. 추정이라는 것을 화면에도 적는다.

alter table public.school_exam_items
  -- 지문의 평균 문장 길이(낱말)
  add column if not exists passage_sentence_words numeric,
  -- 선택지 다섯 개의 평균 낱말 수
  add column if not exists choice_avg_words numeric,
  -- 선택지가 영어인지(한글 선택지면 낱말 수를 재지 않는다)
  add column if not exists choice_lang text check (choice_lang in ('en', 'ko', 'mixed')),
  -- 추정 렉사일(예: 950). 잴 수 없으면 null
  add column if not exists lexile int,
  -- 어휘 수준 한 마디(예: 고1 교과서, 수능, 수능 이상)
  add column if not exists vocab_level text,
  -- 수준을 그렇게 본 까닭 한 문장
  add column if not exists level_reason text;

-- 시험지 한 벌의 수준(문항별 값을 모은 것). 동형모의고사를 만들 때 이 값을 기준으로 맞춘다.
alter table public.school_exam_analyses
  -- 지문 전체의 평균 문장 길이(낱말)
  add column if not exists sentence_words numeric,
  -- 선택지 평균 낱말 수
  add column if not exists choice_words numeric,
  -- 추정 렉사일 가운데값
  add column if not exists lexile int,
  -- 어휘 수준 한 마디
  add column if not exists vocab_level text,
  -- 수준 요약 한 문장(화면과 동형모의고사 프롬프트에 함께 쓴다)
  add column if not exists level_summary text;

comment on column public.school_exam_analyses.lexile is
  '추정 렉사일. 정식 측정값이 아니라 지문 길이·문장 길이·어휘 등급으로 어림한 값이다.';
comment on column public.school_exam_items.lexile is
  '추정 렉사일. 정식 측정값이 아니다.';
