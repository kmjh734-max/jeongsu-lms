import type { SupabaseClient } from "@supabase/supabase-js";

/** 모의고사 지문 모음(mock_exam_passages): 학력평가·모의평가 영어 지문 원문 */
export type MockPassage = {
  id: string;
  year: number;
  month: number;
  grade: number;
  kind: string;
  item_no: string;
  english_text: string;
  gloss: string | null;
  word_count: number;
};

export type MockExamSummary = {
  key: string;
  year: number;
  month: number;
  grade: number;
  kind: string;
  count: number;
};

/** 2024년 고2 6월 학력평가 24번 */
export function mockPassageLabel(p: Pick<MockPassage, "year" | "month" | "grade" | "kind" | "item_no">) {
  return `${p.year}년 고${p.grade} ${p.month}월 ${p.kind} ${p.item_no}번`;
}

/** 24년 고2 6월 학평 24번 (보고서 표처럼 좁은 칸) */
export function mockPassageShortLabel(p: Pick<MockPassage, "year" | "month" | "grade" | "kind" | "item_no">) {
  const kind = p.kind === "모의평가" ? "모평" : "학평";
  return `${String(p.year).slice(2)}년 고${p.grade} ${p.month}월 ${kind} ${p.item_no}번`;
}

export const mockExamKey = (p: { year: number; month: number; grade: number }) => `${p.year}-${p.month}-${p.grade}`;

const COLUMNS = "id, year, month, grade, kind, item_no, english_text, gloss, word_count";

/** 시험 목록 (학년·연도·월별 지문 수) */
export async function loadMockExamList(admin: SupabaseClient): Promise<MockExamSummary[]> {
  // 한 번에 1,000줄까지만 오므로 나눠 읽는다
  const data: { year: number; month: number; grade: number; kind: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data: page } = await admin
      .from("mock_exam_passages")
      .select("year, month, grade, kind")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("id")
      .range(from, from + 999);
    data.push(...((page ?? []) as typeof data));
    if (!page || page.length < 1000) break;
  }
  const map = new Map<string, MockExamSummary>();
  for (const r of data) {
    const key = mockExamKey(r as MockExamSummary);
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { key, year: r.year, month: r.month, grade: r.grade, kind: r.kind, count: 1 });
  }
  return [...map.values()];
}

/** 시험 하나의 지문들 (번호 순) */
export async function loadMockExamPassages(
  admin: SupabaseClient,
  exam: { year: number; month: number; grade: number }
): Promise<MockPassage[]> {
  const { data } = await admin
    .from("mock_exam_passages")
    .select(COLUMNS)
    .eq("year", exam.year)
    .eq("month", exam.month)
    .eq("grade", exam.grade)
    .order("sort_no");
  return (data ?? []) as MockPassage[];
}

/** 대조용: 전체 지문 */
export async function loadAllMockPassages(admin: SupabaseClient): Promise<MockPassage[]> {
  const out: MockPassage[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await admin
      .from("mock_exam_passages")
      .select(COLUMNS)
      .order("id")
      .range(from, from + 999);
    out.push(...((data ?? []) as MockPassage[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}
