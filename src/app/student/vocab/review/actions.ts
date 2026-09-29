"use server";

import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordReviewResult } from "@/lib/vocab/review";

/**
 * 복습 결과 저장 — 답을 그대로 보내면 서버가 채점한다.
 * 맞힌 단어는 다음 칸으로, 연속 두 번이면 졸업.
 */
export async function submitVocabReview(
  answers: Array<{ reviewId: string; answer: string }>
): Promise<{ graduated: number; results: Array<{ reviewId: string; correct: boolean }> }> {
  const profile = await getCurrentProfile();
  if (!profile) return { graduated: 0, results: [] };
  const admin = createAdminClient();
  const clean = (Array.isArray(answers) ? answers : [])
    .slice(0, 100)
    .map((a) => ({ reviewId: String(a?.reviewId ?? ""), answer: String(a?.answer ?? "").slice(0, 200) }))
    .filter((a) => a.reviewId);
  return recordReviewResult(admin, profile.id, clean);
}
