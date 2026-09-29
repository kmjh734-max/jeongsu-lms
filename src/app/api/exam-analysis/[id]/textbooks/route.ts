import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { resolveTextbookPassageAcademyId } from "@/lib/textbooks/shared-passages";

export const runtime = "nodejs";

/**
 * 출처를 손으로 달 때 고를 목록 — 교과서 본문과 모의고사 지문.
 *
 * 지문 불러오기와 달리 대화문(듣기·말하기)도 함께 준다 — 듣기 지문이 시험에
 * 나오면 그 출처도 달 수 있어야 한다.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });
  }

  const admin = createAdminClient();
  const ownerId = await resolveTextbookPassageAcademyId(admin, auth.profile.academy_id);
  const rows: { id: string; subject: string; publisher: string; lesson: string; part: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await admin
      .from("textbook_passages")
      .select("id, subject, publisher, lesson, part")
      .eq("academy_id", ownerId)
      .order("order_index")
      .range(from, from + 999);
    rows.push(...((data ?? []) as typeof rows));
    if (!data || data.length < 1000) break;
  }

  // 교재별로 묶어 준다 — 고를 때 교재를 먼저 고르고 본문을 고른다
  const books = new Map<string, { key: string; label: string; parts: { id: string; label: string }[] }>();
  for (const r of rows) {
    const key = `${r.subject}|${r.publisher}`;
    if (!books.has(key)) books.set(key, { key, label: `${r.publisher} ${r.subject}`, parts: [] });
    books.get(key)!.parts.push({ id: r.id, label: `${r.lesson} ${r.part}` });
  }
  // 모의고사는 시험 회차로 묶는다
  const mockRows: { id: string; year: number; month: number; grade: number; kind: string; item_no: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await admin
      .from("mock_exam_passages")
      .select("id, year, month, grade, kind, item_no")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("sort_no")
      .range(from, from + 999);
    mockRows.push(...((data ?? []) as typeof mockRows));
    if (!data || data.length < 1000) break;
  }
  const exams = new Map<string, { key: string; label: string; parts: { id: string; label: string }[] }>();
  for (const r of mockRows) {
    const key = `${r.year}-${r.month}-${r.grade}`;
    const kind = r.kind === "모의평가" ? "모평" : "학평";
    if (!exams.has(key)) {
      exams.set(key, { key, label: `${String(r.year).slice(2)}년 고${r.grade} ${r.month}월 ${kind}`, parts: [] });
    }
    exams.get(key)!.parts.push({ id: r.id, label: `${r.item_no}번` });
  }

  return NextResponse.json({
    ok: true,
    books: [...books.values()].sort((a, b) => a.label.localeCompare(b.label, "ko")),
    mocks: [...exams.values()],
  });
}
