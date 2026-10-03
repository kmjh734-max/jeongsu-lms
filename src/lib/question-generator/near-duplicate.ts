/**
 * 같은 지문으로 이미 만든 문항과 사실상 같은 문항을 거른다.
 *
 * 정수학원 세 작업(2026-10-04) 조건부 25개 중 4개가 중복이었다 — 순서추론은 (A)(B)(C) 단락과
 * 정답 순서가 같고 주어진 글만 한 문장 늘린 것, 주제추론은 정답 보기가 같은 말인 것.
 * 「다르게 만들라」는 지시만으로는 막히지 않아, 저장하기 전에 글자로 비교한다.
 *
 * 시험 50문항 두 번째(2026-10-04)에서는 조건부 10개 중 5개가 「유형이 다른데 같은 것을 묻는」
 * 중복이었다 — 주제추론과 제목추론의 정답이 같은 말, 함축의미와 특정표현이 같은 밑줄의 뜻,
 * 제시어배열 기본과 어형변화가 같은 문장, 요약문 빈칸끼리 같은 낱말. 그래서 유형 대신
 * 「묶음」끼리 비교한다.
 */
import type { GeneratedQuestionPayload } from "@/lib/question-generator/types";

export type DupSignature = {
  type: string;
  /** 비교할 묶음 — 같은 묶음끼리만 겹침을 본다 */
  group: string;
  /** 순서추론 (A)(B)(C) 단락의 낱말 */
  paras?: Set<string>[];
  /** 객관식 정답 보기의 내용어 */
  keyed?: Set<string>;
  /** 요약문 빈칸 정답 구(「ⓐ: … / ⓑ: …」을 칸마다 나눠 소문자로) */
  answers?: string[];
  /** 제시어배열 정답 문장의 낱말 */
  sentence?: Set<string>;
  /** 밑줄 친 표현의 낱말(함축의미·특정표현) */
  underline?: Set<string>;
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
/** 글 전체의 요지를 묻는 유형 — 정답 보기가 같은 말이면 같은 문항이다 */
const GIST_TYPES = new Set(["topic", "title", "summary_mcq"]);

function underlined(passageModified: string | null | undefined): Set<string> | undefined {
  const spans = [...String(passageModified ?? "").matchAll(/<u>([\s\S]*?)<\/u>/g)].map((m) => m[1]!);
  if (spans.length !== 1) return undefined;
  const set = words(spans[0]!);
  return set.size >= 2 ? set : undefined;
}

export function dupSignature(q: {
  type?: string | null;
  passageModified?: string | null;
  choices?: GeneratedQuestionPayload["choices"] | null;
  correctAnswer?: unknown;
}): DupSignature | null {
  const type = String(q.type ?? "");
  if (!type || SKIP_TYPES.test(type)) return null;
  /*
   * 요약문 빈칸은 보기가 없어 정답 구로 비교한다. 2026-10-04 시험 50문항에서 같은 지문의 요약문
   * 빈칸 둘이 정답까지 똑같았다(widespread objections / confirmed, successive moment / gust).
   */
  if (type === "summary_short") {
    const answers = String(q.correctAnswer ?? "")
      .split("/")
      .map((s) => s.replace(/^\s*[ⓐ-ⓩ(][A-Za-z)]?\s*[:：]?\s*/, "").replace(/[^a-z' ]/gi, " ").replace(/\s+/g, " ").trim().toLowerCase())
      .filter(Boolean);
    return answers.length ? { type, group: "summary_short", answers } : null;
  }
  if (type === "order") {
    const text = String(q.passageModified ?? "");
    const paras = [...text.matchAll(/\(([A-C])\)\s*([\s\S]*?)(?=\n\s*\([A-C]\)|$)/g)].map((m) => words(m[2]!));
    return paras.length >= 3 ? { type, group: "order", paras } : null;
  }
  if (type === "writing") {
    // 밑줄이 있으면 특정표현(뜻 묻기), 없으면 제시어배열(문장 배열)이다
    const underline = underlined(q.passageModified);
    if (underline) return { type, group: "meaning", underline };
    const sentence = words(String(q.correctAnswer ?? ""));
    return sentence.size >= 3 ? { type, group: "arrange", sentence } : null;
  }
  const choices = Array.isArray(q.choices) ? q.choices : [];
  if (choices.length < 4) return null;
  const keyed = choices.find((c) => Number(c.number) === Number(q.correctAnswer));
  if (!keyed) return null;
  const set = words(keyed.text);
  if (set.size < 3) return null;
  if (type === "underlined_inference") {
    return { type, group: "meaning", keyed: set, underline: underlined(q.passageModified) };
  }
  return { type, group: GIST_TYPES.has(type) ? "gist" : type, keyed: set };
}

/** 새 문항이 앞서 만든 문항과 사실상 같으면 true */
export function isNearDuplicate(next: DupSignature, prev: DupSignature): boolean {
  if (next.group !== prev.group) return false;
  if (next.paras && prev.paras) {
    // 단락 셋 중 둘 이상이 거의 그대로 겹치면 같은 문항이다
    let same = 0;
    for (const p of next.paras) if (prev.paras.some((o) => jaccard(p, o) >= 0.8)) same += 1;
    return same >= 2;
  }
  // 같은 밑줄의 뜻을 다시 묻는다(함축의미 ↔ 특정표현)
  if (next.underline && prev.underline && jaccard(next.underline, prev.underline) >= 0.6) return true;
  if (next.keyed && prev.keyed && next.type === prev.type) return jaccard(next.keyed, prev.keyed) >= 0.6;
  // 주제·제목·요지는 정답이 같은 말이면 같은 문항이다(유형이 달라도)
  if (next.keyed && prev.keyed && next.group === "gist") return jaccard(next.keyed, prev.keyed) >= 0.5;
  if (next.sentence && prev.sentence) return jaccard(next.sentence, prev.sentence) >= 0.6;
  if (next.answers && prev.answers) {
    // 칸 정답이 같거나, 두 낱말 이상인 구를 한쪽이 품으면(「despite widespread objections」 ↔ 「widespread objections」) 같은 자리다.
    // 낱말 하나가 긴 구 안에 들어 있는 것만으로는 겹친 것으로 보지 않는다 — 273문항에 대어 보니 거의 다 다른 문항이었다.
    const overlap = (a: string, b: string) => {
      if (a === b) return true;
      const [short, long] = a.length <= b.length ? [a, b] : [b, a];
      return short.includes(" ") && ` ${long} `.includes(` ${short} `);
    };
    return next.answers.some((a) => prev.answers!.some((b) => overlap(a, b)));
  }
  return false;
}
