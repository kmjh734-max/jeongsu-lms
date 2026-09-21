// 교과서 본문 + 추가지문 JSON → textbook_passages (정수학원만)
//
// Read More / Further Reading 처럼 본문 뒤에 딸린 지문은 내용정리 플러스에 표시가 없어
// 앞 본문에 붙어 있었다. 이제 따로 '추가지문N' 으로 넣고, 그 때문에 번호가 밀려
// 쓸모없어진 옛 줄은 지운다.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const academyId = prof.academy_id;

const list = [];
for (const f of fs.readdirSync("scripts/tmp-rv").filter((x) => x.startsWith("tb-extra-"))) {
  list.push(...JSON.parse(fs.readFileSync(`scripts/tmp-rv/${f}`, "utf8")));
}

const lessonNo = (s) => {
  const m = String(s).match(/(\d+)/);
  return m ? Number(m[1]) : 90;
};
const partNo = (s) => Number(String(s).replace(/\D/g, "") || 0);
const orderOf = (p) =>
  (String(p.lesson).startsWith("Special") || String(p.lesson).startsWith("Project") ? 9000 : 0) +
  lessonNo(p.lesson) * 100 +
  (String(p.part).startsWith("추가지문") ? 50 : 0) +
  partNo(p.part);

const rows = list.map((p) => ({
  academy_id: academyId,
  subject: p.subject,
  publisher: p.publisher,
  lesson: p.lesson,
  part: p.part,
  label: p.label,
  english_text: p.english_text,
  korean_text: p.korean_text || null,
  word_count: p.words,
  order_index: orderOf(p),
}));

for (let i = 0; i < rows.length; i += 100) {
  const { error } = await admin
    .from("textbook_passages")
    .upsert(rows.slice(i, i + 100), { onConflict: "academy_id,subject,publisher,lesson,part" });
  if (error) throw error;
}
console.log("넣은 지문", rows.length, "개");

// 새 파일에 없는 옛 줄 정리 — 추가지문으로 이름이 바뀌어 남은 껍데기다.
// 다만 그 글이 새 파일 어디에도 없으면 지우지 않는다. 지우면 그대로 잃는다.
const keep = new Set(rows.map((r) => `${r.subject}|${r.publisher}|${r.lesson}|${r.part}`));
const { data: all } = await admin
  .from("textbook_passages")
  .select("id, subject, publisher, lesson, part, english_text")
  .eq("academy_id", academyId);
const leftover = (all ?? []).filter((r) => !keep.has(`${r.subject}|${r.publisher}|${r.lesson}|${r.part}`));

const flat = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
const stale = [];
const risky = [];
for (const r of leftover) {
  const head = flat(r.english_text).split(" ").slice(0, 10).join(" ");
  const sameLesson = rows.filter(
    (x) => x.subject === r.subject && x.publisher === r.publisher && x.lesson === r.lesson,
  );
  const found = head && sameLesson.some((x) => flat(x.english_text).includes(head));
  (found ? stale : risky).push(r);
}

console.log("지울 옛 줄", stale.length, "개 (새 파일에서 같은 글을 찾음)");
for (const s of stale) console.log("   ", s.subject, s.publisher, s.lesson, s.part);
if (risky.length > 0) {
  console.log("\n남겨 두는 줄", risky.length, "개 — 새 파일에서 같은 글을 못 찾았습니다. 눈으로 보고 정하세요.");
  for (const s of risky) console.log("   ", s.subject, s.publisher, s.lesson, s.part);
}
if (stale.length > 0 && process.argv.includes("--적용")) {
  const { error } = await admin.from("textbook_passages").delete().in("id", stale.map((s) => s.id));
  if (error) throw error;
  console.log("지웠습니다.");
}
const { count } = await admin.from("textbook_passages").select("id", { count: "exact", head: true });
console.log("저장 뒤 전체", count);
