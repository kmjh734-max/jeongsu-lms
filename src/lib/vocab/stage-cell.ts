/** 학생 한 명 × 단어장 하나의 4단계 진행을 점 네 개와 짧은 글로 바꾼다. */

export type StageDot = "done" | "current" | "failed" | "none";

export interface StageCellInput {
  /** 진행 기록이 있는지 (한 번이라도 시작했는지) */
  started: boolean;
  stage1: boolean;
  stage2: boolean;
  stage3: boolean;
  /** 4단계(최종 시험) 합격 */
  passed: boolean;
  attempts: number;
  bestScore: number;
}

export interface StageCell {
  dots: StageDot[];
  /** 점수가 없을 때 보여 줄 글 — "2단계", "시작 전" */
  label: string;
  /** 최종 시험을 봤으면 최고 점수 */
  score: number | null;
  passed: boolean;
  failed: boolean;
}

export function buildStageCell(input: StageCellInput): StageCell {
  const failed = !input.passed && input.attempts > 0;
  const dots: StageDot[] = [
    input.stage1 ? "done" : "none",
    input.stage2 ? "done" : "none",
    input.stage3 ? "done" : "none",
    input.passed ? "done" : failed ? "failed" : "none",
  ];

  let currentIndex = -1;
  if (input.started && !input.passed && !failed) {
    currentIndex = dots.findIndex((d) => d === "none");
    if (currentIndex >= 0) dots[currentIndex] = "current";
  }

  const tookTest = input.passed || input.attempts > 0;
  return {
    dots,
    label: tookTest
      ? ""
      : currentIndex >= 0
        ? `${currentIndex + 1}단계`
        : "시작 전",
    score: tookTest ? input.bestScore : null,
    passed: input.passed,
    failed,
  };
}
