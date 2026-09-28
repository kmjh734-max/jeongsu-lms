import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import type {
  GrammarChapterGroup,
  GrammarChapterRow,
  GrammarQuestion,
} from "./types";

/** 이 학원에서 문법 은행을 쓸 수 있는지 (정수학원처럼 켜 준 곳만) */
export async function isGrammarBankOpen(
  academyId: string | null | undefined,
): Promise<boolean> {
  return isAcademyFeatureOn(createAdminClient(), academyId, "grammar_bank");
}

const COLUMNS =
  "id, source_file, number, level, level_name, chapter_no, chapter, kind, round, tier, unit_no, unit, point_nos, point_label, question_kind, difficulty, badges, prompt, body, choices, answer, explanation";

/** 레벨 → 단원 → 묶음 차례로 정리해 돌려준다 */
export async function loadGrammarChapters(): Promise<GrammarChapterGroup[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("grammar_bank_chapters")
    .select("level, level_name, chapter_no, chapter, tier, question_count");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as GrammarChapterRow[];
  const byLevel = new Map<number, GrammarChapterGroup>();

  for (const row of rows) {
    let level = byLevel.get(row.level);
    if (!level) {
      level = { level: row.level, level_name: row.level_name, chapters: [] };
      byLevel.set(row.level, level);
    }
    let chapter = level.chapters.find((c) => c.chapter_no === row.chapter_no);
    if (!chapter) {
      chapter = {
        chapter_no: row.chapter_no,
        chapter: row.chapter,
        tiers: [],
        question_count: 0,
      };
      level.chapters.push(chapter);
    }
    chapter.tiers.push({
      tier: row.tier ?? 2,
      question_count: row.question_count,
    });
    chapter.question_count += row.question_count;
  }

  const groups = [...byLevel.values()].sort((a, b) => a.level - b.level);
  for (const group of groups) {
    group.chapters.sort((a, b) => a.chapter_no - b.chapter_no);
    for (const chapter of group.chapters) {
      chapter.tiers.sort((a, b) => a.tier - b.tier);
    }
  }
  return groups;
}

/** 한 단원의 문항 */
export async function loadGrammarQuestions(opts: {
  level: number;
  chapterNo: number;
  tier?: number | null;
}): Promise<GrammarQuestion[]> {
  const admin = createAdminClient();
  let query = admin
    .from("grammar_bank_questions")
    .select(COLUMNS)
    .eq("level", opts.level)
    .eq("chapter_no", opts.chapterNo)
    .order("tier", { ascending: true })
    .order("source_file", { ascending: true })
    .order("number", { ascending: true });

  if (opts.tier != null) query = query.eq("tier", opts.tier);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as GrammarQuestion[];
}

/** 시험지에 담은 문항을 한 번에 */
export async function loadGrammarQuestionsByIds(
  ids: number[],
): Promise<GrammarQuestion[]> {
  if (ids.length === 0) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .select(COLUMNS)
    .in("id", ids);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as GrammarQuestion[];
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
