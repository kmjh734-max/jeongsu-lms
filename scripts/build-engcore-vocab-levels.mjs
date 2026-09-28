/**
 * EngCore 단어장 열 권에서 "낱말 → 가장 낮은 레벨" 표를 만들어 파일로 둔다.
 *
 * 지문 수준을 우리 단어장 기준으로 재는 데 쓴다. 단어장이 바뀌면 다시 돌린다.
 *   node --env-file=.env.local scripts/build-engcore-vocab-levels.mjs
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ORDER = [
  "EngCore 초등 Level 1", "EngCore 초등 Level 2", "EngCore 초등 Level 3", "EngCore 초등 Level 4",
  "EngCore 중학기본", "EngCore 중학필수", "EngCore 중학고난도",
  "EngCore 고교기본", "EngCore 고교필수", "EngCore 수능필수",
];

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: folders } = await admin.from("vocab_folders").select("id, name");
const byName = new Map();
for (const f of folders ?? []) {
  if (!byName.has(f.name)) byName.set(f.name, []);
  byName.get(f.name).push(f.id);
}

/** 낱말 → 가장 낮은 레벨 번호(0부터) */
const level = {};
for (let i = 0; i < ORDER.length; i++) {
  // 학원마다 사본이 있지만 낱말은 같다. 한 벌만 읽는다.
  const fid = (byName.get(ORDER[i]) ?? [])[0];
  if (!fid) { console.log("없음:", ORDER[i]); continue; }
  const { data: sets } = await admin.from("vocab_sets").select("id").eq("folder_id", fid);
  let n = 0;
  for (const s of sets ?? []) {
    const { data: items } = await admin.from("vocab_items").select("word").eq("set_id", s.id);
    for (const it of items ?? []) {
      const w = String(it.word ?? "").trim().toLowerCase();
      if (!/^[a-z][a-z'-]*$/.test(w)) continue;
      if (level[w] === undefined) { level[w] = i; n++; }
    }
  }
  console.log(`${ORDER[i]}: 새 낱말 ${n}개`);
}

const out = { levels: ORDER, words: level };
fs.writeFileSync("src/lib/vocab/engcore-levels.generated.json", JSON.stringify(out), "utf8");
console.log("낱말", Object.keys(level).length, "개 저장");
