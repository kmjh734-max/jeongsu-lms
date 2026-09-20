/**
 * 적어 둔 세트를 올리기 전에 볼 수 있게 한 장짜리 시안(HTML)으로 뽑는다.
 *
 *   node ... preview-set.mts scripts/listening-build/sets/고1-11회.ts 나갈파일.html
 */
import { writeFileSync } from "fs";
import { pathToFileURL } from "url";
import { resolve } from "path";
import type { SetSpec, QuestionSpec } from "./spec.ts";

const [specPath, outPath] = process.argv.slice(2);
if (!specPath || !outPath) throw new Error("쓰는 법: node ... preview-set.mts <세트 파일> <나갈파일.html>");

const mod = (await import(pathToFileURL(resolve(specPath)).href)) as { spec: SetSpec };
const spec = mod.spec;

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const NUM = "①②③④⑤";

function questionBlock(q: QuestionSpec): string {
  const lines = q.lines
    .map(([sp, t]) => `<p class="line"><span class="who">${sp}</span>${esc(t)}</p>`)
    .join("");
  const choices = q.choices
    .map(
      (c, i) =>
        `<li class="${i + 1 === q.answer ? "pick" : ""}"><span class="no">${NUM[i]}</span>${esc(c)}</li>`
    )
    .join("");
  const table = q.table
    ? `<table class="tbl">${q.table.rows
        .map((r) => `<tr><td class="no">${esc(r.label)}</td><td>${esc(r.value)}</td></tr>`)
        .join("")}</table>`
    : "";
  const figure = q.figure
    ? `<p class="figure"><b>그림</b> ${esc(q.figure.scene)}</p>`
    : "";

  return `<section class="q">
  <h2><span class="qno">${q.order}</span>${esc(q.type)}</h2>
  <p class="inst">${esc(q.instruction)}</p>
  ${q.questionText ? `<p class="qtext">${esc(q.questionText)}</p>` : ""}
  ${figure}
  ${table}
  <div class="script">${lines}</div>
  <ol class="choices">${choices}</ol>
  <p class="meta"><b>정답</b> ${NUM[q.answer - 1]} · <b>근거</b> ${esc(q.clue)}</p>
  <p class="meta">${esc(q.explanation)}</p>
  <details><summary>해석</summary><pre>${esc(q.translation)}</pre></details>
</section>`;
}

const html = `<title>${esc(spec.title)} 시안</title>
<style>
  :root {
    --ink: #17202a; --muted: #5d6b7a; --line: #dce3ea; --paper: #fbfcfd;
    --card: #ffffff; --pick: #0f7a5a; --pick-bg: #e8f6f0; --accent: #1f5f8b;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ink: #e7edf3; --muted: #9dabb9; --line: #2a3644; --paper: #131a22;
      --card: #1a232d; --pick: #57d6a8; --pick-bg: #163429; --accent: #7cb6e0;
    }
  }
  :root[data-theme="dark"] {
    --ink: #e7edf3; --muted: #9dabb9; --line: #2a3644; --paper: #131a22;
    --card: #1a232d; --pick: #57d6a8; --pick-bg: #163429; --accent: #7cb6e0;
  }
  body {
    background: var(--paper); color: var(--ink); margin: 0;
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif;
    line-height: 1.6;
  }
  .wrap { max-width: 760px; margin: 0 auto; padding: 16px; padding-block: 28px 56px; }
  header { border-bottom: 2px solid var(--ink); padding-bottom: 14px; margin-bottom: 22px; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: var(--muted); font-size: 13px; margin: 0; }
  .q {
    background: var(--card); border: 1px solid var(--line); border-radius: 10px;
    padding: 16px 18px; margin-bottom: 14px;
  }
  .q h2 { font-size: 15px; margin: 0 0 6px; display: flex; align-items: center; gap: 8px; color: var(--accent); }
  .qno {
    background: var(--accent); color: var(--card); font-size: 12px;
    width: 22px; height: 22px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .inst { margin: 0 0 10px; font-weight: 700; font-size: 14px; }
  .qtext { margin: 0 0 10px; font-size: 14px; }
  .figure { font-size: 13px; color: var(--muted); border-left: 3px solid var(--line); padding-left: 10px; margin: 0 0 10px; }
  .script { border-top: 1px dashed var(--line); border-bottom: 1px dashed var(--line); padding: 10px 0; margin: 0 0 10px; }
  .line { margin: 0 0 4px; font-size: 14px; }
  .who { display: inline-block; min-width: 34px; color: var(--muted); font-weight: 700; font-size: 12px; }
  .choices { list-style: none; margin: 0 0 10px; padding: 0; }
  .choices li { font-size: 14px; padding: 3px 8px; border-radius: 6px; display: flex; gap: 7px; }
  .choices .pick { background: var(--pick-bg); color: var(--pick); font-weight: 700; }
  .no { color: var(--muted); }
  .choices .pick .no { color: var(--pick); }
  .meta { font-size: 13px; color: var(--muted); margin: 0 0 4px; }
  .tbl { border-collapse: collapse; margin: 0 0 10px; font-size: 13px; width: 100%; }
  .tbl td { border: 1px solid var(--line); padding: 4px 8px; }
  details { font-size: 13px; color: var(--muted); }
  pre { white-space: pre-wrap; font-family: inherit; margin: 6px 0 0; }
</style>
<div class="wrap">
  <header>
    <h1>${esc(spec.title)}</h1>
    <p class="sub">${esc(spec.gradeLevel)} · ${spec.questions.length}문항 · 배속 ${spec.speechSpeed} · 정답은 초록색</p>
  </header>
  ${[...spec.questions].sort((a, b) => a.order - b.order).map(questionBlock).join("\n")}
</div>`;

writeFileSync(outPath, html, "utf8");
console.log("시안 만듦:", outPath);
