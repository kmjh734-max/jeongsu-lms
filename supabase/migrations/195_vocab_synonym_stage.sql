-- 단어학습 4단계 「동반의어 객관식」 (2026-10-20 선생님 요청)
-- 1 뜻 익히기 → 2 스펠링 → 3 예문 빈칸 → 4 동반의어 객관식(새로) → 5 종합테스트
-- 종합테스트 기록은 그대로 stage4_* 칸을 쓴다(화면에서만 5단계로 보인다). 새 단계 기록만 더한다.
-- 시험 연계(exam_compact) 단어장은 이 단계를 쓰지 않는다.

alter table public.vocab_stage_progress
  add column if not exists stage_syn_passed boolean not null default false,
  add column if not exists stage_syn_best_score int not null default 0,
  add column if not exists stage_syn_last_score int not null default 0,
  add column if not exists stage_syn_attempt_count int not null default 0,
  add column if not exists stage_syn_passed_at timestamptz,
  -- 동의어·반의어가 있는 단어가 없어 건너뛴 단어장
  add column if not exists stage_syn_skipped boolean not null default false;
