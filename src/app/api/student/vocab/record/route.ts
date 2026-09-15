import { NextResponse } from "next/server";
import {
  recordStage1Batch,
  recordStage2Batch,
  recordStage3Batch,
  studentSetContext,
} from "@/lib/vocab/student-study-writes";

export const runtime = "nodejs";

/*
 * 학생 단어학습 중간 기록 (알아요/몰라요, 스펠링·예문 빈칸 입력).
 * 화면이 답을 몇 개씩 모아 fetch(keepalive)로 보낸다 — 서버 액션과 달리 차례를 기다리지 않고,
 * 화면을 닫거나 다른 곳으로 가도 보낸 기록은 끝까지 저장된다.
 * 확인(학생 본인·배정된 단어장)과 채점은 모두 서버가 한다.
 */

interface RecordBody {
  stage?: unknown;
  setId?: unknown;
  entries?: unknown;
  seenIds?: unknown;
}

/** 다른 사이트에서 보낸 요청은 받지 않는다 */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    return [
      new URL(request.url).host,
      request.headers.get("host"),
      request.headers.get("x-forwarded-host"),
    ].includes(host);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, message: "잘못된 요청이에요." }, { status: 403 });
  }
  let body: RecordBody;
  try {
    body = (await request.json()) as RecordBody;
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청이에요." }, { status: 400 });
  }

  const { ctx, error } = await studentSetContext(body.setId);
  if (error) return NextResponse.json(error, { status: 403 });
  const setId = body.setId as string;

  try {
    if (body.stage === 1) {
      return NextResponse.json(
        await recordStage1Batch(ctx, setId, body.entries, body.seenIds)
      );
    }
    if (body.stage === 2) {
      return NextResponse.json(await recordStage2Batch(ctx, setId, body.entries));
    }
    if (body.stage === 3) {
      return NextResponse.json(await recordStage3Batch(ctx, setId, body.entries));
    }
  } catch (e) {
    console.error("[vocab] record failed", e);
    return NextResponse.json(
      { ok: false, message: "저장하지 못했어요. 잠시 뒤 다시 시도해 주세요." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: false, message: "잘못된 요청이에요." }, { status: 400 });
}
