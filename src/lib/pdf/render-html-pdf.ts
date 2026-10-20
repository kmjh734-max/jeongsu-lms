import { existsSync } from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";

/**
 * 쪽 HTML을 서버의 Chrome으로 PDF로 만든다(글자가 글자로 남는다). /api/pdf/render가 쓴다.
 * 받은 HTML은 스크립트를 끄고 그리며, origin·구글 글꼴·Supabase 말고는 접속하지 않는다.
 */
const WINDOWS_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browserPromise: Promise<Browser> | null = null;
/** 한글 글꼴을 깔았는지(자가 시험에서 본다) */
let fontNote = "";
export function pdfServerDiagnostics() {
  return { fontNote, home: process.env.HOME, fontconfig: process.env.FONTCONFIG_PATH, ld: process.env.LD_LIBRARY_PATH };
}

async function getBrowser(origin: string): Promise<Browser> {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b?.connected) return b;
    browserPromise = null;
  }
  browserPromise = (async () => {
    const local = process.env.CHROME_PATH || (existsSync(WINDOWS_CHROME) ? WINDOWS_CHROME : "");
    if (process.platform === "linux" && !process.env.CHROME_PATH) {
      /*
       * @sparticuz/chromium은 실행 환경 이름이 Node 20·22일 때만 Chrome이 쓰는 시스템 라이브러리(al2023:
       * libnss3 등)를 풀어 놓는다. Vercel은 더 새 Node라 이름이 맞지 않아 「libnss3.so 없음」으로 Chrome이
       * 뜨지 않았다(2026-10-20, 그래서 늘 그림 PDF로 되돌아갔다). 불러오기 전에 Node 22로 알려 준다.
       */
      const env = process.env.AWS_EXECUTION_ENV ?? "";
      if (!/2[02]\.x/.test(env)) process.env.AWS_EXECUTION_ENV = "AWS_Lambda_nodejs22.x";
      const chromium = (await import("@sparticuz/chromium")).default;
      // 서버리스 Chrome에는 한글 시스템 글꼴이 없다. 웹 글꼴이 빠진 글자가 네모로 나오지 않게 깔아 둔다.
      fontNote = await chromium
        .font(`${origin}/fonts/NotoSansKR-Regular.otf`)
        .then((n) => `ok ${n}`)
        .catch((e: unknown) => `fail ${String(e)}`);
      return puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
        defaultViewport: { width: 1240, height: 1754 },
      });
    }
    return puppeteer.launch({ executablePath: local, headless: true, args: ["--no-sandbox"] });
  })();
  return browserPromise;
}

function allowed(url: string, origin: string): boolean {
  if (url.startsWith("data:") || url.startsWith("blob:") || url === "about:blank") return true;
  try {
    const u = new URL(url);
    if (u.origin === origin) return true;
    return (
      u.protocol === "https:" &&
      (u.hostname === "fonts.googleapis.com" ||
        u.hostname === "fonts.gstatic.com" ||
        u.hostname.endsWith(".supabase.co"))
    );
  } catch {
    return false;
  }
}

export async function renderHtmlToPdf(
  html: string,
  paper: { w: number; h: number },
  origin: string
): Promise<Uint8Array> {
  const browser = await getBrowser(origin);
  const page = await browser.newPage();
  try {
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (allowed(req.url(), origin)) void req.continue();
      else void req.abort();
    });
    // 예전 그림 저장과 같은 모양이 나오게 화면용 CSS로 그린다(인쇄용 CSS는 화면 밖 요소를 숨긴다).
    await page.emulateMediaType("screen");
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 40_000 });
    // 스크립트를 꺼도 page.pdf는 글꼴이 다 들어오기를 기다린다. 혹시 몰라 한 번 더 기다린다.
    await page.evaluateHandle("document.fonts.ready").catch(() => undefined);
    return await page.pdf({
      width: `${paper.w}mm`,
      height: `${paper.h}mm`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 40_000,
    });
  } finally {
    await page.close().catch(() => undefined);
  }
}
