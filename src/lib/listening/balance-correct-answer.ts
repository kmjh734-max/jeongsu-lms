/** 생성 문항의 정답 위치(①~⑤)를 고르게 분산 */

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function buildBalancedCorrectAnswerSlots(count: number): number[] {
  const pool = [1, 2, 3, 4, 5];
  const slots: number[] = [];
  while (slots.length < count) {
    slots.push(...shuffle(pool));
  }
  return slots.slice(0, count);
}

/** 선택지 앞에 모델이 붙인 ①~⑤ 번호는 섞으면 어긋나므로 뗀다. */
function stripChoiceNumber(choice: string): string {
  return choice.replace(/^\s*[①②③④⑤]\s*/, "").replace(/^\s*\(?[1-5][).]\s+/, "");
}

/**
 * 시각·금액처럼 수로 된 선택지면 그 값을 돌려준다(아니면 null).
 * "4:20", "4:20 p.m.", "$76", "76 dollars", "76달러", "12,000원"
 */
export function numericChoiceValue(choice: string): number | null {
  const t = stripChoiceNumber(choice).trim().toLowerCase();
  const time = t.match(/^(?:at\s+)?(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)?$/);
  if (time) {
    let h = Number(time[1]);
    if (time[3]?.startsWith("p") && h < 12) h += 12;
    if (time[3]?.startsWith("a") && h === 12) h = 0;
    return h * 60 + Number(time[2]);
  }
  const money = t.match(/^\$?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\.(\d+))?\s*(dollars?|달러|원|won)?$/);
  if (money && (t.includes("$") || money[3])) {
    return Number(money[1]!.replace(/,/g, "")) + (money[2] ? Number("0." + money[2]) : 0);
  }
  return null;
}

/**
 * 시각·금액 선택지는 실제 시험처럼 작은 값부터 늘어놓는다. 정답 위치를 섞느라 정답만 순서를
 * 벗어나 있으면 순서만 보고 답을 알 수 있었다(고1 시각 47/60, 금액 16/20).
 */
export function orderNumericChoices(
  choices: string[],
  correctAnswer: number
): { choices: string[]; correct_answer: number } | null {
  if (choices.length !== 5 || correctAnswer < 1 || correctAnswer > 5) return null;
  const values = choices.map(numericChoiceValue);
  if (values.some((v) => v === null)) return null;
  if (new Set(values).size !== values.length) return null;
  const correctText = choices[correctAnswer - 1]!;
  const sorted = choices
    .map((c, i) => ({ c, v: values[i]! }))
    .sort((a, b) => a.v - b.v)
    .map((x) => x.c);
  return { choices: sorted, correct_answer: sorted.indexOf(correctText) + 1 };
}

export function repositionCorrectChoice(
  choices: string[],
  correctAnswer: number,
  targetSlot: number
): { choices: string[]; correct_answer: number } {
  if (choices.length !== 5) {
    return { choices: [...choices], correct_answer: correctAnswer };
  }
  const from = correctAnswer - 1;
  if (from < 0 || from >= 5) {
    return { choices: [...choices], correct_answer: correctAnswer };
  }
  const target = targetSlot - 1;
  if (target < 0 || target >= 5) {
    return { choices: [...choices], correct_answer: correctAnswer };
  }

  const next = [...choices];
  const [correctText] = next.splice(from, 1);
  next.splice(target, 0, correctText!);
  return { choices: next, correct_answer: targetSlot };
}

/** 그림 속 라벨(①~⑤)이나 표의 행 기호(A~E)만 있는 선택지 — 그림·표가 정답 위치를 정하므로 섞으면 안 된다 */
export function isLabelOnlyChoiceSet(choices: string[]): boolean {
  if (choices.length === 0) return false;
  return choices.every((c) => /^\s*(?:[①②③④⑤]|[A-E]|\(?[1-5]\)?)\s*$/.test(String(c)));
}

export function shouldBalanceQuestionChoices(q: {
  order_index?: number;
  question_type?: string;
  table_data?: unknown;
  choices?: string[];
}): boolean {
  const qt = q.question_type?.trim() ?? "";
  // 중등 14번(표 정보 불일치)만 제외 — 예전엔 번호로만 막아 고등 14번(긴 응답) 정답이 20문항 모두 ①이었다
  if (q.order_index === 14 && !qt) return false;
  if (q.table_data) return false;
  if (qt.includes("표")) return false;
  if (qt.includes("그림 불일치")) return false;
  // 선택지가 대본 언급 순서대로 놓이는 유형(미언급·내용 불일치·언급 여부): 섞으면 정답만 순서를 벗어나 튄다.
  // 정답 자리는 생성할 때 미리 정해 준다(slot-plan.ts).
  if (/미언급|내용 불일치|언급 여부|언급하지 않은/.test(qt)) return false;
  if (q.choices && isLabelOnlyChoiceSet(q.choices)) return false;
  return true;
}

type ChoiceQuestion = {
  choices: string[];
  correct_answer: number;
  order_index?: number;
  question_type?: string;
  table_data?: unknown;
  explanation?: string;
  choice_image_prompts?: string[];
  choice_image_urls?: string[];
};

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

/**
 * 새 순서의 각 자리가 예전 몇 번째 선택지였는지 (perm[새 자리] = 예전 자리).
 * 같은 글자의 선택지가 여러 개면 앞에서부터 짝짓는다.
 */
export function choicePermutation(before: string[], after: string[]): number[] | null {
  if (before.length !== after.length) return null;
  const used = new Set<number>();
  const perm: number[] = [];
  for (const text of after) {
    const idx = before.findIndex((b, i) => !used.has(i) && b === text);
    if (idx < 0) return null;
    used.add(idx);
    perm.push(idx);
  }
  return perm;
}

/**
 * 해설 속 ①~⑤ 번호를 선택지 이동에 맞춰 바꾼다.
 * 섞기 전 번호가 해설에 남아 "①이 가장 적절하다"인데 정답은 ④가 되는 일이 있었다.
 */
export function remapExplanationChoiceRefs(explanation: string, perm: number[]): string {
  if (!explanation || !/[①②③④⑤]/.test(explanation)) return explanation;
  const oldToNew = new Map<number, number>();
  perm.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));
  return explanation.replace(/[①②③④⑤]/g, (ch) => {
    const oldIdx = CIRCLED.indexOf(ch as (typeof CIRCLED)[number]);
    const newIdx = oldToNew.get(oldIdx);
    return newIdx == null ? ch : CIRCLED[newIdx]!;
  });
}

/** 선택지 순서가 바뀐 결과를 해설 번호·그림 프롬프트/URL에도 똑같이 반영 */
function withReorderedChoices<T extends ChoiceQuestion>(
  q: T,
  cleaned: string[],
  next: { choices: string[]; correct_answer: number }
): T {
  const perm = choicePermutation(cleaned, next.choices);
  const out: T = { ...q, choices: next.choices, correct_answer: next.correct_answer };
  if (!perm) return out;
  if (typeof q.explanation === "string") {
    out.explanation = remapExplanationChoiceRefs(q.explanation, perm);
  }
  const reorder = (list?: string[]) =>
    Array.isArray(list) && list.length === perm.length
      ? perm.map((oldIdx) => list[oldIdx]!)
      : list;
  if (q.choice_image_prompts) out.choice_image_prompts = reorder(q.choice_image_prompts);
  if (q.choice_image_urls) out.choice_image_urls = reorder(q.choice_image_urls);
  return out;
}

/**
 * 한 문항의 선택지를 정리한다: ①~⑤ 접두어 제거, 수 선택지는 오름차순, 아니면 정답을 targetSlot으로.
 * 해설의 ①~⑤ 번호와 그림 프롬프트 순서도 함께 옮긴다.
 */
export function reorderQuestionChoices<T extends ChoiceQuestion>(q: T, targetSlot?: number): T {
  const cleaned = q.choices.map(stripChoiceNumber);
  const numeric = orderNumericChoices(cleaned, q.correct_answer);
  const next =
    numeric ??
    (targetSlot
      ? repositionCorrectChoice(cleaned, q.correct_answer, targetSlot)
      : { choices: cleaned, correct_answer: q.correct_answer });
  return withReorderedChoices({ ...q, choices: cleaned }, cleaned, next);
}

export function applyBalancedChoicePositions<T extends ChoiceQuestion>(
  questions: T[]
): T[] {
  const eligible = questions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => shouldBalanceQuestionChoices(q));
  const targets = buildBalancedCorrectAnswerSlots(eligible.length);
  const result = [...questions];

  eligible.forEach(({ q, index }, i) => {
    result[index] = reorderQuestionChoices(q, targets[i]!);
  });

  return result;
}

export function applyRandomChoicePosition<T extends ChoiceQuestion>(question: T): T {
  if (!shouldBalanceQuestionChoices(question)) return question;
  const targetSlot = Math.floor(Math.random() * 5) + 1;
  return reorderQuestionChoices(question, targetSlot);
}
