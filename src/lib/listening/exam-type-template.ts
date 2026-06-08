import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";

/** 전국 중1·중2 영어듣기평가 공통 유형 템플릿 */
export interface ExamTypeTemplate {
  id: number;
  question_type: string;
  instruction: string;
  format_guide: string;
  segment_guide: string;
  choice_guide: string;
  difficulty_tier: ListeningDifficultyTier;
}
