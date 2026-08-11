import { NextResponse } from "next/server";
import { generateFullExamPrepWorkbookAction } from "@/lib/exam-prep/generate-full-workbook-action";

/** 지문 1개 원클릭 워크북 — AI 다단계라 장시간 허용 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      passageId?: string;
      title?: string;
      publishStages?: boolean;
    };
    const passageId = String(body.passageId ?? "").trim();
    if (!passageId) {
      return NextResponse.json(
        { ok: false, message: "passageId가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await generateFullExamPrepWorkbookAction({
      passageId,
      title: body.title,
      publishStages: body.publishStages !== false,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "워크북 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
