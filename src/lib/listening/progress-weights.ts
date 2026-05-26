/** 문제 생성 전체 진행률 (0~100) */

export type GenerationPhase =
  | "idle"
  | "generating"
  | "validating"
  | "saving"
  | "done"
  | "error";

const GEN_END = 50;
const VALIDATE_END = 85;
const SAVE_END = 95;

export function generationProgressPercent(
  phase: GenerationPhase,
  itemIndex: number,
  itemCount: number,
  subPhase: "generate" | "validate" = "generate"
): number {
  if (phase === "idle" || itemCount <= 0) return 0;
  if (phase === "done") return 100;
  if (phase === "error") return 0;

  const slice = 1 / itemCount;
  const base = itemIndex * slice;

  if (phase === "generating") {
    const inner = subPhase === "generate" ? 0.7 : 1;
    return Math.round((base + slice * inner * 0.5) * GEN_END);
  }
  if (phase === "validating") {
    const start = GEN_END;
    const span = VALIDATE_END - GEN_END;
    const inner = subPhase === "validate" ? 1 : 0.3;
    return Math.round(start + (base + slice * inner) * span);
  }
  if (phase === "saving") {
    const start = VALIDATE_END;
    const span = SAVE_END - VALIDATE_END;
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
