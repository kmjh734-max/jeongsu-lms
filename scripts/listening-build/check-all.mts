/** 적어 둔 듣기 세트를 모두 규칙 검수한다(API 안 씀): node ... check-all-sets.mts */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";
import type { SetSpec } from "./spec.ts";
import { checkSet } from "./check-set.ts";

const dir = "C:/video-app/scripts/listening-build/sets";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();

let clean = 0;
const rows: Array<{ file: string; level: string; order: number | undefined; message: string }> = [];

for (const f of files) {
  const mod = (await import(pathToFileURL(path.join(dir, f)).href)) as { spec: SetSpec };
  const problems = checkSet(mod.spec);
  if (problems.length === 0) {
    clean += 1;
    continue;
  }
  for (const p of problems) rows.push({ file: f.replace(/\.ts$/, ""), level: p.level, order: p.order, message: p.message });
}

console.log(`세트 ${files.length}개 · 깨끗함 ${clean}개 · 걸린 세트 ${files.length - clean}개`);
const block = rows.filter((r) => r.level === "막음");
console.log(`막음 ${block.length}건 · 살핌 ${rows.length - block.length}건`);
console.log("");
for (const r of rows) {
  console.log(`${r.level === "막음" ? "[막음]" : "[살핌]"} ${r.file} ${r.order ? `${r.order}번` : "세트"} — ${r.message}`);
}
