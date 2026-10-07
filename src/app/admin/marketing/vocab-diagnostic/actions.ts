"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDiagStaff } from "@/lib/vocab-diagnostic/access";
import { loadBook, pickQuestions } from "@/lib/vocab-diagnostic/server";
import { diagToken, hashDiagToken, newNonce, resultPath } from "@/lib/vocab-diagnostic/tokens";
import { DIAG_RESULT_DAYS, DIAG_TARGETS, isDiagTarget, type DiagTarget } from "@/lib/vocab-diagnostic/types";

/**
 * 어휘 진단 관리 액션. 모두 requireDiagStaff()로 「정수학원 관리자」인지 서버에서 확인하고,
 * 고치는 행이 그 학원 것인지 academy_id 로 다시 묶는다.
 */

const BASE = "/admin/marketing/vocab-diagnostic";
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : String(e) };
}

function defaultIntro(target: DiagTarget): string {
  const cfg = DIAG_TARGETS[target];
  return `영어 단어를 보고 알맞은 우리말 뜻을 고르세요. 권장 시간은 ${cfg.defaultMinutes}분이며 시간이 지나도 계속 풀 수 있습니다.`;
}

/** 처음 열 때: 공용 링크와 대상별 시험 설정(기본값)을 만든다. 이미 있으면 그대로 둔다. */
export async function setupAction(): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    const admin = createAdminClient();
    const { data: link } = await admin.from("vocab_diag_links").select("academy_id").eq("academy_id", staff.academyId).maybeSingle();
    if (!link) {
      const nonce = newNonce();
      const { error } = await admin.from("vocab_diag_links").insert({
        academy_id: staff.academyId,
        public_nonce: nonce,
        public_token_hash: hashDiagToken("open", diagToken("open", staff.academyId, nonce)),
      });
      if (error && error.code !== "23505") throw new Error(error.message);
    }
    for (const target of Object.keys(DIAG_TARGETS) as DiagTarget[]) {
      const cfg = DIAG_TARGETS[target];
      const { error } = await admin.from("vocab_diag_tests").insert({
        academy_id: staff.academyId,
        target,
        title: `${cfg.label} 어휘 진단`,
        question_count: cfg.defaultCount,
        recommended_minutes: cfg.defaultMinutes,
        intro_text: defaultIntro(target),
        created_by: staff.userId,
      });
      if (error && error.code !== "23505") throw new Error(error.message);
    }
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 대상별 설정. 바꾼 값은 앞으로 시작하는 응시에만 쓰인다(이미 본 응시의 문항·점수는 그대로). */
export async function updateTestAction(
  target: string,
  input: { title: string; questionCount: number; minutes: number; intro: string; active: boolean },
): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    if (!isDiagTarget(target)) throw new Error("진단 대상이 올바르지 않습니다.");
    const count = Math.round(Number(input.questionCount));
    const minutes = Math.round(Number(input.minutes));
    if (!(count >= 5 && count <= 100)) throw new Error("문항 수는 5~100 사이로 정해 주세요.");
    if (!(minutes >= 1 && minutes <= 120)) throw new Error("권장 시간은 1~120분 사이로 정해 주세요.");
    const title = input.title.trim().slice(0, 80);
    if (!title) throw new Error("시험 제목을 적어 주세요.");
    const { error } = await createAdminClient()
      .from("vocab_diag_tests")
      .update({ title, question_count: count, recommended_minutes: minutes, intro_text: input.intro.trim().slice(0, 600), is_active: !!input.active, updated_at: new Date().toISOString() })
      .eq("academy_id", staff.academyId)
      .eq("target", target);
    if (error) throw new Error(error.message);
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 공용 링크 멈추기·다시 켜기 */
export async function setLinkActiveAction(active: boolean): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    await createAdminClient().from("vocab_diag_links").update({ is_active: active, updated_at: new Date().toISOString() }).eq("academy_id", staff.academyId);
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 공용 링크 주소 바꾸기 — 옛 주소는 더는 열리지 않는다(이미 시작한 개인 응시는 그대로 이어 풀 수 있다) */
export async function rotateLinkAction(): Promise<Result> {
  try {
    const staff = await requireDiagStaff();
    const nonce = newNonce();
    const { data, error } = await createAdminClient()
      .from("vocab_diag_links")
      .update({ public_nonce: nonce, public_token_hash: hashDiagToken("open", diagToken("open", staff.academyId, nonce)), updated_at: new Date().toISOString() })
      .eq("academy_id", staff.academyId)
      .select("academy_id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("공용 링크가 없습니다.");
    revalidatePath(BASE);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 문항 예시: 학생 한 명이 받을 무작위 문항을 미리 뽑아 본다(저장하지 않음) */
export async function sampleAction(target: string): Promise<Result<{ questions: { day: number; word: string; choices: string[]; answerIndex: number }[] }>> {
  try {
    const staff = await requireDiagStaff();
    if (!isDiagTarget(target)) throw new Error("진단 대상이 올바르지 않습니다.");
    const { data: test } = await createAdminClient().from("vocab_diag_tests").select("question_count").eq("academy_id", staff.academyId).eq("target", target).maybeSingle();
    const book = await loadBook(staff.academyId, target);
    if (!book) throw new Error(`「${DIAG_TARGETS[target].folderName}」 단어장이 없습니다.`);
    const qs = pickQuestions(book, test?.question_count ?? DIAG_TARGETS[target].defaultCount, `sample:${Date.now()}:${Math.random()}`);
    return { ok: true, questions: qs.map((q) => ({ day: q.day, word: q.word, choices: q.choices, answerIndex: q.answerIndex })).sort((a, b) => a.day - b.day) };
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
