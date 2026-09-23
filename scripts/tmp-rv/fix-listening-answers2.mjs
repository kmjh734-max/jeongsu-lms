// 문항별 검토 1차 — 정답·해설이 틀린 것을 고친다(API 안 씀).
//   node scripts/tmp-rv/fix-listening-answers2.mjs [--적용]
//
// 모두 대본·표·그림을 직접 보고 확인한 것만 담는다. 음성은 건드리지 않는다.
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
  // ───────────────────────── 정답이 틀린 것
  {
    set: "중3 8회", no: 2, why: "장소(2층 음악실)는 대본에 나온다. 안 나온 것은 대상",
    answer: 3,
  },
  {
    set: "중3 6회", no: 16, why: "3×$3 + $5 + $2 = $16, 쿠폰 $2 빼면 $14",
    answer: 3,
    explanation:
      "안내 책자는 3달러씩 세 권이라 9달러, 교통카드는 5달러, 캠퍼스 지도는 2달러로 모두 16달러다. 여기서 쿠폰 2달러를 빼면 14달러이므로 답은 ③이다.",
  },
  {
    set: "고2 4회", no: 8, why: "개최 기간(5월 17~19일)은 대본에 나온다. 안 나온 것은 제출 마감일",
    answer: 2,
  },
  {
    set: "고1 6회", no: 8, why: "개최 기간(10월 9~11일)은 대본에 나온다. 안 나온 것은 제출 마감일",
    answer: 2,
  },
  {
    set: "고1 8회", no: 8, why: "진행 기간(8월 5~7일)은 대본에 나온다. 안 나온 것은 신청 마감일",
    answer: 2,
  },
  {
    set: "고1 7회", no: 13, why: "남자가 '상자를 더 열기 전에 사진부터 찍어라'라고 했으므로 ④는 앞말과 어긋난다. 해설도 ②를 풀이한다",
    answer: 2,
  },
  {
    set: "고3 4회", no: 6, why: "바이알 4개분 $8 + 공책 2권 $10 = $18, 쿠폰 $4를 빼면 $14. 대본이 '무료 행사 뒤에 쿠폰이 적용된다'고 말한다",
    answer: 1,
    explanation:
      "바이알은 두 개를 사면 한 개가 덤이라 여섯 개에 네 개 값만 내므로 2달러씩 8달러이고, 연구 노트는 5달러씩 두 권이라 10달러다. 합이 18달러이고 쿠폰으로 4달러를 빼면 14달러이므로 답은 ①이다.",
  },
  {
    set: "고1 5회", no: 6, why: "박스 2개분 $14 + 쿨러 $5 = $19, 쿠폰 $4를 빼면 $15인데 보기에 $15가 없었다. 보기 ①을 $15로 고치고 답을 ①로 한다",
    choices: ["$15", "$18", "$21", "$22", "$26"],
    answer: 1,
    explanation:
      "피크닉 박스는 두 개를 사면 한 개가 덤이라 세 개에 두 개 값만 내므로 7달러씩 14달러이고, 쿨러는 5달러다. 합이 19달러이고 쿠폰으로 4달러를 빼면 15달러이므로 답은 ①이다.",
  },
  {
    set: "고3 8회", no: 4, why: "그림 ③은 알람 시계인데 대화는 '빨간 불이 들어오는 작은 타이머'라고 한다. ④ 종이 더미는 대화대로 플래시카드가 맞다",
    answer: 3,
    explanation:
      "대화에서는 가운데에 빨간 불이 들어오는 작은 타이머가 있다고 했는데 그림에는 알람 시계가 놓여 있다. 따라서 답은 ③이다.",
  },

  // ───────────────────────── 해설이 딴 번호를 가리키는 것
  {
    set: "중3 5회", no: 9, why: "답은 ④ 손신호인데 해설이 '3번'이라고 적혀 있었다",
    explanation:
      "팔을 써서 왼쪽이나 오른쪽으로 갈 것을 알리는 방법을 설명하고 있으므로 손신호다. 따라서 답은 ④이다.",
  },
  {
    set: "중3 9회", no: 5, why: "답은 ④ embarrassed인데 해설이 '3번'이라고 적혀 있었다",
    explanation:
      "사진이 흩어져 모두가 쳐다봤고 남자는 얼굴이 뜨겁다며 잠깐 나가 있겠다고 한다. 창피함을 느끼고 있으므로 답은 ④이다.",
  },
  {
    set: "고2 10회", no: 15, why: "답은 ③인데 해설 첫 문장이 '4번'이라고 적혀 있었다",
    explanation:
      "Jisoo는 Minho가 제 몫을 다한 것을 알기에 나무라려는 것이 아니라, 동의서가 여러 책상에 흩어져 있으니 십 분만 도와 달라고 부탁하려 한다. 따라서 답은 ③이다.",
  },
  {
    set: "고3 4회", no: 11, why: "답은 ④인데 해설이 '2번'이라고 적혀 있었다",
    explanationFix: { from: /2\s*번/g, to: "4번" },
  },
  {
    set: "고2 8회", no: 6, why: "대본의 추가 구매품은 행주(dish towels)인데 해설이 '행거'라고 적혀 있었다",
    explanationFix: { from: /행거/g, to: "행주" },
  },
];

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin.from("listening_sets").select("id, title").eq("academy_id", prof.academy_id);

let n = 0;
for (const f of FIXES) {
  const s = sets.find((x) => x.title === f.set);
  if (!s) {
    console.log(`[못 찾음] ${f.set}`);
    continue;
  }
  const { data: q } = await admin
    .from("listening_questions")
    .select("id, correct_answer, choices, explanation")
    .eq("set_id", s.id)
    .eq("order_index", f.no)
    .single();
  if (!q) {
    console.log(`[못 찾음] ${f.set} ${f.no}번`);
    continue;
  }

  const patch = {};
  if (f.answer && f.answer !== q.correct_answer) patch.correct_answer = f.answer;
  if (f.choices) patch.choices = f.choices;
  if (f.explanation) patch.explanation = f.explanation;
  if (f.explanationFix) {
    const next = String(q.explanation ?? "").replace(f.explanationFix.from, f.explanationFix.to);
    if (next !== q.explanation) patch.explanation = next;
  }
  if (Object.keys(patch).length === 0) {
    console.log(`[이미 맞음] ${f.set} ${f.no}번`);
    continue;
  }

  console.log(`${f.set} ${f.no}번 — ${f.why}`);
  if (patch.correct_answer) console.log(`   정답: ${q.correct_answer} → ${patch.correct_answer}`);
  if (patch.choices) console.log(`   보기: ${(q.choices ?? []).join(" / ")} → ${patch.choices.join(" / ")}`);
  if (patch.explanation) console.log(`   해설: ${String(patch.explanation).slice(0, 70)}…`);

  if (apply) {
    const { error } = await admin.from("listening_questions").update(patch).eq("id", q.id);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
  }
  n += 1;
}

console.log(`${apply ? "적용함" : "미리보기"} — ${n}개`);
if (!apply) console.log("적용하려면 --적용 을 붙이세요.");
