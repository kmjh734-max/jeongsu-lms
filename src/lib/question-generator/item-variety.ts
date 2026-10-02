/**
 * 문항마다 달라져야 하는 것을 여기서 정한다.
 *
 * 모델에게 맡기면 한 가지 틀로 굳는다. 저장된 문항을 세어 보니 그대로였다
 * (2026-10-01, Jayden·최다빈 선생님 지적).
 *  · 어법오류수정2 는 100%가 2개, 어법오류수정3 은 97%가 3개 — 발문은 「모두 찾아」인데
 *    늘 같은 개수라 학생이 세어 보지 않고 찍는다.
 *  · 틀린 자리도 ⓑⓓ 34% · ②④ 33%로 짝수 자리에 몰렸다.
 *  · 어휘추론 정답은 4번이 32%, 1번은 0%였다.
 *
 * 그래서 개수·자리·정답 번호를 작업 전체 차례(typeTurn)로 돌려 가며 박아 준다.
 * 프롬프트와 검수가 같은 값을 보도록 여기 하나만 둔다.
 */

/** 이 유형이 심을 오류 개수(문항마다 달라진다) */
export function plannedWrongCount(code: string, turn: number): number {
  const t = Math.max(0, Math.floor(turn));
  if (code === "어휘개수") return [1, 2, 3, 4, 5][t % 5]!;
  // 어법개수 줄이 처음부터 빠져 있어 프롬프트에 「틀린 곳 0개」가 들어갔다.
  // 그래서 288문항 작업의 어법개수 6개가 모두 정답 「1개」였다(2026-10-03).
  if (code === "어법개수") return [2, 1, 3, 2, 4][t % 5]!;
  if (code === "어법오류수정2") return [2, 1, 3, 2, 1][t % 5]!;
  if (code === "어법오류수정3") return [3, 2, 4, 3, 5][t % 5]!;
  if (code === "어법문장오류수정") return [2, 1, 3, 2, 1][t % 5]!;
  return 0;
}

const MARKS = "ⓐⓑⓒⓓⓔⓕⓖ";
const NUMS = "①②③④⑤";

/** 틀린 곳을 어디에 둘지 — 자리가 한쪽으로 몰리지 않게 돌려 가며 고른다 */
export function plannedWrongSpots(total: number, n: number, turn: number): number[] {
  const t = Math.max(0, Math.floor(turn));
  const k = Math.min(n, total);
  const start = t % total;
  const step = 1 + (Math.floor(t / total) % (total - 1));
  const out = new Set<number>();
  for (let i = 0; out.size < k && i < total * 2; i++) {
    out.add((start + i * step) % total);
  }
  return [...out].sort((a, b) => a - b);
}

/** 「틀린 곳은 ⓐ·ⓒ·ⓔ 이다」처럼 적어 줄 글귀 */
export function wrongSpotLabel(total: number, n: number, turn: number, kind: "mark" | "number"): string {
  const chars = kind === "number" ? NUMS : MARKS;
  return plannedWrongSpots(total, n, turn)
    .map((i) => chars[i] ?? "")
    .filter(Boolean)
    .join("·");
}

/**
 * 이번 문항의 정답 번호(1~5). 해당 없으면 null.
 *
 * 어법추론·어휘추론뿐 아니라 문장삽입·무관한문장도 자리가 가운데로 몰린다 —
 * 전수 대조(2026-10-01)에서 무관한문장은 ③④ 두 가지만 나왔고 ④가 54%였다.
 */
const SPOT_ROTATED = new Set(["어법추론", "어휘추론", "문장삽입", "무관한문장"]);

export function plannedAnswerNumber(code: string, turn: number): number | null {
  if (!SPOT_ROTATED.has(code)) return null;
  const t = Math.max(0, Math.floor(turn));
  /*
   * 문장삽입 ①은 도입문 바로 뒤, 무관한문장 ⓐ는 주제문 자리라 정답으로 두지 않는다
   * (선생님과 함께 한 전수조사 2026-09-29). 두 유형은 2~5번만 돌린다.
   */
  if (code === "문장삽입" || code === "무관한문장") return (t % 4) + 2;
  return (t % 5) + 1;
}
