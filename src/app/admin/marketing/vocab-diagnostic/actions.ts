"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDiagStaff } from "@/lib/vocab-diagnostic/access";
import { getTest } from "@/lib/vocab-diagnostic/admin-queries";
import { loadBook, questionFor, recommend, replacementFor } from "@/lib/vocab-diagnostic/server";
import { diagToken, hashDiagToken, invitePath, newNonce, resultPath } from "@/lib/vocab-diagnostic/tokens";
import { DIAG_INVITE_DAYS, DIAG_RESULT_DAYS, DIAG_TARGETS, isDiagTarget, type DiagQuestion } from "@/lib/vocab-diagnostic/types";

/**
 * 어휘 진단 관리 액션. 모두 requireDiagStaff()로 「정수학원 관리자」인지 서버에서 확인하고,
 * 고치는 행이 그 학원 것인지 academy_id 로 다시 묶는다.
 */

const BASE = "/admin/marketing/vocab-diagnostic";
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : String(e) };
}

async function draftOf(academyId: string, testId: string) {
  const test = await getTest(academyId, testId);
  if (!test) throw new Error("시험을 찾을 수 없습니다.");
  if (test.status !== "draft") throw new Error("확정한 시험은 고칠 수 없습니다. 「새 버전」으로 고쳐 주세요.");
  return test;
}

async function bookFor(academyId: string, target: Parameters<typeof loadBook>[1]) {
  const book = await loadBook(academyId, target);
  if (!book) throw new Error(`「${DIAG_TARGETS[target].folderName}」 단어장이 없습니다. 단어장을 먼저 등록해 주세요.`);
  return book;
}

/** 새 초안: 대상 단어장에서 자동 추천 */
export async function createDraftAction(target: string): Promise<Result<{ id: string }>> {
  try {
    const staff = await requireDiagStaff();
    if (!isDiagTarget(target)) throw new Error("진단 대상이 올바르지 않습니다.");
    const cfg = DIAG_TARGETS[target];
    const book = await bookFor(staff.academyId, target);
    const admin = createAdminClient();
    const { data: last } = await admin
      .from("vocab_diag_tests")
      .select("version")
      .eq("academy_id", staff.academyId)
      .eq("target", target)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    const version = (last?.version ?? 0) + 1;
    const questions = recommend(book, cfg.defaultCount, `${target}:v${version}:${Date.now()}`);
    const { data, error } = await admin
      .from("vocab_diag_tests")
      .insert({
        academy_id: staff.academyId,
        target,
        title: `${cfg.label} 어휘 진단`,
        version,
        question_count: cfg.defaultCount,
        recommended_minutes: cfg.defaultMinutes,
        intro_text: `영어 단어를 보고 알맞은 우리말 뜻을 고르세요. 모르는 단어는 「모르겠어요」를 누르면 됩니다. 권장 시간은 ${cfg.defaultMinutes}분이며 시간이 지나도 계속 풀 수 있습니다.`,
        folder_id: book.folderId,
        questions,
        created_by: staff.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath(BASE);
    return { ok: true, id: data.id };
  } catch (e) {
    return fail(e);
  }
}

/** 초안 기본 정보(제목·문항 수·권장 시간·안내 문구). 문항 수를 바꾸면 추천을 다시 한다. */
export async function updateDraftAction(
  testId: string,
  input: { title: string; questionCount: number; minutes: number; intro: string },
): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    const test = await draftOf(staff.academyId, testId);
    const count = Math.round(Number(input.questionCount));
    const minutes = Math.round(Number(input.minutes));
    if (!(count >= 5 && count <= 100)) throw new Error("문항 수는 5~100 사이로 정해 주세요.");
    if (!(minutes >= 1 && minutes <= 120)) throw new Error("권장 시간은 1~120분 사이로 정해 주세요.");
    const title = input.title.trim().slice(0, 80);
    if (!title) throw new Error("시험 제목을 적어 주세요.");
    const patch: Record<string, unknown> = { title, recommended_minutes: minutes, intro_text: input.intro.trim().slice(0, 600), question_count: count, updated_at: new Date().toISOString() };
    if (count !== test.questions.length) {
      const book = await bookFor(staff.academyId, test.target);
      patch.questions = recommend(book, count, `${test.target}:${test.id}:${Date.now()}`);
    }
    await createAdminClient().from("vocab_diag_tests").update(patch).eq("id", test.id).eq("academy_id", staff.academyId);
    revalidatePath(`${BASE}/tests/${testId}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 추천 전체 다시 */
export async function reRecommendAction(testId: string): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    const test = await draftOf(staff.academyId, testId);
    const book = await bookFor(staff.academyId, test.target);
    const questions = recommend(book, test.question_count, `${test.target}:${test.id}:${Date.now()}`);
    await createAdminClient().from("vocab_diag_tests").update({ questions, updated_at: new Date().toISOString() }).eq("id", test.id).eq("academy_id", staff.academyId);
    revalidatePath(`${BASE}/tests/${testId}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 한 문항: 같은 Day의 다른 단어로 바꾸기 / 보기만 다시 만들기 */
export async function changeQuestionAction(testId: string, index: number, mode: "word" | "choices"): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    const test = await draftOf(staff.academyId, testId);
    const q = test.questions[index];
    if (!q) throw new Error("문항을 찾을 수 없습니다.");
    const book = await bookFor(staff.academyId, test.target);
    const seed = `${test.id}:${index}:${Date.now()}`;
    let next: DiagQuestion | null;
    if (mode === "word") {
      next = replacementFor(book, test.questions, index, seed);
      if (!next) throw new Error(`Day ${q.day}에서 바꿀 단어가 더 없습니다.`);
    } else {
      const w = book.words.find((x) => x.itemId === q.itemId);
      if (!w) throw new Error("단어장에서 이 단어를 찾을 수 없습니다.");
      next = questionFor(w, book.words, seed);
      if (!next) throw new Error("겹치지 않는 보기를 만들지 못했습니다. 단어를 바꿔 주세요.");
    }
    const questions = test.questions.map((x, i) => (i === index ? next! : x));
    await createAdminClient().from("vocab_diag_tests").update({ questions, updated_at: new Date().toISOString() }).eq("id", test.id).eq("academy_id", staff.academyId);
    revalidatePath(`${BASE}/tests/${testId}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 출제 확정 — 이 뒤로 문항이 바뀌지 않는다 */
export async function confirmTestAction(testId: string): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    const test = await draftOf(staff.academyId, testId);
    if (test.questions.length !== test.question_count) throw new Error(`문항이 ${test.questions.length}개입니다. ${test.question_count}개를 채운 뒤 확정해 주세요.`);
    const bad = test.questions.findIndex((q) => q.choices.length !== 4 || new Set(q.choices).size !== 4 || q.choices[q.answerIndex] !== q.answer);
    if (bad >= 0) throw new Error(`${bad + 1}번 문항의 보기가 올바르지 않습니다. 보기를 다시 만들어 주세요.`);
    await createAdminClient()
      .from("vocab_diag_tests")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", test.id)
      .eq("academy_id", staff.academyId)
      .eq("status", "draft");
    revalidatePath(BASE);
    revalidatePath(`${BASE}/tests/${testId}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 확정한 시험을 바탕으로 새 버전 초안을 만든다(문항을 그대로 옮겨 와 고친다) */
export async function newVersionAction(testId: string): Promise<Result<{ id: string }>> {
  try {
    const staff = await requireDiagStaff();
    const test = await getTest(staff.academyId, testId);
    if (!test) throw new Error("시험을 찾을 수 없습니다.");
    const admin = createAdminClient();
    const { data: last } = await admin.from("vocab_diag_tests").select("version").eq("academy_id", staff.academyId).eq("target", test.target).order("version", { ascending: false }).limit(1).single();
    const { data, error } = await admin
      .from("vocab_diag_tests")
      .insert({
        academy_id: staff.academyId,
        target: test.target,
        title: test.title,
        version: (last?.version ?? test.version) + 1,
        question_count: test.question_count,
        recommended_minutes: test.recommended_minutes,
        intro_text: test.intro_text,
        folder_id: test.folder_id,
        questions: test.questions,
        created_by: staff.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath(BASE);
    return { ok: true, id: data.id };
  } catch (e) {
    return fail(e);
  }
}

export async function setActiveAction(testId: string, active: boolean): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    await createAdminClient().from("vocab_diag_tests").update({ is_active: active, updated_at: new Date().toISOString() }).eq("id", testId).eq("academy_id", staff.academyId);
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 초안 지우기(확정 전만) */
export async function deleteDraftAction(testId: string): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    await draftOf(staff.academyId, testId);
    await createAdminClient().from("vocab_diag_tests").delete().eq("id", testId).eq("academy_id", staff.academyId).eq("status", "draft");
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * 개인 응시 링크 발급. 응시자는 이미 등록한 사람(candidateId)·재원생(studentId)·새 외부 응시자(name·grade·school) 가운데 하나.
 * 같은 이름·학년·학교면 새로 만들지 않고 그 사람을 쓴다.
 */
export async function createInviteAction(input: {
  testId: string;
  candidateId?: string;
  studentId?: string;
  name?: string;
  grade?: string;
  school?: string;
  days?: number;
}): Promise<Result<{ link: string }>> {
  try {
    const staff = await requireDiagStaff();
    const admin = createAdminClient();
    const test = await getTest(staff.academyId, input.testId);
    if (!test || test.status !== "confirmed") throw new Error("출제 확정한 시험만 링크를 보낼 수 있습니다.");
    if (!test.is_active) throw new Error("멈춘 시험입니다. 다시 켠 뒤 보내 주세요.");
    const days = Math.round(Number(input.days ?? DIAG_INVITE_DAYS));
    if (!(days >= 1 && days <= 60)) throw new Error("링크 기간은 1~60일로 정해 주세요.");

    let candidateId = input.candidateId ?? "";
    if (candidateId) {
      const { data } = await admin.from("vocab_diag_candidates").select("id").eq("id", candidateId).eq("academy_id", staff.academyId).maybeSingle();
      if (!data) throw new Error("응시자를 찾을 수 없습니다.");
    } else {
      let name = (input.name ?? "").trim().slice(0, 40);
      let studentId: string | null = null;
      if (input.studentId) {
        const { data: st } = await admin.from("profiles").select("id, name").eq("id", input.studentId).eq("academy_id", staff.academyId).eq("role", "student").maybeSingle();
        if (!st) throw new Error("학생을 찾을 수 없습니다.");
        studentId = st.id;
        name = name || st.name;
      }
      if (!name) throw new Error("응시자 이름을 적어 주세요.");
      const grade = (input.grade ?? "").trim().slice(0, 20);
      const school = (input.school ?? "").trim().slice(0, 40);
      const { data: found } = await admin.from("vocab_diag_candidates").select("id").eq("academy_id", staff.academyId).eq("name", name).eq("grade", grade).eq("school", school).maybeSingle();
      if (found) candidateId = found.id;
      else {
        const { data: made, error } = await admin.from("vocab_diag_candidates").insert({ academy_id: staff.academyId, student_id: studentId, name, grade, school }).select("id").single();
        if (error) throw new Error(error.message);
        candidateId = made.id;
      }
    }

    const id = crypto.randomUUID();
    const nonce = newNonce();
    const token = diagToken("invite", id, nonce);
    const { error } = await admin.from("vocab_diag_invites").insert({
      id,
      academy_id: staff.academyId,
      test_id: test.id,
      candidate_id: candidateId,
      token_nonce: nonce,
      token_hash: hashDiagToken("invite", token),
      expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
      created_by: staff.userId,
    });
    if (error) throw new Error(error.message);
    revalidatePath(BASE);
    return { ok: true, link: invitePath(token) };
  } catch (e) {
    return fail(e);
  }
}

/** 링크 회수 */
export async function revokeInviteAction(inviteId: string): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    await createAdminClient().from("vocab_diag_invites").update({ revoked_at: new Date().toISOString() }).eq("id", inviteId).eq("academy_id", staff.academyId);
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 재발급: 새 주소(옛 주소는 더는 안 열림)와 새 기간. 이미 제출한 링크는 재발급하지 않는다(재응시는 새 초대). */
export async function reissueInviteAction(inviteId: string, days = DIAG_INVITE_DAYS): Promise<Result<{ link: string }>> {
  try {
    const staff = await requireDiagStaff();
    const admin = createAdminClient();
    const { data: att } = await admin.from("vocab_diag_attempts").select("submitted_at").eq("invite_id", inviteId).maybeSingle();
    if (att?.submitted_at) throw new Error("이미 제출한 응시입니다. 다시 보게 하려면 새 링크를 발급해 주세요.");
    const nonce = newNonce();
    const token = diagToken("invite", inviteId, nonce);
    const { data, error } = await admin
      .from("vocab_diag_invites")
      .update({ token_nonce: nonce, token_hash: hashDiagToken("invite", token), revoked_at: null, expires_at: new Date(Date.now() + days * 86_400_000).toISOString() })
      .eq("id", inviteId)
      .eq("academy_id", staff.academyId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("링크를 찾을 수 없습니다.");
    revalidatePath(BASE);
    return { ok: true, link: invitePath(token) };
  } catch (e) {
    return fail(e);
  }
}

/** 결과 링크 회수·재발급 */
export async function resultLinkAction(attemptId: string, mode: "revoke" | "reissue"): Promise<Result<{ link?: string }>> {
  try {
    const staff = await requireDiagStaff();
    const admin = createAdminClient();
    if (mode === "revoke") {
      await admin.from("vocab_diag_attempts").update({ result_revoked_at: new Date().toISOString() }).eq("id", attemptId).eq("academy_id", staff.academyId);
      revalidatePath(BASE);
      return { ok: true };
    }
    const nonce = newNonce();
    const token = diagToken("result", attemptId, nonce);
    const { data, error } = await admin
      .from("vocab_diag_attempts")
      .update({ result_nonce: nonce, result_token_hash: hashDiagToken("result", token), result_revoked_at: null, result_expires_at: new Date(Date.now() + DIAG_RESULT_DAYS * 86_400_000).toISOString() })
      .eq("id", attemptId)
      .eq("academy_id", staff.academyId)
      .not("submitted_at", "is", null)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("제출한 응시를 찾을 수 없습니다.");
    revalidatePath(BASE);
    return { ok: true, link: resultPath(token) };
  } catch (e) {
    return fail(e);
  }
}
