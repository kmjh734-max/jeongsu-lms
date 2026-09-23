// 문항별 검토에서 찾은 결함을 고친다(API 안 씀).
//   node scripts/tmp-rv/fix-listening-review.mjs [--적용]
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

/**
 * 고칠 것. set/no 로 문항을 찾고, 준 항목만 바꾼다.
 * why 는 사람이 읽을 까닭(로그에만 쓴다).
 */
const FIXES = [
  // ── 중1 5회
  {
    set: "중1 5회", no: 3,
    why: "보기 ④ 맞춤법(묻려고 → 물어보려고)",
    choices: [
      "점심 메뉴를 정하려고",
      "점심 시간을 바꾸려고",
      "학교에 함께 가려고",
      "설문 결과를 물어보려고",
      "설문지를 가져와 달라고",
    ],
  },
  {
    set: "중1 5회", no: 12,
    why: "지시문이 대본과 다름(숙박권 → 책), 표 ③ 라벨 겹침",
    instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 책을 고르시오.",
    tablePatch: { fixRowLabels: true },
  },
  {
    set: "중1 5회", no: 13,
    why: "지시문이 대본과 다름(신발 → 매점 설문 검토)",
    instruction: "대화를 듣고, 두 사람이 매점 설문을 검토할 날짜를 고르시오.",
  },

  // ── 중1 6회
  {
    set: "중1 6회", no: 2,
    why: "지시문이 대본과 다름(분실물 → 여름 아르바이트). 임금은 묻기만 하고 답이 없어 정답이 둘이 되므로 보기 ④를 대본에 나온 항목으로 바꾼다",
    instruction: "대화를 듣고, 여름 아르바이트에 관해 언급되지 않은 것을 고르시오.",
    choices: ["시작 시각", "근무 장소", "업무 내용", "근무 업종", "지원 방법"],
    explanation:
      "근무 시작 시각(월요일 오전 9시), 근무 장소(버스 정류장 옆), 근무 업종(카페), 지원 방법(학생 사무실에서 등록)은 언급되지만 무슨 일을 하는지는 언급되지 않았다. 따라서 답은 ③이다.",
  },
  {
    set: "중1 6회", no: 13,
    why: "지시문이 대본과 다름(신발 → 농구 대회 등록)",
    instruction: "대화를 듣고, 두 사람이 농구 대회에 등록할 날짜를 고르시오.",
  },

  // ── 중1 7회
  {
    set: "중1 7회", no: 2,
    why: "지시문·보기가 대본과 다름(분실물 → 교복 교환 행사)",
    instruction: "대화를 듣고, 교복 교환 행사에 관해 언급되지 않은 것을 고르시오.",
    choices: ["색깔", "모이는 장소", "참가비", "행사 시각", "신청 방법"],
    explanation:
      "색깔(초록 블레이저), 모이는 장소(체육관 입구), 행사 시각(이번 주 금요일 세 시), 신청 방법(학생회에 이메일)은 언급되지만 참가비는 언급되지 않았다. 따라서 답은 ③이다.",
  },
  {
    set: "중1 7회", no: 13,
    why: "지시문이 대본과 다름(신발 → 축제 음식 부스)",
    instruction: "대화를 듣고, 두 사람이 축제 음식 부스를 운영할 날짜를 고르시오.",
  },

  // ── 중1 8회
  {
    set: "중1 8회", no: 13,
    why: "지시문이 대본과 다름(신발 → 학교 신문 작업)",
    instruction: "대화를 듣고, 두 사람이 학교 신문 작업을 할 날짜를 고르시오.",
  },

  // ── 중1 10회
  {
    set: "중1 10회", no: 13,
    why: "지시문이 대본과 다름(신발 → 카누 활동)",
    instruction: "대화를 듣고, 두 사람이 카누 활동을 진행할 날짜를 고르시오.",
  },
];

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title")
  .eq("academy_id", prof.academy_id);

let done = 0;
for (const f of FIXES) {
  const s = sets.find((x) => x.title === f.set);
  if (!s) {
    console.log(`[못 찾음] ${f.set}`);
    continue;
  }
  const { data: q } = await admin
    .from("listening_questions")
    .select("id, instruction, choices, explanation, table_data")
    .eq("set_id", s.id)
    .eq("order_index", f.no)
    .single();
  if (!q) {
    console.log(`[못 찾음] ${f.set} ${f.no}번`);
    continue;
  }

  const patch = {};
  if (f.instruction) patch.instruction = f.instruction;
  if (f.choices) patch.choices = f.choices;
  if (f.explanation) patch.explanation = f.explanation;
  if (f.tablePatch?.fixRowLabels && q.table_data?.rows) {
    const MARKS = "①②③④⑤";
    patch.table_data = {
      ...q.table_data,
      rows: q.table_data.rows.map((r, i) => ({
        ...r,
        label: MARKS[i],
        // "③ ③ Price: ..." 처럼 라벨이 값 앞에 한 번 더 붙은 것을 뗀다
        value: String(r.value ?? "").replace(/^[①②③④⑤]\s*/, ""),
      })),
    };
  }

  console.log(`${f.set} ${f.no}번 — ${f.why}`);
  if (patch.instruction) console.log(`   지시: ${q.instruction} → ${patch.instruction}`);
  if (patch.choices) console.log(`   보기: ${(q.choices ?? []).join(" / ")} → ${patch.choices.join(" / ")}`);
  if (patch.table_data) console.log(`   표: ${patch.table_data.rows.map((r) => `${r.label} ${r.value}`).join(" // ")}`);

  if (apply) {
    const { error } = await admin.from("listening_questions").update(patch).eq("id", q.id);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
  }
  done += 1;
}

console.log(`${apply ? "적용함" : "미리보기"} — ${done}개`);
if (!apply) console.log("적용하려면 --적용 을 붙이세요.");
