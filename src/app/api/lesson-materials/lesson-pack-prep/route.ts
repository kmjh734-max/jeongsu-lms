import { NextResponse } from "next/server";
import {
  ensureLessonMaterialTitleEnAction,
  generateAndSaveLessonPackVocabAction,
} from "@/lib/lesson-materials/lesson-pack-actions";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 수업자료 준비(단어·동반의어 생성, 영어 제목 채우기)를 지문 하나씩 처리한다.
 * 서버 액션을 그대로 부르되 fetch로 받는 이유는 post-json.ts 참고(브라우저의
 * 서버 액션은 한 번에 하나씩만 돈다). 권한은 액션 안의 requireRole이 대조한다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      role?: string;
      projectId?: string;
      kind?: string;
    };
    const role = body.role === "admin" ? "admin" : "teacher";
    const input = { projectId: String(body.projectId ?? "") };
    const result =
      body.kind === "titleEn"
        ? await ensureLessonMaterialTitleEnAction(role, input)
        : await generateAndSaveLessonPackVocabAction(role, input);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({
      ok: false as const,
      message: e instanceof Error ? e.message : "수업자료 준비에 실패했습니다.",
    });
  }
}
