import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows, chunkIds } from "@/lib/supabase/fetch-all-rows";
import { seededRandom, shuffleWith } from "@/lib/vocab/build-stage3-questions";
import { buildChoices, displayMeaning, isPlainEntry, personalOrder, type PoolWord } from "./choices";
import { summarize, type DiagSummary } from "./scoring";
import { diagToken, hashDiagToken, newNonce } from "./tokens";
import {
  DIAG_RESULT_DAYS,
  DIAG_TARGETS,
  type DiagAnswers,
  type DiagClientQuestion,
  type DiagQuestion,
  type DiagTarget,
  type DiagTestRow,
} from "./types";

/** 서버 전용. 브라우저는 이 테이블들을 직접 읽거나 쓸 수 없다(RLS 정책 없음). */

export type BookWord = PoolWord & { setId: string; day: number };

/** 대상의 단어장(학원 안 폴더 이름으로 찾는다)과 그 단어 전부 */
export async function loadBook(academyId: string, target: DiagTarget): Promise<{ folderId: string; words: BookWord[]; days: number[] } | null> {
  const admin = createAdminClient();
  const { data: folder } = await admin
    .from("vocab_folders")
    .select("id")
    .eq("academy_id", academyId)
    .eq("name", DIAG_TARGETS[target].folderName)
    .maybeSingle();
  if (!folder) return null;
  const sets = await fetchAllRows<{ id: string; order_index: number }>((from, to) =>
    admin.from("vocab_sets").select("id, order_index").eq("folder_id", folder.id).order("order_index").range(from, to),
  );
  const dayOf = new Map(sets.map((s) => [s.id, s.order_index]));
  const words: BookWord[] = [];
  for (const ids of chunkIds(sets.map((s) => s.id), 100)) {
    const rows = await fetchAllRows<{ id: string; set_id: string; word: string; meaning: string }>((from, to) =>
      admin.from("vocab_items").select("id, set_id, word, meaning").in("set_id", ids).order("id").range(from, to),
    );
    for (const r of rows) words.push({ itemId: r.id, setId: r.set_id, day: dayOf.get(r.set_id) ?? 0, word: r.word, meaning: r.meaning ?? "" });
  }
  return { folderId: folder.id, words, days: [...new Set(sets.map((s) => s.order_index))].sort((a, b) => a - b) };
}

const eligible = isPlainEntry;

export function questionFor(w: BookWord, pool: BookWord[], seed: string): DiagQuestion | null {
  const built = buildChoices(w, pool, seed);
  if (!built) return null;
  return { itemId: w.itemId, setId: w.setId, day: w.day, word: w.word, answer: displayMeaning(w.meaning), ...built };
}

/**
 * 자동 추천: Day를 처음부터 끝까지 고르게 count개 골라(빈도 구간 ★★★·★★·★이 모두 들어간다) Day마다 한 단어.
 * 첫 Day만 쓰거나 전체에서 무작정 뽑지 않는다.
 */
export function recommend(book: { words: BookWord[]; days: number[] }, count: number, seed: string): DiagQuestion[] {
  const rng = seededRandom(seed);
  const days = book.days;
  const picks: number[] = [];
  if (count <= days.length) {
    for (let i = 0; i < count; i++) picks.push(days[Math.floor(((i + 0.5) * days.length) / count)]!);
  } else {
    for (let i = 0; i < count; i++) picks.push(days[i % days.length]!);
  }
  const used = new Set<string>();
  const out: DiagQuestion[] = [];
  for (const day of picks) {
    const cands = shuffleWith(book.words.filter((w) => w.day === day && eligible(w) && !used.has(w.word.toLowerCase())), rng);
    for (const w of cands) {
      const q = questionFor(w, book.words, `${seed}:${w.itemId}`);
      if (!q) continue;
      out.push(q);
      used.add(w.word.toLowerCase());
      break;
    }
  }
  return out;
}

/** 같은 Day에서 다른 단어로 바꾼다(이미 낸 단어는 빼고) */
export function replacementFor(book: { words: BookWord[] }, current: DiagQuestion[], index: number, seed: string): DiagQuestion | null {
  const q = current[index];
  if (!q) return null;
  const used = new Set(current.map((x) => x.word.toLowerCase()));
  const cands = shuffleWith(book.words.filter((w) => w.day === q.day && eligible(w) && !used.has(w.word.toLowerCase())), seededRandom(seed));
  for (const w of cands) {
    const next = questionFor(w, book.words, `${seed}:${w.itemId}`);
    if (next) return next;
  }
  return null;
}

// ---------------------------------------------------------------- 공개 응시 쪽

export type InviteState =
  | { kind: "invalid" }
  | { kind: "expired" | "revoked" | "inactive"; academyName: string }
  | {
      kind: "ready" | "in_progress" | "submitted";
      inviteId: string;
      academyId: string;
      academyName: string;
      candidateName: string;
      candidateGrade: string;
      test: Pick<DiagTestRow, "id" | "target" | "title" | "version" | "question_count" | "recommended_minutes" | "intro_text">;
      attemptId: string | null;
    };

async function academyName(academyId: string): Promise<string> {
  const { data } = await createAdminClient().from("academies").select("name").eq("id", academyId).maybeSingle();
  return (data?.name as string | undefined) ?? "";
}

export async function loadInvite(token: string): Promise<InviteState> {
  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("vocab_diag_invites")
    .select("id, academy_id, test_id, candidate_id, expires_at, revoked_at")
    .eq("token_hash", hashDiagToken("invite", token))
    .maybeSingle();
  if (!inv) return { kind: "invalid" };
  const name = await academyName(inv.academy_id);
  const { data: attempt } = await admin.from("vocab_diag_attempts").select("id, submitted_at").eq("invite_id", inv.id).maybeSingle();
  // 이미 낸 응시는 링크가 만료·회수돼도 「제출 완료」로 안내한다(결과는 결과 링크로)
  if (!attempt?.submitted_at) {
    if (inv.revoked_at) return { kind: "revoked", academyName: name };
    if (new Date(inv.expires_at).getTime() < Date.now()) return { kind: "expired", academyName: name };
  }
  const [{ data: test }, { data: cand }] = await Promise.all([
    admin.from("vocab_diag_tests").select("id, target, title, version, question_count, recommended_minutes, intro_text, is_active, status").eq("id", inv.test_id).maybeSingle(),
    admin.from("vocab_diag_candidates").select("name, grade").eq("id", inv.candidate_id).maybeSingle(),
  ]);
  if (!test || !cand) return { kind: "invalid" };
  if (!attempt && (!test.is_active || test.status !== "confirmed")) return { kind: "inactive", academyName: name };
  return {
    kind: attempt?.submitted_at ? "submitted" : attempt ? "in_progress" : "ready",
    inviteId: inv.id,
    academyId: inv.academy_id,
    academyName: name,
    candidateName: cand.name,
    candidateGrade: cand.grade,
    test: { id: test.id, target: test.target, title: test.title, version: test.version, question_count: test.question_count, recommended_minutes: test.recommended_minutes, intro_text: test.intro_text },
    attemptId: attempt?.id ?? null,
  };
}

export type AttemptView = { questions: DiagClientQuestion[]; answers: DiagAnswers; submitted: boolean };

type AttemptRow = { id: string; academy_id: string; questions: DiagQuestion[]; answers: DiagAnswers; submitted_at: string | null; test_id: string; target: string };

async function attemptByInvite(inviteId: string): Promise<AttemptRow | null> {
  const { data } = await createAdminClient()
    .from("vocab_diag_attempts")
    .select("id, academy_id, questions, answers, submitted_at, test_id, target")
    .eq("invite_id", inviteId)
    .maybeSingle();
  return (data as AttemptRow | null) ?? null;
}

export function toView(a: AttemptRow): AttemptView {
  return { questions: a.questions.map((q) => ({ word: q.word, choices: q.choices })), answers: a.answers ?? {}, submitted: !!a.submitted_at };
}

/**
 * 응시 시작. 이미 시작했으면 그 기록을 그대로 돌려준다(새로고침·두 번 누르기에도 한 줄).
 * 문항 차례와 보기 차례를 이 응시자만의 차례로 섞어 응시 기록에 옮겨 둔다.
 */
export async function startAttempt(state: Extract<InviteState, { inviteId: string }>): Promise<AttemptRow> {
  const existing = await attemptByInvite(state.inviteId);
  if (existing) return existing;
  const admin = createAdminClient();
  const { data: test } = await admin.from("vocab_diag_tests").select("questions").eq("id", state.test.id).single();
  const base = (test?.questions ?? []) as DiagQuestion[];
  const questions = personalOrder(base, `attempt:${state.inviteId}`);
  const { error } = await admin.from("vocab_diag_attempts").insert({
    academy_id: state.academyId,
    invite_id: state.inviteId,
    test_id: state.test.id,
    target: state.test.target,
    questions,
  });
  // 동시에 두 번 눌러 unique(invite_id)에 걸리면 먼저 만든 줄을 쓴다
  if (error && error.code !== "23505") throw new Error(error.message);
  const row = await attemptByInvite(state.inviteId);
  if (!row) throw new Error("응시 기록을 만들지 못했습니다.");
  return row;
}

export async function loadAttempt(inviteId: string): Promise<AttemptRow | null> {
  return attemptByInvite(inviteId);
}

/** 답 저장 — 제출 전에만. 제출한 뒤에는 바뀌지 않는다(조건부 update). */
export async function saveAnswers(attemptId: string, answers: DiagAnswers): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from("vocab_diag_attempts")
    .update({ answers, updated_at: new Date().toISOString() })
    .eq("id", attemptId)
    .is("submitted_at", null)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

/**
 * 제출·채점. submitted_at 이 비어 있을 때만 한 번 쓴다 — 연속으로 눌러도, 다시 보내도 결과는 한 번.
 * 점수는 서버에 저장된 문항·답으로만 매긴다(브라우저가 보낸 점수는 받지 않는다).
 */
export async function submitAttempt(attemptId: string): Promise<{ resultToken: string } | null> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("vocab_diag_attempts")
    .select("id, questions, answers, submitted_at, result_nonce")
    .eq("id", attemptId)
    .maybeSingle();
  if (!row) return null;
  if (!row.submitted_at) {
    const s = summarize(row.questions as DiagQuestion[], (row.answers ?? {}) as DiagAnswers);
    const nonce = newNonce();
    const token = diagToken("result", row.id, nonce);
    const now = new Date();
    await admin
      .from("vocab_diag_attempts")
      .update({
        submitted_at: now.toISOString(),
        correct_count: s.correct,
        total_count: s.total,
        result_nonce: nonce,
        result_token_hash: hashDiagToken("result", token),
        result_expires_at: new Date(now.getTime() + DIAG_RESULT_DAYS * 86_400_000).toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", row.id)
      .is("submitted_at", null);
  }
  const { data: done } = await admin.from("vocab_diag_attempts").select("id, result_nonce, submitted_at").eq("id", attemptId).single();
  if (!done?.submitted_at || !done.result_nonce) return null;
  return { resultToken: diagToken("result", done.id, done.result_nonce) };
}

export type ResultState =
  | { kind: "invalid" }
  | { kind: "expired" | "revoked" }
  | {
      kind: "ok";
      academyName: string;
      candidateName: string;
      target: DiagTarget;
      title: string;
      version: number;
      submittedAt: string;
      summary: DiagSummary;
    };

export async function loadResult(token: string): Promise<ResultState> {
  const admin = createAdminClient();
  const { data: a } = await admin
    .from("vocab_diag_attempts")
    .select("id, academy_id, invite_id, test_id, target, questions, answers, submitted_at, result_expires_at, result_revoked_at")
    .eq("result_token_hash", hashDiagToken("result", token))
    .maybeSingle();
  if (!a || !a.submitted_at) return { kind: "invalid" };
  if (a.result_revoked_at) return { kind: "revoked" };
  if (a.result_expires_at && new Date(a.result_expires_at).getTime() < Date.now()) return { kind: "expired" };
  const [{ data: inv }, { data: test }, name] = await Promise.all([
    admin.from("vocab_diag_invites").select("candidate_id").eq("id", a.invite_id).single(),
    admin.from("vocab_diag_tests").select("title, version").eq("id", a.test_id).single(),
    academyName(a.academy_id),
  ]);
  const { data: cand } = await admin.from("vocab_diag_candidates").select("name").eq("id", inv?.candidate_id ?? "").maybeSingle();
  return {
    kind: "ok",
    academyName: name,
    candidateName: cand?.name ?? "",
    target: a.target as DiagTarget,
    title: test?.title ?? "",
    version: test?.version ?? 1,
    submittedAt: a.submitted_at,
    summary: summarize(a.questions as DiagQuestion[], (a.answers ?? {}) as DiagAnswers),
  };
}
