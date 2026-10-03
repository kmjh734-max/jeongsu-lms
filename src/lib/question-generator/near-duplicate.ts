/**
 * 같은 지문·같은 유형으로 이미 만든 문항과 사실상 같은 문항을 거른다.
 *
 * 정수학원 세 작업(2026-10-04) 조건부 25개 중 4개가 중복이었다 — 순서추론은 (A)(B)(C) 단락과
 * 정답 순서가 같고 주어진 글만 한 문장 늘린 것, 주제추론은 정답 보기가 같은 말인 것.
 * 「다르게 만들라」는 지시만으로는 막히지 않아, 저장하기 전에 글자로 비교한다.
 */
import type { GeneratedQuestionPayload } from "@/lib/question-generator/types";

export type DupSignature = {
  type: string;
  /** 순서추론 (A)(B)(C) 단락의 낱말 */
  paras?: Set<string>[];
  /** 객관식 정답 보기의 내용어 */
  keyed?: Set<string>;
};

const STOP = new Set(
  "the a an and or but of to in on at for with by from as is are was were be been being it its this that these those their there they them his her he she we our you your can could may might will would should not no how why what which who whom whose when where than then also more most very into about over such".split(
    " "
  )
);

function words(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of String(text ?? "")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase()
    .match(/[a-z]+/g) ?? []) {
    if (w.length >= 3 && !STOP.has(w)) out.add(w);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let both = 0;
  for (const w of a) if (b.has(w)) both += 1;
  return both / (a.size + b.size - both);
}

/** 어법·어휘·문장삽입·무관한문장은 자리마다 달라 정답 보기만으로는 겹침을 알 수 없다 — 보지 않는다 */
const SKIP_TYPES = /grammar|vocab|insertion|irrelevant/i;

export function dupSignature(q: {
  type?: string | null;
  passageModified?: string | null;
  choices?: GeneratedQuestionPayload["choices"] | null;
  correctAnswer?: unknown;
}): DupSignature | null {
  const type = String(q.type ?? "");
  if (!type || SKIP_TYPES.test(type)) return null;
  if (type === "order") {
    const text = String(q.passageModified ?? "");
    const paras = [...text.matchAll(/\(([A-C])\)\s*([\s\S]*?)(?=\n\s*\([A-C]\)|$)/g)].map((m) => words(m[2]!));
    return paras.length >= 3 ? { type, paras } : null;
  }
  const choices = Array.isArray(q.choices) ? q.choices : [];
  if (choices.length < 4) return null;
  const keyed = choices.find((c) => Number(c.number) === Number(q.correctAnswer));
  if (!keyed) return null;
  const set = words(keyed.text);
  return set.size >= 3 ? { type, keyed: set } : null;
}

/** 새 문항이 앞서 만든 문항과 사실상 같으면 true */
export function isNearDuplicate(next: DupSignature, prev: DupSignature): boolean {
  if (next.type !== prev.type) return false;
  if (next.paras && prev.paras) {
    // 단락 셋 중 둘 이상이 거의 그대로 겹치면 같은 문항이다
    let same = 0;
    for (const p of next.paras) if (prev.paras.some((o) => jaccard(p, o) >= 0.8)) same += 1;
    return same >= 2;
  }
  if (next.keyed && prev.keyed) return jaccard(next.keyed, prev.keyed) >= 0.6;
  return false;
}
