import { NextResponse } from "next/server";
import {
  generateExamPrepWorkbookPhase,
  type WorkbookGenPhase,
} from "@/lib/exam-prep/generate-full-workbook-core";

/** 단계별 호출(shell/ai56/ai7) — 각 요청이 게이트웨이 제한 안에 끝나도록 */
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const PHASES = new Set<WorkbookGenPhase>(["shell", "ai56", "ai7", "full"]);

export async function POST(req: Request) {
  try {
    let body: {
      passageId?: string;
      title?: string;
      publishStages?: boolean;
      phase?: string;
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

    const rawPhase = String(body.phase ?? "shell").trim() as WorkbookGenPhase;
    const phase: WorkbookGenPhase = PHASES.has(rawPhase) ? rawPhase : "shell";

    const result = await generateExamPrepWorkbookPhase({
      passageId,
      title: body.title,
      publishStages: body.publishStages !== false,
      phase,
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
