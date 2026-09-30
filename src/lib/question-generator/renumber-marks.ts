/**
 * 지문에 찍힌 밑줄 기호를 나온 차례대로 다시 매긴다.
 *
 * 선생님 지적(2026-10-01): 만들다 버린 값도 우리가 낸다. 빠질 것 같으면 아예
 * 만들지 말든가 다 만들든가 해야 한다.
 *
 * ⓐ ⓑ ⓓ ⓒ 처럼 뒤바뀌면 학생이 몇 번째 밑줄인지 찾기 어려워 예전에는 통째로 버렸다.
 * 기호만 맞바꾸면 되는 일이라 다시 부를 까닭이 없다. 글자는 하나도 바꾸지 않는다.
 */

const SETS = ["ⓐⓑⓒⓓⓔⓕⓖ", "①②③④⑤"];

type MarkedQuestion = {
  passageModified?: string | null;
  correctAnswer?: unknown;
  explanation?: string | null;
  questionText?: string | null;
};

/** 고쳤으면 true. 손댈 수 없으면 false (그때는 버린다) */
export function renumberMarksInOrder(q: MarkedQuestion): boolean {
  const passage = String(q.passageModified ?? "");
  if (!passage) return false;

  for (const marks of SETS) {
    const re = new RegExp(`[${marks}]`, "g");
    const seen: string[] = [];
    for (const m of passage.match(re) ?? []) if (!seen.includes(m)) seen.push(m);
    if (seen.length < 2) continue;
    const want = marks.slice(0, seen.length).split("");
    if (seen.join("") === want.join("")) continue;

    // 나온 차례 → 제자리. 예: ⓓ가 셋째로 나오면 ⓓ → ⓒ
    const map = new Map<string, string>();
    seen.forEach((old, i) => map.set(old, want[i]!));
    const swap = (t: string) =>
      t.replace(new RegExp(`[${seen.join("")}]`, "g"), (c) => map.get(c) ?? c);

    const nextPassage = swap(passage);
    // 다시 매긴 뒤에도 차례가 안 맞으면 손대지 않는다
    const after: string[] = [];
    for (const m of nextPassage.match(new RegExp(`[${marks}]`, "g")) ?? []) {
      if (!after.includes(m)) after.push(m);
    }
    if (after.join("") !== want.join("")) return false;

    q.passageModified = nextPassage;
    if (typeof q.correctAnswer === "string") q.correctAnswer = swap(q.correctAnswer);
    if (q.explanation) q.explanation = swap(String(q.explanation));
    if (q.questionText) q.questionText = swap(String(q.questionText));
    return true;
  }
  return false;
}
