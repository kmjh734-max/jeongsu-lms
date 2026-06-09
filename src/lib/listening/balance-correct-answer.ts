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
    const { choices, correct_answer } = repositionCorrectChoice(
      q.choices,
      q.correct_answer,
      targets[i]!
    );
    result[index] = { ...q, choices, correct_answer };
  });

  return result;
}

export function applyRandomChoicePosition<T extends ChoiceQuestion>(question: T): T {
  if (!shouldBalanceQuestionChoices(question)) return question;
  const targetSlot = Math.floor(Math.random() * 5) + 1;
  const { choices, correct_answer } = repositionCorrectChoice(
    question.choices,
    question.correct_answer,
    targetSlot
  );
  return { ...question, choices, correct_answer };
}
