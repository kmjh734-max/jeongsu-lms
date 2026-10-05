import { NextResponse } from "next/server";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOutsidePassageOpen } from "@/lib/outside-passages/access";

export const runtime = "nodejs";

/**
 * 외부지문 모음(수능특강 등).
 * GET → 교재 목록, GET ?book=수능특강 라이트 영어독해 → 그 교재의 지문들
 * 응답 모양은 교과서 본문(/api/textbook-passages)과 같아서 같은 고르기 창에서 쓴다.
 */
export async function GET(req: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const admin = createAdminClient();
  if (!(await isOutsidePassageOpen(admin, auth.profile.academy_id))) {
    return NextResponse.json(
      { ok: false, message: "이 학원에서는 쓸 수 없는 기능입니다." },
      { status: 403 },
    );
  }

  const book = new URL(req.url).searchParams.get("book");
  if (!book) {
    const { data } = await admin.from("outside_passages").select("book").order("book");
    const map = new Map<string, { key: string; subject: string; publisher: string; count: number }>();
    for (const r of data ?? []) {
      const key = String(r.book);
      const cur = map.get(key);
      if (cur) cur.count++;
      else map.set(key, { key, subject: "외부지문", publisher: key, count: 1 });
    }
    return NextResponse.json({ ok: true, books: [...map.values()] });
  }

  const { data } = await admin
    .from("outside_passages")
    .select("id, unit, part, label, english_text, korean_text, word_count")
    .eq("book", book)
    .order("order_index");

  return NextResponse.json({
    ok: true,
    passages: (data ?? []).map((p) => ({
      id: p.id as string,
      itemNo: `${p.unit} ${p.part}`,
      label: String(p.label),
      shortLabel: `${p.unit} ${p.part}`,
      text: String(p.english_text ?? ""),
      korean: String(p.korean_text ?? ""),
      words: Number(p.word_count ?? 0),
    })),
  });
}
