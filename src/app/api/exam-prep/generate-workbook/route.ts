import { NextResponse } from "next/server";
import { generateFullExamPrepWorkbook } from "@/lib/exam-prep/generate-full-workbook-core";

/** 지문 1개 원클릭 워크북 — AI 다단계라 장시간 허용 */
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: {
      passageId?: string;
      title?: string;
      publishStages?: boolean;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 본문이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const passageId = String(body.passageId ?? "").trim();
    if (!passageId) {
      return NextResponse.json(
        { ok: false, message: "passageId가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await generateFullExamPrepWorkbook({
      passageId,
      title: body.title,
      publishStages: body.publishStages !== false,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("[exam-prep/generate-workbook]", e);
    const message =
      e instanceof Error ? e.message : "워크북 생성 중 오류가 발생했습니다.";
    return NextResponse.json(
      {
        ok: false,
        message:
          message.length > 280 ? `${message.slice(0, 280)}…` : message,
      },
      { status: 500 }
    );
  }
}
