/**
 * 금액 계산 문항(고등 6번 등) 정답 검산.
 * 모델이 대본·해설과 다른 금액을 정답으로 찍은 적이 있어(고1 6회: (72+18)×0.9−5 = $76인데 정답 $81)
 * price_calculation(단가·수량·할인 순서)을 받아 직접 계산하고, 없으면 해설의 최종 금액과 대조한다.
 */
import {
  numericChoiceValue,
  orderNumericChoices,
} from "@/lib/listening/balance-correct-answer";

export interface PriceCalculationItem {
  label?: string;
  unit_price: number;
  quantity: number;
}

export interface PriceCalculationAdjustment {
  /** percent_off: 전체에서 %할인, amount_off: 금액 할인, add: 추가 금액 */
  kind: "percent_off" | "amount_off" | "add";
  value: number;
  label?: string;
  /** 특정 품목에만 적용할 때 그 품목 label (없으면 전체 금액에 적용) */
  applies_to?: string[];
}

export interface PriceCalculation {
  items: PriceCalculationItem[];
  adjustments: PriceCalculationAdjustment[];
  final_amount?: number;
  /** 거스름돈 문항(중2): 손님이 낸 돈. 있으면 정답 = 낸 돈 − 지불액 */
  paid_amount?: number;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[$,\s]|달러|dollars?/gi, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function normalizePriceCalculation(raw: unknown): PriceCalculation | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const items: PriceCalculationItem[] = [];
  for (const it of Array.isArray(o.items) ? o.items : []) {
    const r = (it ?? {}) as Record<string, unknown>;
    const unit_price = toNum(r.unit_price ?? r.price);
    const quantity = toNum(r.quantity ?? r.qty ?? 1);
    if (unit_price == null || quantity == null) continue;
    items.push({ label: String(r.label ?? "").trim(), unit_price, quantity });
  }
  const adjustments = (Array.isArray(o.adjustments) ? o.adjustments : [])
    .map((a) => {
      const r = (a ?? {}) as Record<string, unknown>;
      const kind = String(r.kind ?? r.type ?? "").trim();
      const value = toNum(r.value ?? r.amount ?? r.percent);
      if (value == null) return null;
      if (kind !== "percent_off" && kind !== "amount_off" && kind !== "add") return null;
      const scope = Array.isArray(r.applies_to)
        ? (r.applies_to as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean)
        : typeof r.applies_to === "string" && r.applies_to.trim()
          ? [r.applies_to.trim()]
          : [];
      return {
        kind,
        value,
        label: String(r.label ?? "").trim(),
        ...(scope.length > 0 ? { applies_to: scope } : {}),
      } as PriceCalculationAdjustment;
    })
    .filter((x): x is PriceCalculationAdjustment => x !== null);
  if (items.length === 0) return null;
  const final_amount = toNum(o.final_amount) ?? undefined;
  const paid = toNum(o.paid_amount ?? o.paid);
  return { items, adjustments, final_amount, ...(paid != null && paid > 0 ? { paid_amount: paid } : {}) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 문항의 정답 금액: 지불액, 거스름돈 문항이면 낸 돈 − 지불액 */
export function computePriceFromCalculation(calc: PriceCalculation): number {
  const pay = computePayableAmount(calc);
  return calc.paid_amount != null ? round2(calc.paid_amount - pay) : pay;
}

/** 단가×수량 합계에 할인·추가를 적힌 순서대로 적용 (지불액) */
export function computePayableAmount(calc: PriceCalculation): number {
  let total = calc.items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);
  const norm = (s: string | undefined) => String(s ?? "").trim().toLowerCase();
  for (const adj of calc.adjustments) {
    // 특정 품목에만 적용하는 % 할인 ("이용권만 10% 할인")
    const scoped = adj.applies_to?.length
      ? calc.items.filter((it) => adj.applies_to!.some((a) => norm(a) === norm(it.label)))
      : [];
    if (adj.kind === "percent_off" && scoped.length > 0) {
      total -= scoped.reduce((sum, it) => sum + it.unit_price * it.quantity, 0) * (adj.value / 100);
    } else if (adj.kind === "percent_off") total = total * (1 - adj.value / 100);
    else if (adj.kind === "amount_off") total -= adj.value;
    else total += adj.value;
  }
  return round2(total);
}

/** 해설에 나온 마지막 금액 ("…76달러이다", "$28.80을 지불한다") */
export function explanationFinalAmount(explanation: string): number | null {
  const re = /\$\s?(\d[\d,]*(?:\.\d+)?)|(\d[\d,]*(?:\.\d+)?)\s*(?:달러|dollars?)/gi;
  let last: number | null = null;
  for (const m of String(explanation ?? "").matchAll(re)) {
    const n = Number((m[1] ?? m[2] ?? "").replace(/,/g, ""));
    if (Number.isFinite(n)) last = n;
  }
  return last;
}

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function wordsUnder1000(n: number): string {
  if (n < 20) return ONES[n]!;
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)]!;
    return n % 10 ? `${t}-${ONES[n % 10]}` : t;
  }
  const h = `${ONES[Math.floor(n / 100)]} hundred`;
  return n % 100 ? `${h} ${wordsUnder1000(n % 100)}` : h;
}

/** 금액을 대본에서 말할 법한 형태로 ("thirty-five dollars", "$35", "twenty-eight dollars and eighty cents") */
export function spokenAmountForms(value: number): string[] {
  const dollars = Math.floor(value + 1e-9);
  const cents = Math.round((value - dollars) * 100);
  const forms: string[] = [];
  if (dollars < 1000) {
    const w = wordsUnder1000(dollars);
    if (cents === 0) {
      forms.push(`${w} dollars`, `${w} dollar`);
    } else {
      forms.push(`${w} dollars and ${wordsUnder1000(cents)} cents`, `${w} ${wordsUnder1000(cents)}`);
    }
  }
  const digits = cents === 0 ? String(dollars) : value.toFixed(2);
  forms.push(`$${digits}`, `${digits} dollars`);
  return forms.map((f) => f.toLowerCase());
}

/** 대본이 최종 지불액을 그대로 말해 버리는지 (계산 없이 들리는 대로 고르면 되는 문항) */
export function scriptStatesAmount(scriptText: string, value: number): boolean {
  const script = String(scriptText ?? "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ");
  return spokenAmountForms(value).some((f) => {
    const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9-])${escaped}(?![a-z0-9-])`).test(script);
  });
}

export function isPriceQuestion(q: { question_type?: string; instruction?: string }): boolean {
  return /금액/.test(q.question_type ?? "") || /지불할\s*금액|거스름돈/.test(q.instruction ?? "");
}

export interface PriceCheckResult {
  /** 계산으로 얻은 정답 금액 */
  expected: number | null;
  source: "calculation" | "explanation" | null;
  keyValue: number | null;
  /** 정답 금액이 선택지 몇 번인지 (1~5, 없으면 null) */
  expectedIndex: number | null;
  keyMismatch: boolean;
  /** 해설의 최종 금액이 계산값과 다름 */
  explanationMismatch: boolean;
  /** 대본이 최종 금액을 그대로 말함 */
  finalAmountSpoken: boolean;
  /** 거스름돈 문항에서 대본이 지불액(합계)을 그대로 말함 — 뺄셈만 하면 되는 문항이 된다 */
  payableSpoken?: boolean;
}

export function checkPriceQuestion(q: {
  choices: string[];
  correct_answer: number;
  explanation?: string;
  script_text?: string;
  price_calculation?: PriceCalculation | null;
}): PriceCheckResult {
  const values = q.choices.map(numericChoiceValue);
  const keyValue = values[q.correct_answer - 1] ?? null;
  const fromExplanation = explanationFinalAmount(q.explanation ?? "");
  let expected: number | null = null;
  let source: PriceCheckResult["source"] = null;
  const computed = q.price_calculation ? computePriceFromCalculation(q.price_calculation) : null;
  const declared = q.price_calculation?.final_amount;
  // 계산식으로 못 나타낸 규칙(예: "이용권에만 10% 할인")이면 계산값이 모델의 final_amount·해설과 다르다.
  // 셋(final_amount·해설·정답)이 서로 맞으면 계산값으로 정답을 고치지 않는다
  // (고1 생성본: (30×2)×0.9+10=64가 맞는데 전체 10% 할인으로 계산해 63으로 바꾼 적이 있다).
  // 1달러 미만 차이는 모델이 센트를 반올림한 것이므로(34.80 → $35) 계산값을 믿는다
  const calcUnreliable =
    computed != null &&
    declared != null &&
    Math.abs(computed - declared) >= 1 &&
    fromExplanation != null &&
    Math.abs(fromExplanation - declared) < 0.005;
  if (computed != null && !calcUnreliable) {
    expected = computed;
    source = "calculation";
  } else if (calcUnreliable && values.some((v) => v != null && Math.abs(v - declared!) < 0.005)) {
    expected = declared!;
    source = "explanation";
  } else if (fromExplanation != null && values.some((v) => v === fromExplanation)) {
    // 해설의 최종 금액이 선택지 중 하나일 때만 기준으로 삼는다 (중간 금액을 잘못 집는 것 방지)
    expected = fromExplanation;
    source = "explanation";
  }
  const idx = expected == null ? -1 : values.findIndex((v) => v != null && Math.abs(v - expected!) < 0.005);
  // 정답 금액이 단가·낸 돈·할인액과 같은 수면 대본에 그 수가 나와도 최종 금액을 말한 것이 아니다 ("three dollars each")
  const answerValue = expected ?? keyValue;
  const calc = q.price_calculation;
  const coincidental =
    answerValue != null &&
    calc != null &&
    [
      ...calc.items.map((it) => it.unit_price),
      ...calc.adjustments.map((a) => a.value),
      ...(calc.paid_amount != null ? [calc.paid_amount] : []),
    ].some((v) => Math.abs(v - answerValue) < 0.005);
  const finalAmountSpoken =
    keyValue != null && q.script_text && !coincidental ? scriptStatesAmount(q.script_text, answerValue!) : false;
  const payableSpoken =
    q.price_calculation?.paid_amount != null && q.script_text
      ? scriptStatesAmount(q.script_text, computePayableAmount(q.price_calculation))
      : false;
  return {
    payableSpoken,
    expected,
    source,
    keyValue,
    expectedIndex: idx >= 0 ? idx + 1 : null,
    keyMismatch: expected != null && keyValue != null && Math.abs(keyValue - expected) >= 0.005,
    explanationMismatch:
      expected != null && fromExplanation != null && Math.abs(fromExplanation - expected) >= 0.005,
    finalAmountSpoken,
  };
}

function formatLike(sample: string, value: number): string {
  const cents = /\.\d{2}/.test(sample) || Math.round(value * 100) % 100 !== 0;
  const n = cents ? value.toFixed(2) : String(Math.round(value));
  if (/달러/.test(sample)) return `${n}달러`;
  return `$${n}`;
}

/** 계산 착오로 나올 법한 금액 (할인·추가 누락, 적용 순서 바꿈, 수량 하나 차이) */
export function priceDistractorCandidates(calc: PriceCalculation): number[] {
  const out = new Set<number>();
  const adj = calc.adjustments;
  // 거스름돈 문항은 지불액 자체도 흔한 착오 (뺄셈을 안 함)
  if (calc.paid_amount != null) out.add(computePayableAmount(calc));
  out.add(computePriceFromCalculation({ ...calc, adjustments: [] }));
  adj.forEach((_, skip) => {
    out.add(computePriceFromCalculation({ ...calc, adjustments: adj.filter((__, i) => i !== skip) }));
  });
  if (adj.length >= 2) out.add(computePriceFromCalculation({ ...calc, adjustments: [...adj].reverse() }));
  calc.items.forEach((it, i) => {
    for (const d of [1, -1]) {
      const quantity = it.quantity + d;
      if (quantity < 1) continue;
      const items = calc.items.map((x, j) => (j === i ? { ...x, quantity } : x));
      out.add(computePriceFromCalculation({ ...calc, items }));
    }
  });
  return [...out].filter((v) => Number.isFinite(v) && v > 0);
}

/**
 * 금액 정답이 오름차순 선택지의 맨 앞·맨 뒤면 계산 착오 금액으로 오답을 다시 골라 정답을 ②~④에 둔다.
 * 교재 금액 문항은 18개 중 17개가 ②~④였는데, 생성본은 정답이 최솟값인 경우가 있어 "제일 싼 것"만 골라도 맞았다.
 * 모델이 쓴 오답은 가능한 한 그대로 쓰고, 모자란 쪽만 계산 착오 금액(없으면 가까운 어림값)으로 채운다.
 */
export function rebalancePriceChoices<T extends {
  choices: string[];
  correct_answer: number;
  price_calculation?: PriceCalculation | null;
}>(q: T, targetRank?: number): { question: T; changed: boolean } {
  const calc = q.price_calculation;
  if (!calc || q.choices.length !== 5) return { question: q, changed: false };
  const values = q.choices.map(numericChoiceValue);
  if (values.some((v) => v == null)) return { question: q, changed: false };
  const expected = computePriceFromCalculation(calc);
  const keyValue = values[q.correct_answer - 1]!;
  if (Math.abs(keyValue - expected) >= 0.005) return { question: q, changed: false };
  const sorted = [...(values as number[])].sort((a, b) => a - b);
  const rank = sorted.findIndex((v) => Math.abs(v - expected) < 0.005) + 1;
  if (rank >= 2 && rank <= 4) return { question: q, changed: false };

  const near = (a: number, b: number) => Math.abs(a - b) < 0.005;
  const existing = (values as number[]).filter((v) => !near(v, expected));
  // 정답이 달러 단위 정수면 센트가 붙은 오답은 튀므로 쓰지 않는다
  const wholeDollars = near(expected, Math.round(expected));
  const computed = priceDistractorCandidates(calc).filter(
    (v) => !near(v, expected) && (!wholeDollars || near(v, Math.round(v)))
  );
  const step = expected >= 100 ? 10 : expected >= 30 ? 5 : expected >= 10 ? 2 : 1;
  const synthetic = [1, 2, 3, 4].flatMap((k) => [expected - k * step, expected + k * step]).filter((v) => v > 0);
  // 출처 우선순위: 모델이 쓴 오답 → 계산 착오 금액 → 어림값. 같은 출처 안에서는 정답에 가까운 값부터.
  const pool: Array<{ v: number; rank: number }> = [];
  [existing, computed, synthetic].forEach((list, rank) => {
    for (const v of list) if (!pool.some((p) => near(p.v, v))) pool.push({ v, rank });
  });
  const order = (a: { v: number; rank: number }, b: { v: number; rank: number }) =>
    a.rank - b.rank || Math.abs(a.v - expected) - Math.abs(b.v - expected);
  const pick = (want: number) => {
    const below = pool.filter((p) => p.v < expected).sort(order).slice(0, want - 1);
    const above = pool.filter((p) => p.v > expected).sort(order).slice(0, 5 - want);
    if (below.length !== want - 1 || above.length !== 5 - want) return null;
    const synth = [...below, ...above].filter((p) => p.rank === 2).length;
    return { want, below: below.map((p) => p.v), above: above.map((p) => p.v), synth };
  };
  // 정한 자리가 없으면 어림값이 가장 적게 드는 자리(②~④)를 고른다
  const options = (targetRank && targetRank >= 2 && targetRank <= 4 ? [targetRank] : [2, 3, 4])
    .map(pick)
    .filter((o): o is NonNullable<ReturnType<typeof pick>> => o !== null);
  if (options.length === 0) return { question: q, changed: false };
  const fewest = Math.min(...options.map((o) => o.synth));
  const best = options.filter((o) => o.synth === fewest);
  const { want, below, above } = best[Math.floor(Math.random() * best.length)]!;

  const sample = q.choices[q.correct_answer - 1]!;
  const next = [...below.sort((a, b) => a - b), expected, ...above.sort((a, b) => a - b)];
  const choices = next.map((v, i) => (i === want - 1 ? sample : formatLike(sample, v)));
  if (new Set(choices).size !== 5) return { question: q, changed: false };
  return { question: { ...q, choices, correct_answer: want }, changed: true };
}

/**
 * 계산(price_calculation)으로 확인된 금액과 정답이 다르면 정답을 고친다.
 * 계산 금액이 선택지에 없으면 계산 금액에서 가장 먼 오답 하나를 계산 금액으로 바꾼다.
 * 해설만 근거일 때는 고치지 않고(검토 표시만) 둔다.
 */
export function fixPriceAnswer<T extends {
  choices: string[];
  correct_answer: number;
  explanation?: string;
  script_text?: string;
  price_calculation?: PriceCalculation | null;
}>(q: T): { question: T; changed: boolean; check: PriceCheckResult } {
  const check = checkPriceQuestion(q);
  // 계산식과 모델의 final_amount·해설이 어긋나 해설 쪽을 믿은 경우도 final_amount와 해설이 서로 맞으면 고친다
  const declared = q.price_calculation?.final_amount;
  const trusted =
    check.source === "calculation" ||
    (check.source === "explanation" && declared != null && check.expected != null && Math.abs(declared - check.expected) < 0.005);
  if (!check.keyMismatch || !trusted || check.expected == null) {
    return { question: q, changed: false, check };
  }
  let choices = [...q.choices];
  let correct = check.expectedIndex;
  if (correct == null) {
    const values = choices.map(numericChoiceValue);
    let far = -1;
    let farDist = -1;
    values.forEach((v, i) => {
      if (i === q.correct_answer - 1 || v == null) return;
      const dist = Math.abs(v - check.expected!);
      if (dist > farDist) {
        farDist = dist;
        far = i;
      }
    });
    if (far < 0) return { question: q, changed: false, check };
    choices[far] = formatLike(choices[far]!, check.expected);
    correct = far + 1;
  }
  const sorted = orderNumericChoices(choices, correct);
  if (sorted) {
    choices = sorted.choices;
    correct = sorted.correct_answer;
  }
  return {
    question: { ...q, choices, correct_answer: correct },
    changed: true,
    check: checkPriceQuestion({ ...q, choices, correct_answer: correct }),
  };
}
