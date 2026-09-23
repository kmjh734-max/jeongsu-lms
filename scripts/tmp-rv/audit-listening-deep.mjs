// 듣기 문항 속내용 검사(API 안 씀). 대본·보기·정답·해설을 서로 맞대어 본다.
//   node scripts/tmp-rv/audit-listening-deep.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MARKS = "①②③④⑤";
const rows = [];
const add = (kind, set, no, msg) => rows.push({ kind, set, no, msg });

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** 영어 어구가 대본에 나오는지(낱말 경계, 복수형 허용) */
function inScript(script, phrase) {
  const p = norm(phrase).replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  if (!p || p.length < 3) return true; // 너무 짧으면 판단하지 않는다
  const s = norm(script).replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ");
  if (s.includes(p)) return true;
  // 마지막 낱말의 단·복수만 다른 경우도 나온 것으로 본다
  const w = p.split(" ");
  const last = w[w.length - 1];
  for (const alt of [last.replace(/s$/, ""), `${last}s`, last.replace(/ies$/, "y")]) {
    if (alt !== last && s.includes([...w.slice(0, -1), alt].join(" "))) return true;
  }
  return false;
}

/** 시각·날짜 값을 대본에서 찾을 수 있는 꼴로 펼친다 */
const NUM_WORDS = {
  1: ["one"], 2: ["two"], 3: ["three"], 4: ["four"], 5: ["five"], 6: ["six"], 7: ["seven"],
  8: ["eight"], 9: ["nine"], 10: ["ten"], 11: ["eleven"], 12: ["twelve"], 13: ["thirteen"],
  14: ["fourteen"], 15: ["fifteen", "quarter"], 16: ["sixteen"], 17: ["seventeen"], 18: ["eighteen"],
  19: ["nineteen"], 20: ["twenty"], 22: ["twenty-two", "twenty two"], 24: ["twenty-four", "twenty four"],
  25: ["twenty-five", "twenty five"], 26: ["twenty-six", "twenty six"], 30: ["thirty", "half"],
  40: ["forty"], 45: ["forty-five", "forty five"], 50: ["fifty"], 55: ["fifty-five", "fifty five"],
};
function timeForms(text) {
  const m = String(text).match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const out = [`${h}:${String(mi).padStart(2, "0")}`];
  for (const hw of NUM_WORDS[h] ?? []) {
    if (mi === 0) out.push(`${hw} o'clock`, `at ${hw}`, `${hw} p`, `${hw} a`);
    else for (const mw of NUM_WORDS[mi] ?? []) out.push(`${hw} ${mw}`, `${mw} past ${hw}`, `${mw} to ${hw}`);
  }
  return out;
}
function dateForms(text) {
  const m = String(text).match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (!m) return null;
  const d = Number(m[2]);
  const ord = { 1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 7: "seventh",
    8: "eighth", 9: "ninth", 10: "tenth", 11: "eleventh", 12: "twelfth", 13: "thirteenth", 14: "fourteenth",
    15: "fifteenth", 16: "sixteenth", 17: "seventeenth", 18: "eighteenth", 19: "nineteenth", 20: "twentieth",
    22: "twenty-second", 23: "twenty-third", 24: "twenty-fourth", 25: "twenty-fifth", 26: "twenty-sixth",
    28: "twenty-eighth", 30: "thirtieth" };
  const out = [`${d}th`, `${d}st`, `${d}nd`, `${d}rd`, ` ${d},`, ` ${d} `];
  if (ord[d]) out.push(ord[d]);
  return out;
}

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title")
  .eq("academy_id", prof.academy_id)
  .order("title");

for (const s of sets) {
  const { data: qs } = await admin
    .from("listening_questions")
    .select("id, order_index, question_type, instruction, script_text, choices, correct_answer, explanation, answer_clue, table_data")
    .eq("set_id", s.id)
    .order("order_index");

  for (const q of qs) {
    const no = q.order_index;
    const type = String(q.question_type ?? "");
    const script = String(q.script_text ?? "");
    const choices = Array.isArray(q.choices) ? q.choices.map((c) => String(c)) : [];
    const ans = Number(q.correct_answer);
    const exp = String(q.explanation ?? "");

    // A. 해설이 가리키는 번호와 정답이 다르다
    const marks = [...new Set([...exp].filter((ch) => MARKS.includes(ch)))];
    if (marks.length === 1 && MARKS.indexOf(marks[0]) + 1 !== ans) {
      add("정답·해설 어긋남", s.title, no, `해설은 ${marks[0]}, 정답은 ${ans}`);
    }
    if (marks.length > 1) {
      add("해설 번호 여럿", s.title, no, `해설에 ${marks.join("")}`);
    }

    // B. 보기가 겹친다
    const seen = new Map();
    for (const c of choices) {
      const k = norm(c);
      if (!k) continue;
      if (seen.has(k)) add("보기 겹침", s.title, no, `"${c}"`);
      seen.set(k, true);
    }

    // C. 언급 여부(영어 보기): 정답은 대본에 없어야 하고 나머지는 있어야 한다
    const englishChoices = choices.length === 5 && choices.every((c) => /^[\x20-\x7e]+$/.test(c.trim()));
    if (/언급|미언급/.test(type) && englishChoices && script) {
      const hit = choices.map((c) => inScript(script, c));
      if (hit[ans - 1]) add("언급 여부 정답 의심", s.title, no, `정답 보기 "${choices[ans - 1]}"가 대본에 나온다`);
      const missing = choices.map((c, i) => (i === ans - 1 || hit[i] ? null : c)).filter(Boolean);
      if (missing.length) add("언급 여부 오답 의심", s.title, no, `대본에 없는 오답: ${missing.join(" / ")}`);
    }

    // D. 시각 파악: 정답 시각이 대본에 나와야 한다
    if (/시각/.test(type) && script && choices[ans - 1]) {
      const forms = timeForms(choices[ans - 1]);
      if (forms && !forms.some((f) => norm(script).includes(norm(f)))) {
        add("시각 정답 의심", s.title, no, `정답 ${choices[ans - 1]}를 대본에서 못 찾음`);
      }
    }

    // E. 날짜 파악: 정답 날짜가 대본에 나와야 한다
    if (/날짜/.test(type) && script && choices[ans - 1]) {
      const forms = dateForms(choices[ans - 1]);
      if (forms && !forms.some((f) => norm(script).includes(norm(f)))) {
        add("날짜 정답 의심", s.title, no, `정답 ${choices[ans - 1]}를 대본에서 못 찾음`);
      }
    }

    // F. 금액: 정답 금액이 대본에 그대로 있으면 계산 문항으로서 수상하다(합을 묻는데 그대로 나옴)
    if (/금액 계산/.test(type) && script && choices[ans - 1]) {
      const v = Number(String(choices[ans - 1]).replace(/[^\d]/g, ""));
      if (v > 0 && new RegExp(`\\$\\s*${v}\\b`).test(script)) {
        add("금액 정답 의심", s.title, no, `정답 ${choices[ans - 1]}가 대본에 그대로 나온다`);
      }
    }

    // G. 지시문 속 우리말 낱말이 대본·보기 어디에도 걸리지 않는다(지시문이 딴 자료의 것)
    if (q.instruction && script) {
      const key = String(q.instruction).match(/[가-힣]{2,}/g) ?? [];
      const STOP = new Set(["대화를", "듣고", "다음", "고르시오", "가장", "적절한", "것을", "남자가", "여자가",
        "두", "사람이", "보면서", "이어질", "마지막", "말에", "대한", "응답으로", "관해", "언급되지", "않은",
        "그림에서", "내용과", "일치하지", "지불할", "금액을", "무엇에", "관한", "설명인지", "표를", "다음을",
        "여학생이", "남학생이", "할", "일로", "심정으로", "의견으로", "목적으로", "이유를", "직후에", "것이",
        "아닌", "어색한", "상황에", "맞는", "대화를", "말로", "지칭하는", "위치는", "바른", "주제로", "요지로",
        "에게", "하는", "말의", "담화", "듣고,"]);
      const words = key.filter((w) => w.length >= 2 && !STOP.has(w));
      // 지시문 낱말 중 하나라도 보기나 우리말 해설에 걸리면 맞는 것으로 본다
      const hay = norm(`${choices.join(" ")} ${exp} ${q.answer_clue ?? ""}`);
      const anchored = words.some((w) => hay.includes(norm(w)) || hay.includes(norm(w.slice(0, 2))));
      if (words.length >= 2 && !anchored) {
        add("지시문 의심", s.title, no, `${q.instruction}`);
      }
    }
  }
}

const byKind = new Map();
for (const r of rows) byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1);
const out = [];
out.push(`문항 검사 결과 — 걸린 것 ${rows.length}건`);
out.push("");
for (const [k, n] of [...byKind].sort((a, b) => b[1] - a[1])) out.push(`  ${k}: ${n}건`);
out.push("");
for (const [k] of [...byKind].sort((a, b) => b[1] - a[1])) {
  out.push(`[${k}]`);
  for (const r of rows.filter((x) => x.kind === k)) out.push(`  · ${r.set} ${r.no}번 — ${r.msg}`);
  out.push("");
}
fs.writeFileSync(
  "C:/Users/kmjh7/AppData/Local/Temp/claude/c--video-app/e53d3a81-1126-4979-9ae9-90ccca3a0846/scratchpad/listening-deep.txt",
  out.join("\n"),
  "utf8"
);
console.log(out.slice(0, 12).join("\n"));
console.log("적음: listening-deep.txt");
