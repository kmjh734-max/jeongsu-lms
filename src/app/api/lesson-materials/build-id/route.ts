import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** 지금 배포된 커밋. 열어 둔 자료함 탭이 예전 코드인지 가리는 데 쓴다(use-reload-on-new-deploy). */
export function GET() {
  return NextResponse.json(
    { sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
