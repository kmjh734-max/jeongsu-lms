-- 자료함 「단어」 탭 단어장에도 수업용 자료처럼 파생어를(윌링어학원 2026-10-30): 단어 정리의 파생어·혼동어휘를 단어장 낱말에 함께 담는다.
-- 파생어 쓰기·고르기 문항과 객관식 오답에 쓴다. 단어학습 편집기는 이 칸을 건드리지 않는다.
alter table public.vocab_items
  add column if not exists forms jsonb not null default '[]'::jsonb,
  add column if not exists confusables jsonb not null default '[]'::jsonb;
