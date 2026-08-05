/**
 * 10단계 영작 — 인천 WORKBOOK PDF형
 * 우리말 + 제시어(원형 4~6개) + 고정 구문 + 단어별 ______ 슬롯
 */
import {
  newCueId,
  newSegId,
  tokenizeAnswerText,
  type Stage10Cue,
  type Stage10Segment,
} from "@/lib/exam-prep/stage10-types";
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import { scoreEnglishBlank, englishCore } from "@/lib/exam-prep/blank-importance";

function lemmaCue(answer: string): string {
  const w = answer.toLowerCase().replace(/[^a-z']/g, "");
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
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3 && !w.endsWith("ss")) return w.slice(0, -1);
  return w || answer;
}

/** PDF 고정 구문 (빈칸이 아닌 안내 문구) — 모두 g 플래그 필수 */
const STAGE10_FIXED: RegExp[] = [
  /^To Whom It May Concern:\s*/gim,
  /\bPeople\s+(?=have\b|are\b|will\b)/g,
  /\bSome of\s+/gi,
  /\bEven though it(?:['’]s| is)\s+/gi,
  /\bTo\s+(?=fix\b|solve\b|address\b|prevent\b)/gi,
  /\bin areas of\s+/gi,
  /\bwhere it(?:['’]s| is)\s+/gi,
  /\bin those areas,\s*recently more and more\s+/gi,
  /,\s*recently more and more\s+/gi,
  /\bin those areas\b/gi,
  /\sand\s+(?=at\b)/gi,
  /\sand\s+(?=the\s+situation\b)/gi,
  /\sand\s+(?=insects\b)/gi,
  /\sand\s+(?=supervision\b)/gi,
  /\sand\s+(?=strict\b)/gi,
  /,\s*which\s+/gi,
  /\bwhich\s+/gi,
  /\sof\s+(?=garbage\b|waste\b|illegal\b|our\b)/gi,
  /\bin\s+(?=a\s+)/gi,
  /\bin a\s+/gi,
  /,\s*I\s+/gi,
  /\bdesperately\s+/gi,
  /\bof our neighborhood\.?/gi,
  /\bin the community\.?/gi,
  /\bThank you for your time and consideration\.?/gi,
  /\bSincerely,?\s*/gi,
  /\bJulia Morgan\b/gi,
];

export function buildPdfWritingSegments(english: string): Stage10Segment[] {
  const src = english.trim();
  if (!src) return [];

  type Span = { start: number; end: number };
  const locked: Span[] = [];
  for (const re of STAGE10_FIXED) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      if (m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (locked.some((g) => start < g.end && end > g.start)) continue;
      locked.push({ start, end });
    }
  }
  locked.sort((a, b) => a.start - b.start);

  // 고정 구간이 없으면 앞머리만 고정
  if (locked.length === 0) {
    const words = src.split(/\s+/);
    if (words.length < 4) return [];
    const headN = /^(Even though|Some of|To Whom)/i.test(src) ? 2 : 1;
    const head = words.slice(0, headN).join(" ");
    const rest = words.slice(headN).join(" ");
    return [
      {
        id: newSegId(),
        segmentOrder: 1,
        segmentType: "fixed_text",
        fixedText: `${head} `,
      },
      {
        id: newSegId(),
        segmentOrder: 2,
        segmentType: "answer_segment",
        originalAnswerText: rest,
        answerTokens: tokenizeAnswerText(rest),
        acceptedAnswers: [],
        englishStart: head.length + 1,
        englishEnd: src.length,
        ignoreExtraSpaces: true,
        ignoreTerminalPunctuation: true,
      },
    ];
  }

  const segs: Stage10Segment[] = [];
  let order = 1;
  let cursor = 0;

  const pushFixed = (text: string) => {
    if (!text) return;
    segs.push({
      id: newSegId(),
      segmentOrder: order++,
      segmentType: "fixed_text",
      fixedText: text,
    });
  };
  const pushAnswer = (text: string, start: number, end: number) => {
    if (!text.trim()) {
      // 공백만 있으면 앞 고정에 붙이거나 유지
      if (text && segs.length > 0) {
        const last = segs[segs.length - 1]!;
        if (last.segmentType === "fixed_text") {
          last.fixedText = `${last.fixedText ?? ""}${text}`;
          return;
        }
      }
      return;
    }
    segs.push({
      id: newSegId(),
      segmentOrder: order++,
      segmentType: "answer_segment",
      originalAnswerText: text,
      answerTokens: tokenizeAnswerText(text),
      acceptedAnswers: [],
      englishStart: start,
      englishEnd: end,
      ignoreExtraSpaces: true,
      ignoreTerminalPunctuation: true,
    });
  };

  for (const g of locked) {
    if (cursor < g.start) pushAnswer(src.slice(cursor, g.start), cursor, g.start);
    pushFixed(src.slice(g.start, g.end));
    cursor = g.end;
  }
  if (cursor < src.length) pushAnswer(src.slice(cursor), cursor, src.length);

  return segs.some((s) => s.segmentType === "answer_segment") ? segs : [];
}

/** 제시어: 어휘 마크 우선, 없으면 빈칸 구간 핵심어 원형 4~6개 */
export function pickWritingCueTexts(
  english: string,
  vocabulary: unknown,
  answerText: string
): string[] {
  const marks = parseVocabMarks(vocabulary);
  const fromMarks = marks
    .map((m) => lemmaCue(m.englishText))
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  const pool = `${answerText} ${english}`;
  const scored = pool
    .split(/\s+/)
    .map((w) => {
      const core = englishCore(w);
      return { core, score: scoreEnglishBlank(w), lemma: lemmaCue(core) };
    })
    .filter((x) => x.score > 0 && x.lemma.length >= 3)
    .sort((a, b) => b.score - a.score);

  const out: string[] = [...fromMarks];
  for (const s of scored) {
    if (out.includes(s.lemma)) continue;
    out.push(s.lemma);
    if (out.length >= 6) break;
  }

  const target = answerText.split(/\s+/).filter(Boolean).length > 14 ? 6 : 4;
  return out.slice(0, Math.max(4, Math.min(target, out.length)));
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
