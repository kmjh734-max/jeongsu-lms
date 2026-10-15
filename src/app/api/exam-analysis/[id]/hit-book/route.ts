import { gunzipSync } from "node:zlib";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import { loadExamAnalysis } from "@/lib/exam-analysis/load";
import { buildHitBook, summarizeHitBook, type HitBook, type HitUpload } from "@/lib/exam-analysis/hit-book";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 적중 자료집 (선생님 지시 2026-10-15) — 「만들기」를 누르면 대조해 담고, 화면에는 요약을 돌려준다.
 * 보기·인쇄 쪽은 담아 둔 것을 그대로 연다. 모델을 부르지 않아 값은 받지 않는다.
 * 선생님이 올린 개인 자료(PDF에서 뽑은 글)도 함께 대조하고, 다시 만들 때 쓰도록 담아 둔다.
 */
async function guard(id: string) {
  const staff = await requireExamStaff();
  if ("error" in staff) return { error: staff.error };
  const admin = createAdminClient();
  if (!(await isAcademyFeatureOn(admin, staff.profile.academy_id, "exam_hit_book"))) {
    return { error: NextResponse.json({ ok: false, message: "이 학원에서는 적중 자료집을 쓸 수 없어요." }, { status: 403 }) };
  }
  const data = await loadExamAnalysis(id, staff.profile.academy_id);
  if (!data) return { error: NextResponse.json({ ok: false, message: "시험지를 찾을 수 없어요." }, { status: 404 }) };
  return { admin, data };
}

const listOf = (u: HitUpload[]) => u.map((x) => ({ name: x.name, chars: x.text.length }));

/** 담아 둔 요약 + 올린 자료 목록 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;
  const { data: row } = await g.admin
    .from("school_exam_analyses")
    .select("hit_book, hit_book_at, hit_book_uploads")
    .eq("id", id)
    .maybeSingle();
  const book = (row?.hit_book ?? null) as HitBook | null;
  const at = (row?.hit_book_at ?? null) as string | null;
  const uploads = ((row?.hit_book_uploads ?? []) as HitUpload[]) ?? [];
  return NextResponse.json({ ok: true, summary: book && at ? summarizeHitBook(book, at) : null, uploads: listOf(uploads) });
}

/** 새로 만든다 — 본문(gzip JSON): { uploads: 새로 올린 자료, keep: 남겨 둘 예전 자료 이름 } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;
  if (g.data.items.length === 0) {
    return NextResponse.json({ ok: false, message: "문항표가 비어 있어요. 시험지 분석이 끝난 뒤 만들어 주세요." }, { status: 400 });
  }
  let body: { uploads?: HitUpload[]; keep?: string[] } = {};
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length > 0) {
      const raw = req.headers.get("x-hitbook-gzip") === "1" ? gunzipSync(buf) : buf;
      body = JSON.parse(raw.toString("utf8"));
    }
  } catch {
    return NextResponse.json({ ok: false, message: "올린 자료를 받지 못했어요. 다시 올려 주세요." }, { status: 400 });
  }
  try {
    const { data: row } = await g.admin.from("school_exam_analyses").select("hit_book_uploads").eq("id", id).maybeSingle();
    const saved = ((row?.hit_book_uploads ?? []) as HitUpload[]) ?? [];
    const keep = new Set(body.keep ?? saved.map((u) => u.name));
    const fresh = (body.uploads ?? [])
      .filter((u) => u && typeof u.name === "string" && typeof u.text === "string" && u.text.trim().length > 40)
      .map((u) => ({ name: u.name.slice(0, 200), text: u.text.slice(0, 400000) }));
    const uploads = [...saved.filter((u) => keep.has(u.name) && !fresh.some((f) => f.name === u.name)), ...fresh].slice(0, 30);

    const book = await buildHitBook(g.admin, g.data.analysis, g.data.items, g.data.analysis.created_at, uploads);
    const at = new Date().toISOString();
    const { error } = await g.admin
      .from("school_exam_analyses")
      .update({ hit_book: book, hit_book_at: at, hit_book_uploads: uploads })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, summary: summarizeHitBook(book, at), uploads: listOf(uploads) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "적중 자료집을 만들지 못했어요. 잠시 뒤 다시 눌러 주세요." },
      { status: 500 }
    );
  }
}
