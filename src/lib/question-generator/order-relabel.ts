/**
 * 순서추론: (A)(B)(C) 라벨을 돌려 정답이 원문 차례 그대로가 되지 않게 한다.
 *
 * 선생님과 함께 전수조사(2026-09-29): 259문항 가운데 192개(74%)가 정답이
 * (A)-(B)-(C)였다. 글을 세 덩이로 자르고 라벨만 차례대로 붙였기 때문이다.
 * 학생이 ①만 찍어도 열에 일곱을 맞힌다. 실제 기출에서 (A)-(B)-(C)는 정답으로
 * 내지 않는다.
 *
 * 다시 만들지 않고 라벨만 돌린다. 덩이의 글은 그대로 두고 이름표만 바꾸므로
 * 뜻이 달라질 일이 없고, 따로 부르는 비용도 없다. 선택지와 해설의 (A)(B)(C)도
 * 같이 바꿔 주어야 셋이 어긋나지 않는다.
 */

/** 정답으로 쓸 차례 — 원문 그대로인 A-B-C만 뺀 다섯 가지 */
const TARGETS: ReadonlyArray<readonly ["A" | "B" | "C", "A" | "B" | "C", "A" | "B" | "C"]> = [
  ["A", "C", "B"],
  ["B", "A", "C"],
  ["B", "C", "A"],
  ["C", "A", "B"],
  ["C", "B", "A"],
];

const LABELS = ["A", "B", "C"] as const;
type Label = (typeof LABELS)[number];

/** 글 속 "(A) …" 덩이를 라벨과 본문으로 가른다. 셋이 차례로 있지 않으면 null. */
function splitChunks(
  passage: string
): { lead: string; chunks: Record<Label, string> } | null {
  const at: Record<string, number> = {};
  for (const l of LABELS) {
    const i = passage.indexOf(`(${l})`);
    if (i < 0) return null;
    at[l] = i;
  }
  if (!(at.A < at.B && at.B < at.C)) return null;
  const lead = passage.slice(0, at.A);
  if (!lead.trim()) return null;
  return {
    lead,
    chunks: {
      A: passage.slice(at.A + 3, at.B).trim(),
      B: passage.slice(at.B + 3, at.C).trim(),
      C: passage.slice(at.C + 3).trim(),
    },
  };
}

/** (A)(B)(C)를 한 번에 바꾼다. 하나씩 바꾸면 방금 바꾼 것을 또 바꾼다. */
function remap(text: string, map: Record<Label, Label>): string {
  return text.replace(/\(([ABC])\)/g, (whole, letter: string) => {
    const to = map[letter as Label];
    return to ? `(${to})` : whole;
  });
}

export function relabelOrderQuestion(input: {
  passageModified: string;
  choices: Array<{ number: number; text: string }>;
  correctAnswer: number;
  explanation: string;
  /** 시험할 때 차례를 정해 넣기 위한 것 */
  pickTarget?: (n: number) => number;
}): {
  passageModified: string;
  choices: Array<{ number: number; text: string }>;
  explanation: string;
  changed: boolean;
} {
  const { passageModified, choices, correctAnswer, explanation } = input;
  const answer = choices[correctAnswer - 1];
  if (!answer) return { passageModified, choices, explanation, changed: false };

  const seq = [...answer.text.matchAll(/\(([ABC])\)/g)].map((m) => m[1] as Label);
  // 정답이 원문 차례 그대로일 때만 손본다
  if (seq.length !== 3 || seq.join("") !== "ABC") {
    return { passageModified, choices, explanation, changed: false };
  }

  const parts = splitChunks(passageModified);
  if (!parts) return { passageModified, choices, explanation, changed: false };

  const pick = input.pickTarget ?? ((n: number) => Math.floor(Math.random() * n));
  const target = TARGETS[pick(TARGETS.length)] ?? TARGETS[0]!;

  // 흐름에서 첫째인 덩이(= 지금의 A)가 새 이름표 target[0]을 받는다
  const map: Record<Label, Label> = { A: target[0], B: target[1], C: target[2] };

  // 글에는 (A) (B) (C) 차례로 다시 적는다
  const byNewLabel: Record<Label, string> = { A: "", B: "", C: "" };
  for (const old of LABELS) byNewLabel[map[old]] = parts.chunks[old];
  const nextPassage = `${parts.lead.trimEnd()}\n\n${LABELS.map(
    (l) => `(${l}) ${byNewLabel[l]}`
  ).join("\n\n")}`;

  return {
    passageModified: nextPassage,
    choices: choices.map((c) => ({ ...c, text: remap(c.text, map) })),
    explanation: remap(explanation, map),
    changed: true,
  };
}
