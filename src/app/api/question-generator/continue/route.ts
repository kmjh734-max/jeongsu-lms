import { after, NextResponse } from "next/server";
import {
  runGenerationChunkAndChain,
  verifyContinueToken,
} from "@/lib/question-generator/job-chain";

export const maxDuration = 300;

/**
 * 변형문제 생성 이어 받기(서버끼리만 부른다). 앞 실행이 시간 안에 다 못 만든 작업을 새
 * 실행으로 이어 간다. 로그인 쿠키가 없으므로 middleware에서 열어 두고, 여기서 서버
 * 비밀값 서명(job-chain.ts)으로 확인한다. 응답은 바로 하고 생성은 after에서 한다.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { jobId?: unknown; token?: unknown };
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  if (!verifyContinueToken(jobId, body.token)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const origin = new URL(req.url).origin;
  after(() => runGenerationChunkAndChain(jobId, origin, { continuation: true }));
  return NextResponse.json({ ok: true });
}
