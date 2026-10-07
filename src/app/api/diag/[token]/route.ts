import { NextResponse } from "next/server";
import { cleanAnswer } from "@/lib/vocab-diagnostic/scoring";
import { loadAttempt, loadInvite, saveAnswers, startAttempt, submitAttempt, toView } from "@/lib/vocab-diagnostic/server";
import { cleanToken, resultPath } from "@/lib/vocab-diagnostic/tokens";
import type { DiagAnswers } from "@/lib/vocab-diagnostic/types";

/**
 * 어휘 진단 비회원 응시 API(로그인 없음, 미들웨어 공개 경로).
 * 응시 토큰 하나로 그 초대의 응시 기록만 읽고 쓴다. 정답 자리는 보내지 않고, 채점은 서버가 저장된 문항으로 한다.
 */

export const dynamic = "force-dynamic";

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    return [new URL(request.url).host, request.headers.get("host"), request.headers.get("x-forwarded-host")].includes(host);
  } catch {
    return false;
  }
}

const NO_STORE = { "Cache-Control": "no-store" };

function closed(kind: string) {
  const message =
    kind === "expired" ? "링크 사용 기간이 지났습니다. 학원에 새 링크를 요청해 주세요."
    : kind === "revoked" ? "학원에서 회수한 링크입니다. 학원에 문의해 주세요."
    : kind === "inactive" ? "지금은 응시할 수 없는 시험입니다. 학원에 문의해 주세요."
    : "올바르지 않은 링크입니다.";
  return NextResponse.json({ ok: false, kind, message }, { status: kind === "invalid" ? 404 : 410, headers: NO_STORE });
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = cleanToken((await params).token);
  if (!token) return closed("invalid");
  const state = await loadInvite(token);
  if (!("inviteId" in state)) return closed(state.kind);
  const attempt = state.attemptId ? await loadAttempt(state.inviteId) : null;
  // 이미 낸 응시자에게는 자기 결과 링크를 다시 알려 준다(제출 기록은 그대로, 새로 채점하지 않는다)
  const done = attempt?.submitted_at ? await submitAttempt(attempt.id) : null;
  return NextResponse.json(
    { ok: true, state: state.kind, attempt: attempt && !attempt.submitted_at ? toView(attempt) : null, resultUrl: done ? resultPath(done.resultToken) : null },
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
  if (!token) return closed("invalid");
  let body: { action?: string; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const state = await loadInvite(token);
  if (!("inviteId" in state)) return closed(state.kind);

  try {
    if (body.action === "start") {
      if (state.kind === "submitted") return NextResponse.json({ ok: false, kind: "submitted", message: "이미 제출한 시험입니다." }, { status: 409, headers: NO_STORE });
      const attempt = await startAttempt(state);
      return NextResponse.json({ ok: true, attempt: toView(attempt) }, { headers: NO_STORE });
    }

    const attempt = await loadAttempt(state.inviteId);
    if (!attempt) return NextResponse.json({ ok: false, message: "먼저 시험을 시작해 주세요." }, { status: 409, headers: NO_STORE });

    if (body.action === "save" || body.action === "submit") {
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
    }
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  } catch (e) {
    console.error("[vocab-diag]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "저장하지 못했습니다. 잠시 뒤 다시 눌러 주세요." }, { status: 500, headers: NO_STORE });
  }
}
