import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { readExamImage } from "@/lib/exam-analysis/read-page";

export const runtime = "nodejs";
export const maxDuration = 300;

const isJpegDataUrl = (s: unknown): s is string =>
  typeof s === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(s) && s.length < 4_000_000;

/**
 * 한 쪽 읽기 { pageNo, image } 또는 두 단으로 나눈 것 { pageNo, halves: [왼쪽, 오른쪽] }.
 * 한 번에 다 못 읽으면 complete:false — 화면이 쪽을 두 단으로 잘라 다시 보낸다.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const analysis = await loadOwnAnalysis(id, auth.profile.academy_id);
  if (!analysis) return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { pageNo?: number; image?: unknown; halves?: unknown[] };
  const pageNo = Math.floor(Number(body.pageNo) || 0);
  if (pageNo < 1 || pageNo > analysis.page_count) {
    return NextResponse.json({ ok: false, message: "쪽 번호가 올바르지 않아요." }, { status: 400 });
  }

  try {
    let text = "";
    let complete = true;
    if (Array.isArray(body.halves) && body.halves.length === 2 && body.halves.every(isJpegDataUrl)) {
      const [left, right] = await Promise.all([
        readExamImage(body.halves[0] as string, `시험지 ${pageNo}쪽 (왼쪽 단)`),
        readExamImage(body.halves[1] as string, `시험지 ${pageNo}쪽 (오른쪽 단)`),
      ]);
      text = `${left.text}\n\n${right.text}`.trim();
    } else if (isJpegDataUrl(body.image)) {
      const r = await readExamImage(body.image, `시험지 ${pageNo}쪽`);
      text = r.text;
      complete = r.complete;
    } else {
      return NextResponse.json({ ok: false, message: "쪽 그림이 없어요." }, { status: 400 });
    }

    // 덜 읽었어도 일단 저장해 둔다(두 단으로 다시 읽으면 더 긴 쪽으로 바꾼다)
    const admin = createAdminClient();
    const { data: prev } = await admin
      .from("school_exam_pages")
      .select("text")
      .eq("analysis_id", id)
      .eq("page_no", pageNo)
      .maybeSingle();
    if (!prev || text.length >= String(prev.text ?? "").length) {
      await admin.from("school_exam_pages").upsert({ analysis_id: id, page_no: pageNo, text });
    }
    return NextResponse.json({ ok: true, complete });
  } catch (e) {
    console.error("[exam-analysis/pages]", e);
    return NextResponse.json({ ok: false, message: "이 쪽을 읽지 못했어요. 다시 시도해 주세요." }, { status: 502 });
  }
}
