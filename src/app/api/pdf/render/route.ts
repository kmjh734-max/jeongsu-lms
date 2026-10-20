import { gunzipSync } from "node:zlib";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { pdfServerDiagnostics, renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";

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
/**
 * 배포 서버에서 Chrome이 뜨는지 확인한다(로그인 없이 부를 수 있지만 서비스 키를 아는 쪽만).
 * 그림 PDF로 되돌아가는 까닭을 찾으려고 둔다.
 */
export async function GET(request: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || request.headers.get("x-pdf-selftest") !== key) return new Response("Not found", { status: 404 });
  const t0 = Date.now();
  try {
    const pdf = await renderHtmlToPdf(
      `<!doctype html><html><body style="font-family:sans-serif"><h1>PDF 시험 Test 가나다</h1></body></html>`,
      { w: 210, h: 297 },
      new URL(request.url).origin
    );
    if (request.headers.get("x-pdf-return") === "1") {
      return new Response(Buffer.from(pdf), { headers: { "Content-Type": "application/pdf" } });
    }
    const { readdirSync } = await import("node:fs");
    const diag = pdfServerDiagnostics();
    let files: string[] = [];
    try {
      files = readdirSync("/tmp/fonts");
    } catch {
      files = [];
    }
    return Response.json({ ok: true, bytes: pdf.length, ms: Date.now() - t0, ...diag, files });
  } catch (e) {
    return Response.json({
      ok: false,
      ms: Date.now() - t0,
      error: e instanceof Error ? `${e.message}\n${e.stack ?? ""}`.slice(0, 2000) : String(e),
    });
  }
}

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
