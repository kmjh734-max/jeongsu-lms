/**
 * 1장 요약직보자료·1장 테스트 공용(브라우저에서도 쓴다). 지문별 재료 타입, 원문 해시, 시험지 조립
 * (문장 순서·어순 섞기·어법/어휘 문항 고르기), 정리자료 본문 표시 조각을 만든다.
 *
 * 재료는 지문마다 한 번 만들어 lesson_pack_json.onePageContent에 둔다. 원문이 바뀌지 않으면
 * 정리자료를 만든 뒤 테스트를 만들어도 다시 만들지 않는다. 섞기는 모두 정해진 열쇠로 하므로
 * 같은 지문은 몇 번 열어도 같은 시험지가 나온다.
 */
import {
  createSeededRng,
  fisherYatesShuffle,
  hashSeedToUint32,
  shuffleSentenceIds,
  stripLeadingSentenceMarkers,
} from "@/lib/lesson-materials/sentence-order-shuffle";
import {
  formatWorkbookPassage,
  joinWorkbookPassageLines,
  type GrammarChoiceRenderSegment,
} from "@/lib/lesson-materials/workbook-types";

/** 재료 형식이 바뀌면 올린다. 옛 형식 재료는 열 때 한 번 새로 만든다. */
export const ONE_PAGE_CONTENT_VERSION = "op-8";

/** 시험지 어법 선택·어휘 선택 문항 수(양식: 10문항씩) */
export const ONE_PAGE_CHOICE_MAX = 10;
/** 문장 순서 배열 보기 수 상한. 넘으면 이웃한 문장을 묶는다. */
const ORDER_ITEM_MAX = 5;
/** 주요문장 영작 문항 수 */
const WRITING_MAX = 4;

export type OnePageFlowNode = { en: string; ko: string };

/** 본문 낱말 아래에 적는 동의어·반의어 */
export type OnePageVocabNote = {
  /** 0부터 센 문장 번호 */
  sentenceIndex: number;
  /** 본문에 나온 그대로의 형태 */
  surface: string;
  meaningKo: string;
  synonyms: string[];
  antonyms: string[];
};

/** 내신 어법 선택·수정에 나올 자리 */
export type OnePageGrammarPoint = {
  sentenceIndex: number;
  /** 교재 어법 코드(one-page-grammar-rules). 옛 재료에는 없다. */
  code?: string;
  /** 본문에 나온 그대로의 부분(표시할 자리). 정답과 그 근거를 함께 담는다. */
  target: string;
  /** target 안의 바른 형태 */
  right: string;
  /** target 안에서 답을 정해 주는 근거(주어 명사·선행사·전치사 등). 옛 재료에는 없다. */
  cue?: string;
  /** 시험에 자주 나오는 틀린 형태(없으면 빈 문자열) */
  wrong: string;
  /** 틀린 형태가 이 문장에서 왜 안 되는지(검수에 쓴다). 옛 재료에는 없다. */
  wrongWhy?: string;
  /** 어법 항목 이름(예: 주어-동사 수일치) */
  point: string;
  /** 교재 빈출 어법 케이스 id(변형문제 어법추론과 같은 목록). 옛 재료에는 없다. */
  caseId?: string;
  /** 학생에게 보여 줄 케이스 한 줄 팁 */
  caseTipKo?: string;
  /** 왜 그 형태인지 한 문장 */
  explanation: string;
};

/** 시험에서 다른 말로 바뀌어 나올 표현 */
export type OnePageParaphrase = {
  sentenceIndex: number;
  /** 본문에 나온 그대로의 표현 */
  expression: string;
  meaningKo: string;
  paraphrases: string[];
};

/** 본문의 지칭어(it, they, such experiences, the fallacy…)와 그것이 가리키는 말 */
export type OnePageReference = {
  sentenceIndex: number;
  /** 본문에 나온 그대로의 지칭 표현 */
  surface: string;
  /** 가리키는 대상(앞 문장에 나온 그대로) */
  referent: string;
  /** 가리키는 대상이 있는 문장(0부터). 지칭어가 있는 문장보다 앞이어야 한다. */
  referentSentenceIndex: number;
  /** 한국어 풀이(짧게) */
  meaningKo: string;
  /** 그 문장에서 몇 번째로 나온 말인지(0부터). 같은 말이 두 번 나오는 문장에서 자리를 가린다. */
  occurrence?: number;
};

/** 이 지문으로 낼 만한 시험 유형 표시(빈칸 추론·문장 삽입·순서 배열·요약문 빈칸) */
export type OnePageExamPointKind = "blank" | "insert" | "order" | "summary";

/**
 * 유력 출제 자리. 본문에 표시를 남기고 "출제 포인트"에 문제 꼴·정답까지 한 줄씩 적는다.
 * 선생님 지적("출제포인트가 너무 모호하다")에 따라 유형마다 실제 문항이 되는 값을 함께 담는다.
 */
export type OnePageExamPoint = {
  kind: OnePageExamPointKind;
  /**
   * 0부터 센 문장 번호. blank는 네모 칠 어구가 있는 문장, insert는 <보기>로 빼낼 문장,
   * order는 첫 경계 문장(그 문장 앞에서 덩어리가 갈린다), summary는 그 내용이 나온 문장.
   */
  sentenceIndex: number;
  /** blank는 본문에 나온 그대로의 어구(네모로 칠한다), summary는 요약문의 어구. 나머지는 빈 문자열. */
  target: string;
  /** 왜 이 자리가 나올 만한지 한국어 한 줄 */
  reasonKo: string;
  /** 빈칸 추론: 학생이 고를 만한 오답 방향(한국어 짧은 구 1~2개) */
  distractorsKo?: string[];
  /** 문장 삽입: 지문에서 빼내어 <보기>로 주는 문장(지문 그대로) */
  insertSentence?: string;
  /** 순서 배열: 덩어리가 시작하는 문장 번호(0부터, 오름차순). 첫 덩어리는 주어진 글이다. */
  splitIndexes?: number[];
  /** 순서 배열: 지문 순서대로 놓인 덩어리에 붙는 (A)(B)(C) 라벨. 이어 읽으면 정답 순서가 된다. */
  orderLabels?: string[];
  /** 요약문 빈칸: 요약문에서 빈칸으로 낼 두 낱말(요약문에 그대로 있는 어구) */
  summaryWords?: string[];
};

export type OnePageTfItem = { statement: string; answer: "T" | "F" };

export type OnePageContent = {
  version: string;
  sourceHash: string;
  topicKo: string;
  titleEn: string;
  summaryEn: string;
  /** summaryEn에 그대로 들어 있는 핵심 어구(나온 순서). 정리자료 밑줄, 시험지 빈칸이 된다. */
  summaryKeywords: string[];
  summaryKo: string;
  flow: OnePageFlowNode[];
  vocab: OnePageVocabNote[];
  grammar: OnePageGrammarPoint[];
  /** 지칭 정리(옛 재료에는 없다) */
  references?: OnePageReference[];
  /** 유력 출제 포인트(옛 재료에는 없다) */
  examPoints?: OnePageExamPoint[];
  paraphrases: OnePageParaphrase[];
  tf: OnePageTfItem[];
  /** 주요문장 영작에 쓸 문장(0부터 센 번호, 지문 순서) */
  keySentenceIndexes: number[];
  createdAt: string;
};

/** 원문에 섞여 들어온 강조 표시(**not**, __word__)를 뗀다. 인쇄물에 별표가 그대로 찍혔다. */
export function stripMarkup(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1");
}

/**
 * 지문 문장 목록(영어가 빈 줄은 뺀다). 재료의 문장 번호는 이 목록 기준이라, 재료를 만들 때와
 * 그릴 때 모두 이것을 쓴다.
 */
export function onePageSentences(
  items: Array<{ english_text?: string | null; korean_text?: string | null }>
): Array<{ english: string; korean: string }> {
  return items
    .map((it) => ({
      english: stripMarkup(formatWorkbookPassage(String(it.english_text ?? ""))),
      korean: stripMarkup(String(it.korean_text ?? "").replace(/\s+/g, " ").trim()),
    }))
    .filter((s) => s.english);
}

/** 1장 요약직보자료·1장 테스트 화면에 넘기는 지문 하나 */
export type OnePageProjectInput = {
  id: string;
  title: string;
  titleEn: string | null;
  source: string | null;
  sentences: Array<{ english: string; korean: string }>;
  /** 지금 원문의 해시(저장된 시험지가 옛 원문으로 만든 것인지 가린다) */
  sourceHash: string;
  /** 지금 원문으로 만든 재료. 없거나 옛 원문이면 null(화면에서 준비한다). */
  content: OnePageContent | null;
};

/** 영어 원문 해시. 문장이 바뀌면 재료를 다시 만든다. */
export function onePageSourceHash(englishLines: string[]): string {
  const joined = englishLines
    .map((t) => formatWorkbookPassage(t).toLowerCase())
    .filter(Boolean)
    .join("\n");
  let out = "";
  for (let i = 0; i < 3; i++) {
    out += hashSeedToUint32(`${joined}#op#${ONE_PAGE_CONTENT_VERSION}#${i}`)
      .toString(16)
      .padStart(8, "0");
  }
  return out;
}

export function isOnePageContentFresh(
  content: OnePageContent | null | undefined,
  englishLines: string[]
): content is OnePageContent {
  return (
    !!content &&
    content.version === ONE_PAGE_CONTENT_VERSION &&
    content.sourceHash === onePageSourceHash(englishLines)
  );
}

/** 요약문을 핵심 어구 자리에서 나눈다(시험지 빈칸·정리자료 밑줄). */
export function splitSummaryByKeywords(
  summary: string,
  keywords: string[]
): Array<{ text: string; keywordIndex: number | null }> {
  const parts: Array<{ text: string; keywordIndex: number | null }> = [];
  let cursor = 0;
  let kwNo = 0;
  for (const kw of keywords) {
    const at = kw ? summary.indexOf(kw, cursor) : -1;
    if (at < 0) continue;
    if (at > cursor) parts.push({ text: summary.slice(cursor, at), keywordIndex: null });
    parts.push({ text: kw, keywordIndex: kwNo++ });
    cursor = at + kw.length;
  }
  if (cursor < summary.length) parts.push({ text: summary.slice(cursor), keywordIndex: null });
  return parts;
}

// ---------------------------------------------------------------- 낱말 찾기

/** 낱말 경계로 찾는 정규식(대소문자 무시, 띄어쓰기 차이 허용). 빈 말이면 null. */
function phraseRegex(phrase: string): RegExp | null {
  const p = phrase.trim();
  if (!p) return null;
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, "gi");
}

/** 낱말 경계로 찾는다(대소문자 무시, 띄어쓰기 차이 허용). from~to 안에서 먼저 찾고 없으면 전체에서. */
export function findPhrase(
  text: string,
  phrase: string,
  range?: { from: number; to: number }
): { start: number; end: number } | null {
  const re = phraseRegex(phrase);
  if (!re) return null;
  const scan = (from: number, to: number) => {
    re.lastIndex = from;
    const m = re.exec(text);
    if (!m || m.index + m[0].length > to) return null;
    return { start: m.index, end: m.index + m[0].length };
  };
  if (range) {
    const hit = scan(range.from, range.to);
    if (hit) return hit;
  }
  return scan(0, text.length);
}

/** 낱말 경계로 n번째(0부터)로 나오는 자리. 같은 말이 한 문장에 두 번 나올 때 쓴다. */
export function findPhraseAt(
  text: string,
  phrase: string,
  occurrence: number
): { start: number; end: number } | null {
  if (occurrence <= 0) return findPhrase(text, phrase);
  const re = phraseRegex(phrase);
  if (!re) return null;
  let n = 0;
  for (;;) {
    const m = re.exec(text);
    if (!m) return null;
    if (n === occurrence) return { start: m.index, end: m.index + m[0].length };
    n += 1;
    if (m[0].length === 0) re.lastIndex += 1;
  }
}

/**
 * 표시 기호(ⓐⓑ, ㉠㉡, 지칭 번호)가 본문에 나오는 차례대로 붙도록, 재료를 지문 순서
 * (문장 번호 → 문장 안의 자리)로 줄 세운다. 선생님 지적: 기호가 뒤죽박죽으로 찍혔다.
 */
export function sortOnePageMarks<T>(
  items: T[],
  sentences: string[],
  locate: (item: T) => {
    sentenceIndex: number;
    surface: string;
    occurrence?: number;
    /** 문장 앞에 붙는 표시(문장 삽입·순서 배열)는 그 문장의 맨 앞으로 본다. */
    atSentenceStart?: boolean;
  }
): T[] {
  return items
    .map((item, i) => {
      const at = locate(item);
      const sentence = sentences[at.sentenceIndex] ?? "";
      const hit = at.surface ? findPhraseAt(sentence, at.surface, at.occurrence ?? 0) : null;
      const start = at.atSentenceStart ? -1 : hit ? hit.start : Number.MAX_SAFE_INTEGER;
      return { item, i, si: at.sentenceIndex, start };
    })
    .sort((a, b) => a.si - b.si || a.start - b.start || a.i - b.i)
    .map((row) => row.item);
}

/** 이어 붙인 본문에서 각 문장이 시작하는 자리. 못 찾은 문장은 null. */
function locateSentenceStarts(passage: string, sentences: string[]): Array<number | null> {
  const out: Array<number | null> = [];
  let cursor = 0;
  for (const s of sentences) {
    const text = formatWorkbookPassage(s);
    const at = text ? passage.indexOf(text, cursor) : -1;
    if (at < 0) {
      out.push(null);
      continue;
    }
    out.push(at);
    cursor = at + text.length;
  }
  return out;
}

// ---------------------------------------------------------------- 문장 순서 배열

export type OnePageSentenceOrder = {
  given: string;
  items: Array<{ label: string; text: string }>;
  /** 원래 순서대로의 기호 */
  answer: string[];
};

const orderLabel = (i: number) => String.fromCharCode(65 + i);

/**
 * 첫 문장을 주고 나머지를 (A)~(E)로 섞는다. 문장이 많으면 이웃한 문장끼리 묶어 보기를 5개로
 * 맞춘다. 문장이 3개보다 적으면 null.
 */
export function buildOnePageSentenceOrder(
  sentences: string[],
  seedKey: string
): OnePageSentenceOrder | null {
  const clean = sentences
    .map((s) => stripLeadingSentenceMarkers(formatWorkbookPassage(s)))
    .filter(Boolean);
  if (clean.length < 3) return null;
  const [given, ...rest] = clean;
  const groupCount = Math.min(ORDER_ITEM_MAX, rest.length);
  const base = Math.floor(rest.length / groupCount);
  const extra = rest.length % groupCount;
  const groups: string[] = [];
  let at = 0;
  for (let g = 0; g < groupCount; g++) {
    const size = base + (g < extra ? 1 : 0);
    groups.push(rest.slice(at, at + size).join(" "));
    at += size;
  }
  const ids = groups.map((_, i) => String(i));
  const shuffled = shuffleSentenceIds(ids, `one-page|${seedKey}`);
  const labelById = new Map(shuffled.map((id, i) => [id, orderLabel(i)] as const));
  return {
    given: given!,
    items: shuffled.map((id, i) => ({ label: orderLabel(i), text: groups[Number(id)]! })),
    answer: ids.map((id) => labelById.get(id)!),
  };
}

// ---------------------------------------------------------------- 주요문장 영작

/** 낱말 단위로 섞는다. 끝 문장부호는 떼고(쉼표 등은 낱말에 붙여 둔다), 원래 순서와 같으면 다시 섞는다. */
export function scrambleSentenceWords(english: string, seedKey: string): string[] {
  const words = answerSentence(english).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const last = words.length - 1;
  words[last] = words[last]!.replace(/[.!?]+(["'”’)]*)$/u, "$1") || words[last]!;
  if (words.length < 2) return words;
  for (let attempt = 0; attempt < 8; attempt++) {
    const out = fisherYatesShuffle(words, createSeededRng(`${seedKey}#${attempt}`));
    if (out.join(" ") !== words.join(" ")) return out;
  }
  return [...words.slice(1), words[0]!];
}

/** 끝 문장부호까지 붙은 정답 문장 */
export function answerSentence(english: string): string {
  return stripLeadingSentenceMarkers(formatWorkbookPassage(english));
}

/** 영작 문장: 재료가 고른 문장, 모자라면 알맞은 길이의 긴 문장으로 채운다. 해석이 없는 문장은 뺀다. */
function pickWritingIndexes(
  sentences: Array<{ english: string; korean: string }>,
  keyIndexes: number[]
): number[] {
  const usable = (i: number) =>
    i >= 0 && i < sentences.length && !!sentences[i]!.english.trim() && !!sentences[i]!.korean.trim();
  const words = (i: number) => answerSentence(sentences[i]!.english).split(/\s+/).length;
  const chosen: number[] = [];
  for (const i of keyIndexes) {
    if (usable(i) && !chosen.includes(i)) chosen.push(i);
    if (chosen.length >= WRITING_MAX) break;
  }
  if (chosen.length < WRITING_MAX) {
    const rest = sentences
      .map((_, i) => i)
      .filter((i) => usable(i) && !chosen.includes(i) && words(i) >= 6)
      .sort((a, b) => {
        const fit = (i: number) => (words(i) <= 35 ? 0 : 1);
        return fit(a) - fit(b) || words(b) - words(a);
      });
    for (const i of rest) {
      if (chosen.length >= WRITING_MAX) break;
      chosen.push(i);
    }
  }
  return chosen.sort((a, b) => a - b);
}

// ---------------------------------------------------------------- 어법·어휘 선택

/** 워크북 어법 선택·어휘 선택 문항에서 쓰는 필드만 */
export type OnePageChoiceSource = {
  sourcePassage: string;
  items: Array<{
    startCharIndex: number;
    endCharIndex: number;
    leftText: string;
    rightText: string;
    correctSide: "left" | "right";
    learningValue?: number;
  }>;
};

export type OnePageChoiceBlock = {
  segments: GrammarChoiceRenderSegment[];
  /** 번호순 정답 */
  answers: string[];
  /** 워크북 문항을 썼는지(workbook), 1장 재료로 만들었는지(material) */
  from: "workbook" | "material";
};

/**
 * 문항이 많으면 학습 가치가 높은 것부터 max개를 고르고(같으면 앞 자리), 지문 순서대로 1번부터
 * 다시 매긴다. 고르지 않은 자리는 본문 그대로 둔다. 자리가 본문과 어긋나면 null.
 */
export function buildChoiceBlock(
  source: OnePageChoiceSource,
  from: OnePageChoiceBlock["from"],
  max = ONE_PAGE_CHOICE_MAX
): OnePageChoiceBlock | null {
  const passage = source.sourcePassage;
  const valid = source.items
    .filter((it) => it.startCharIndex >= 0 && it.endCharIndex <= passage.length && it.startCharIndex < it.endCharIndex)
    .sort((a, b) => a.startCharIndex - b.startCharIndex)
    // 겹치는 자리는 앞의 것만 둔다.
    .filter((it, i, arr) => i === 0 || it.startCharIndex >= arr[i - 1]!.endCharIndex);
  const chosen =
    valid.length <= max
      ? valid
      : valid
          .map((it, i) => ({ it, i }))
          .sort((a, b) => (b.it.learningValue ?? 0) - (a.it.learningValue ?? 0) || a.i - b.i)
          .slice(0, max)
          .map((row) => row.it)
          .sort((a, b) => a.startCharIndex - b.startCharIndex);
  if (chosen.length === 0) return null;
  const segments: GrammarChoiceRenderSegment[] = [];
  const answers: string[] = [];
  let cursor = 0;
  chosen.forEach((it, i) => {
    if (cursor < it.startCharIndex) segments.push({ type: "text", text: passage.slice(cursor, it.startCharIndex) });
    segments.push({ type: "choice", number: i + 1, leftText: it.leftText, rightText: it.rightText });
    answers.push(it.correctSide === "left" ? it.leftText : it.rightText);
    cursor = it.endCharIndex;
  });
  if (cursor < passage.length) segments.push({ type: "text", text: passage.slice(cursor) });
  return { segments, answers, from };
}

/** 바른 형태를 왼쪽·오른쪽 어디에 둘지 정해진 열쇠로 고른다. */
function sideFor(seedKey: string): "left" | "right" {
  return hashSeedToUint32(seedKey) % 2 === 0 ? "left" : "right";
}

/**
 * 워크북 문항이 없을 때 1장 재료로 만든다. 어법은 어법 포인트의 [바른 형태 / 틀린 형태],
 * 어휘는 핵심 낱말의 [원래 낱말 / 반의어]다.
 */
function fallbackChoiceSources(
  english: string[],
  content: OnePageContent,
  seedKey: string
): { grammar: OnePageChoiceSource; vocab: OnePageChoiceSource } {
  const passage = joinWorkbookPassageLines(english);
  const starts = locateSentenceStarts(passage, english);
  const rangeOf = (si: number) => {
    const from = starts[si];
    if (from == null) return undefined;
    return { from, to: from + formatWorkbookPassage(english[si] ?? "").length };
  };
  const item = (start: number, end: number, correct: string, wrong: string, key: string) => {
    const side = sideFor(key);
    return {
      startCharIndex: start,
      endCharIndex: end,
      leftText: side === "left" ? correct : wrong,
      rightText: side === "left" ? wrong : correct,
      correctSide: side,
    };
  };
  const grammar: OnePageChoiceSource["items"] = [];
  content.grammar.forEach((g, i) => {
    if (!g.right || !g.wrong) return;
    const target = findPhrase(passage, g.target, rangeOf(g.sentenceIndex));
    if (!target) return;
    const inner = findPhrase(passage, g.right, { from: target.start, to: target.end });
    if (!inner || inner.start < target.start || inner.end > target.end) return;
    grammar.push(item(inner.start, inner.end, passage.slice(inner.start, inner.end), g.wrong, `${seedKey}#g${i}`));
  });
  const vocab: OnePageChoiceSource["items"] = [];
  content.vocab.forEach((v, i) => {
    const wrong = v.antonyms[0];
    if (!wrong) return;
    const hit = findPhrase(passage, v.surface, rangeOf(v.sentenceIndex));
    if (!hit) return;
    vocab.push(item(hit.start, hit.end, passage.slice(hit.start, hit.end), wrong, `${seedKey}#v${i}`));
  });
  return { grammar: { sourcePassage: passage, items: grammar }, vocab: { sourcePassage: passage, items: vocab } };
}

// ---------------------------------------------------------------- 테스트 한 장

export type OnePageBlankSegment =
  | { type: "text"; text: string }
  | { type: "blank"; number: number; answer: string };

export type OnePageTestPassage = {
  projectId: string;
  /** 만들 때의 원문 해시. 원문이 바뀌면 시험지를 다시 조립한다. */
  sourceHash: string;
  title: string;
  titleEn: string;
  source: string | null;
  order: OnePageSentenceOrder | null;
  summary: { segments: OnePageBlankSegment[]; ko: string } | null;
  tf: OnePageTfItem[];
  grammar: OnePageChoiceBlock | null;
  vocab: OnePageChoiceBlock | null;
  writing: Array<{ words: string[]; korean: string; answer: string }>;
};

export type OnePageTestPayload = {
  version: 1;
  createdAt: string;
  passages: OnePageTestPassage[];
};

export function buildOnePageTestPassage(input: {
  projectId: string;
  title: string;
  titleEn: string | null;
  source: string | null;
  sentences: Array<{ english: string; korean: string }>;
  content: OnePageContent;
  /** 워크북 어법 선택·어휘 선택 결과. 없으면 1장 재료로 만든다. */
  grammarSection: OnePageChoiceSource | null;
  vocabSection: OnePageChoiceSource | null;
}): OnePageTestPassage {
  const english = input.sentences.map((s) => s.english);
  const seed = `${input.projectId}|${input.content.sourceHash}`;
  const fallback = fallbackChoiceSources(english, input.content, seed);
  const summaryParts = splitSummaryByKeywords(input.content.summaryEn, input.content.summaryKeywords);
  const blanks = summaryParts.filter((p) => p.keywordIndex !== null).length;
  const writing = pickWritingIndexes(input.sentences, input.content.keySentenceIndexes);
  return {
    projectId: input.projectId,
    sourceHash: input.content.sourceHash,
    title: input.title,
    titleEn: (input.titleEn ?? "").trim() || input.content.titleEn,
    source: input.source,
    order: buildOnePageSentenceOrder(english, seed),
    summary:
      blanks > 0
        ? {
            segments: summaryParts.map((p) =>
              p.keywordIndex === null
                ? { type: "text" as const, text: p.text }
                : { type: "blank" as const, number: p.keywordIndex + 1, answer: p.text }
            ),
            ko: input.content.summaryKo,
          }
        : null,
    tf: input.content.tf.slice(0, 5),
    grammar:
      (input.grammarSection && buildChoiceBlock(input.grammarSection, "workbook")) ||
      buildChoiceBlock(fallback.grammar, "material"),
    vocab:
      (input.vocabSection && buildChoiceBlock(input.vocabSection, "workbook")) ||
      buildChoiceBlock(fallback.vocab, "material"),
    writing: writing.map((i) => ({
      words: scrambleSentenceWords(input.sentences[i]!.english, `${seed}#w${i}`),
      korean: input.sentences[i]!.korean.replace(/\s+/g, " ").trim(),
      answer: answerSentence(input.sentences[i]!.english),
    })),
  };
}

export function normalizeOnePageTestPayload(raw: unknown): OnePageTestPayload | null {
  const p = raw as Partial<OnePageTestPayload> | null;
  if (!p || typeof p !== "object" || !Array.isArray(p.passages)) return null;
  return {
    version: 1,
    createdAt: String(p.createdAt ?? ""),
    passages: p.passages.filter((x) => !!x && typeof x === "object" && typeof x.projectId === "string"),
  };
}

// ---------------------------------------------------------------- 정리자료 본문 표시

export type OnePageRun = {
  text: string;
  /** 걸린 어법 포인트 번호(content.grammar의 순번) */
  grammar: number[];
  /** 걸린 바꿔 쓰기 표현 번호 */
  expression: number[];
  /** 걸린 지칭어 번호 */
  reference: number[];
  /** 걸린 빈칸 추론 자리 번호(content.examPoints의 순번) */
  exam: number[];
  /** 어법·표현·지칭이 시작하는 조각이면 그 번호(표시 기호를 앞에 붙인다) */
  grammarStart: number[];
  expressionStart: number[];
  referenceStart: number[];
  examStart: number[];
};

/** 문장 하나를 낱말(동·반의어) 덩어리로 나누고, 덩어리 안을 어법·표현 경계로 다시 나눈다. */
export type OnePageSegment = { vocab: number | null; runs: OnePageRun[] };

/**
 * 정리자료 본문 한 문장의 표시 조각. 동·반의어는 낱말 아래에 달아야 하므로 낱말 자리는 한
 * 덩어리로 두고(겹치는 낱말은 앞의 것만), 어법 자리·바꿔 쓰기 표현은 겹쳐도 되게 모든 경계에서 자른다.
 */
export function splitSentenceForSummary(
  english: string,
  sentenceIndex: number,
  content: Pick<OnePageContent, "vocab" | "grammar" | "paraphrases"> &
    Pick<OnePageContent, "references" | "examPoints">
): OnePageSegment[] {
  const vocabRanges: Array<{ start: number; end: number; index: number }> = [];
  content.vocab.forEach((v, index) => {
    if (v.sentenceIndex !== sentenceIndex) return;
    const hit = findPhrase(english, v.surface);
    if (!hit || vocabRanges.some((r) => hit.start < r.end && r.start < hit.end)) return;
    vocabRanges.push({ ...hit, index });
  });
  vocabRanges.sort((a, b) => a.start - b.start);

  const marks: Array<{
    start: number;
    end: number;
    kind: "grammar" | "expression" | "reference" | "exam";
    index: number;
  }> = [];
  content.grammar.forEach((g, index) => {
    if (g.sentenceIndex !== sentenceIndex) return;
    const hit = findPhrase(english, g.target);
    if (hit) marks.push({ ...hit, kind: "grammar", index });
  });
  content.paraphrases.forEach((p, index) => {
    if (p.sentenceIndex !== sentenceIndex) return;
    const hit = findPhrase(english, p.expression);
    if (hit) marks.push({ ...hit, kind: "expression", index });
  });
  (content.references ?? []).forEach((r, index) => {
    if (r.sentenceIndex !== sentenceIndex) return;
    const hit = findPhraseAt(english, r.surface, r.occurrence ?? 0);
    if (hit) marks.push({ ...hit, kind: "reference", index });
  });
  // 빈칸 추론 자리만 본문에 표시한다(문장 삽입·순서 배열은 문장 앞 경계에 붙인다).
  (content.examPoints ?? []).forEach((e, index) => {
    if (e.kind !== "blank" || e.sentenceIndex !== sentenceIndex || !e.target) return;
    const hit = findPhrase(english, e.target);
    if (hit) marks.push({ ...hit, kind: "exam", index });
  });

  const runsBetween = (from: number, to: number): OnePageRun[] => {
    const cuts = new Set<number>([from, to]);
    for (const m of marks) {
      if (m.start > from && m.start < to) cuts.add(m.start);
      if (m.end > from && m.end < to) cuts.add(m.end);
    }
    const points = [...cuts].sort((a, b) => a - b);
    const runs: OnePageRun[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]!;
      const end = points[i + 1]!;
      if (start === end) continue;
      const on = marks.filter((m) => m.start <= start && m.end >= end);
      runs.push({
        text: english.slice(start, end),
        grammar: on.filter((m) => m.kind === "grammar").map((m) => m.index),
        expression: on.filter((m) => m.kind === "expression").map((m) => m.index),
        reference: on.filter((m) => m.kind === "reference").map((m) => m.index),
        exam: on.filter((m) => m.kind === "exam").map((m) => m.index),
        grammarStart: on.filter((m) => m.kind === "grammar" && m.start === start).map((m) => m.index),
        expressionStart: on.filter((m) => m.kind === "expression" && m.start === start).map((m) => m.index),
        referenceStart: on.filter((m) => m.kind === "reference" && m.start === start).map((m) => m.index),
        examStart: on.filter((m) => m.kind === "exam" && m.start === start).map((m) => m.index),
      });
    }
    return runs;
  };

  const segments: OnePageSegment[] = [];
  let cursor = 0;
  for (const r of vocabRanges) {
    if (cursor < r.start) segments.push({ vocab: null, runs: runsBetween(cursor, r.start) });
    segments.push({ vocab: r.index, runs: runsBetween(r.start, r.end) });
    cursor = r.end;
  }
  if (cursor < english.length) segments.push({ vocab: null, runs: runsBetween(cursor, english.length) });
  return segments;
}

export const CIRCLED_NUMBERS = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
/** 어법 포인트 기호 */
const CIRCLED_LETTERS = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛ";
/** 바꿔 쓰기 표현 기호 */
const CIRCLED_HANGUL = "㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫";

export function circledNumber(i: number): string {
  return CIRCLED_NUMBERS[i] ?? `(${i + 1})`;
}

export function circledLetter(i: number): string {
  return CIRCLED_LETTERS[i] ?? `(${String.fromCharCode(97 + i)})`;
}

export function circledHangul(i: number): string {
  return CIRCLED_HANGUL[i] ?? `(${i + 1})`;
}

/** 출제 포인트 표시 기호와 이름(본문 표시와 "출제 포인트" 줄에서 같이 쓴다) */
export const EXAM_POINT_MARKS: Record<OnePageExamPointKind, { mark: string; labelKo: string }> = {
  blank: { mark: "▭", labelKo: "빈칸 추론" },
  insert: { mark: "∧", labelKo: "문장 삽입" },
  order: { mark: "‖", labelKo: "순서 배열" },
  summary: { mark: "≡", labelKo: "요약문 빈칸" },
};

/** 그 자체로는 아무것도 가리켜 주지 못하는 말(가리키는 대상이 이런 말뿐이면 풀이가 안 된다). */
const EMPTY_WORDS = new Set([
  "the","a","an","this","that","these","those","such","it","its","they","them","their","he","him",
  "his","she","her","we","us","our","you","your","i","me","my","one","ones","other","others","another",
  "thing","things","something","anything","everything","nothing","some","any","all","both","each",
  "of","in","on","at","to","for","and","or","but","is","are","was","were","be","been",
]);

/** 가리키는 대상이 실제로 무엇인지 이름을 대 주는 말인지(내용어가 하나라도 있어야 한다). */
export function namesSomething(referent: string): boolean {
  return referent
    .split(/\s+/)
    .map((w) => w.toLowerCase().replace(/[^a-z'’-]/g, ""))
    .some((w) => w.length >= 2 && !EMPTY_WORDS.has(w));
}

/** 두 어구가 사실상 같은 말인지(대소문자·문장부호만 다른 것). */
export function sameWords(a: string, b: string): boolean {
  const cut = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  return cut(a) === cut(b);
}

/** 지칭어 표시 번호(본문에는 위첨자로 작게 붙인다). 문장 번호 ①②③과 겹치지 않게 그냥 숫자를 쓴다. */
export function referenceMark(i: number): string {
  return String(i + 1);
}
