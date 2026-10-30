/**
 * 중학교 「분석서」·「최종통합자료」 탭 시안: 로컬 dev 서버(3000)에서 정수학원 관리자 매직링크 세션으로 화면을 찍고 인쇄 PDF를 뽑는다.
 *   node scripts/middle-school/shot-final.mjs <출력 폴더> [과 번호 1~8] [중1|중2]
 * 쪽 수·넘침(scrollHeight > clientHeight)도 같이 센다(선생님 「A4가 잘 안 되더라」 — 배포 전 확인).
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const OUT = process.argv[2] ?? ".";
const LESSON = Number(process.argv[3] ?? 1);
const GRADE = process.argv[4] ?? "중1";
fs.mkdirSync(OUT, { recursive: true });
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ACADEMY = "79ea0a71-d148-46ac-8c8f-a3a3e4961838";
const { data: who } = await admin.from("profiles").select("email").eq("role", "admin").eq("academy_id", ACADEMY).limit(1).single();
const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: who.email });
if (error) throw error;
const jar = new Map();
const sb = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  cookies: { getAll: () => [...jar.entries()].map(([n, v]) => ({ name: n, value: v })), setAll: (cs) => cs.forEach((c) => jar.set(c.name, c.value)) },
});
const u = new URL(link.properties.action_link);
const { error: e2 } = await sb.auth.verifyOtp({ type: "magiclink", token_hash: u.searchParams.get("token") ?? u.searchParams.get("token_hash") });
if (e2) throw e2;
const { data: unit } = await admin.from("ms_units").select("id").eq("academy_id", ACADEMY).eq("grade", GRADE).eq("lesson_no", LESSON).single();

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.setViewport({ width: 1500, height: 1100, deviceScaleFactor: 1 });
await page.setCookie(...[...jar.entries()].map(([name, value]) => ({ name, value, domain: "localhost", path: "/" })));
await page.goto(`http://localhost:3000/admin/middle-school/${unit.id}`, { waitUntil: "networkidle0", timeout: 300000 });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** 쪽 수·넘침을 재고 화면·PDF를 남긴다 */
async function snap(name, settle = 4000) {
  await wait(settle);
  await page.emulateMediaType("screen");
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const info = await page.evaluate(() => {
    const sheets = [...document.querySelectorAll("#tb-print-root .tb-sheet, #tb-print-root .qg-print-page")].filter((el) => !el.closest(".tb-measure"));
    return { sheets: sheets.length, overflow: sheets.map((s, i) => [i + 1, s.scrollHeight - s.clientHeight]).filter(([, d]) => d > 1) };
  });
  await page.emulateMediaType("print");
  await page.pdf({ path: `${OUT}/${name}.pdf`, preferCSSPageSize: true, printBackground: true });
  console.log(name, "쪽", info.sheets, "넘침", JSON.stringify(info.overflow));
  return info;
}
async function click(text) {
  await page.emulateMediaType("screen");
  const ok = await page.evaluate((text) => {
    const b = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim().startsWith(text));
    b?.click();
    return !!b;
  }, text);
  if (!ok) throw new Error("단추 없음: " + text);
}

await click("분석서");
await snap("ms-analysis-a");
await click("B");
await snap("ms-analysis-b", 2500);
await click("A");
// 직독직해
await page.evaluate(() => [...document.querySelectorAll("label")].find((l) => l.textContent?.trim() === "직독직해")?.querySelector("input")?.click());
await snap("ms-analysis-chunk", 2500);

await click("최종통합자료");
await snap("ms-final", 9000);
// 첫 쪽들(표지·목차·간지)을 따로 크게 찍는다
await page.emulateMediaType("screen");
const shots = await page.evaluate(() => {
  const sheets = [...document.querySelectorAll("#tb-print-root .tb-sheet, #tb-print-root .qg-print-page")].filter((el) => !el.closest(".tb-measure"));
  return sheets.slice(0, 4).map((s) => { const r = s.getBoundingClientRect(); return { x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height }; });
});
for (let i = 0; i < shots.length; i++) {
  const s = shots[i];
  await page.evaluate((y) => window.scrollTo(0, y), s.y - 20);
  await wait(800);
  const el = (await page.$$("#tb-print-root .tb-sheet, #tb-print-root .qg-print-page"))[i];
  if (el) await el.screenshot({ path: `${OUT}/ms-final-p${i + 1}.png` });
}
await browser.close();
