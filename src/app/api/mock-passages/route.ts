import { NextResponse } from "next/server";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadMockExamList, loadMockExamPassages, mockPassageLabel, mockPassageShortLabel } from "@/lib/mock-passages";

/**
 * 모의고사 지문 모음.
 * GET → 시험 목록, GET ?exam=2024-6-2 → 그 시험의 지문들
 */
export async function GET(req: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const admin = createAdminClient();

  const exam = new URL(req.url).searchParams.get("exam");
  if (!exam) {
    return NextResponse.json({ ok: true, exams: await loadMockExamList(admin) });
  }
  const [year, month, grade] = exam.split("-").map((v) => parseInt(v, 10));
  if (!year || !month || !grade) {
    return NextResponse.json({ ok: false, message: "시험을 다시 골라 주세요." }, { status: 400 });
  }
  const passages = await loadMockExamPassages(admin, { year, month, grade });
  return NextResponse.json({
    ok: true,
    passages: passages.map((p) => ({
      id: p.id,
      itemNo: p.item_no,
      label: mockPassageLabel(p),
      shortLabel: mockPassageShortLabel(p),
      text: p.english_text,
      words: p.word_count,
    })),
  });
}
