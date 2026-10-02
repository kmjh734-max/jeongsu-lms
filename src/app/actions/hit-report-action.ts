"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { buildHitReport } from "@/lib/exam-analysis/hit-report";
import type { ExamItemRow } from "@/lib/exam-analysis/types";

const FEATURE = "exam_hit_report";

export async function hitReportActionCompressed(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID가 없습니다.");

  const profile = await getCurrentProfile();
  if (!profile?.academy_id || (profile.role !== "admin" && profile.role !== "teacher")) {
    throw new Error("권한이 없습니다.");
  }

  const admin = createAdminClient();
  const { data: analysis } = await admin
    .from("school_exam_analyses")
    .select("id, academy_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!analysis || analysis.academy_id !== profile.academy_id) {
    throw new Error(`시험 분석을 찾을 수 없습니다. (ID: ${id})`);
  }

  const shortfall = await lessonCreditShortfall(profile.academy_id, FEATURE);
  if (shortfall) throw new Error(shortfall);

  const { data: items } = await admin
    .from("school_exam_items")
    .select("*")
    .eq("analysis_id", id)
    .order("order_index");

  if (!items?.length) {
    throw new Error("문항표가 아직 없습니다.");
  }

  let uploads: Array<{ name: string; text: string }> = [];
  const file = formData.get("uploads") as File | null;
  if (file) {
    try {
      const ds = new DecompressionStream("gzip");
      const decompressedStream = file.stream().pipeThrough(ds);
      const text = await new Response(decompressedStream).text();
      uploads = JSON.parse(text);
      uploads = uploads
        .map((u) => ({ name: String(u.name ?? "올린 자료"), text: String(u.text ?? "") }))
        .filter((u) => u.text.trim().length > 40)
        .slice(0, 20);
    } catch (e) {
      console.error("Failed to decompress uploads:", e);
      throw new Error("업로드 데이터 압축 해제 실패");
    }
  }

  const report = await buildHitReport(
    admin,
    profile.academy_id,
    items as ExamItemRow[],
    (analysis.created_at as string) ?? null,
    uploads
  );

  const at = new Date().toISOString();
  await admin
    .from("school_exam_analyses")
    .update({ hit_report: report, hit_report_at: at })
    .eq("id", id);

  await debitLessonCredits({
    academyId: profile.academy_id,
    actorId: profile.id,
    featureKey: FEATURE,
    projectId: id,
    idempotencyKey: `${FEATURE}:${id}:${at}`,
    metadata: { analysis_id: id, used_for: "exam_hit_report" },
    note: `시험지 적중 대조 ${report.total}문항${uploads.length ? ` · 올린 자료 ${uploads.length}개` : ""}`,
  });

  return { ok: true, report, at };
}
