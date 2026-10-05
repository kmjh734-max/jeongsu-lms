import { NextResponse } from "next/server";
import { joinOrphanParticles } from "@/lib/korean-spacing";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTextbookPassageOpen, resolveTextbookPassageAcademyId } from "@/lib/textbooks/shared-passages";

export const runtime = "nodejs";

/**
 * 교과서 본문 모음(우리 학원 것).
 * GET → 교과서 목록(과목·출판사), GET ?book=공통영어2|YBM(박준언) → 그 교과서의 본문들
 */
export async function GET(req: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const admin = createAdminClient();
  if (!(await isTextbookPassageOpen(admin, auth.profile.academy_id))) {
    return NextResponse.json(
      { ok: false, message: "이 학원에서는 쓸 수 없는 기능입니다." },
      { status: 403 },
    );
  }
  const academyId = await resolveTextbookPassageAcademyId(admin, auth.profile.academy_id);

  const book = new URL(req.url).searchParams.get("book");
  if (!book) {
    /*
     * DB가 한 번에 1,000행까지만 돌려준다(limit(3000)이어도). 본문이 1,737개로 늘자 뒤에 적재한
     * 교과서(영어2 등)가 목록에서 빠졌다(2026-10-05). 1,000행씩 끝까지 읽는다.
     */
    const data: { subject: string; publisher: string }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: page } = await admin
        .from("textbook_passages")
        .select("subject, publisher")
        .eq("academy_id", academyId)
        .order("id")
        .range(from, from + 999);
      data.push(...((page ?? []) as typeof data));
      if (!page || page.length < 1000) break;
    }
    const map = new Map<string, { key: string; subject: string; publisher: string; count: number }>();
    for (const r of data) {
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

  /*
   * 대화문(듣기·말하기 단원)은 지문 불러오기에 내지 않는다.
   *
   * 선생님 말씀(2026-09-30): 대화문은 DB에 두어 내신 보고서에서 출처를 파악하는
   * 데는 써야 하지만, 지문을 불러와 자료를 만들 때는 나오면 안 된다.
   * 주제·제목·빈칸 같은 독해 유형을 대화문으로 내면 문항이 서지 않는다.
   *
   * 출처 대조는 DB를 바로 읽으므로 그대로 잡힌다. 여기서만 걷어 낸다.
   * 적재할 때 part를 「대화문N」으로 따로 두므로 글 내용을 짐작할 것 없이 가려진다.
   */
  const rows = (data ?? []).filter((p) => !String(p.part ?? "").startsWith("대화문"));

  return NextResponse.json({
    ok: true,
    passages: rows.map((p) => ({
      id: p.id as string,
      itemNo: `${p.lesson} ${p.part}`,
      label: String(p.label),
      shortLabel: `${p.lesson} ${p.part}`,
      text: String(p.english_text ?? ""),
      // 떨어져 나온 조사를 붙인다 (korean-spacing.ts에 까닭을 적었다)
      korean: joinOrphanParticles(String(p.korean_text ?? "")),
      words: Number(p.word_count ?? 0),
    })),
  });
}
