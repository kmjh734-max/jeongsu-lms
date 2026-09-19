import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { refreshMaterialMatches } from "@/lib/exam-analysis/match-materials";

export const runtime = "nodejs";

/** 수업자료 대조 켜기·끄기 { enabled } — 켜면 지금 수업자료로 다시 대조한다 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });
  }
  const body = (await request.json().catch(() => ({}))) as { enabled?: boolean };
  const matched = await refreshMaterialMatches(createAdminClient(), id, auth.profile.academy_id, body.enabled !== false);
  return NextResponse.json({ ok: true, matched });
}
