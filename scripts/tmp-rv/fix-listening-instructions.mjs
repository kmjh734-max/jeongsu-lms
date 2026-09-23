// 문항별 검토 2차 — 대본과 어긋난 지시문·보기·표를 고친다(API 안 씀).
//   node scripts/tmp-rv/fix-listening-instructions.mjs [--적용]
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const apply = process.argv.includes("--적용");

const FIXES = [
  // ── 중1
  { set: "중1 5회", no: 12, instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 책을 고르시오.", fixTableLabels: true },
  { set: "중1 5회", no: 13, instruction: "대화를 듣고, 두 사람이 매점 설문을 검토할 날짜를 고르시오." },
  {
    set: "중1 6회", no: 2,
    instruction: "대화를 듣고, 여름 아르바이트에 관해 언급되지 않은 것을 고르시오.",
    choices: ["시작 시각", "근무 장소", "업무 내용", "근무 업종", "지원 방법"],
    explanation:
      "근무 시작 시각(월요일 오전 9시), 근무 장소(버스 정류장 옆), 근무 업종(카페), 지원 방법(학생 사무실에서 등록)은 언급되지만 무슨 일을 하는지는 언급되지 않았다. 따라서 답은 ③이다.",
  },
  { set: "중1 6회", no: 13, instruction: "대화를 듣고, 두 사람이 농구 대회에 등록할 날짜를 고르시오." },
  {
    set: "중1 7회", no: 2,
    instruction: "대화를 듣고, 교복 교환 행사에 관해 언급되지 않은 것을 고르시오.",
    choices: ["색깔", "모이는 장소", "참가비", "행사 시각", "신청 방법"],
    explanation:
      "색깔(초록 블레이저), 모이는 장소(체육관 입구), 행사 시각(이번 주 금요일 세 시), 신청 방법(학생회에 이메일)은 언급되지만 참가비는 언급되지 않았다. 따라서 답은 ③이다.",
  },
  { set: "중1 7회", no: 13, instruction: "대화를 듣고, 두 사람이 축제 음식 부스를 운영할 날짜를 고르시오." },
  { set: "중1 8회", no: 13, instruction: "대화를 듣고, 두 사람이 학교 신문 작업을 할 날짜를 고르시오." },
  { set: "중1 10회", no: 13, instruction: "대화를 듣고, 두 사람이 카누 활동을 진행할 날짜를 고르시오." },
  {
    set: "중1 5회", no: 3,
    choices: ["점심 메뉴를 정하려고", "점심 시간을 바꾸려고", "학교에 함께 가려고", "설문 결과를 물어보려고", "설문지를 가져와 달라고"],
  },

  // ── 중2
  { set: "중2 7회", no: 12, instruction: "다음 표를 보면서 대화를 듣고, 여자가 고를 블레이저를 고르시오." },
  { set: "중2 7회", no: 13, instruction: "대화를 듣고, 두 사람이 학교 축제에 갈 날짜를 고르시오." },
  { set: "중2 9회", no: 13, instruction: "대화를 듣고, 두 사람이 선거 포스터를 만들러 갈 날짜를 고르시오." },
  { set: "중2 10회", no: 2, instruction: "대화를 듣고, 동네 답사 모임에 관해 언급되지 않은 것을 고르시오." },
  { set: "중2 10회", no: 13, instruction: "대화를 듣고, 두 사람이 캠프 물품을 사러 갈 날짜를 고르시오." },
  { set: "중2 8회", no: 12, fixTableLabels: true },

  // ── 중3
  { set: "중3 5회", no: 13, instruction: "대화를 듣고, 두 사람이 매점 설문 조사를 할 날짜를 고르시오." },
  { set: "중3 6회", no: 13, instruction: "대화를 듣고, 두 사람이 농구 대회에 등록할 날짜를 고르시오." },
  { set: "중3 7회", no: 13, instruction: "대화를 듣고, 두 사람이 축제 부스를 설치할 날짜를 고르시오." },
  { set: "중3 8회", no: 13, instruction: "대화를 듣고, 두 사람이 신문 편집을 마무리할 날짜를 고르시오." },
  { set: "중3 9회", no: 2, instruction: "대화를 듣고, 겨울 코트 모으기 봉사에 관해 언급되지 않은 것을 고르시오." },
  { set: "중3 10회", no: 2, instruction: "대화를 듣고, 이사할 집에 관해 언급되지 않은 것을 고르시오." },
  { set: "중3 10회", no: 12, instruction: "다음 표를 보면서 대화를 듣고, 여자가 선택할 동네를 고르시오." },

  // ── 고1
  { set: "고1 4회", no: 10, instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 시간표를 고르시오." },
  { set: "고1 7회", no: 7, instruction: "대화를 듣고, 남자가 교복 기부 행사에 갈 수 없는 이유를 고르시오." },
  { set: "고1 9회", no: 7, instruction: "대화를 듣고, 남자가 겨울옷 정리 모임에 갈 수 없는 이유를 고르시오." },
  { set: "고1 9회", no: 10, instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 전시 관람을 고르시오." },

  // ── 고2
  { set: "고2 1회", no: 10, instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 텃밭 구획을 고르시오." },
  { set: "고2 2회", no: 8, instruction: "대화를 듣고, 방과후 요리 수업에 관해 언급되지 않은 것을 고르시오." },
  { set: "고2 4회", no: 7, instruction: "대화를 듣고, 남자가 병원 진료를 받으러 가지 못하는 이유를 고르시오." },

  // ── 고3
  { set: "고3 3회", no: 8, instruction: "대화를 듣고, 휴대폰 수리 행사에 관해 언급되지 않은 것을 고르시오." },
  { set: "고3 3회", no: 10, instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 부스를 고르시오." },
  { set: "고3 9회", no: 10, instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 오디션 장소를 고르시오." },
];

/** 보기 안의 한국어 오타 — 문항을 찾아 그 자리만 고친다 */
const CHOICE_TYPOS = [
  { set: "중2 10회", no: 3, from: "묻려고", to: "물어보려고" },
  { set: "고1 4회", no: 2, from: "목요일 오후은", to: "목요일 오후는" },
  { set: "고3 5회", no: 7, from: "모임 시간이 너무 이르거나", to: "모임 시간이 너무 일러서" },
  { set: "고3 8회", no: 7, from: "출발 시간이 너무 이래서", to: "출발 시간이 너무 일러서" },
  { set: "고2 7회", no: 7, from: "자전거가 몸에 맞지 않아서", to: "교복이 몸에 맞지 않아서" },
];

const MARKS = "①②③④⑤";
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin.from("listening_sets").select("id, title").eq("academy_id", prof.academy_id);

const find = async (title, no, cols) => {
  const s = sets.find((x) => x.title === title);
  if (!s) return null;
  const { data } = await admin.from("listening_questions").select(cols).eq("set_id", s.id).eq("order_index", no).single();
  return data ?? null;
};

let n = 0;
for (const f of FIXES) {
  const q = await find(f.set, f.no, "id, instruction, choices, explanation, table_data");
  if (!q) {
    console.log(`[못 찾음] ${f.set} ${f.no}번`);
    continue;
  }
  const patch = {};
  if (f.instruction && f.instruction !== q.instruction) patch.instruction = f.instruction;
  if (f.choices) patch.choices = f.choices;
  if (f.explanation) patch.explanation = f.explanation;
  if (f.fixTableLabels && q.table_data?.rows) {
    const rows = q.table_data.rows.map((r, i) => ({
      ...r,
      label: MARKS[i],
      value: String(r.value ?? "").replace(/^[①②③④⑤]\s*/, ""),
    }));
    if (JSON.stringify(rows) !== JSON.stringify(q.table_data.rows)) patch.table_data = { ...q.table_data, rows };
  }
  if (Object.keys(patch).length === 0) {
    console.log(`[이미 맞음] ${f.set} ${f.no}번`);
    continue;
  }
  console.log(`${f.set} ${f.no}번`);
  if (patch.instruction) console.log(`   지시: ${q.instruction} → ${patch.instruction}`);
  if (patch.choices) console.log(`   보기: ${(q.choices ?? []).join(" / ")} → ${patch.choices.join(" / ")}`);
  if (patch.table_data) console.log(`   표 라벨 고침`);
  if (apply) {
    const { error } = await admin.from("listening_questions").update(patch).eq("id", q.id);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
  }
  n += 1;
}

for (const t of CHOICE_TYPOS) {
  const q = await find(t.set, t.no, "id, choices");
  if (!q) {
    console.log(`[못 찾음] ${t.set} ${t.no}번`);
    continue;
  }
  const next = (q.choices ?? []).map((c) => String(c).split(t.from).join(t.to));
  if (JSON.stringify(next) === JSON.stringify(q.choices)) {
    console.log(`[그 말 없음] ${t.set} ${t.no}번 — "${t.from}"`);
    continue;
  }
  console.log(`${t.set} ${t.no}번 보기 오타: ${t.from} → ${t.to}`);
  if (apply) {
    const { error } = await admin.from("listening_questions").update({ choices: next }).eq("id", q.id);
    if (error) throw new Error(`${t.set} ${t.no}번: ${error.message}`);
  }
  n += 1;
}

console.log(`${apply ? "적용함" : "미리보기"} — ${n}개`);
if (!apply) console.log("적용하려면 --적용 을 붙이세요.");
