import { NextResponse } from "next/server";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * 교과서 본문 모음(우리 학원 것).
 * GET → 교과서 목록(과목·출판사), GET ?book=공통영어2|YBM(박준언) → 그 교과서의 본문들
 */
export async function GET(req: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const admin = createAdminClient();
  const academyId = auth.profile.academy_id;

  const book = new URL(req.url).searchParams.get("book");
  if (!book) {
    const { data } = await admin
      .from("textbook_passages")
      .select("subject, publisher")
      .eq("academy_id", academyId)
      .limit(3000);
    const map = new Map<string, { key: string; subject: string; publisher: string; count: number }>();
    for (const r of data ?? []) {
      const key = `${r.subject}|${r.publisher}`;
      const cur = map.get(key);
      if (cur) cur.count++;
      else map.set(key, { key, subject: String(r.subject), publisher: String(r.publisher), count: 1 });
    }
    return NextResponse.json({ ok: true, books: [...map.values()] });
  }

  const [subject, publisher] = book.split("|");
  const { data } = await admin
    .from("textbook_passages")
    .select("id, lesson, part, label, english_text, korean_text, word_count")
    .eq("academy_id", academyId)
    .eq("subject", subject ?? "")
    .eq("publisher", publisher ?? "")
    .order("order_index");

  return NextResponse.json({
    ok: true,
    passages: (data ?? []).map((p) => ({
      id: p.id as string,
      itemNo: `${p.lesson} ${p.part}`,
      label: String(p.label),
      shortLabel: `${p.lesson} ${p.part}`,
      text: String(p.english_text ?? ""),
      korean: String(p.korean_text ?? ""),
      words: Number(p.word_count ?? 0),
    })),
  });
}
