import { NextResponse } from "next/server";
import {
  createLessonMaterialDocument,
  getWorkbookDocument,
} from "@/lib/lesson-materials/document-actions";
import type { LessonMaterialDocumentKind } from "@/lib/lesson-materials/documents";

export const runtime = "nodejs";

/**
 * 제작 버튼으로 연 페이지가 자료 파일을 만들거나(create) 워크북 파일을 연다(getWorkbook).
 *
 * 서버 액션을 페이지가 열리자마자 부르면, 운영에서 응답이 돌아오지 않아 "새로 만들고
 * 있습니다…"에서 멈췄다(2026-09-13: 파일은 만들어졌는데 생성이 시작되지 않았다). 서버
 * 액션은 Next 라우터의 줄을 타고, 이어서 주소를 바꾸는 replaceState와 얽힌다. fetch는 라우터를
 * 거치지 않는다. 권한은 액션 안의 requireRole이 로그인한 사용자의 실제 역할과 대조한다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      op?: string;
      role?: string;
      id?: string;
      kind?: LessonMaterialDocumentKind;
      projectIds?: string[];
      name?: string | null;
      sourceQuery?: string | null;
    };
    const role = body.role === "admin" ? "admin" : "teacher";
    if (body.op === "create") {
      return NextResponse.json(
        await createLessonMaterialDocument(role, {
          kind: body.kind as LessonMaterialDocumentKind,
          projectIds: Array.isArray(body.projectIds) ? body.projectIds.map(String) : [],
          name: body.name ?? null,
          sourceQuery: body.sourceQuery ?? null,
        })
      );
    }
    if (body.op === "getWorkbook") {
      return NextResponse.json(await getWorkbookDocument(role, { id: String(body.id ?? "") }));
    }
    return NextResponse.json({ ok: false, message: "알 수 없는 요청입니다." });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      message: e instanceof Error ? e.message : "자료 파일을 처리하지 못했습니다.",
    });
  }
}
