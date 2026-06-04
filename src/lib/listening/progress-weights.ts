/** 문제 생성 전체 진행률 (0~100) */

export type GenerationPhase =
  | "idle"
  | "generating"
  | "validating"
  | "saving"
  | "done"
  | "error";

const GEN_END = 90;
const SAVE_END = 98;

export function generationProgressPercent(
  phase: GenerationPhase,
  itemIndex: number,
  itemCount: number
): number {
  if (phase === "idle" || itemCount <= 0) return 0;
  if (phase === "done") return 100;
  if (phase === "error") return 0;

  const slice = 1 / itemCount;
  const base = itemIndex * slice;

  if (phase === "generating" || phase === "validating") {
    return Math.round((base + slice) * GEN_END);
  }
  if (phase === "saving") {
    const start = GEN_END;
    const span = SAVE_END - start;
    return Math.round(start + (base + slice) * span);
  }
  return 0;
}

export function audioProgressPercent(
  completedQuestions: number,
  totalQuestions: number
): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((completedQuestions / totalQuestions) * 100);
}

export function audioProgressLabel(orderIndex: number, stage?: string): string {
  const stageLabels: Record<string, string> = {
    preparing: "segment 준비",
    tts: "TTS 생성",
    merging: "음원 병합",
    uploading: "업로드",
    saved: "DB 저장",
    uploaded: "완료",
  };
  const detail = stage ? stageLabels[stage] ?? stage : "음원 생성";
  return `${orderIndex}번 문항 ${detail} 중`;
}
