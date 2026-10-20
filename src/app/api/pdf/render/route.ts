import { gunzipSync } from "node:zlib";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 화면의 A4 쪽(HTML)을 받아 서버의 Chrome으로 PDF를 만든다.
 *
 * 선생님 말씀(2026-10-20): PDF 저장이 빨랐으면 좋겠고, 그림이 아니라 글자로 저장되게
 * (그림이라 인쇄하면 별로다). 예전에는 브라우저가 쪽마다 그림(JPEG)으로 찍어 붙였다.
 * 여기서는 Chrome이 인쇄하듯 PDF를 만들어 글자가 글자로 남는다(고르기·찾기 되고, 인쇄가 선명하다).
 * 브라우저가 쪽을 나눠 여러 번 부르고(server-pdf.ts), 받은 PDF들을 한 파일로 합친다.
 */
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return new Response("로그인이 필요합니다.", { status: 401 });

  let html: string;
  let paper: { w: number; h: number };
  try {
    const raw = Buffer.from(await request.arrayBuffer());
    const text = (request.headers.get("x-body-encoding") === "gzip" ? gunzipSync(raw) : raw).toString("utf8");
    const body = JSON.parse(text) as { html?: string; paper?: { w?: number; h?: number } };
    html = String(body.html ?? "");
    paper = { w: Number(body.paper?.w) || 210, h: Number(body.paper?.h) || 297 };
    if (!html) throw new Error("빈 쪽");
  } catch {
    return new Response("쪽을 읽지 못했습니다.", { status: 400 });
  }

  try {
    // 배포에서는 요청 주소가 곧 사이트 주소다(쪽 HTML의 base와 같다).
    const pdf = await renderHtmlToPdf(html, paper, new URL(request.url).origin);
    return new Response(Buffer.from(pdf), {
      headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "PDF를 만들지 못했습니다.", { status: 500 });
  }
}
