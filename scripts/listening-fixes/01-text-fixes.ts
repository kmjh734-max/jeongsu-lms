/**
 * 듣기 문항 글자만 고치는 수정 (음원은 그대로 — 대본은 바꾸지 않음).
 *   1) 부탁한 일: 지시문이 반대 화자를 묻는 문항 → 실제로 부탁한 사람 기준으로 지시문·해설 수정
 *   2) 격려 의도: 마지막 말이 자기 다짐("Don't worry, I can do it")인데 정답이 격려 → 정답 선택지를 "다짐"으로
 *   3) 고1 6회 6번 금액: (72+18)×0.9−5 = $76인데 정답이 $81 → $76으로
 *   4) 해설이 섞기 전 번호(①~⑤)를 가리키는 문항 → 정답 번호로
 *   5) 선택지 앞에 옛 번호("⑤ 신청 장소")가 붙은 문항 → 번호 제거
 *   6) 날씨 선택지가 영어인 문항 → 한국어 (다른 날씨 문항과 통일)
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/01-text-fixes.ts          (미리보기)
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/01-text-fixes.ts --apply  (저장)
 */
import {
  findTemplate,
  keyOf,
  loadAll,
  runPlannedFixes,
  templateQuestions,
  type Loaded,
  type PlannedFix,
} from "./lib";
import { speakerOfQuote } from "../../src/lib/listening/speaker-attribution";
import { koreanizeWeatherChoices } from "../../src/lib/listening/fix-type3-question";
import { checkPriceQuestion, isPriceQuestion } from "../../src/lib/listening/price-check";

const CIRCLED = ["①", "②", "③", "④", "⑤"];
/** ①(일)·③(삼)은 받침이 있어 조사가 이/은/을/과, 나머지는 가/는/를/와 */
const HAS_BATCHIM = [true, false, true, false, false];
const PARTICLES: Array<[string, string]> = [
  ["이", "가"],
  ["은", "는"],
  ["을", "를"],
  ["과", "와"],
];

/** 해설 속 번호 하나를 다른 번호로 바꾸고 바로 뒤 조사도 맞춘다 */
function replaceCircledRef(text: string, from: string, to: string): string {
  const toIdx = CIRCLED.indexOf(to);
  return text.replace(new RegExp(`${from}(이|가|은|는|을|를|과|와)?`, "g"), (_m, particle?: string) => {
    if (!particle) return to;
    const pair = PARTICLES.find(([a, b]) => a === particle || b === particle)!;
    return to + (HAS_BATCHIM[toIdx] ? pair[0] : pair[1]);
  });
}

function stripChoicePrefix(choice: string): string {
  return choice.replace(/^\s*[①②③④⑤]\s*/, "");
}

function swapGender(text: string): string {
  return text.replace(/남자|여자/g, (m) => (m === "남자" ? "여자" : "남자"));
}

/** 격려가 아니라 자기 다짐인 문항 — 대본을 하나씩 읽고 정한 해설 */
const SELF_TALK_FIXES: Array<{ title: string; explanation: string; replaceDistractor?: [string, string] }> = [
  {
    title: "중1 4회",
    explanation: "남자의 마지막 말은 걱정하지 말라며 오늘 최선을 다하겠다고 스스로 다짐하는 말이다.",
  },
  {
    title: "중1 18회",
    explanation: "여자의 마지막 말은 걱정하지 말라며 오늘 잘 해내겠다고 스스로 다짐하는 말이다.",
  },
  {
    title: "중1 9회",
    explanation: "남자는 도와주겠다는 여자에게 걱정하지 말라며 혼자서도 해낼 수 있다고 다짐하고 있다.",
  },
  {
    title: "중2 14회",
    explanation: "남자는 고맙다고 한 뒤, 한 번 더 연습하면 해낼 수 있다고 스스로 다짐하고 있다.",
    // "Thanks, but don't worry"를 거절로도 볼 수 있어 정답이 둘이 되지 않게 오답을 바꾼다
    replaceDistractor: ["거절", "초대"],
  },
  {
    title: "중3 11회",
    explanation: "남자는 걱정하지 말라며 한 번 더 연습하면 해낼 수 있다고 스스로 다짐하고 있다.",
  },
  {
    title: "중2 3회",
    explanation: "남자는 걱정하지 말라며 자신 있게 해낼 수 있다고 스스로 다짐하고 있다.",
  },
];

function speakerLabel(sp: "M" | "W"): "남자" | "여자" {
  return sp === "M" ? "남자" : "여자";
}

function requestFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const q of templateQuestions(d)) {
    const m = q.instruction.match(/(남자|여자)가\s*(남자|여자)에게\s*부탁/);
    if (!m) continue;
    const segs = (d.segmentsByQuestion.get(q.id) ?? []).map((s) => ({ speaker: s.speaker_type, text: s.text }));
    const actual = speakerOfQuote(segs, String(q.request_expression ?? ""));
    if (!actual || speakerLabel(actual) === m[1]) continue;
    const asker = speakerLabel(actual);
    const other = asker === "남자" ? "여자" : "남자";
    out.push({
      template: q,
      reason: `지시문은 ${m[1]}가 부탁했다고 묻지만 부탁 문장("${q.request_expression}")은 ${asker}가 말함`,
      patch: {
        instruction: q.instruction.replace(m[0], `${asker}가 ${other}에게 부탁`),
        explanation: swapGender(q.explanation),
        requester: asker,
        requested_person: other,
      },
    });
  }
  return out;
}

function selfTalkFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const fix of SELF_TALK_FIXES) {
    const q = findTemplate(d, fix.title, 4);
    if (!q) throw new Error(`${fix.title} 4번 없음`);
    const key = q.choices[q.correct_answer - 1];
    if (key !== "격려") {
      console.log(`  (건너뜀) ${fix.title} 4번 정답이 이미 "${key}"`);
      continue;
    }
    const choices = q.choices.map((c) => {
      if (c === "격려") return "다짐";
      if (fix.replaceDistractor && c === fix.replaceDistractor[0]) return fix.replaceDistractor[1];
      return c;
    });
    out.push({
      template: q,
      reason: "마지막 말이 상대 격려가 아니라 자기 다짐 → 정답 선택지를 다짐으로",
      patch: {
        choices,
        explanation: fix.explanation,
        target_intention: "다짐",
        intention_candidates: choices,
      },
    });
  }
  return out;
}

function priceFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const q of templateQuestions(d)) {
    if (!isPriceQuestion(q)) continue;
    const check = checkPriceQuestion({
      choices: q.choices,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      script_text: q.script_text,
    });
    if (!check.keyMismatch || check.expectedIndex == null) continue;
    out.push({
      template: q,
      reason: `해설·계산 금액 $${check.expected} ≠ 정답 선택지 $${check.keyValue}`,
      patch: { correct_answer: check.expectedIndex },
      indexMeaningChanges: true,
    });
  }
  return out;
}

function explanationPositionFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const q of templateQuestions(d)) {
    if (/그림|표/.test(q.question_type)) continue;
    if (q.choices.every((c) => /^\s*[①②③④⑤A-E]\s*$/.test(c))) continue;
    const refs = [...new Set(q.explanation.match(/[①②③④⑤]/g) ?? [])];
    if (refs.length !== 1) continue;
    const key = CIRCLED[q.correct_answer - 1]!;
    if (refs[0] === key) continue;
    out.push({
      template: q,
      reason: `해설이 ${refs[0]}을 가리키지만 정답은 ${key}`,
      patch: { explanation: replaceCircledRef(q.explanation, refs[0]!, key) },
    });
  }
  return out;
}

function prefixedChoiceFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const q of templateQuestions(d)) {
    if (!q.choices.every((c) => /^\s*[①②③④⑤]\s*\S/.test(c))) continue;
    out.push({
      template: q,
      reason: "선택지 앞에 섞기 전 번호가 붙어 있음 → 번호 제거",
      patch: { choices: q.choices.map(stripChoicePrefix) },
    });
  }
  return out;
}

function weatherFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const q of templateQuestions(d)) {
    const grade = d.setById.get(q.set_id)?.grade_level ?? "";
    if (grade.startsWith("high") || q.order_index !== 3) continue;
    const ko = koreanizeWeatherChoices(q.choices);
    if (!ko) continue;
    const answer = ko[q.correct_answer - 1]!;
    out.push({
      template: q,
      reason: "날씨 선택지가 영어 → 한국어로 통일",
      patch: { choices: ko, weather_answer: answer },
    });
  }
  return out;
}

async function main() {
  const d = await loadAll();
  const groups: Array<[string, PlannedFix[]]> = [
    ["부탁한 일 화자", requestFixes(d)],
    ["격려→다짐", selfTalkFixes(d)],
    ["금액 정답", priceFixes(d)],
    ["해설 번호", explanationPositionFixes(d)],
    ["선택지 옛 번호", prefixedChoiceFixes(d)],
    ["날씨 선택지 한국어", weatherFixes(d)],
  ];
  // 같은 문항에 두 수정이 겹치면 하나로 합친다
  const merged = new Map<string, PlannedFix>();
  for (const [name, fixes] of groups) {
    console.log(`\n[${name}] ${fixes.length}문항: ${fixes.map((f) => keyOf(d, f.template)).join(", ")}`);
    for (const f of fixes) {
      const prev = merged.get(f.template.id);
      if (prev) {
        prev.patch = { ...prev.patch, ...f.patch };
        prev.reason += ` + ${f.reason}`;
        prev.indexMeaningChanges = prev.indexMeaningChanges || f.indexMeaningChanges;
      } else merged.set(f.template.id, { ...f, patch: { ...f.patch } });
    }
  }
  await runPlannedFixes("01-text-fixes", d, [...merged.values()]);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

