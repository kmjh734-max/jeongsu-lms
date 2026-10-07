import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows, chunkIds } from "@/lib/supabase/fetch-all-rows";
import { seededRandom, shuffleWith } from "@/lib/vocab/build-stage3-questions";
import { buildChoices, displayMeaning, isPlainEntry, type PoolWord } from "./choices";
import { summarize, type DiagSummary } from "./scoring";
import { diagToken, hashDiagToken, newNonce } from "./tokens";
import {
  DIAG_INVITE_DAYS,
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
type Book = { folderId: string; words: BookWord[]; days: number[] };

/** 응시를 시작할 때마다 단어장 2,000단어를 다시 읽지 않게 잠깐 들고 있는다(단어장을 고치면 10분 안에 반영) */
const bookCache = new Map<string, { at: number; book: Book }>();
const BOOK_TTL_MS = 10 * 60 * 1000;

/** 대상의 단어장(학원 안 폴더 이름으로 찾는다)과 그 단어 전부 */
export async function loadBook(academyId: string, target: DiagTarget): Promise<Book | null> {
  const key = `${academyId}:${target}`;
  const hit = bookCache.get(key);
  if (hit && Date.now() - hit.at < BOOK_TTL_MS) return hit.book;
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
  const book = { folderId: folder.id, words, days: [...new Set(sets.map((s) => s.order_index))].sort((a, b) => a - b) };
  bookCache.set(key, { at: Date.now(), book });
  return book;
}

export function questionFor(w: BookWord, pool: BookWord[], seed: string): DiagQuestion | null {
  const built = buildChoices(w, pool, seed);
  if (!built) return null;
  return { itemId: w.itemId, setId: w.setId, day: w.day, word: w.word, answer: displayMeaning(w.meaning), ...built };
}

/**
 * 무작위 출제: Day 전체를 count개 구간으로 나눠 구간마다 Day 하나·단어 하나를 무작위로 뽑는다.
 * 그래서 응시자마다 단어가 다르면서도 ★★★부터 ★까지 모든 빈도 구간이 고르게 들어간다.
 * 첫 Day만 쓰거나 전체에서 무작정 뽑지 않는다. 문항 차례도 섞는다.
 */
export function pickQuestions(book: { words: BookWord[]; days: number[] }, count: number, seed: string): DiagQuestion[] {
  const rng = seededRandom(seed);
  const days = book.days;
  const buckets: number[][] = [];
  if (count <= days.length) {
    for (let i = 0; i < count; i++) buckets.push(days.slice(Math.floor((i * days.length) / count), Math.floor(((i + 1) * days.length) / count)));
  } else {
    for (let i = 0; i < count; i++) buckets.push([days[i % days.length]!]);
  }
  const used = new Set<string>();
  const out: DiagQuestion[] = [];
  for (const bucket of buckets) {
    const cands = shuffleWith(book.words.filter((w) => bucket.includes(w.day) && isPlainEntry(w) && !used.has(w.word.toLowerCase())), rng);
    for (const w of cands) {
      const q = questionFor(w, book.words, `${seed}:${w.itemId}`);
      if (!q) continue;
      out.push(q);
      used.add(w.word.toLowerCase());
      break;
    }
  }
  return shuffleWith(out, rng);
}

async function academyName(academyId: string): Promise<string> {
  const { data } = await createAdminClient().from("academies").select("name").eq("id", academyId).maybeSingle();
  return (data?.name as string | undefined) ?? "";
}

// ---------------------------------------------------------------- 공용 링크

export type OpenTest = Pick<DiagTestRow, "id" | "academy_id" | "target" | "title" | "question_count" | "recommended_minutes" | "intro_text">;

export type OpenState =
  | { kind: "invalid" }
  | { kind: "inactive"; academyName: string }
  | { kind: "ok"; academyName: string; tests: OpenTest[] };

/** 공용 링크 → 그 학원에서 켜 둔 대상별 시험(예비고1·예비중1) */
export async function loadOpenLink(token: string): Promise<OpenState> {
  const admin = createAdminClient();
  const { data: link } = await admin
    .from("vocab_diag_links")
    .select("academy_id, is_active")
    .eq("public_token_hash", hashDiagToken("open", token))
    .maybeSingle();
  if (!link) return { kind: "invalid" };
  const name = await academyName(link.academy_id);
  if (!link.is_active) return { kind: "inactive", academyName: name };
  const { data: tests } = await admin
    .from("vocab_diag_tests")
    .select("id, academy_id, target, title, question_count, recommended_minutes, intro_text")
    .eq("academy_id", link.academy_id)
    .eq("is_active", true)
    .order("target");
  const list = ((tests ?? []) as OpenTest[]).sort((x, y) => (x.target === "pre_high1" ? -1 : 1) - (y.target === "pre_high1" ? -1 : 1));
  if (list.length === 0) return { kind: "inactive", academyName: name };
  return { kind: "ok", academyName: name, tests: list };
}

/**
 * 공용 링크에서 대상을 고르고 이름·학교를 적으면: 응시자 한 줄, 개인 응시 링크 하나, 무작위 문항으로 응시 기록을 만든다.
 * 고른 대상(예비고1·예비중1)을 학년 칸에 둔다. 돌려주는 개인 응시 토큰으로 이어 풀기·제출을 한다.
 */
export async function createEntry(test: OpenTest, info: { name: string; school: string }): Promise<{ inviteToken: string }> {
  const admin = createAdminClient();
  const book = await loadBook(test.academy_id, test.target);
  if (!book) throw new Error("단어장을 찾지 못했습니다.");
  const inviteId = randomUUID();
  const questions = pickQuestions(book, test.question_count, `entry:${inviteId}:${newNonce()}`);
  if (questions.length < test.question_count) throw new Error("문항을 만들지 못했습니다.");

  const { data: cand, error: e1 } = await admin
    .from("vocab_diag_candidates")
    .insert({ academy_id: test.academy_id, name: info.name, grade: DIAG_TARGETS[test.target].label, school: info.school })
    .select("id")
    .single();
  if (e1) throw new Error(e1.message);
  const nonce = newNonce();
  const token = diagToken("invite", inviteId, nonce);
  const { error: e2 } = await admin.from("vocab_diag_invites").insert({
    id: inviteId,
    academy_id: test.academy_id,
    test_id: test.id,
    candidate_id: cand.id,
    token_nonce: nonce,
    token_hash: hashDiagToken("invite", token),
    expires_at: new Date(Date.now() + DIAG_INVITE_DAYS * 86_400_000).toISOString(),
  });
  if (e2) throw new Error(e2.message);
  const { error: e3 } = await admin.from("vocab_diag_attempts").insert({
    academy_id: test.academy_id,
    invite_id: inviteId,
    test_id: test.id,
    target: test.target,
    questions,
  });
  if (e3) throw new Error(e3.message);
  return { inviteToken: token };
}

// ---------------------------------------------------------------- 개인 응시

export type InviteState =
  | { kind: "invalid" }
  | { kind: "expired" | "revoked"; academyName: string }
  | {
      kind: "in_progress" | "submitted";
      inviteId: string;
      academyName: string;
      candidateName: string;
      candidateGrade: string;
      test: Pick<DiagTestRow, "id" | "target" | "title" | "question_count" | "recommended_minutes">;
    };

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
  if (!attempt) return { kind: "invalid" };
  // 이미 낸 응시는 링크가 만료·회수돼도 「제출 완료」로 안내한다(결과는 결과 링크로)
  if (!attempt.submitted_at) {
    if (inv.revoked_at) return { kind: "revoked", academyName: name };
    if (new Date(inv.expires_at).getTime() < Date.now()) return { kind: "expired", academyName: name };
  }
  const [{ data: test }, { data: cand }] = await Promise.all([
    admin.from("vocab_diag_tests").select("id, target, title, question_count, recommended_minutes").eq("id", inv.test_id).maybeSingle(),
    admin.from("vocab_diag_candidates").select("name, grade").eq("id", inv.candidate_id).maybeSingle(),
  ]);
  if (!test || !cand) return { kind: "invalid" };
  return {
    kind: attempt.submitted_at ? "submitted" : "in_progress",
    inviteId: inv.id,
    academyName: name,
    candidateName: cand.name,
    candidateGrade: cand.grade,
    test: test as Extract<InviteState, { inviteId: string }>["test"],
  };
}

export type AttemptView = { questions: DiagClientQuestion[]; answers: DiagAnswers; submitted: boolean };

type AttemptRow = { id: string; academy_id: string; questions: DiagQuestion[]; answers: DiagAnswers; submitted_at: string | null; test_id: string; target: string };

export async function loadAttempt(inviteId: string): Promise<AttemptRow | null> {
  const { data } = await createAdminClient()
    .from("vocab_diag_attempts")
    .select("id, academy_id, questions, answers, submitted_at, test_id, target")
    .eq("invite_id", inviteId)
    .maybeSingle();
  return (data as AttemptRow | null) ?? null;
}

/** 브라우저에 보내는 꼴 — 정답 자리가 없다 */
export function toView(a: AttemptRow): AttemptView {
  return { questions: a.questions.map((q) => ({ word: q.word, choices: q.choices })), answers: a.answers ?? {}, submitted: !!a.submitted_at };
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
    .select("id, questions, answers, submitted_at")
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

// ---------------------------------------------------------------- 결과

export type ResultState =
  | { kind: "invalid" }
  | { kind: "expired" | "revoked" }
  | {
      kind: "ok";
      academyName: string;
      candidateName: string;
      target: DiagTarget;
      title: string;
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
    admin.from("vocab_diag_tests").select("title").eq("id", a.test_id).single(),
    academyName(a.academy_id),
  ]);
  const { data: cand } = await admin.from("vocab_diag_candidates").select("name").eq("id", inv?.candidate_id ?? "").maybeSingle();
  return {
    kind: "ok",
    academyName: name,
    candidateName: cand?.name ?? "",
    target: a.target as DiagTarget,
    title: test?.title ?? "",
    submittedAt: a.submitted_at,
    summary: summarize(a.questions as DiagQuestion[], (a.answers ?? {}) as DiagAnswers),
  };
}
