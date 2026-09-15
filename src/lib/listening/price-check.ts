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
}

export interface PriceCalculation {
  items: PriceCalculationItem[];
  adjustments: PriceCalculationAdjustment[];
  final_amount?: number;
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
      return { kind, value, label: String(r.label ?? "").trim() } as PriceCalculationAdjustment;
    })
    .filter((x): x is PriceCalculationAdjustment => x !== null);
  if (items.length === 0) return null;
  const final_amount = toNum(o.final_amount) ?? undefined;
  return { items, adjustments, final_amount };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 단가×수량 합계에 할인·추가를 적힌 순서대로 적용 */
export function computePriceFromCalculation(calc: PriceCalculation): number {
  let total = calc.items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);
  for (const adj of calc.adjustments) {
    if (adj.kind === "percent_off") total = total * (1 - adj.value / 100);
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
  return /금액/.test(q.question_type ?? "") || /지불할\s*금액/.test(q.instruction ?? "");
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
  if (q.price_calculation) {
    expected = computePriceFromCalculation(q.price_calculation);
    source = "calculation";
  } else if (fromExplanation != null && values.some((v) => v === fromExplanation)) {
    // 해설의 최종 금액이 선택지 중 하나일 때만 기준으로 삼는다 (중간 금액을 잘못 집는 것 방지)
    expected = fromExplanation;
    source = "explanation";
  }
  const idx = expected == null ? -1 : values.findIndex((v) => v != null && Math.abs(v - expected!) < 0.005);
  const finalAmountSpoken =
    keyValue != null && q.script_text ? scriptStatesAmount(q.script_text, expected ?? keyValue) : false;
  return {
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
  if (!check.keyMismatch || check.source !== "calculation" || check.expected == null) {
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
