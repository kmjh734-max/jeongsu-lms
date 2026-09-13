import { NextResponse } from "next/server";
import { generateVocabChoicePassageAction } from "@/lib/lesson-materials/workbook-actions";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 지문 하나의 어휘 선택 재료를 만든다(어휘 수정도 이것으로 만든다). 어법 선택 라우트와
 * 같은 이유로 서버 액션을 fetch로 부른다(post-json.ts). 권한은 액션 안에서 대조한다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      role?: string;
      projectId?: string;
      forceRegenerate?: boolean;
    };
    const role = body.role === "admin" ? "admin" : "teacher";
    const result = await generateVocabChoicePassageAction(role, {
      projectId: String(body.projectId ?? ""),
      forceRegenerate: body.forceRegenerate === true,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({
      ok: false as const,
      message: e instanceof Error ? e.message : "어휘 선택을 만들지 못했습니다.",
    });
  }
}
