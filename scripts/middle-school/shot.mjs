/**
 * 중학교 수업자료 화면을 로컬 dev 서버(3000)에서 정수학원 관리자 매직링크 세션으로 찍고, 인쇄 PDF도 뽑는다.
 *   node scripts/middle-school/shot.mjs <출력 폴더> [과 번호 1~8] [중1|중2]
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const OUT = process.argv[2] ?? ".";
const LESSON = Number(process.argv[3] ?? 1);
const GRADE = process.argv[4] ?? "중1";
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
await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });
await page.setCookie(...[...jar.entries()].map(([name, value]) => ({ name, value, domain: "localhost", path: "/" })));

await page.goto("http://localhost:3000/admin/middle-school", { waitUntil: "networkidle0", timeout: 240000 });
await page.screenshot({ path: `${OUT}/ms-home.png` });
await page.goto(`http://localhost:3000/admin/middle-school/${unit.id}`, { waitUntil: "networkidle0", timeout: 240000 });

/** 쪽 수·넘침을 재고 화면·PDF를 남긴다 */
async function snap(name) {
  await new Promise((r) => setTimeout(r, 3000));
  await page.emulateMediaType("screen");
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const info = await page.evaluate(() => {
    const sheets = [...document.querySelectorAll("#tb-print-root .tb-sheet")].filter((el) => !el.closest(".tb-measure"));
    return { sheets: sheets.length, overflow: sheets.map((s, i) => [i + 1, s.scrollHeight - s.clientHeight]).filter(([, d]) => d > 1) };
  });
  await page.emulateMediaType("print");
  await page.pdf({ path: `${OUT}/${name}.pdf`, preferCSSPageSize: true, printBackground: true });
  console.log(name, "쪽", info.sheets, "넘침", JSON.stringify(info.overflow));
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
await snap("ms-lesson");
await click("워크북");
await snap("ms-workbook");
await click("뽑기");
await snap("ms-draw");
await click("문제");
await snap("ms-questions");
await click("20문항");
await snap("ms-qdraw");
await browser.close();
