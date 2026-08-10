/**
 * 10단계 영작 — 인천 WORKBOOK PDF형
 * 우리말 + 제시어(원형, 등장 순서) + 고정 골격 + 내용어 ______ 슬롯
 *
 * PDF 예:
 *   dump, waste, neighborhood, permit
 *   To Whom…: People ____ ____ ____ ____ ____ in areas of ____ ____ where it’s ____ ____.
 */
import {
  englishCore,
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
  if (/(?:ss|sh|ch|x|z)es$/i.test(w) && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3 && !w.endsWith("ss") && !/(us|is|os|ss)$/i.test(w)) {
    return w.slice(0, -1);
  }
  return w || answer;
}

/** PDF에서 남겨 두는 골격·담화 구 (빈칸 아님) */
const STAGE10_FIXED: RegExp[] = [
  /^To Whom It May Concern:\s*/gim,
  /\bPeople\s+(?=have\b|are\b|will\b|can\b)/g,
  /\bSome of\s+/gi,
  /\bin areas of\s+/gi,
  /\bwhere it(?:['’]s| is)\s+/gi,
  /\bEven though it(?:['’]s| is)\s+/gi,
  /\bin those areas,\s*recently more and more\s+/gi,
  /,\s*recently more and more\s+/gi,
  /\brecently more and more\s+/gi,
  /\bin those areas\b/gi,
  /\band at\s+/gi,
  /\bin the community\.?/gi,
  /\bin a disgusting state\.?/gi,
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
  /\bFor a long time,\s*/gi,
  /\bUnlike the empty ocean,\s*/gi,
  /\bThere seemed\s+/gi,
  /\bUnder the rising sun,\s*/gi,
  /\bBelow the light\s+/gi,
  /\bThen\s+(?=something\b)/gi,
  /\bmonths after\s+/gi,
  /\band Steller\s+/gi,
  /\bwith the thought that\s+/gi,
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

function overlaps(tok: Tok, spans: CharSpan[]): boolean {
  return spans.some((g) => tok.start < g.end && tok.end > g.start);
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
 * PDF형: 고정 골격만 남기고 나머지 내용어를 ______ 로.
 * 고정 구가 없으면 앞 1~2어절만 고정.
 */
export function buildPdfWritingSegments(english: string): Stage10Segment[] {
  const src = english.trim();
  if (!src) return [];

  const toks = tokenizeWithPos(src);
  if (toks.length < 2) return [];

  let fixedSpans = collectRegexSpans(src, STAGE10_FIXED);

  // 고정이 너무 없으면 머리만 고정 (전체 통째 blank 방지)
  if (fixedSpans.length === 0) {
    const headN = Math.min(2, Math.max(1, Math.floor(toks.length * 0.15)));
    if (headN < toks.length) {
      fixedSpans = [{ start: 0, end: toks[headN]!.start }];
    } else {
      fixedSpans = [{ start: 0, end: toks[0]!.end }];
    }
  }

  const blankIdx = new Set<number>();
  for (const t of toks) {
    if (!overlaps(t, fixedSpans)) blankIdx.add(t.index);
  }
  if (blankIdx.size < 2) {
    for (const t of toks) {
      if (scoreEnglishBlank(t.text) > 0) blankIdx.add(t.index);
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
      const to = j < toks.length ? toks[j]!.start : src.length;
      pushFixed(segs, src.slice(runStart, to), order);
      cursor = to;
    }
    i = j;
  }
  if (cursor < src.length) pushFixed(segs, src.slice(cursor), order);

  return segs.some((s) => s.segmentType === "answer_segment") ? segs : [];
}

const CUE_STOP = new Set(
  "a an the of to in on at for with from by into onto upon over under and or but so as if than then it its this that these those their our my your his her not".split(
    " "
  )
);

/** 제시어: 빈칸에 등장하는 핵심 원형을 **문장 등장 순서**로 4~6개 */
export function pickWritingCueTexts(
  english: string,
  vocabulary: unknown,
  answerText: string
): string[] {
  const marks = parseVocabMarks(vocabulary)
    .map((m) => lemmaCue(m.englishText))
    .filter((v) => v.length >= 3 && !CUE_STOP.has(v));

  const blankTokens = tokenizeAnswerText(answerText);
  const ordered: string[] = [];
  for (const t of blankTokens) {
    const core = englishCore(t);
    const lemma = lemmaCue(core || t);
    if (!lemma || lemma.length < 3 || CUE_STOP.has(lemma)) continue;
    if (scoreEnglishBlank(t) <= 0 && !marks.includes(lemma)) continue;
    if (ordered.includes(lemma)) continue;
    ordered.push(lemma);
  }

  for (const m of marks) {
    if (!ordered.includes(m) && english.toLowerCase().includes(m.slice(0, 4))) {
      ordered.push(m);
    }
  }

  const target = blankTokens.length > 10 ? 6 : blankTokens.length > 6 ? 5 : 4;
  return ordered.slice(0, Math.min(6, Math.max(3, target)));
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
