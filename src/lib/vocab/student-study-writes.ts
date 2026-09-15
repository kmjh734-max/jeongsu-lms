import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { scheduleStudentMonthlySeat } from "@/lib/credits/monthly-seat";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import {
  buildExampleBlankQuestion,
  gradeExampleBlankAnswer,
} from "@/lib/vocab/example-blank";
import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import { loadStageProgress } from "@/lib/vocab/load-stage-progress";
import { isStudentAssignedToVocabSet } from "@/lib/vocab/student-assignment";
import type { VocabItem } from "@/types/database";

/*
 * 학생 단어학습 기록(서버 전용).
 * 학생 계정에는 진행·점수 테이블 쓰기 권한이 없다(마이그레이션 130).
 * 로그인한 학생 본인인지, 이 단어장을 배정받았는지 확인한 뒤 service role로 쓴다.
 * 서버 액션(actions.ts)과 기록용 API(/api/student/vocab/record)가 함께 쓴다.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ANSWER_LENGTH = 200;
export const MAX_LIST_LENGTH = 2000;
/** 한 번에 받는 기록 수 (화면은 보통 몇 개씩 모아 보낸다) */
export const MAX_BATCH = 200;

export type StudentSetContext = {
  studentId: string;
  admin: SupabaseClient;
  examCompact: boolean;
};

type ContextResult =
  | { ctx: StudentSetContext; error: null }
  | { ctx: null; error: ActionResult };

export type Stage1Result = ActionResult & { completed?: boolean };

export interface Stage1Response {
  itemId: string;
  known: boolean;
}

export interface PracticeAttempt {
  itemId: string;
  answer: string;
  round: number;
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function cleanAnswer(value: unknown): string {
  return String(value ?? "").slice(0, MAX_ANSWER_LENGTH);
}

function cleanRound(value: unknown): number {
  return Math.max(1, Math.min(1000, Math.floor(Number(value) || 1)));
}

/** 로그인 학생 + 배정된 단어장인지 확인하고 서버용 클라이언트를 돌려준다 */
export async function studentSetContext(setId: unknown): Promise<ContextResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return { ctx: null, error: actionError("학생 계정으로 로그인해 주세요.") };
  }
  if (!isUuid(setId)) {
    return { ctx: null, error: actionError("단어장을 찾을 수 없어요.") };
  }

  const admin = createAdminClient();
  const [{ data: set }, assigned] = await Promise.all([
    admin
      .from("vocab_sets")
      .select("id, exam_compact")
      .eq("id", setId)
      .maybeSingle(),
    isStudentAssignedToVocabSet(admin, profile.id, setId),
  ]);
  if (!set || !assigned) {
    return { ctx: null, error: actionError("단어장을 찾을 수 없어요.") };
  }

  // 새 달에 처음 공부하면 이번 달 이용료를 낸다(응답 뒤에, 잔액이 모자라도 공부는 막지 않는다)
  scheduleStudentMonthlySeat({
    academyId: profile.academy_id,
    studentId: profile.id,
    kind: "vocab",
    assignmentVerified: true,
  });

  return {
    ctx: {
      studentId: profile.id,
      admin,
      examCompact: Boolean(set.exam_compact),
    },
    error: null,
  };
}

export async function loadSetItems<T>(
  admin: SupabaseClient,
  setId: string,
  columns: string
): Promise<T[]> {
  const { data } = await admin
    .from("vocab_items")
    .select(columns)
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");
  return (data ?? []) as T[];
}

/* ------------------------------------------------------------------------ */
/* 1단계 · 뜻 익히기 (알아요/몰라요 여러 개를 한 번에)                          */
/* ------------------------------------------------------------------------ */

export async function recordStage1Batch(
  ctx: StudentSetContext,
  setId: string,
  responses: unknown,
  /** 이 화면에서 이미 넘긴 카드들 (동시에 저장될 때 서로 덮어쓰지 않게) */
  seenIds?: unknown
): Promise<Stage1Result> {
  const { admin, studentId } = ctx;
  const list = (Array.isArray(responses) ? responses.slice(0, MAX_BATCH) : [])
    .filter(
      (r): r is Stage1Response =>
        Boolean(r) && isUuid((r as Stage1Response).itemId)
    )
    .map((r) => ({ itemId: r.itemId, known: Boolean(r.known) }));
  const itemIds = [...new Set(list.map((r) => r.itemId))];

  const [items, progress, { data: existingRows }] = await Promise.all([
    loadSetItems<{ id: string }>(admin, setId, "id"),
    loadStageProgress(admin, studentId, setId, { fields: "stage1" }),
    itemIds.length > 0
      ? admin
          .from("vocab_progress")
          .select("item_id, studied_count")
          .eq("student_id", studentId)
          .in("item_id", itemIds)
      : Promise.resolve({ data: [] as { item_id: string; studied_count: number }[] }),
  ]);
  const currentIds = new Set(items.map((i) => i.id));
  const valid = list.filter((r) => currentIds.has(r.itemId));
  if (list.length > 0 && valid.length === 0) {
    return actionError("단어를 찾을 수 없어요.");
  }

  const now = new Date().toISOString();

  if (valid.length > 0) {
    // 같은 단어가 여러 번 오면 마지막 답을 쓰고, 본 횟수는 모두 센다
    const countById = new Map<string, number>();
    const lastById = new Map<string, boolean>();
    for (const r of valid) {
      countById.set(r.itemId, (countById.get(r.itemId) ?? 0) + 1);
      lastById.set(r.itemId, r.known);
    }
    const prevCount = new Map(
      ((existingRows ?? []) as { item_id: string; studied_count: number | null }[]).map(
        (row) => [row.item_id, row.studied_count ?? 0]
      )
    );
    const { error: upsertError } = await admin.from("vocab_progress").upsert(
      [...lastById].map(([itemId, known]) => ({
        student_id: studentId,
        item_id: itemId,
        status: known ? "known" : "review",
        studied_count: (prevCount.get(itemId) ?? 0) + (countById.get(itemId) ?? 1),
        last_studied_at: now,
      })),
      { onConflict: "student_id,item_id" }
    );
    if (upsertError) {
      console.error("[vocab] stage1 progress upsert failed", upsertError);
      return actionError("저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
  }

  if (progress.stage1_completed) {
    return { ...actionSuccess("기록했어요."), completed: true };
  }

  // 지금 단어장에 있는 단어만 센다 (지워진 단어의 기록으로 일찍 끝나지 않게)
  const clientSeen = Array.isArray(seenIds)
    ? seenIds.slice(0, MAX_LIST_LENGTH)
    : [];
  const seen = new Set<string>();
  for (const id of [
    ...(progress.stage1_seen_item_ids ?? []),
    ...clientSeen,
    ...valid.map((r) => r.itemId),
  ]) {
    if (typeof id === "string" && currentIds.has(id)) seen.add(id);
  }
  const seenList = [...seen];
  const allSeen = currentIds.size > 0 && seenList.length >= currentIds.size;

  const { error: stageError } = await admin
    .from("vocab_stage_progress")
    .update({
      stage1_seen_item_ids: seenList,
      stage1_completed: allSeen,
      stage1_completed_at: allSeen ? now : null,
      updated_at: now,
    })
    .eq("id", progress.id)
    .eq("stage1_completed", false);
  if (stageError) {
    console.error("[vocab] stage1 stage progress update failed", stageError);
    return actionError("저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
  }

  if (allSeen) {
    return {
      ...actionSuccess("1단계를 완료했어요. 2단계를 시작할 수 있어요."),
      completed: true,
    };
  }
  return { ...actionSuccess("기록했어요."), completed: false };
}

/* ------------------------------------------------------------------------ */
/* 2단계 · 스펠링 / 3단계 · 예문 빈칸 입력 기록                                */
/* ------------------------------------------------------------------------ */

function cleanAttempts(attempts: unknown): PracticeAttempt[] {
  return (Array.isArray(attempts) ? attempts.slice(0, MAX_BATCH) : [])
    .filter(
      (a): a is PracticeAttempt =>
        Boolean(a) && isUuid((a as PracticeAttempt).itemId)
    )
    .map((a) => ({
      itemId: a.itemId,
      answer: cleanAnswer(a.answer),
      round: cleanRound(a.round),
    }));
}

/** 스펠링 입력 기록 — 정답 여부는 서버가 다시 채점한다 */
export async function recordStage2Batch(
  ctx: StudentSetContext,
  setId: string,
  attempts: unknown
): Promise<ActionResult> {
  const { admin, studentId } = ctx;
  const list = cleanAttempts(attempts);
  if (list.length === 0) return actionSuccess("기록할 답이 없어요.");

  const [progress, { data: rows }] = await Promise.all([
    loadStageProgress(admin, studentId, setId, {
      createIfMissing: false,
      fields: "hub",
    }),
    admin
      .from("vocab_items")
      .select("id, word")
      .eq("set_id", setId)
      .in("id", [...new Set(list.map((a) => a.itemId))]),
  ]);
  if (!progress.stage1_completed) {
    return actionError("1단계를 먼저 끝내 주세요.");
  }
  const wordById = new Map(
    ((rows ?? []) as { id: string; word: string }[]).map((r) => [r.id, r.word])
  );
  const inserts = list
    .filter((a) => wordById.has(a.itemId))
    .map((a) => ({
      student_id: studentId,
      set_id: setId,
      item_id: a.itemId,
      student_answer: a.answer,
      is_correct: gradeSpellingAnswer(String(wordById.get(a.itemId) ?? ""), a.answer),
      attempt_round: a.round,
    }));
  if (inserts.length === 0) return actionError("단어를 찾을 수 없어요.");

  const { error } = await admin.from("vocab_spelling_attempts").insert(inserts);
  if (error) {
    console.error("[vocab] stage2 attempts insert failed", error);
    return actionError("저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
  }
  return actionSuccess("기록했어요.");
}

const EXAMPLE_COLUMNS = "id, word, example_sentence, example_meaning";

/** 예문 빈칸 입력 기록 — 정답 여부는 서버가 다시 채점한다 */
export async function recordStage3Batch(
  ctx: StudentSetContext,
  setId: string,
  attempts: unknown
): Promise<ActionResult> {
  const { admin, studentId } = ctx;
  const list = cleanAttempts(attempts);
  if (list.length === 0) return actionSuccess("기록할 답이 없어요.");

  const [progress, { data: rows }] = await Promise.all([
    loadStageProgress(admin, studentId, setId, {
      createIfMissing: false,
      fields: "hub",
    }),
    admin
      .from("vocab_items")
      .select(EXAMPLE_COLUMNS)
      .eq("set_id", setId)
      .in("id", [...new Set(list.map((a) => a.itemId))]),
  ]);
  if (!progress.stage2_completed) {
    return actionError("2단계를 먼저 끝내 주세요.");
  }
  const questionById = new Map(
    ((rows ?? []) as unknown as VocabItem[]).flatMap((item) => {
      const q = buildExampleBlankQuestion(item);
      return q ? [[item.id, q] as const] : [];
    })
  );
  const inserts = list.flatMap((a) => {
    const q = questionById.get(a.itemId);
    if (!q) return [];
    return [
      {
        student_id: studentId,
        set_id: setId,
        item_id: a.itemId,
        student_answer: a.answer,
        correct_answer:
          q.acceptedAnswers.length > 1 ? q.acceptedAnswers.join(" / ") : q.word,
        is_correct: gradeExampleBlankAnswer(q.acceptedAnswers, a.answer),
        attempt_round: a.round,
      },
    ];
  });
  if (inserts.length === 0) return actionError("문제를 찾을 수 없어요.");

  const { error } = await admin.from("vocab_example_attempts").insert(inserts);
  if (error) {
    console.error("[vocab] stage3 attempts insert failed", error);
    return actionError("저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
  }
  return actionSuccess("기록했어요.");
}
