/** 올리지 않고 검수만 한다:  node ... check-only.mts <세트 파일> */
import { pathToFileURL } from "url";
import { resolve } from "path";
import type { SetSpec } from "./spec.ts";
import { checkSet } from "./check-set.ts";

const specPath = process.argv[2];
if (!specPath) throw new Error("쓰는 법: node ... check-only.mts <세트 파일>");
const mod = (await import(pathToFileURL(resolve(specPath)).href)) as { spec: SetSpec };
const problems = checkSet(mod.spec);
for (const p of problems) console.log(`  [${p.level}] ${p.order ? `${p.order}번` : "세트"}: ${p.message}`);
console.log(problems.length ? `총 ${problems.length}건` : "깨끗합니다.");
