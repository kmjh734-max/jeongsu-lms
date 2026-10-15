import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import { loadExamAnalysis } from "@/lib/exam-analysis/load";
import { assembleHitBook, buildHitBook, summarizeHitBook, type HitBook, type HitUpload } from "@/lib/exam-analysis/hit-book";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { flushAiUsage, setAiUsage } from "@/lib/ai-usage/context";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * 적중 자료집 문항 재검토 (선생님 지시 2026-10-15) — 한 문항만 다시 찾고 다시 판정해 담아 둔 자료집에 바꿔 넣는다.
 * 문항당 100(190). 그사이 만든 자료·올린 자료도 다시 찾는다.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requireExamStaff();
  if ("error" in staff) return staff.error;
  const academyId = staff.profile.academy_id;
  const admin = createAdminClient();
  if (!(await isAcademyFeatureOn(admin, academyId, "exam_hit_book"))) {
    return NextResponse.json({ ok: false, message: "이 학원에서는 적중 자료집을 쓸 수 없어요." }, { status: 403 });
  }
  const { itemId } = (await req.json().catch(() => ({}))) as { itemId?: string };
  const data = await loadExamAnalysis(id, academyId);
  if (!data || !itemId || !data.items.some((x) => x.id === itemId)) {
    return NextResponse.json({ ok: false, message: "문항을 찾을 수 없어요." }, { status: 404 });
  }
  const { data: row } = await admin.from("school_exam_analyses").select("hit_book, hit_book_uploads").eq("id", id).maybeSingle();
  const saved = (row?.hit_book ?? null) as HitBook | null;
  if (!saved) return NextResponse.json({ ok: false, message: "먼저 「적중 자료집 만들기」를 눌러 주세요." }, { status: 400 });

  const shortfall = await lessonCreditShortfall(academyId, "exam_hit_book_recheck");
  if (shortfall) return NextResponse.json({ ok: false, message: shortfall }, { status: 402 });

  try {
    setAiUsage({ academyId, actorId: staff.profile.id, featureKey: "exam_hit_book_recheck", usedFor: "exam_hit_book_recheck" });
    const uploads = ((row?.hit_book_uploads ?? []) as HitUpload[]) ?? [];
    const one = await buildHitBook(admin, data.analysis, data.items, data.analysis.created_at, uploads, { ai: true, only: itemId });
    const fresh = one.items[0];
    if (!fresh) throw new Error("문항을 다시 판정하지 못했어요.");
    const items = saved.items.some((x) => x.id === itemId)
      ? saved.items.map((x) => (x.id === itemId ? fresh : x))
      : [...saved.items, fresh];
    const book = assembleHitBook(data.analysis, items, saved.cutoff);
    const at = new Date().toISOString();
    const { error } = await admin.from("school_exam_analyses").update({ hit_book: book, hit_book_at: at }).eq("id", id);
    if (error) throw new Error(error.message);
    await flushAiUsage();
    await debitLessonCredits({
      academyId,
      actorId: staff.profile.id,
      featureKey: "exam_hit_book_recheck",
      idempotencyKey: `exam_hit_book_recheck:${id}:${itemId}:${at}`,
      metadata: { analysis_id: id, item_id: itemId, item_no: fresh.no, verdict: fresh.verdict },
      note: `적중 자료집 ${fresh.no}번 재검토`,
    });
    return NextResponse.json({ ok: true, summary: summarizeHitBook(book, at), item: { no: fresh.no, verdict: fresh.verdict, count: fresh.count } });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "재검토하지 못했어요. 잠시 뒤 다시 눌러 주세요." },
      { status: 500 }
    );
  }
}
