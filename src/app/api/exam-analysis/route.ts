import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { requireExamStaff } from "@/lib/exam-analysis/access";

export const runtime = "nodejs";

/** 새 시험지 분석 시작 { pageCount, schoolName?, grade?, subject?, examLabel? } */
export async function POST(request: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { profile } = auth;
  const body = (await request.json().catch(() => ({}))) as {
    pageCount?: number;
    schoolName?: string;
    grade?: string;
    subject?: string;
    examLabel?: string;
    matchMaterials?: boolean;
  };
  const pageCount = Math.floor(Number(body.pageCount) || 0);
  if (pageCount < 1 || pageCount > 20) {
    return NextResponse.json({ ok: false, message: "시험지는 1~20쪽까지 올릴 수 있어요." }, { status: 400 });
  }
  const shortfall = await lessonCreditShortfall(profile.academy_id, "school_exam_analysis");
  if (shortfall) return NextResponse.json({ ok: false, message: shortfall, code: "insufficient_credits" }, { status: 402 });

  const clean = (s?: string) => (s ?? "").trim().slice(0, 60) || null;
  const { data, error } = await createAdminClient()
    .from("school_exam_analyses")
    .insert({
      academy_id: profile.academy_id,
      created_by: profile.id,
      page_count: pageCount,
      school_name: clean(body.schoolName),
      grade: clean(body.grade),
      subject: clean(body.subject),
      exam_label: clean(body.examLabel),
      match_materials: body.matchMaterials !== false,
    })
    .select("id")
    .single();
  if (error || !data) return NextResponse.json({ ok: false, message: "분석을 시작하지 못했어요." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
