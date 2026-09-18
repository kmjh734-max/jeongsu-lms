/**
 * 세트를 다 만든 뒤 한 번에 보는 검사 — 문항 하나만 봐서는 알 수 없는 흠을 잡는다.
 *
 * 선생님이 3회차를 받아 보고 짚은 것(2026-09-18):
 *  1) 중1·중2·중3의 같은 번호가 같은 이야기였다 (문항 하나만 보면 멀쩡하다)
 *  2) 한 회차 안에서 정답 번호가 한쪽으로 쏠렸다 (중2 3회: ② 9개, ④ 0개)
 * 둘 다 사람이 읽어야만 보이던 흠이라, 만든 자리에서 기계가 보고 스스로 고친다.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";

/** 뜻이 옅어 소재를 가리지 못하는 낱말 */
const STOP = new Set(
  `the a an and or but so then that this these those i you he she it we they me my your his her our their
   is are am was were be been being do does did have has had will would can could should may might must
   to of in on at for with from about into over after before as not no yes ok okay well oh right good great
   nice thanks thank please let lets us there here what when where why how who which very really just too
   also more most much many some any all every one two three four five six seven eight nine ten first next
   last time day today tomorrow yesterday now again still only if because while during until since than
   like want need know think see look come go get make take give find` .split(/\s+/)
);

/** 대본에서 소재를 가리는 낱말만 남긴다 */
export function topicWords(text: string): Set<string> {
  return new Set(
    String(text ?? "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
  );
}

/** 두 대본이 얼마나 같은 소재인지 (0~1) */
export function topicOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let same = 0;
  for (const w of a) if (b.has(w)) same++;
  return same / Math.max(6, Math.min(a.size, b.size));
}

/** 이만큼 겹치면 같은 이야기로 본다 (실측: 다른 이야기는 보통 0.2 아래, 같은 이야기는 0.5 위) */
export const SAME_STORY = 0.45;

export interface StoredQuestionLite {
  id: string;
  order_index: number;
  question_type: string | null;
  script_text: string | null;
}

/**
 * 같은 학원의 다른 세트(같은 학년의 지난 회차, 그리고 다른 학년의 같은 번호)와 견줘
 * 이야기가 겹치는 문항을 찾는다. DB만 읽고 모델은 부르지 않는다.
 */
export async function findDuplicateStories(
  admin: SupabaseClient,
  setId: string,
  gradeLevel: ListeningGradeLevel,
  questions: StoredQuestionLite[]
): Promise<Array<{ orderIndex: number; note: string }>> {
  try {
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("id, academy_id, folder_id")
      .eq("id", setId)
      .maybeSingle();
    if (!setRow) return [];

    let q = admin.from("listening_sets").select("id, title, grade_level").neq("id", setId).limit(60);
    if (setRow.academy_id) q = q.eq("academy_id", setRow.academy_id);
    else if (setRow.folder_id) q = q.eq("folder_id", setRow.folder_id);
    else return [];
    const { data: others } = await q;
    const otherIds = (others ?? []).map((s) => s.id as string);
    if (otherIds.length === 0) return [];

    const titleOf = new Map((others ?? []).map((s) => [s.id as string, String(s.title ?? "")]));
    const rows: Array<{ set_id: string; order_index: number; script_text: string | null }> = [];
    for (let i = 0; i < otherIds.length; i += 40) {
      const { data } = await admin
        .from("listening_questions")
        .select("set_id, order_index, script_text")
        .in("set_id", otherIds.slice(i, i + 40));
      rows.push(...((data ?? []) as typeof rows));
    }

    const oldWords = rows.map((r) => ({
      title: titleOf.get(r.set_id) ?? "",
      orderIndex: Number(r.order_index),
      words: topicWords(String(r.script_text ?? "")),
    }));

    const out: Array<{ orderIndex: number; note: string }> = [];
    for (const item of questions) {
      const mine = topicWords(String(item.script_text ?? ""));
      if (mine.size === 0) continue;
      let worst: { title: string; orderIndex: number; ratio: number } | null = null;
      for (const old of oldWords) {
        const ratio = topicOverlap(mine, old.words);
        if (ratio >= SAME_STORY && (!worst || ratio > worst.ratio)) {
          worst = { title: old.title, orderIndex: old.orderIndex, ratio };
        }
      }
      if (worst) {
        out.push({
          orderIndex: item.order_index,
          note: `same_story|${worst.title} ${worst.orderIndex}번과 이야기가 겹친다(${Math.round(
            worst.ratio * 100
          )}%). 장소·소재·등장인물·물건을 완전히 다른 것으로 바꿔 새 상황으로 써라.`,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** 정답 자리를 바꿔도 되는 문항인지 (선택지 차례가 대본·표·그림으로 정해지면 안 된다) */
const FIXED_ORDER = /언급하지|미언급|불일치|표|그림|어색한|양식|순서|일치하지/;

function looksOrdered(choices: string[]): boolean {
  const nums = choices.map((c) => {
    const m = String(c).match(/(\d+(?:[.:]\d+)?)/);
    return m ? Number(m[1].replace(":", ".")) : null;
  });
  if (nums.some((n) => n === null)) return false;
  const asc = nums.every((n, i) => i === 0 || (n as number) >= (nums[i - 1] as number));
  const desc = nums.every((n, i) => i === 0 || (n as number) <= (nums[i - 1] as number));
  return asc || desc;
}

export interface BalanceableQuestion {
  order_index: number;
  question_type?: string | null;
  choices?: string[] | null;
  correct_answer?: number | null;
  table_data?: unknown;
  choice_image_prompts?: string[] | null;
  choice_image_urls?: string[] | null;
}

/**
 * 한 회차 안에서 정답 번호가 쏠린 것을 고르게 편다.
 * 문항 내용은 손대지 않고, 차례가 정해지지 않은 유형에서만 선택지 두 개의 자리를 바꾼다.
 * 바뀐 문항만 돌려준다(빈 배열이면 그대로 두면 된다).
 */
export function balanceAnswerNumbers<T extends BalanceableQuestion>(
  questions: T[]
): Array<{ order_index: number; choices: string[]; correct_answer: number }> {
  const counts = [0, 0, 0, 0, 0];
  for (const q of questions) {
    const a = Number(q.correct_answer);
    if (a >= 1 && a <= 5) counts[a - 1]!++;
  }
  const movable = questions.filter((q) => {
    const c = (q.choices ?? []).map(String);
    if (c.length !== 5) return false;
    if (c.every((x) => /^[①②③④⑤]$/.test(x.trim()))) return false;
    if (looksOrdered(c)) return false;
    if (FIXED_ORDER.test(String(q.question_type ?? ""))) return false;
    if ((q.choice_image_prompts ?? []).filter(Boolean).length > 0) return false;
    if ((q.choice_image_urls ?? []).filter(Boolean).length > 0) return false;
    if (q.table_data) return false;
    return true;
  });

  const changed: Array<{ order_index: number; choices: string[]; correct_answer: number }> = [];
  for (let guard = 0; guard < 12; guard++) {
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    // 스무 문항에서 한 번호가 다른 번호보다 셋 넘게 많으면 눈에 띈다
    if (max - min <= 2) break;
    const from = counts.indexOf(max);
    const to = counts.indexOf(min);
    const target = movable.find(
      (q) => Number(q.correct_answer) === from + 1 && !changed.some((c) => c.order_index === q.order_index)
    );
    if (!target) break;
    const next = [...(target.choices ?? []).map(String)];
    const tmp = next[from]!;
    next[from] = next[to]!;
    next[to] = tmp;
    changed.push({ order_index: target.order_index, choices: next, correct_answer: to + 1 });
    counts[from]!--;
    counts[to]!++;
  }
  return changed;
}
