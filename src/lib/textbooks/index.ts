import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 교재 목차 — 목차를 한 번 올려 두면 학습일정표에서 트리로 골라 쓴다.
 * 올리는 방법: 목차를 그대로 붙여 넣는다. 들여쓰기(공백·탭)로 층을 나눈다.
 */
export type TextbookUnit = {
  id: string;
  parentId: string | null;
  title: string;
  pages: string | null;
  depth: number;
  orderIndex: number;
};

export type Textbook = {
  id: string;
  title: string;
  subject: string | null;
  units: TextbookUnit[];
};

export type ParsedUnit = { title: string; pages: string | null; depth: number };

/**
 * 붙여 넣은 목차를 층으로 나눈다.
 * - 줄 앞 공백 두 칸(또는 탭 하나)이 한 층
 * - 줄 끝의 "p.42~47", "42-47", "(42~47)"은 쪽으로 떼어 낸다
 * - "1과", "Unit 3" 같은 번호는 제목에 그대로 둔다
 */
export function parseTableOfContents(text: string): ParsedUnit[] {
  const out: ParsedUnit[] = [];
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const indent = raw.match(/^[\t ]*/)?.[0] ?? "";
    const depth = Math.min(3, indent.replace(/\t/g, "  ").length >> 1);
    let title = raw.trim();
    let pages: string | null = null;
    const m = title.match(/[\s(\[]*((?:p\.?\s*)?\d{1,4}\s*(?:[~\-–]\s*\d{1,4})?)\s*(?:쪽|페이지|p)?[)\]]*$/i);
    if (m && /\d/.test(m[1]!) && title.length > m[0].length) {
      pages = m[1]!.replace(/\s+/g, "").replace(/^p\.?/i, "");
      title = title.slice(0, title.length - m[0].length).trim().replace(/[.\-–·]+$/, "").trim();
    }
    if (!title) continue;
    out.push({ title, pages, depth });
  }
  return out;
}

/** 목차를 저장한다(교재 하나 통째로) */
export async function saveTextbook(
  admin: SupabaseClient,
  input: { academyId: string; title: string; subject?: string | null; createdBy?: string | null; units: ParsedUnit[]; textbookId?: string | null }
): Promise<string> {
  let bookId = input.textbookId ?? null;
  if (bookId) {
    await admin.from("textbooks").update({ title: input.title, subject: input.subject ?? null }).eq("id", bookId);
    await admin.from("textbook_units").delete().eq("textbook_id", bookId);
  } else {
    const { data, error } = await admin
      .from("textbooks")
      .insert({ academy_id: input.academyId, title: input.title, subject: input.subject ?? null, created_by: input.createdBy ?? null })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "교재를 저장하지 못했습니다.");
    bookId = data.id as string;
  }

  // 층을 따라 부모를 잡아 가며 넣는다
  const parents: string[] = [];
  let order = 0;
  for (const u of input.units) {
    const parentId = u.depth > 0 ? parents[u.depth - 1] ?? null : null;
    const { data, error } = await admin
      .from("textbook_units")
      .insert({
        textbook_id: bookId,
        parent_id: parentId,
        title: u.title,
        pages: u.pages,
        depth: u.depth,
        order_index: order++,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "목차를 저장하지 못했습니다.");
    parents[u.depth] = data.id as string;
    parents.length = u.depth + 1;
  }
  return bookId;
}

export async function listTextbooks(admin: SupabaseClient, academyId: string): Promise<Textbook[]> {
  const { data: books } = await admin
    .from("textbooks")
    .select("id, title, subject")
    .eq("academy_id", academyId)
    .order("created_at", { ascending: false });
  const list = books ?? [];
  if (list.length === 0) return [];

  const { data: units } = await admin
    .from("textbook_units")
    .select("id, textbook_id, parent_id, title, pages, depth, order_index")
    .in("textbook_id", list.map((b) => b.id as string))
    .order("order_index");

  return list.map((b) => ({
    id: b.id as string,
    title: String(b.title ?? ""),
    subject: (b.subject as string | null) ?? null,
    units: (units ?? [])
      .filter((u) => u.textbook_id === b.id)
      .map((u) => ({
        id: u.id as string,
        parentId: (u.parent_id as string | null) ?? null,
        title: String(u.title ?? ""),
        pages: (u.pages as string | null) ?? null,
        depth: Number(u.depth ?? 0),
        orderIndex: Number(u.order_index ?? 0),
      })),
  }));
}

/** 진도 칸에 넣을 글자: "3과 Reading (42~47)" */
export function unitLabel(unit: TextbookUnit, parents: TextbookUnit[]): string {
  const path = [...parents.map((p) => p.title), unit.title].join(" ");
  return unit.pages ? `${path} (${unit.pages})` : path;
}
