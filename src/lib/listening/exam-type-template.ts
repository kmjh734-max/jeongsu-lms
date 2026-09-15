import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ListeningTypeKey } from "@/lib/listening/type-catalog";

/**
 * 학년 배치표의 한 자리(번호)에 놓인 유형.
 * id는 학년 배치표의 번호(문항 번호)이고, 어떤 유형인지는 key·code가 말한다.
 * 중1·고등은 번호와 모듈 번호(code)가 같지만, 중2·중3은 배치가 달라 번호로 유형을 판단하면 안 된다.
 */
export interface ExamTypeTemplate {
  id: number;
  question_type: string;
  instruction: string;
  format_guide: string;
  segment_guide: string;
  choice_guide: string;
  difficulty_tier: ListeningDifficultyTier;
  /** 의미 기반 유형 키 (type-catalog.ts) */
  key?: ListeningTypeKey;
  /** 지시문 변형 id ("" = 기본 지시문 그대로) */
  variant?: string;
  /** 유형 모듈 번호 (fix-typeN·typeN 프롬프트·검수가 쓰는 번호). 없으면 id */
  code?: number;
}

/** 유형 모듈 번호 — 번호(id)가 아니라 이것으로 유형별 규칙을 고른다 */
export function examTypeCode(t: Pick<ExamTypeTemplate, "id" | "code">): number {
  return t.code ?? t.id;
}
