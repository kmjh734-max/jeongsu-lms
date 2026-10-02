import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";

export const runtime = "nodejs";

/** 시험 정보 고치기 { schoolName, grade, subject, examLabel } */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const clean = (s?: unknown) => (typeof s === "string" ? s.trim().slice(0, 100) : null) || null;
  const patch: Record<string, unknown> = {};
  if ("schoolName" in body) patch.school_name = clean(body.schoolName);
  if ("grade" in body) patch.grade = clean(body.grade);
  if ("subject" in body) patch.subject = clean(body.subject);
  if ("examLabel" in body) patch.exam_label = clean(body.examLabel);
  if ("features" in body && Array.isArray(body.features)) {
    patch.features = body.features.map((x) => String(x).trim()).filter(Boolean);
  }
  if ("strategy" in body && Array.isArray(body.strategy)) {
    patch.strategy = body.strategy.map((x) => String(x).trim()).filter(Boolean);
  }
  if ("decisiveItemIds" in body && Array.isArray(body.decisiveItemIds)) {
    patch.decisive_item_ids = body.decisiveItemIds.map((x) => String(x).trim()).filter(Boolean);
  }
  await createAdminClient()
    .from("school_exam_analyses")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });
  }
  await createAdminClient().from("school_exam_analyses").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
