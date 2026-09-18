/**
 * 소스에 제어문자가 섞였는지 본다 (빌드 전에 돌린다).
 *
 * 편집 도구가 정규식의 \b 같은 표기를 실제 제어문자(0x08)로 바꿔 넣으면 코드는 그대로 돌지만
 * 그 검사만 조용히 멈춘다 — 실제로 듣기 색 검사 하나가 그렇게 며칠 동안 꺼져 있었다(2026-09-18).
 * 눈으로는 보이지 않으므로 기계가 본다.
 */
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src", "scripts"];
const EXTS = /\.(ts|tsx|js|jsx|mjs|cjs|css|json)$/;
// 줄바꿈·탭은 정상
const CONTROL = new RegExp("[" + String.fromCharCode(0) + "-" + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + "-" + String.fromCharCode(31) + "]");

const bad = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (!/node_modules|\.next|\.git/.test(p)) walk(p);
      continue;
    }
    if (!EXTS.test(name)) continue;
    const text = fs.readFileSync(p, "utf8");
    if (!CONTROL.test(text)) continue;
    text.split("\n").forEach((line, i) => {
      if (CONTROL.test(line)) bad.push(`${p}:${i + 1}  ${line.trim().slice(0, 100)}`);
    });
  }
}

for (const root of ROOTS) if (fs.existsSync(root)) walk(root);

if (bad.length > 0) {
  console.error("소스에 제어문자가 섞였습니다 (정규식의 \\b, \\t 등이 깨진 자리):");
  for (const b of bad) console.error("  " + b);
  process.exit(1);
}
console.log("소스 제어문자 검사 통과");
