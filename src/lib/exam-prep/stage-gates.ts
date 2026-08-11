import { createAdminClient } from "@/lib/supabase/admin";

const PUBLISH_COL: Record<number, string> = {
  2: "stage2_published",
  3: "stage3_published",
  4: "stage4_published",
  5: "stage5_published",
  6: "stage6_published",
  7: "stage7_published",
  8: "stage8_published",
  9: "stage9_published",
  10: "stage10_published",
};

/**
 * 공개된 데이터 단계만 선행 완료로 요구한다.
 * (예: 우리말 빈칸 stage2 미공개면 영어 빈칸부터 가능)
 */
export async function assertPublishedPriorStages(
  assignmentStudentId: string,
  passageId: string,
  /** 현재 데이터 단계 번호 — 이보다 작은 공개 단계들을 검사 */
  currentDataStage: number
): Promise<{ ok: true } | { ok: false; code: string }> {
  const admin = createAdminClient();
  const cols = Object.entries(PUBLISH_COL)
    .filter(([n]) => Number(n) < currentDataStage)
    .map(([, c]) => c);
  const selectCols = ["id", ...cols].join(", ");
  const { data: passage } = await admin
    .from("exam_passages")
    .select(selectCols)
    .eq("id", passageId)
    .maybeSingle();
  if (!passage) {
    return { ok: false as const, code: "no_passage" as const };
  }

  const { data: s1 } = await admin
    .from("exam_stage1_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 1)
    .maybeSingle();
  if (!s1?.completed_at) {
    return { ok: false as const, code: "stage1_required" as const };
  }

  for (let n = 2; n < currentDataStage; n++) {
    const col = PUBLISH_COL[n];
    if (!col) continue;
    const published = Boolean(
      (passage as unknown as Record<string, unknown>)[col]
    );
    if (!published) continue;

    const { data } = await admin
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", n)
      .maybeSingle();
    if (!data?.completed_at) {
      return {
        ok: false as const,
        code: (`stage${n}_required` as const),
      };
    }
  }
  return { ok: true as const };
}

export const STAGE_GATE_MESSAGES: Record<string, string> = {
  stage1_required: "1단계 지문 익히기를 먼저 완료해 주세요.",
  stage2_required: "이전 단계(우리말 빈칸)를 먼저 완료해 주세요.",
  stage3_required: "2단계 영어 빈칸을 먼저 완료해 주세요.",
  stage4_required: "3단계 해석 연습을 먼저 완료해 주세요.",
  stage5_required: "4단계 동사형 연습을 먼저 완료해 주세요.",
  stage6_required: "5·6단계 어법·어휘 고르기를 먼저 완료해 주세요.",
  stage7_required: "7단계를 먼저 완료해 주세요.",
  stage8_required: "8단계를 먼저 완료해 주세요.",
  stage9_required: "9단계를 먼저 완료해 주세요.",
};
