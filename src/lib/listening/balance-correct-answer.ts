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

export function shouldBalanceQuestionChoices(q: {
  order_index?: number;
  question_type?: string;
  table_data?: unknown;
}): boolean {
  if (q.order_index === 14) return false;
  if (q.table_data) return false;
  const qt = q.question_type?.trim() ?? "";
  if (qt.includes("표")) return false;
  return true;
}

type ChoiceQuestion = {
  choices: string[];
  correct_answer: number;
  order_index?: number;
  question_type?: string;
  table_data?: unknown;
};

export function applyBalancedChoicePositions<T extends ChoiceQuestion>(
  questions: T[]
): T[] {
  const eligible = questions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => shouldBalanceQuestionChoices(q));
  const targets = buildBalancedCorrectAnswerSlots(eligible.length);
  const result = [...questions];

  eligible.forEach(({ q, index }, i) => {
    const cleaned = q.choices.map(stripChoiceNumber);
    const numeric = orderNumericChoices(cleaned, q.correct_answer);
    const { choices, correct_answer } =
      numeric ?? repositionCorrectChoice(cleaned, q.correct_answer, targets[i]!);
    result[index] = { ...q, choices, correct_answer };
  });

  return result;
}

export function applyRandomChoicePosition<T extends ChoiceQuestion>(question: T): T {
  if (!shouldBalanceQuestionChoices(question)) return question;
  const targetSlot = Math.floor(Math.random() * 5) + 1;
  const cleaned = question.choices.map(stripChoiceNumber);
  const { choices, correct_answer } =
    orderNumericChoices(cleaned, question.correct_answer) ??
    repositionCorrectChoice(cleaned, question.correct_answer, targetSlot);
  return { ...question, choices, correct_answer };
}
