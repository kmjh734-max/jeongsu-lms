import type { VocabStageProgress } from "@/types/database";

/**
 * 학생에게 보이는 단계 목록 — 화면마다 같은 규칙을 쓴다.
 * - 일반 단어장: 뜻 익히기 → 스펠링 → 예문 빈칸 → 종합테스트 (4단계)
 * - 시험 연계 단어장(exam_compact): 뜻 익히기 → 스펠링 → 종합테스트 (3단계)
 */
export interface StudentStageStep {
  name: string;
  done: boolean;
  /** 종합테스트 칸인지 */
  isTest: boolean;
}

export function studentStageSteps(s: {
  examCompact: boolean;
  stage1Completed: boolean;
  stage2Completed: boolean;
  stage3Completed: boolean;
  stage4Passed: boolean;
}): StudentStageStep[] {
  const steps: StudentStageStep[] = [
    { name: "뜻 익히기", done: s.stage1Completed, isTest: false },
    { name: "스펠링", done: s.stage2Completed, isTest: false },
  ];
  if (!s.examCompact) {
    steps.push({ name: "예문 빈칸", done: s.stage3Completed, isTest: false });
  }
  steps.push({ name: "종합테스트", done: s.stage4Passed, isTest: true });
  return steps;
}

export function stage3Completed(progress: VocabStageProgress): boolean {
  return Boolean(progress.stage3_completed);
}

export function stage4Passed(progress: VocabStageProgress): boolean {
  if (progress.stage4_passed) return true;
  if ((progress.stage4_attempt_count ?? 0) > 0) {
    return Boolean(progress.stage4_passed);
  }
  return Boolean(progress.stage3_passed);
}

export function stage4LastScore(progress: VocabStageProgress): number {
  if ((progress.stage4_attempt_count ?? 0) > 0) {
    return progress.stage4_last_score ?? 0;
  }
  return progress.stage3_last_score ?? 0;
}

export function stage4BestScore(progress: VocabStageProgress): number {
  if ((progress.stage4_attempt_count ?? 0) > 0) {
    return progress.stage4_best_score ?? 0;
  }
  return Math.max(
    progress.stage4_best_score ?? 0,
    progress.stage3_best_score ?? 0
  );
}

export function stage4AttemptCount(progress: VocabStageProgress): number {
  const s4 = progress.stage4_attempt_count ?? 0;
  if (s4 > 0) return s4;
  return progress.stage3_attempt_count ?? 0;
}
