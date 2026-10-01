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

/**
 * 고쳤으면 true. 손댈 수 없으면 false (그때는 버린다)
 *
 * `source`는 「어느 글에 찍힌 차례를 제자리로 볼지」다. 어법·어휘는 본문에 밑줄이 찍히지만
 * 요약문 빈칸은 묻는 글에 찍힌다. 선생님 지시(2026-10-01)로 문항을 하나하나 대조하다,
 * 요약문이 「… in ⓑ____ and … where ⓐ____ …」로 거꾸로 찍힌 것을 찾았다. 학생은 ⓐ부터
 * 쓰는데 지면은 ⓑ가 먼저여서 헷갈린다.
 */
export function renumberMarksInOrder(
  q: MarkedQuestion,
  source: "passage" | "questionText" = "passage"
): boolean {
  const passage = String(
    (source === "questionText" ? q.questionText : q.passageModified) ?? ""
  );
  if (!passage) return false;

  for (const marks of SETS) {
    /*
     * 차례는 「빈칸·밑줄에 붙은 기호」로 본다.
     * 묻는 글에는 조건 줄에도 「ⓐ는 세 단어」처럼 기호가 나오므로, 그것까지 세면
     * 이미 차례가 맞는 것으로 보여 빈칸이 거꾸로인데도 손대지 않는다.
     */
    const orderRe =
      source === "questionText"
        ? new RegExp(`([${marks}])\\s*_{3,}`, "g")
        : new RegExp(`([${marks}])`, "g");
    const seen: string[] = [];
    for (const m of passage.matchAll(orderRe)) if (!seen.includes(m[1]!)) seen.push(m[1]!);
    if (seen.length < 2) continue;
    const want = marks.slice(0, seen.length).split("");
    if (seen.join("") === want.join("")) continue;

    // 나온 차례 → 제자리. 예: ⓓ가 셋째로 나오면 ⓓ → ⓒ
    const map = new Map<string, string>();
    seen.forEach((old, i) => map.set(old, want[i]!));
    const swap = (t: string) =>
      t.replace(new RegExp(`[${seen.join("")}]`, "g"), (c) => map.get(c) ?? c);

    const nextPassage = swap(passage);
    // 다시 매긴 뒤에도 차례가 안 맞으면 손대지 않는다 (볼 때와 같은 잣대로 센다)
    const after: string[] = [];
    for (const m of nextPassage.matchAll(orderRe)) if (!after.includes(m[1]!)) after.push(m[1]!);
    if (after.join("") !== want.join("")) return false;

    // 차례를 본 글에는 바꾼 것을 넣고, 나머지 글은 같은 짝으로 함께 옮긴다
    if (source === "questionText") {
      q.questionText = nextPassage;
      if (q.passageModified) q.passageModified = swap(String(q.passageModified));
    } else {
      q.passageModified = nextPassage;
      if (q.questionText) q.questionText = swap(String(q.questionText));
    }
    if (typeof q.correctAnswer === "string") {
      q.correctAnswer = sortAnswerByMark(swap(q.correctAnswer), marks);
    }
    if (q.explanation) q.explanation = swap(String(q.explanation));
    return true;
  }
  return false;
}

/**
 * 「ⓑ: … / ⓐ: …」로 적힌 정답을 기호 차례로 다시 늘어놓는다.
 *
 * 기호를 다시 매기면 정답 문자열의 차례가 뒤바뀔 수 있다. 선생님이 답지를 대조할 때
 * ⓐ부터 보는 것이 편하다. 짝은 그대로 두고 늘어놓는 차례만 바꾼다.
 */
function sortAnswerByMark(answer: string, marks: string): string {
  const parts = answer
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return answer;
  const at = (s: string) => {
    const i = marks.indexOf(s[0] ?? "");
    return i < 0 ? 99 : i;
  };
  // 기호로 시작하지 않는 조각이 섞여 있으면 손대지 않는다
  if (parts.some((p) => at(p) === 99)) return answer;
  return [...parts].sort((a, b) => at(a) - at(b)).join(" / ");
}
