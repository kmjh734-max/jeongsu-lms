import { NextResponse } from "next/server";
import { generateAndSaveAnalysisReportAction } from "@/lib/lesson-materials/analysis-report-actions";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 지문 하나의 분석서를 만든다. 서버 액션을 그대로 부르되 fetch로 받는 이유는
 * post-json.ts 참고(브라우저의 서버 액션은 한 번에 하나씩만 돈다).
 * 권한은 액션 안의 requireRole이 로그인한 사용자의 실제 역할과 대조한다.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      role?: string;
      projectId?: string;
      headerLabel?: string;
    };
    const role = body.role === "admin" ? "admin" : "teacher";
    const result = await generateAndSaveAnalysisReportAction(role, {
      projectId: String(body.projectId ?? ""),
      headerLabel: body.headerLabel,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({
      ok: false as const,
      message: e instanceof Error ? e.message : "분석서를 만들지 못했습니다.",
    });
  }
}
