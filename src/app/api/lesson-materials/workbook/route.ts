import { NextResponse } from "next/server";
import { generateWorkbookAction } from "@/lib/lesson-materials/workbook-actions";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 워크북(어법 선택을 뺀 유형)을 만든다. 서버 액션을 fetch로 받는 이유는
 * documents/open/route.ts 참고. 권한은 액션 안의 requireRole이 확인한다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: string; input?: Parameters<typeof generateWorkbookAction>[1] };
    const role = body.role === "admin" ? "admin" : "teacher";
    if (!body.input) return NextResponse.json({ ok: false, message: "요청 내용이 없습니다." });
    return NextResponse.json(await generateWorkbookAction(role, body.input));
  } catch (e) {
    return NextResponse.json({
      ok: false,
      message: e instanceof Error ? e.message : "워크북을 만들지 못했습니다.",
    });
  }
}
