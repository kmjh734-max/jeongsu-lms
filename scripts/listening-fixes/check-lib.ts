/**
 * 저장된 문항(DB 행 + segment)을 앱의 규칙 검수(무료, 모델 호출 없음)에 넣는 도구.
 * - quality-check.ts (checkListeningQuestionQuality, 안에서 generic-quality-checks 포함)
 * - price-check.ts (금액 문항 검산, 최종 금액이 대본에 그대로 나오는지)
 */
import * as examTypes from "@/lib/listening/exam-types";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { checkListeningQuestionQuality } from "@/lib/listening/quality-check";
import {
  checkPriceQuestion,
  computePriceFromCalculation,
  isPriceQuestion,
  scriptStatesAmount,
  type PriceCalculation,
} from "@/lib/listening/price-check";
import type {
  GeneratedListeningQuestion,
  ListeningScriptSegment,
} from "@/lib/listening/types";

export type SimpleSeg = { speaker: string; text: string };

/** DB 행 + segment → 검수 함수가 받는 모양 (null 은 빈 값으로) */
export function toGenerated(
  row: Record<string, unknown>,
  segments: SimpleSeg[],
  priceCalculation?: PriceCalculation | null
): GeneratedListeningQuestion {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null) continue;
    out[k] = v;
  }
  out.segments = segments.map((s) => ({
    speaker: s.speaker as ListeningScriptSegment["speaker"],
    text: s.text,
  }));
  out.choices = Array.isArray(row.choices) ? row.choices : [];
  out.correct_answer = Number(row.correct_answer ?? 0);
  for (const k of [
    "instruction",
    "script_text",
    "script_translation",
    "question_text",
    "answer_clue",
    "explanation",
    "question_type",
  ]) {
    out[k] = String(row[k] ?? "");
  }
  if (priceCalculation) out.price_calculation = priceCalculation;
  return out as unknown as GeneratedListeningQuestion;
}

export type RuleCheck = {
  score: number;
  issues: Array<{ code: string; message: string }>;
  price?: ReturnType<typeof checkPriceQuestion>;
};

export function runRuleChecks(
  gen: GeneratedListeningQuestion,
  grade: ListeningGradeLevel
): RuleCheck {
  // 저장된 문항의 유형은 번호가 아니라 저장된 이름·지시문으로 정한다 (중2·중3 새 번호 배치와 다름).
  // templateForStoredQuestion 이 없는 예전 src(커밋본 스냅숏)에서는 번호로 찾는다(그때는 중1 배치와 같았음).
  const stored = (examTypes as { templateForStoredQuestion?: (q: GeneratedListeningQuestion, g: ListeningGradeLevel) => ReturnType<typeof examTypes.getExamTypeById> }).templateForStoredQuestion;
  const typeHint = stored ? stored(gen, grade) : examTypes.getExamTypeById(gen.order_index, grade);
  const r = checkListeningQuestionQuality(gen, typeHint, grade);
  const out: RuleCheck = {
    score: r.quality_score,
    issues: r.issues.map((i) => ({ code: i.code, message: i.message })),
  };
  if (isPriceQuestion(gen)) out.price = checkPriceQuestion(gen);
  return out;
}

// ---------------------------------------------------------------------------
// 쉬운 문항 다시 쓰기(08)용 추가 점검 — 다시 쓴 대본이 또 쉬워지지 않았는지 본다.
// ---------------------------------------------------------------------------

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** 정답 감정을 그대로 말하는 영어 단어 (심정 문항에서 대본에 쓰면 안 됨) */
const EMOTION_GIVEAWAY: Record<string, RegExp> = {
  걱정: /\b(worried|worry|worrying|worries|nervous|anxious)\b/i,
  불안: /\b(nervous|anxious|uneasy|worried|worry)\b/i,
  실망: /\b(disappointed|disappointing|disappointment)\b/i,
  안도: /\b(relieved|relief)\b/i,
  자랑스러움: /\b(proud|pride)\b/i,
  설렘: /\b(excited|thrilled)\b/i,
  만족: /\b(satisfied|satisfying|pleased)\b/i,
  슬픔: /\b(sad|sadness)\b/i,
  놀람: /\b(surprised|surprising|shocked)\b/i,
  당황: /\b(embarrassed|embarrassing)\b/i,
  지루함: /\b(bored|boring)\b/i,
  평화로움: /\b(peaceful|calm)\b/i,
};

/** 장래 희망 선택지(한국어) → 대본에 나올 영어 직업명 */
export const JOB_ENGLISH: Record<string, RegExp> = {
  기자: /\b(reporter|journalist)s?\b/i,
  작가: /\b(writer|author|novelist)s?\b/i,
  교사: /\b(teacher)s?\b/i,
  선생님: /\b(teacher)s?\b/i,
  사서: /\b(librarian)s?\b/i,
  배우: /\b(actor|actress)(es|s)?\b/i,
  요리사: /\b(chef|cook)s?\b/i,
  과학자: /\b(scientist)s?\b/i,
  사진작가: /\b(photographer)s?\b/i,
  사진가: /\b(photographer)s?\b/i,
  수의사: /\b(vet|veterinarian)s?\b/i,
  운동선수: /\b(athlete|player)s?\b/i,
  음악가: /\b(musician|pianist|violinist)s?\b/i,
  화가: /\b(painter|artist)s?\b/i,
  간호사: /\b(nurse)s?\b/i,
  "컴퓨터 프로그래머": /\b(programmer)s?\b/i,
  프로그래머: /\b(programmer)s?\b/i,
  "동물 사육사": /\b(zookeeper)s?\b/i,
  정원사: /\b(gardener)s?\b/i,
  천문학자: /\b(astronomer)s?\b/i,
  디자이너: /\b(designer)s?\b/i,
  영화감독: /\b(film director|movie director)s?\b/i,
  "방송 진행자": /\b(host|announcer)s?\b/i,
  안내원: /\b(guide)s?\b/i,
  의사: /\b(doctor)s?\b/i,
  가수: /\b(singer)s?\b/i,
  조종사: /\b(pilot)s?\b/i,
  만화가: /\b(cartoonist)s?\b/i,
  영양사: /\b(nutritionist)s?\b/i,
};

export type GuardInput = {
  grade: string;
  orderIndex: number;
  questionType: string;
  instruction: string;
  choices: string[];
  correctAnswer: number;
  oldSegments: SimpleSeg[];
  newSegments: SimpleSeg[];
  targetPerson?: string;
  priceCalculation?: PriceCalculation | null;
  /** 대본에 나오면 안 되는 말 (정답 직업명·주제어 등, 데이터 파일의 banned_words) */
  bannedWords?: string[];
};

/** 다시 쓴 대본의 추가 점검. 문제 문장 목록을 돌려준다 (없으면 통과) */
export function easyGuards(g: GuardInput): string[] {
  const out: string[] = [];
  const segs = g.newSegments;
  const script = segs.map((s) => s.text).join(" ");
  const middle = g.grade.startsWith("middle");

  // 화자 구성은 그대로 (음성이 바뀌지 않게)
  const oldSpk = [...new Set(g.oldSegments.map((s) => s.speaker))].sort().join(",");
  const newSpk = [...new Set(segs.map((s) => s.speaker))].sort().join(",");
  if (oldSpk !== newSpk) out.push(`화자 구성이 바뀜 (${oldSpk} → ${newSpk})`);

  // 학년별 한 줄 길이
  const maxWords =
    g.grade === "middle1" || g.grade === "middle2" ? 13 : g.grade === "middle3" ? 17 : 20;
  const monologue = segs.length === 1;
  if (!monologue) {
    for (const s of segs) {
      if (words(s.text) > maxWords) out.push(`한 줄이 ${maxWords}단어를 넘음: "${s.text}"`);
    }
  }
  if (middle && /\b(who|which|that)\s+(is|are|was|were|has|have)\b/i.test(script)) {
    out.push("중등 금지 문법(that is 등)이 있음");
  }

  const key = (g.choices[g.correctAnswer - 1] ?? "").trim();
  const targetCode = /남자/.test(g.targetPerson ?? "") ? "M" : /여자/.test(g.targetPerson ?? "") ? "W" : null;

  // 금액: 최종 금액·할인 전 합계를 말하지 않는다
  if (/금액/.test(g.questionType)) {
    if (!g.priceCalculation) out.push("price_calculation 없음");
    else {
      const final = computePriceFromCalculation(g.priceCalculation);
      if (scriptStatesAmount(script, final)) out.push(`최종 금액 ${final}을 대본이 말함`);
      const subtotal = g.priceCalculation.items.reduce((n, it) => n + it.unit_price * it.quantity, 0);
      if (g.priceCalculation.adjustments.length && scriptStatesAmount(script, subtotal)) {
        out.push(`할인 전 합계 ${subtotal}을 대본이 말함`);
      }
      const keyValue = Number(key.replace(/[$,]/g, ""));
      if (Math.abs(keyValue - final) >= 0.005) out.push(`계산 ${final} ≠ 정답 ${key}`);
    }
  }

  // 심정: 정답 감정어를 그대로 말하지 않는다
  if (g.orderIndex === 8 && middle) {
    const re = EMOTION_GIVEAWAY[key.replace(/\s+/g, "")];
    if (re && re.test(script)) out.push(`정답 감정(${key})을 그대로 말하는 단어가 있음: ${script.match(re)?.[0]}`);
  }

  // 장래 희망: 목표 인물이 한 번만 "I want to be a/an", 상대가 먼저 정답 직업을 말하지 않음, 오답 직업이 1개 이상 등장
  if (g.orderIndex === 7 && middle) {
    const iw = segs.filter((s) => /I want to be (a|an) /i.test(s.text));
    if (iw.length !== 1) out.push(`"I want to be a/an"이 ${iw.length}번 나옴 (1번이어야 함)`);
    if (iw[0] && targetCode && iw[0].speaker !== targetCode) out.push("장래 희망을 말한 화자가 지시문 대상과 다름");
    const keyRe = JOB_ENGLISH[key];
    if (!keyRe) out.push(`정답 직업 영어 대응 없음: ${key}`);
    else {
      const idx = segs.findIndex((s) => /I want to be (a|an) /i.test(s.text));
      const before = segs.slice(0, Math.max(0, idx)).map((s) => s.text).join(" ");
      if (keyRe.test(before)) out.push("정답 직업이 장래 희망 발화 전에 먼저 나옴");
      const hits = segs.filter((s) => keyRe.test(s.text)).length;
      if (hits > 1) out.push(`정답 직업명이 ${hits}번 나옴`);
    }
    const distractorsSpoken = g.choices.filter(
      (c, i) => i !== g.correctAnswer - 1 && JOB_ENGLISH[c.trim()]?.test(script)
    );
    if (distractorsSpoken.length < 1) out.push("오답 직업이 대본에 하나도 나오지 않음");
  }

  for (const w of g.bannedWords ?? []) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}`, "i").test(script)) out.push(`금지어가 대본에 나옴: ${w}`);
  }

  // 핵심 내용: 정답 주제(○○ 촬영 장소 등)를 대본이 그대로 말하지 않는다 — 장소를 비교하는 대화에서 주제를 추론하게
  if (g.orderIndex === 10 && middle) {
    const announce = [
      /\b(place|spot|location|room)s? (to|for) (film|record|shoot|practi[cs]e|make)/i,
      /\b(filming|recording|shooting|practice|video) (place|spot|location)s?\b/i,
      /\bwhere (we |to |can we |should we |could we |we can |we should )?(film|record|shoot|practi[cs]e)\b/i,
    ].find((re) => re.test(script));
    if (announce) out.push(`핵심 내용을 대본이 그대로 말함: "${script.match(announce)?.[0]}"`);
  }

  return out;
}
