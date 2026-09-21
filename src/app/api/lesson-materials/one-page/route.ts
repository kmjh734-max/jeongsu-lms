import { NextResponse } from "next/server";
import {
  prepareOnePageContentAction,
  saveOnePageTestAction,
} from "@/lib/lesson-materials/one-page-actions";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 1장 자료: 지문 하나의 재료를 준비하거나(prepare, 기본) 조립한 테스트를 파일에 저장한다
 * (saveTest). 어법 선택 라우트와 같은 이유로 서버 액션을 fetch로 부른다(post-json.ts).
 * 권한은 액션 안에서 로그인한 사용자의 실제 역할과 대조한다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      op?: string;
      role?: string;
      projectId?: string;
      forceRegenerate?: boolean;
      id?: string;
      payload?: unknown;
      kind?: "summary" | "test";
    };
    const role = body.role === "admin" ? "admin" : "teacher";
    if (body.op === "saveTest") {
      return NextResponse.json(
        await saveOnePageTestAction(role, { id: String(body.id ?? ""), payload: body.payload })
      );
    }
    return NextResponse.json(
      await prepareOnePageContentAction(role, {
        projectId: String(body.projectId ?? ""),
        forceRegenerate: body.forceRegenerate === true,
        kind: body.kind === "test" ? "test" : "summary",
      })
    );
  } catch (e) {
    return NextResponse.json({
      ok: false as const,
      message: e instanceof Error ? e.message : "1장 자료를 만들지 못했습니다.",
    });
  }
}
