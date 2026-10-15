import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { HwpReadError, hwpToText } from "@/lib/exam-analysis/hwp-text";

export const runtime = "nodejs";
export const maxDuration = 60;

/** 적중 자료집에 올린 한글(HWP · HWPX) 파일에서 글자를 뽑는다(2026-10-15). 모델을 부르지 않아 값은 없다. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requireExamStaff();
  if ("error" in staff) return staff.error;
  if (!(await isAcademyFeatureOn(createAdminClient(), staff.profile.academy_id, "exam_hit_book"))) {
    return NextResponse.json({ ok: false, message: "이 학원에서는 적중 자료집을 쓸 수 없어요." }, { status: 403 });
  }
  if (!(await loadOwnAnalysis(id, staff.profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "시험지를 찾을 수 없어요." }, { status: 404 });
  }
  const name = decodeURIComponent(req.headers.get("x-filename") ?? "file.hwp");
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    const text = hwpToText(buf, name);
    return NextResponse.json({ ok: true, name, text });
  } catch (e) {
    const why = e instanceof HwpReadError ? e.message : "한글 파일을 읽지 못했어요.";
    return NextResponse.json({ ok: false, message: `${name}: ${why} 한글에서 「파일 → PDF로 저장」 한 뒤 PDF로 올려 주세요.` }, { status: 400 });
  }
}
