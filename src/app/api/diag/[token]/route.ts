import { NextResponse } from "next/server";
import { cleanAnswer } from "@/lib/vocab-diagnostic/scoring";
import { loadAttempt, loadInvite, saveAnswers, submitAttempt, toView } from "@/lib/vocab-diagnostic/server";
import { cleanToken, resultPath } from "@/lib/vocab-diagnostic/tokens";
import type { DiagAnswers } from "@/lib/vocab-diagnostic/types";
import { closedResponse, NO_STORE, sameOrigin } from "../shared";

/**
 * 어휘 진단 개인 응시 API(로그인 없음, 미들웨어 공개 경로).
 * 개인 응시 토큰 하나로 그 응시 기록만 읽고 쓴다. 정답 자리는 보내지 않고, 채점은 서버가 저장된 문항으로 한다.
 */

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = cleanToken((await params).token);
  if (!token) return closedResponse("invalid");
  const state = await loadInvite(token);
  if (!("inviteId" in state)) return closedResponse(state.kind);
  const attempt = await loadAttempt(state.inviteId);
  if (!attempt) return closedResponse("invalid");
  // 이미 낸 응시자에게는 자기 결과 링크를 다시 알려 준다(제출 기록은 그대로, 새로 채점하지 않는다)
  const done = attempt.submitted_at ? await submitAttempt(attempt.id) : null;
  return NextResponse.json(
    { ok: true, state: state.kind, attempt: attempt.submitted_at ? null : toView(attempt), resultUrl: done ? resultPath(done.resultToken) : null },
    { headers: NO_STORE },
  );
}

/** 보내 온 답을 문항 수에 맞춰 거른다. 알맞지 않은 값은 버린다. */
function cleanAnswers(raw: unknown, count: number): DiagAnswers {
  const out: DiagAnswers = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const i = Number(k);
    if (!Number.isInteger(i) || i < 0 || i >= count) continue;
    const a = cleanAnswer(v, 4);
    if (a === null || a === undefined) continue;
    out[String(i)] = a;
  }
  return out;
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 403 });
  const token = cleanToken((await params).token);
  if (!token) return closedResponse("invalid");
  let body: { action?: string; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  if (body.action !== "save" && body.action !== "submit") return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  const state = await loadInvite(token);
  if (!("inviteId" in state)) return closedResponse(state.kind);

  try {
    const attempt = await loadAttempt(state.inviteId);
    if (!attempt) return closedResponse("invalid");
    if (attempt.submitted_at) {
      if (body.action === "submit") {
        const done = await submitAttempt(attempt.id);
        return NextResponse.json({ ok: true, resultUrl: done ? resultPath(done.resultToken) : null }, { headers: NO_STORE });
      }
      return NextResponse.json({ ok: false, kind: "submitted", message: "이미 제출해 답을 바꿀 수 없습니다." }, { status: 409, headers: NO_STORE });
    }
    if (body.answers !== undefined) {
      const saved = await saveAnswers(attempt.id, cleanAnswers(body.answers, attempt.questions.length));
      if (!saved && body.action === "save") return NextResponse.json({ ok: false, kind: "submitted", message: "이미 제출해 답을 바꿀 수 없습니다." }, { status: 409, headers: NO_STORE });
    }
    if (body.action === "save") return NextResponse.json({ ok: true }, { headers: NO_STORE });
    const done = await submitAttempt(attempt.id);
    if (!done) throw new Error("제출하지 못했습니다.");
    return NextResponse.json({ ok: true, resultUrl: resultPath(done.resultToken) }, { headers: NO_STORE });
  } catch (e) {
    console.error("[vocab-diag]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "저장하지 못했습니다. 잠시 뒤 다시 눌러 주세요." }, { status: 500, headers: NO_STORE });
  }
}
