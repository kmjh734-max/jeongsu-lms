import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import type { MsWorkbook } from "./workbook";

/**
 * 중학교 수업자료(선생님 2026-10-29): 족보닷컴 중학 교과서 자료를 과 단위로 읽는다.
 * 정수학원만 켠다(기능 키 middle_school_lessons). 자료는 정수학원 것으로 적재돼 있다.
 */

export type MsWord = {
  section: "대화문" | "본문";
  word: string;
  meaning: string;
  examples?: { en: string; ko: string }[];
};

export type MsGrammar = {
  no: number;
  title: string;
  /** 「설명 | e.g. 예문」 꼴 — 예문이 없으면 설명만 */
  points: string[];
  examples: { en: string; ko: string; fromText: boolean }[];
};

export type MsLine = { en: string; ko: string; speaker: string };

export type MsText = {
  id: string;
  kind: "대화문" | "본문";
  part: string;
  title: string | null;
  lines: MsLine[];
};

export type MsUnitSummary = {
  id: string;
  grade: string;
  publisher: string;
  lessonNo: number;
  title: string;
  wordCount: number;
  grammarTitles: string[];
};

export type MsUnit = MsUnitSummary & {
  words: MsWord[];
  grammar: MsGrammar[];
  dialogues: MsText[];
  passages: MsText[];
  /** 미리 정해 둔 워크북 문항(족보닷컴 본문 10단계 워크북) */
  workbook: MsWorkbook;
};

export async function isMiddleSchoolOpen(academyId: string | null | undefined): Promise<boolean> {
  return isAcademyFeatureOn(createAdminClient(), academyId, "middle_school_lessons");
}

type UnitRow = {
  id: string;
  grade: string;
  publisher: string;
  lesson_no: number;
  title: string;
  words: MsWord[];
  grammar: MsGrammar[];
};

function summary(r: UnitRow): MsUnitSummary {
  return {
    id: r.id,
    grade: r.grade,
    publisher: r.publisher,
    lessonNo: r.lesson_no,
    title: r.title,
    wordCount: (r.words ?? []).length,
    grammarTitles: (r.grammar ?? []).map((g) => g.title),
  };
}

export async function loadMsUnits(academyId: string): Promise<MsUnitSummary[]> {
  const { data } = await createAdminClient()
    .from("ms_units")
    .select("id, grade, publisher, lesson_no, title, words, grammar")
    .eq("academy_id", academyId)
    .order("grade")
    .order("publisher")
    .order("lesson_no");
  return ((data ?? []) as UnitRow[]).map(summary);
}

export async function loadMsUnit(academyId: string, unitId: string): Promise<MsUnit | null> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("ms_units")
    .select("id, grade, publisher, lesson_no, title, words, grammar, workbook")
    .eq("academy_id", academyId)
    .eq("id", unitId)
    .maybeSingle();
  if (!row) return null;
  const { data: texts } = await admin
    .from("ms_texts")
    .select("id, kind, part, title, lines")
    .eq("unit_id", unitId)
    .order("order_index");
  const all = (texts ?? []) as MsText[];
  const r = row as UnitRow & { workbook: MsWorkbook | null };
  return {
    ...summary(r),
    words: r.words ?? [],
    grammar: r.grammar ?? [],
    dialogues: all.filter((t) => t.kind === "대화문"),
    passages: all.filter((t) => t.kind === "본문"),
    workbook: r.workbook ?? {},
  };
}
