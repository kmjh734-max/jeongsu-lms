// 문법 은행 전 문항을 실제 시험지와 같은 모양(기본 G형, 85mm 단)으로 150문항씩 PDF로 뽑고,
// 화면에서 잡히는 깨짐(넘침·남은 표기·이상한 글자)을 함께 적는다.
//   node scripts/grammar-bank/render-audit.mjs [시작묶음] [끝묶음]
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const OUT = process.env.OUT || "tmp-grammar-bank/render-audit";
const PER = 150;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

const css = fs.readFileSync("src/app/globals.css", "utf8").split("\n").slice(3466, 4815).join("\n");
const hidden = new Set(JSON.parse(fs.readFileSync("tmp-grammar-bank/hidden-ids.json", "utf8")));
const bank = JSON.parse(fs.readFileSync("tmp-grammar-bank/bank-all.json", "utf8"))
  .filter((q) => !q.excluded_reason && !hidden.has(q.id))
  .filter((q) => !process.env.IDS || JSON.parse(fs.readFileSync(process.env.IDS, "utf8")).includes(q.id))
  .sort((a, b) => a.id - b.id);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// GrammarPrintSheets 의 withUnderlines 와 같은 규칙
const under = (s) =>
  String(s ?? "").split(/(\[\[.*?\]\])/g)
    .map((p) => (p.startsWith("[[") && p.endsWith("]]") ? `<u>${esc(p.slice(2, -2))}</u>` : esc(p)))
    .join("");

function card(q, no) {
  const written = !q.choices || q.choices.length === 0;
  const body = (q.body || []).length
    ? `<div class="gb-body">${q.body.map((l) => `<p>${under(l)}</p>`).join("")}</div>` : "";
  const ch = written
    ? `<div class="gb-write"></div>`
    : `<p class="gb-ch">${q.choices.map((c) => `<span>${CIRCLED[c.no - 1] ?? c.no + "."} ${under(c.text)}</span>`).join("")}</p>`;
  return `<div class="wrap" data-id="${q.id}"><div class="qid">#${q.id} · ${esc(q.level_name)} ${esc(q.chapter_no)}. ${esc(q.unit)} · ${q.tier}단계</div>
<section class="gb-q"><p class="gb-q-head"><span class="gb-no">${no}</span><span class="gb-ask">${under(q.prompt)}${written ? '<span class="gb-tag">서술형</span>' : ""}</span></p>${body}${ch}</section>
<div class="ans"><b>정답</b> ${under(q.answer)}</div></div>`;
}

function page(batch, start) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A4; margin: 10mm }
body { margin: 0; font-family: "Pretendard", "Malgun Gothic", sans-serif; color: #111 }
${css}
.grid { display: grid; grid-template-columns: 85mm 85mm; column-gap: 8mm; width: 186mm; margin: 0 auto }
.wrap { break-inside: avoid; margin-bottom: 4mm; border-bottom: 0.2mm dashed #ccc; padding-bottom: 2mm; overflow: hidden }
.qid { font-size: 7pt; color: #888; margin-bottom: 0.6mm }
.ans { font-size: 8.5pt; color: #1d4ed8; margin-top: 1mm }
</style></head><body><div class="gb-sheet gb-sheet--g" style="width:auto;min-height:0;padding:0;margin:0">
<div class="grid">${batch.map((q, i) => card(q, start + i + 1)).join("")}</div></div></body></html>`;
}

// 글로 잡을 수 있는 깨짐
function textFlags(q) {
  const f = [];
  const all = [q.prompt, ...(q.body || []), ...(q.choices || []).map((c) => c.text), q.answer || ""].join("\n");
  const open = (all.match(/\[\[/g) || []).length, close = (all.match(/\]\]/g) || []).length;
  if (open !== close) f.push("밑줄 표시 짝 안 맞음");
  if (/[\u0000-\u0008\u000b-\u001f\ufffd]/.test(all)) f.push("이상한 글자");
  if (/<\/?(u|b|i|br|span)>/i.test(all)) f.push("HTML 표기 남음");
  if (/\S{40,}/.test(all.replace(/_{2,}/g, "__"))) f.push("띄어쓰기 없는 긴 낱말");
  if (/_{25,}/.test(all)) f.push("너무 긴 빈칸");
  if (/밑줄/.test(q.prompt) && !/\[\[/.test(all)) f.push("밑줄이라 했는데 밑줄 없음");
  if (/<보기>/.test(q.prompt) && !/<보기>|보기/.test((q.body || []).join(""))) f.push("<보기>라 했는데 <보기> 없음");
  if ((q.choices || []).some((c) => !String(c.text).trim())) f.push("빈 보기");
  if (!(q.answer || "").trim()) f.push("정답 없음");
  return f;
}

const [from = 0, to = Math.ceil(bank.length / PER) - 1] = process.argv.slice(2).map(Number);
fs.mkdirSync(path.join(OUT, "pdf"), { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const pg = await browser.newPage();
const report = {};
for (let b = from; b <= to; b++) {
  const batch = bank.slice(b * PER, (b + 1) * PER);
  if (!batch.length) break;
  const name = `r${String(b).padStart(3, "0")}`;
  await pg.setContent(page(batch, b * PER), { waitUntil: "load" });
  // 단 너비(85mm)를 넘는 줄, 단보다 긴 문항
  const dom = await pg.evaluate(() => {
    const colH = (296 - 11 - 8 - 30) * (96 / 25.4);
    const out = {};
    for (const w of document.querySelectorAll(".wrap")) {
      const q = w.querySelector(".gb-q"), f = [];
      if (q.scrollWidth > q.clientWidth + 1) f.push("단 너비 넘침");
      for (const el of q.querySelectorAll("p, span"))
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== "inline") { f.push("줄 넘침"); break; }
      if (q.getBoundingClientRect().height > colH) f.push("한 단보다 김(쪽 너비로 눕힘)");
      if (f.length) out[w.dataset.id] = f;
    }
    return out;
  });
  for (const q of batch) {
    const f = [...textFlags(q), ...(dom[q.id] || [])];
    if (f.length) report[q.id] = f;
  }
  await pg.pdf({ path: path.join(OUT, "pdf", `${name}.pdf`), format: "A4", printBackground: true, margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" } });
  // 그림으로도 뽑는다(A4 한 쪽 높이씩)
  await pg.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.4 });
  const H = await pg.evaluate(() => document.body.scrollHeight);
  fs.mkdirSync(path.join(OUT, "png", name), { recursive: true });
  for (let y = 0, k = 1; y < H; y += 1080, k++)
    await pg.screenshot({ path: path.join(OUT, "png", name, `p${String(k).padStart(2, "0")}.png`), clip: { x: 0, y, width: 794, height: Math.min(1123, H - y) }, captureBeyondViewport: true });
  fs.writeFileSync(path.join(OUT, "pdf", `${name}.ids.json`), JSON.stringify(batch.map((q) => q.id)));
  process.stdout.write(`${name} `);
}
await browser.close();
const prev = fs.existsSync(path.join(OUT, "auto-flags.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "auto-flags.json"), "utf8")) : {};
fs.writeFileSync(path.join(OUT, "auto-flags.json"), JSON.stringify({ ...prev, ...report }, null, 1));
console.log(`\n문항 ${bank.length} / 자동 표시 ${Object.keys(report).length}`);
