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

/** 한 번에 돌려주는 줄 수 (Supabase 가 여기서 끊는다) */
const PAGE = 1000;

/**
 * 1,000줄씩 끊어서 끝까지 가져온다.
 *
 * 그냥 부르면 1,000줄에서 말없이 잘린다. 은행이 만 문항을 넘었으므로 한 단원이
 * 그만큼 커질 수 있고, 그러면 뒤쪽 문항이 화면에서 통째로 사라진다.
 */
async function everyRow<T>(
  make: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await make(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const got = data ?? [];
    out.push(...got);
    if (got.length < PAGE) return out;
  }
}

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
  const rows = await everyRow<GrammarQuestion>((from, to) => {
    let query = admin
      .from("grammar_bank_questions")
      .select(COLUMNS)
      .eq("level", opts.level)
      .eq("chapter_no", opts.chapterNo)
      .order("tier", { ascending: true })
      .order("source_file", { ascending: true })
      .order("number", { ascending: true })
      .range(from, to);
    if (opts.tier != null) query = query.eq("tier", opts.tier);
    return query as unknown as PromiseLike<{
      data: GrammarQuestion[] | null;
      error: { message: string } | null;
    }>;
  });
  return rows;
}

/** 시험지에 담은 문항을 한 번에 */
export async function loadGrammarQuestionsByIds(
  ids: number[],
): Promise<GrammarQuestion[]> {
  if (ids.length === 0) return [];
  const admin = createAdminClient();
  const rows: GrammarQuestion[] = [];
  for (let i = 0; i < ids.length; i += 500) {
    const { data, error } = await admin
      .from("grammar_bank_questions")
      .select(COLUMNS)
      .in("id", ids.slice(i, i + 500));
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as GrammarQuestion[]));
  }
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

/**
 * 문항 하나를 같은 단원 안의 다른 세부 단원으로 옮긴다.
 *
 * 세부는 문제를 보고 자동으로 붙인 것이라 더러 어긋난다. 그래서 고칠 수 있게
 * 열어 두되, 그 단원에 이미 쓰이고 있는 세부로만 옮길 수 있게 막는다.
 */
export async function moveGrammarQuestionUnit(
  id: number,
  unit: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("grammar_bank_questions")
    .select("id, level, chapter_no")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, message: "문항을 찾을 수 없어요." };

  const siblings = await everyRow<{ unit: string }>((from, to) =>
    admin
      .from("grammar_bank_questions")
      .select("unit")
      .eq("level", row.level)
      .eq("chapter_no", row.chapter_no)
      .not("unit", "is", null)
      .order("id", { ascending: true })
      .range(from, to) as unknown as PromiseLike<{
      data: { unit: string }[] | null;
      error: { message: string } | null;
    }>,
  );
  const allowed = new Set(siblings.map((s) => s.unit));
  if (!allowed.has(unit)) {
    return { ok: false, message: "이 단원에 없는 세부 단원이에요." };
  }

  const { error } = await admin
    .from("grammar_bank_questions")
    .update({ unit })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
