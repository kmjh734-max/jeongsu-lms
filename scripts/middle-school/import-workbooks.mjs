/**
 * 중학교 워크북: parse-workbooks.py 의 workbooks.json → ms_units.workbook (정수학원)
 *
 *   node --env-file=.env.local scripts/middle-school/import-workbooks.mjs [동아(윤)] [--적용]
 *
 * 족보닷컴 워크북 문항은 과 전체가 한 줄로 이어져 있다. 문항의 영어 낱말이 가장 많이 겹치는 본문(본문1·본문2…)에 붙이고,
 * 문항 차례가 글 차례이므로 앞 문항보다 앞 본문으로 돌아가지 않게 한다.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes("--적용");
const only = args.find((a) => !a.startsWith("--")) ?? "동아(윤)";
const PUBLISHER = { "동아(윤)": "동아(윤정미)", "동아(이)": "동아(이병민)" };

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: academy } = await sb.from("academies").select("id").eq("slug", "jeongsu").single();
const units = JSON.parse(fs.readFileSync(path.join(here, "workbooks.json"), "utf8")).filter((u) => u.publisher === only);

const toks = (s) => new Set(String(s ?? "").toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter((w) => w.length > 2));

function assigner(parts) {
  const bags = parts.map((p) => toks(p.english_text));
  let prev = 0;
  return (text) => {
    const t = toks(text);
    let best = prev;
    let bestScore = -1;
    bags.forEach((bag, i) => {
      let s = 0;
      for (const w of t) if (bag.has(w)) s++;
      const score = s / Math.max(1, t.size);
      if (i >= prev && score > bestScore + 0.05) {
        best = i;
        bestScore = score;
      }
    });
    prev = best;
    return parts[best].part;
  };
}

for (const u of units) {
  const lessonNo = Number(u.lesson.replace("과", ""));
  const { data: unit } = await sb
    .from("ms_units")
    .select("id")
    .eq("academy_id", academy.id)
    .eq("grade", u.grade)
    .eq("publisher", PUBLISHER[u.publisher] ?? u.publisher)
    .eq("lesson_no", lessonNo)
    .single();
  const { data: parts } = await sb.from("ms_texts").select("part, english_text").eq("unit_id", unit.id).eq("kind", "본문").order("order_index");
  const sets = {};
  const counts = [];
  for (const [kind, set] of Object.entries(u.sets)) {
    if (kind === "context_fix") continue;
    const at = assigner(parts);
    sets[kind] = {
      direction: set.direction,
      items: set.items.map((it) => ({ part: at(it.en ?? `${it.q ?? ""} ${it.answer}`), ...it })),
    };
    const byPart = {};
    for (const it of sets[kind].items) byPart[it.part] = (byPart[it.part] ?? 0) + 1;
    counts.push(`${kind} ${Object.values(byPart).join("/")}`);
  }
  const atCtx = assigner(parts);
  // 어색한 곳은 문맥 → 어법 두 바퀴가 이어진다 — 바퀴가 바뀌면 다시 앞에서 찾는다
  const contextFix = [];
  let round = assigner(parts);
  let last = -1;
  for (const c of u.sets.context_fix?.items ?? []) {
    let part = round(c.passage);
    const idx = parts.findIndex((p) => p.part === part);
    if (idx < last || (idx === last && contextFix.length)) {
      round = assigner(parts);
      part = round(c.passage);
    }
    last = parts.findIndex((p) => p.part === part);
    contextFix.push({ part, ...c });
  }
  void atCtx;
  console.log(`${u.grade} ${lessonNo}과 본문 ${parts.length} · ${counts.join(" · ")} · 어색한 곳 ${contextFix.map((c) => c.part.replace("본문", "")).join(",")}`);
  if (apply) {
    const { error } = await sb.from("ms_units").update({ workbook: { sets, contextFix } }).eq("id", unit.id);
    if (error) throw error;
  }
}
console.log(apply ? "넣음" : "(미리 보기 — --적용 으로 넣는다)");
