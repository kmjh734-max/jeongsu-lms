import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { categoryOfName, EXAM_LEVELS } from "@/lib/exam-analysis/types";

export const runtime = "nodejs";

/** 문항표 한 줄 고치기 { typeName?, level?, points? } — 선생님이 바로잡은 값 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string; itemId: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id, itemId } = await context.params;
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });
  }
  const admin = createAdminClient();
  const { data: item } = await admin
    .from("school_exam_items")
    .select("id, is_subjective")
    .eq("id", itemId)
    .eq("analysis_id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ ok: false, message: "문항을 찾을 수 없어요." }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { typeName?: string; level?: string; points?: number | null };
  const patch: Record<string, unknown> = { edited: true };
  if (typeof body.typeName === "string" && body.typeName.trim()) {
    patch.type_name = body.typeName.trim().slice(0, 40);
    patch.category = categoryOfName(patch.type_name as string, item.is_subjective);
  }
  if (typeof body.level === "string" && (EXAM_LEVELS as readonly string[]).includes(body.level)) {
    patch.level = body.level;
    patch.difficulty = body.level === "상" ? 4 : body.level === "하" ? 2 : 3;
  }
  if (body.points === null || (typeof body.points === "number" && body.points >= 0 && body.points <= 100)) {
    patch.points = body.points;
  }
  await admin.from("school_exam_items").update(patch).eq("id", itemId);

  // 총점 다시 계산
  const { data: rows } = await admin.from("school_exam_items").select("points").eq("analysis_id", id);
  const total = (rows ?? []).reduce((s, r) => s + (Number(r.points) || 0), 0);
  await admin.from("school_exam_analyses").update({ total_points: Math.round(total * 10) / 10 }).eq("id", id);
  return NextResponse.json({ ok: true });
}
