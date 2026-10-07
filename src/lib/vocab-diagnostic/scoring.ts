import type { DiagAnswer, DiagAnswers, DiagQuestion } from "./types";

/**
 * 채점·결과 요약. 서버에서만 부른다(정답 자리는 브라우저로 가지 않는다).
 * 정답률 = 정답 수 ÷ 전체 출제 문항 수 × 100. 「모르겠어요」와 미응답도 분모에 넣는다.
 */

export type DiagResultRow = {
  no: number;
  word: string;
  answer: string;
  day: number;
  picked: string | null;
  status: "correct" | "wrong" | "unknown" | "blank";
};

export type DiagSummary = {
  total: number;
  correct: number;
  wrong: number;
  unknown: number;
  blank: number;
  rate: number;
  rateText: string;
  rows: DiagResultRow[];
};

/** 브라우저가 보낸 답 하나를 다듬는다. 알맞지 않으면 undefined(무시) */
export function cleanAnswer(raw: unknown, choiceCount: number): DiagAnswer | null | undefined {
  if (raw === null) return null; // 지움
  if (raw === "unknown") return "unknown";
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < choiceCount) return raw;
  return undefined;
}

export function rateText(correct: number, total: number): string {
  if (total <= 0) return "0.0";
  return ((Math.round((correct / total) * 1000) / 10).toFixed(1));
}

export function summarize(questions: DiagQuestion[], answers: DiagAnswers): DiagSummary {
  const rows: DiagResultRow[] = questions.map((q, i) => {
    const a = answers[String(i)];
    if (a === "unknown") return { no: i + 1, word: q.word, answer: q.answer, day: q.day, picked: null, status: "unknown" };
    if (typeof a !== "number") return { no: i + 1, word: q.word, answer: q.answer, day: q.day, picked: null, status: "blank" };
    const ok = a === q.answerIndex;
    return { no: i + 1, word: q.word, answer: q.answer, day: q.day, picked: q.choices[a] ?? null, status: ok ? "correct" : "wrong" };
  });
  const count = (s: DiagResultRow["status"]) => rows.filter((r) => r.status === s).length;
  const total = questions.length;
  const correct = count("correct");
  const text = rateText(correct, total);
  return { total, correct, wrong: count("wrong"), unknown: count("unknown"), blank: count("blank"), rate: Number(text), rateText: text, rows };
}
