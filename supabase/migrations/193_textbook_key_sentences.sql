-- 교과서 본문 문장 분석(테스트 교재 「중요문장 어순배열」): 문장마다 그 과 단원문법, 어려운 구문(구조 이름·점수).
-- 규칙으로 만든다(모델 호출 없음) — scripts/grammar-bank/build-textbook-key-sentences.mts.
-- { version, unitKey, sentences: [{ english, unitGrammar[], structures[], score, hard }] }

alter table public.textbook_passages
  add column if not exists key_sentences jsonb;
