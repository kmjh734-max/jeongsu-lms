import { z } from "zod";

export type KeyMeaningPoint = {
  id: string;
  description: string;
  weight: number;
};

export type ExamStage4Setting = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: number;
  override_model_translation: string | null;
  key_meaning_points: KeyMeaningPoint[];
  accepted_expressions: string[];
  common_errors: string[];
  teacher_explanation: string | null;
  max_score: number;
  minimum_pass_score: number;
  grading_mode: "ai_assisted" | "manual_only" | "exact_optional";
  manual_review_required: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

export type Stage4SentenceStatus =
  | "draft"
  | "submitted"
  | "grading"
  | "graded"
  | "pending_review"
  | "teacher_reviewed"
  | "passed"
  | "needs_retry"
  | "error";

export type Stage4MeaningStatus =
  | "correct"
  | "partial"
  | "incorrect"
  | "missing";

export type Stage4MeaningResult = {
  meaningPointId: string;
  status: Stage4MeaningStatus;
  earnedScore: number;
  feedback: string;
};

export type Stage4AiGradeResult = {
  score: number;
  isPass: boolean;
  meaningResults: Stage4MeaningResult[];
  missingMeanings: string[];
  mistranslations: string[];
  naturalnessFeedback: string;
  overallFeedback: string;
  requiresTeacherReview: boolean;
};

export type Stage4SentenceAnswerState = {
  value: string;
  status: Stage4SentenceStatus;
  attempts: number;
  latestScore: number | null;
  finalScore: number | null;
  isPass: boolean;
  modelTranslationRevealed: boolean;
  revealedModelTranslation?: string | null;
  overallFeedback?: string | null;
  naturalnessFeedback?: string | null;
  meaningResults?: Stage4MeaningResult[];
  missingMeanings?: string[];
  mistranslations?: string[];
  gradingSource?: "ai" | "teacher" | "ai_then_teacher" | null;
  lastSavedAt?: string | null;
  submittedAt?: string | null;
};

export type ExamStage4Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage4SentenceAnswerState>;
  correct_blank_ids: string[];
  incorrect_blank_ids: string[];
  completed_blank_ids: string[];
  attempt_count: number;
  score: number;
  progress_percent: number;
  revision: number;
  completed_at: string | null;
  updated_at: string;
};

export const STAGE4_DEFAULTS = {
  hintAfterAttempts: 2,
  revealAfterAttempts: 3,
  nearPassBand: 5,
  maxScore: 100,
  minimumPassScore: 70,
} as const;

export type Stage4SettingDraft = {
  sentence_id: string;
  override_model_translation?: string | null;
  key_meaning_points: KeyMeaningPoint[];
  accepted_expressions: string[];
  common_errors: string[];
  teacher_explanation?: string | null;
  max_score?: number;
  minimum_pass_score?: number;
  grading_mode?: ExamStage4Setting["grading_mode"];
  manual_review_required?: boolean;
  is_required?: boolean;
};

export const stage4AiGradeSchema = z.object({
  score: z.number().min(0).max(100),
  isPass: z.boolean(),
  meaningResults: z.array(
    z.object({
      meaningPointId: z.string(),
      status: z.enum(["correct", "partial", "incorrect", "missing"]),
      earnedScore: z.number().min(0).max(100),
      feedback: z.string(),
    })
  ),
  missingMeanings: z.array(z.string()).default([]),
  mistranslations: z.array(z.string()).default([]),
  naturalnessFeedback: z.string().default(""),
  overallFeedback: z.string().min(1),
  requiresTeacherReview: z.boolean().default(false),
});

export function parseKeyMeaningPoints(raw: unknown): KeyMeaningPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: KeyMeaningPoint[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const description = String(o.description ?? "").trim();
    if (!description) continue;
    out.push({
      id: String(o.id ?? `meaning-${out.length + 1}`),
      description,
      weight: Number(o.weight) || 0,
    });
  }
  return out;
}

export function meaningWeightSum(points: KeyMeaningPoint[]): number {
  return points.reduce((n, p) => n + (Number(p.weight) || 0), 0);
}

export function computePassageAverageScore(
  answers: Record<string, Stage4SentenceAnswerState>,
  requiredSentenceIds: string[]
): number {
  if (requiredSentenceIds.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const id of requiredSentenceIds) {
    const a = answers[id];
    if (a?.finalScore != null) {
      sum += Number(a.finalScore);
      count += 1;
    } else if (a?.latestScore != null) {
      sum += Number(a.latestScore);
      count += 1;
    }
  }
  if (count === 0) return 0;
  return Math.round(sum / requiredSentenceIds.length);
}

export function isBlankOrWhitespace(text: string): boolean {
  return !text.replace(/\s+/g, "").length;
}

export function looksLikeEnglishCopy(
  student: string,
  english: string
): boolean {
  const a = student.trim().toLowerCase().replace(/\s+/g, " ");
  const b = english.trim().toLowerCase().replace(/\s+/g, " ");
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 20 && b.includes(a)) return true;
  if (a.length >= 40 && a.includes(b.slice(0, Math.min(40, b.length)))) {
    return true;
  }
  // mostly latin letters
  const hangul = (a.match(/[\uAC00-\uD7A3]/g) || []).length;
  const latin = (a.match(/[a-z]/g) || []).length;
  return latin > 20 && hangul < 3;
}
