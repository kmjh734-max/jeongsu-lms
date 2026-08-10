/**
 * 10단계 영작 — 인천 WORKBOOK PDF형
 * 우리말 + 제시어(원형) + 고정 구문 + 중요 어휘·표현 위주 ______ 슬롯
 */
import {
  blankPickCount,
  englishCore,
  pickSpreadByScore,
  scoreEnglishBlank,
} from "@/lib/exam-prep/blank-importance";
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import {
  newCueId,
  newSegId,
  tokenizeAnswerText,
  type Stage10Cue,
  type Stage10Segment,
} from "@/lib/exam-prep/stage10-types";

function lemmaCue(answer: string): string {
  const w = answer.toLowerCase().replace(/[^a-z'-]/g, "");
  if (!w) return answer.toLowerCase().replace(/[^a-z']/g, "") || answer;
  if (w === "been" || w === "being" || w === "is" || w === "are" || w === "was" || w === "were") {
    return "be";
  }
  if (w === "has" || w === "had" || w === "have") return "have";
  if (w === "does" || w === "did" || w === "done" || w === "doing") return "do";
  if (w === "left") return "leave";
  if (w === "made") return "make";
  if (w === "got" || w === "gotten" || w === "getting") return "get";
  if (w === "permitted" || w === "permission") return "permit";
  if (w === "neighbors" || w === "neighbour" || w === "neighbours") return "neighbor";
  if (w === "corners") return "corner";
  if (w === "dumping" || w === "dumped") return "dump";
  if (w === "leaving") return "leave";
  if (w === "growing") return "grow";
  if (w === "disgusting" || w === "disgusted") return "disgust";
  if (w === "needed") return "need";
  if (w === "strengthened" || w === "strengthening") return "strengthen";
  if (w === "attracts" || w === "attracted") return "attract";
  if (w === "buildups") return "buildup";
  if (w === "becomes" || w === "became") return "become";
  if (w.endsWith("ying") && w.length > 5) return `${w.slice(0, -4)}y`;
  if (w.endsWith("ing") && w.length > 5) {
    const base = w.slice(0, -3);
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    if (base.endsWith("v")) return `${base}e`;
    return base;
  }
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ed") && w.length > 4) {
    const base = w.slice(0, -2);
    if (base.endsWith("i")) return `${base.slice(0, -1)}y`;
    if (
      base.length >= 2 &&
      base[base.length - 1] === base[base.length - 2] &&
      !/[aeiou]/.test(base[base.length - 1]!)
    ) {
      return base.slice(0, -1);
    }
    return base;
  }
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  // employees→employee, boxes→box (sibilant+es만 -es)
  if (/(?:ss|sh|ch|x|z)es$/i.test(w) && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3 && !w.endsWith("ss") && !/(us|is|os|ss)$/i.test(w)) {
    return w.slice(0, -1);
  }
  return w || answer;
}

/** 담화·구조 고정 구문 (빈칸이 아닌 안내 문구) — 모두 g 플래그 필수 */
const STAGE10_FIXED: RegExp[] = [
  /^To Whom It May Concern:\s*/gim,
  /\bEven though it(?:['’]s| is)\s+/gi,
  /\bin those areas,\s*recently more and more\s+/gi,
  /,\s*recently more and more\s+/gi,
  /\bin those areas\b/gi,
  /\bThank you for your time and consideration\.?/gi,
  /\bSincerely,?\s*/gi,
  /\bJulia Morgan\b/gi,
  /\bIn contrast,\s*/gi,
  /\bConsequently,\s*/gi,
  /\bTherefore,\s*/gi,
  /\bHowever,\s*/gi,
  /\bFor this reason,\s*/gi,
  /\bAs a result,\s*/gi,
  /\bFor example,\s*/gi,
  /\bOn the other hand,\s*/gi,
];

/** 의미 단위로 한 칸에 묶을 관용·결합 표현 */
const STAGE10_PHRASE_BLANKS: RegExp[] = [
  /\bon board\b/gi,
  /\btake place\b/gi,
  /\bend in\b/gi,
  /\bin charge of\b/gi,
  /\bas a result\b/gi,
  /\bin spite of\b/gi,
  /\bbecause of\b/gi,
  /\binstead of\b/gi,
  /\baccording to\b/gi,
  /\bin order to\b/gi,
  /\brather than\b/gi,
  /\bdue to\b/gi,
  /\bout of\b/gi,
  /\bsuch as\b/gi,
  /\bas well as\b/gi,
  /\bmore and more\b/gi,
  /\bless and less\b/gi,
  /\beven though\b/gi,
  /\bfor example\b/gi,
  /\bpredator[-‑]?prey\b/gi,
  /\billegal dumping\b/gi,
  /\bstreet corners\b/gi,
  /\bbus stops\b/gi,
];

type CharSpan = { start: number; end: number };
type Tok = { index: number; start: number; end: number; text: string };

function tokenizeWithPos(src: string): Tok[] {
  const toks: Tok[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(src)) !== null) {
    toks.push({
      index: i++,
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }
  return toks;
}

function collectRegexSpans(src: string, patterns: RegExp[]): CharSpan[] {
  const out: CharSpan[] = [];
  for (const re of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      if (m.index == null || !m[0]) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (out.some((g) => start < g.end && end > g.start)) continue;
      out.push({ start, end });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

function collectVocabSpans(src: string, vocabulary: unknown): CharSpan[] {
  const marks = parseVocabMarks(vocabulary)
    .map((m) => (m.englishText || "").trim())
    .filter((t) => t.length >= 3)
    .sort((a, b) => b.length - a.length);
  const out: CharSpan[] = [];
  const low = src.toLowerCase();
  for (const needle of marks) {
    const n = needle.toLowerCase();
    let from = 0;
    while (from < low.length) {
      const idx = low.indexOf(n, from);
      if (idx < 0) break;
      const end = idx + needle.length;
      const boundaryOk =
        (idx === 0 || !/[a-z]/i.test(src[idx - 1]!)) &&
        (end >= src.length || !/[a-z]/i.test(src[end]!));
      if (
        boundaryOk &&
        !out.some((g) => idx < g.end && end > g.start)
      ) {
        out.push({ start: idx, end });
      }
      from = idx + Math.max(1, needle.length);
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

function overlaps(tok: Tok, spans: CharSpan[]): boolean {
  return spans.some((g) => tok.start < g.end && tok.end > g.start);
}

function spanCoveringTokens(toks: Tok[], span: CharSpan): number[] {
  return toks
    .filter((t) => t.start < span.end && t.end > span.start)
    .map((t) => t.index);
}

function pushFixed(segs: Stage10Segment[], text: string, order: { n: number }) {
  if (!text) return;
  const last = segs[segs.length - 1];
  if (last?.segmentType === "fixed_text") {
    last.fixedText = `${last.fixedText ?? ""}${text}`;
    return;
  }
  segs.push({
    id: newSegId(),
    segmentOrder: order.n++,
    segmentType: "fixed_text",
    fixedText: text,
  });
}

function pushAnswer(
  segs: Stage10Segment[],
  text: string,
  start: number,
  end: number,
  order: { n: number }
) {
  if (!text.trim()) {
    if (text) pushFixed(segs, text, order);
    return;
  }
  segs.push({
    id: newSegId(),
    segmentOrder: order.n++,
    segmentType: "answer_segment",
    originalAnswerText: text,
    answerTokens: tokenizeAnswerText(text),
    acceptedAnswers: [],
    englishStart: start,
    englishEnd: end,
    ignoreExtraSpaces: true,
    ignoreTerminalPunctuation: true,
  });
}

/**
 * 중요 어휘·표현만 빈칸. 관사·조동사·담화표지 등은 고정.
 * vocabulary 마크·관용 구는 한 덩어리로 비움.
 */
export function buildPdfWritingSegments(
  english: string,
  vocabulary?: unknown
): Stage10Segment[] {
  const src = english.trim();
  if (!src) return [];

  const toks = tokenizeWithPos(src);
  if (toks.length < 2) return [];

  const fixedSpans = collectRegexSpans(src, STAGE10_FIXED);
  const phraseSpans = [
    ...collectVocabSpans(src, vocabulary),
    ...collectRegexSpans(src, STAGE10_PHRASE_BLANKS),
  ].filter((p) => !fixedSpans.some((f) => p.start < f.end && p.end > f.start));

  const forcedBlank = new Set<number>();
  for (const span of phraseSpans) {
    for (const idx of spanCoveringTokens(toks, span)) forcedBlank.add(idx);
  }

  const scored = toks.map((t) => {
    if (overlaps(t, fixedSpans)) return { index: t.index, score: -1 };
    if (forcedBlank.has(t.index)) return { index: t.index, score: 100 };
    return { index: t.index, score: scoreEnglishBlank(t.text) };
  });

  const eligible = scored.filter((x) => x.score > 0);
  // 구(phrase)는 칸 1개로 세고, 나머지 중요어를 문장에 분산
  const phraseUnitCount = phraseSpans.length;
  const pickTarget = Math.max(
    3,
    blankPickCount(Math.max(1, eligible.length), "medium", { max: 6 })
  );
  const need = Math.max(0, pickTarget - Math.max(1, phraseUnitCount));
  const picked = pickSpreadByScore(
    eligible.filter((x) => !forcedBlank.has(x.index)),
    need
  );

  const blankIdx = new Set<number>([
    ...forcedBlank,
    ...picked.map((p) => p.index),
  ]);
  if (blankIdx.size < 2) {
    for (const c of [...eligible].sort((a, b) => b.score - a.score)) {
      blankIdx.add(c.index);
      if (blankIdx.size >= 2) break;
    }
  }
  if (blankIdx.size < 1) return [];

  const segs: Stage10Segment[] = [];
  const order = { n: 1 };
  let cursor = 0;
  let i = 0;
  while (i < toks.length) {
    const isBlank = blankIdx.has(i);
    let j = i + 1;
    while (j < toks.length && blankIdx.has(j) === isBlank) j++;

    const runStart = toks[i]!.start;
    const runEnd = toks[j - 1]!.end;
    if (cursor < runStart) pushFixed(segs, src.slice(cursor, runStart), order);

    if (isBlank) {
      pushAnswer(segs, src.slice(runStart, runEnd), runStart, runEnd, order);
      cursor = runEnd;
    } else {
      // 다음 빈칸 전까지의 공백·구두점 포함
      const to = j < toks.length ? toks[j]!.start : src.length;
      pushFixed(segs, src.slice(runStart, to), order);
      cursor = to;
    }
    i = j;
  }
  if (cursor < src.length) pushFixed(segs, src.slice(cursor), order);

  return segs.some((s) => s.segmentType === "answer_segment") ? segs : [];
}

/** 제시어: 빈칸 답안 원형 우선, 어휘 마크 보강 (4~6개) */
const CUE_STOP = new Set(
  "a an the of to in on at for with from by into onto upon over under and or but so as if than then".split(
    " "
  )
);

export function pickWritingCueTexts(
  english: string,
  vocabulary: unknown,
  answerText: string
): string[] {
  const fromAnswers = tokenizeAnswerText(answerText)
    .map((t) => lemmaCue(englishCore(t) || t))
    .filter((v) => v.length >= 3 && !CUE_STOP.has(v))
    .filter((v, i, a) => a.indexOf(v) === i);

  const marks = parseVocabMarks(vocabulary)
    .map((m) => lemmaCue(m.englishText))
    .filter((v) => v.length >= 3 && !CUE_STOP.has(v))
    .filter((v, i, a) => a.indexOf(v) === i);

  const scored = `${answerText} ${english}`
    .split(/\s+/)
    .map((w) => {
      const core = englishCore(w);
      return { lemma: lemmaCue(core), score: scoreEnglishBlank(w) };
    })
    .filter((x) => x.score > 0 && x.lemma.length >= 3 && !CUE_STOP.has(x.lemma))
    .sort((a, b) => b.score - a.score);

  const out: string[] = [];
  for (const x of [...fromAnswers, ...marks, ...scored.map((s) => s.lemma)]) {
    if (!x || out.includes(x)) continue;
    out.push(x);
    if (out.length >= 6) break;
  }

  const target = answerText.split(/\s+/).filter(Boolean).length > 8 ? 6 : 4;
  return out.slice(0, Math.max(Math.min(4, out.length), Math.min(target, out.length)));
}

export function buildWritingCues(
  cueTexts: string[],
  segments: Stage10Segment[]
): Stage10Cue[] {
  const answerSeg = segments.find((x) => x.segmentType === "answer_segment");
  return cueTexts.map((text, i) => ({
    id: newCueId(),
    cueOrder: i + 1,
    cueText: text,
    linkedSegmentId: answerSeg?.id ?? null,
    linkedAnswerText: null,
  }));
}

/** 인쇄/미리보기: 고정문 + 단어별 ______ */
export function formatWritingSlotLine(segments: Stage10Segment[]): string {
  const SLOT = "______________";
  return segments
    .map((s) => {
      if (s.segmentType === "fixed_text") return s.fixedText ?? "";
      const raw = s.originalAnswerText ?? "";
      const lead = raw.match(/^\s*/)?.[0] ?? "";
      const trailSpace = raw.match(/\s*$/)?.[0] ?? "";
      const tokens =
        s.answerTokens && s.answerTokens.length > 0
          ? s.answerTokens
          : tokenizeAnswerText(raw);
      if (tokens.length === 0) return `${lead}${SLOT}${trailSpace}`;
      const body = tokens
        .map((t) => {
          const trail = t.match(/[^A-Za-z0-9']+$/)?.[0] ?? "";
          return trail ? `${SLOT}${trail}` : SLOT;
        })
        .join(" ");
      return `${lead}${body}${trailSpace}`;
    })
    .join("");
}

export { lemmaCue as writingLemmaCue };
