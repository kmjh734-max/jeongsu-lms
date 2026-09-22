// DB에 올라간 듣기 세트를 훑는다(API 안 씀). 문항 수·음성·그림·정답 쏠림·대본을 본다.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const academyId = prof.academy_id;

const { data: sets, error } = await admin
  .from("listening_sets")
  .select("id, title, grade_level, folder_id, is_locked, listening_set_folders(name)")
  .eq("academy_id", academyId)
  .order("title");
if (error) throw error;

const out = [];
const say = (s) => {
  out.push(s);
};

say(`세트 ${sets.length}개`);

// 폴더별 수
const byFolder = new Map();
for (const s of sets) {
  const k = s.listening_set_folders?.name || "(폴더 없음)";
  byFolder.set(k, (byFolder.get(k) ?? 0) + 1);
}
say("");
say("[폴더]");
for (const [k, v] of [...byFolder].sort()) say(`  ${k}: ${v}개`);

const unlocked = sets.filter((s) => !s.is_locked);
say("");
say(`[잠금] 안 잠긴 세트 ${unlocked.length}개`);
for (const s of unlocked.slice(0, 20)) say(`  - ${s.title}`);

const problems = [];
let checked = 0;

for (const s of sets) {
  const { data: qs, error: qe } = await admin
    .from("listening_questions")
    .select("id, order_index, question_type, choices, correct_answer, audio_url, choice_image_urls, dictation_prepared_at, script_text, explanation")
    .eq("set_id", s.id)
    .order("order_index");
  if (qe) throw qe;
  checked += 1;

  const grade = String(s.grade_level ?? "");
  const want = grade.startsWith("high") ? 17 : 20;
  if (qs.length !== want) problems.push(`${s.title} — 문항 ${qs.length}개 (${want}개여야 함)`);

  const noAudio = qs.filter((q) => !q.audio_url);
  if (noAudio.length) problems.push(`${s.title} — 음성 없는 문항 ${noAudio.length}개 (${noAudio.map((q) => q.order_index).join(",")})`);

  // 그림 문항: 중등 1·6번, 고등 4번이 그림이다(유형 이름으로 가린다)
  const figureQs = qs.filter((q) => String(q.question_type ?? "").includes("그림"));
  const noImage = figureQs.filter((q) => !(Array.isArray(q.choice_image_urls) && q.choice_image_urls.length > 0));
  if (noImage.length) problems.push(`${s.title} — 그림 없는 그림문항 ${noImage.length}개 (${noImage.map((q) => q.order_index).join(",")})`);

  // 정답 쏠림
  const counts = [0, 0, 0, 0, 0];
  for (const q of qs) {
    const a = Number(q.correct_answer);
    if (a >= 1 && a <= 5) counts[a - 1] += 1;
  }
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  if (max - min >= 4) problems.push(`${s.title} — 정답 쏠림 ${counts.join("/")}`);
  if (counts.some((c) => c === 0)) problems.push(`${s.title} — 안 쓰인 번호 있음 ${counts.join("/")}`);

  // 보기 수
  const badChoices = qs.filter((q) => !Array.isArray(q.choices) || q.choices.length !== 5);
  if (badChoices.length) problems.push(`${s.title} — 보기 5개가 아닌 문항 ${badChoices.map((q) => q.order_index).join(",")}`);

  // 빈 해설
  const noExp = qs.filter((q) => !String(q.explanation ?? "").trim());
  if (noExp.length) problems.push(`${s.title} — 해설 없는 문항 ${noExp.length}개`);

  // 빈 대본
  const noScript = qs.filter((q) => !String(q.script_text ?? "").trim());
  if (noScript.length) problems.push(`${s.title} — 대본 없는 문항 ${noScript.length}개`);

  // 받아쓰기 준비
  const noDict = qs.filter((q) => !q.dictation_prepared_at);
  if (noDict.length) problems.push(`${s.title} — 받아쓰기 준비 안 된 문항 ${noDict.length}개`);
}

say("");
say(`[문항 검사] ${checked}개 세트`);
if (problems.length === 0) say("  걸린 것 없음");
for (const p of problems) say(`  · ${p}`);

// 같은 제목이 겹치는지(한 학원 안에서만)
const titles = new Map();
for (const s of sets) titles.set(s.title, (titles.get(s.title) ?? 0) + 1);
const dup = [...titles].filter(([, n]) => n > 1);
say("");
say(`[제목 겹침] ${dup.length}건`);
for (const [t, n] of dup) say(`  · ${t} ×${n}`);

const text = out.join("\n");
fs.writeFileSync("C:/Users/kmjh7/AppData/Local/Temp/claude/c--video-app/e53d3a81-1126-4979-9ae9-90ccca3a0846/scratchpad/listening-audit.txt", text, "utf8");
console.log("적음: listening-audit.txt");
console.log(`문제 ${problems.length}건`);
