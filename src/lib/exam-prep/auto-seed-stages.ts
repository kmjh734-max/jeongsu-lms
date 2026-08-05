/**
 * 인천 10단계 WORKBOOK PDF + 어법 카탈로그 기준 규칙 시드.
 * 영어 원문은 수정하지 않는다. (7단계만 표시문에 오류 삽입)
 */
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import {
  blankPickCount,
  pickSpreadByScore,
  scoreEnglishBlank,
  scoreKoreanBlank,
} from "@/lib/exam-prep/blank-importance";
import type { BlankDraft } from "@/lib/exam-prep/stage2-types";
import type { Stage3BlankDraft } from "@/lib/exam-prep/stage3-types";
import type { Stage5ItemDraft } from "@/lib/exam-prep/stage5-types";
import type { Stage6ItemDraft } from "@/lib/exam-prep/stage6-types";
import type { Stage7CandidateDraft } from "@/lib/exam-prep/stage7-types";
import {
  newChunkId,
  type Stage8Chunk,
  type Stage8GroupDraft,
} from "@/lib/exam-prep/stage8-types";
import type { Stage9ConfigDraft } from "@/lib/exam-prep/stage9-types";
import {
  newCueId,
  newSegId,
  proposeFullSentenceSegments,
  tokenizeAnswerText,
  type Stage10ItemDraft,
  type Stage10Segment,
} from "@/lib/exam-prep/stage10-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";
import { GRAMMAR_UNIT_BANKS } from "@/lib/question-generator/grammar-catalog";

const EN_STOP = new Set(
  `the a an of to in on for and or is are was were be been being it this that with as by from at have has had do does did will would can could may might should not but so if than then into over under about their its his her our your my we you they he she i am`.split(
    " "
  )
);

/** -ing/-ed 이지만 동사형 연습 대상이 아닌 단어 */
const NON_VERB_FORM = new Set(
  [
    "during",
    "something",
    "nothing",
    "everything",
    "anything",
    "according",
    "including",
    "regarding",
    "concerning",
    "morning",
    "evening",
    "building",
    "ceiling",
    "feeling",
    "meaning",
    "warning",
    "housing",
    "meeting",
    "wedding",
    "shopping",
    "cooking",
    "reading",
    "writing",
    "learning",
    "understanding",
    "interesting",
    "exciting",
    "amazing",
    "following",
    "remaining",
    "existing",
    "outstanding",
    "united",
    "related",
    "limited",
    "detailed",
    "crowded",
    "needed", // handled via multi-word "desperately needed"
  ].map((w) => w.toLowerCase())
);

/** PDF·어법책 형태 쌍 — 정답이 문장에 있을 때 [정답 / 오답] */
const CHOICE_PLANTS: Array<{
  correct: RegExp;
  wrong: string;
  category: "grammar" | "vocabulary";
  sub: string;
}> = [
  // PDF 18번 예시
  { correct: /\bbeen dumping\b/i, wrong: "been dumped", category: "grammar", sub: "voice" },
  { correct: /\bbeen leaving\b/i, wrong: "been left", category: "grammar", sub: "voice" },
  { correct: /\bare leaving\b/i, wrong: "are left", category: "grammar", sub: "voice" },
  { correct: /\battracts\b/i, wrong: "is attracted", category: "grammar", sub: "voice" },
  { correct: /\bis desperately needed\b/i, wrong: "is desperate needed", category: "grammar", sub: "adverb" },
  { correct: /\bdesperately\b/i, wrong: "desperate", category: "grammar", sub: "adjective_adverb" },
  { correct: /\bwhere\b/i, wrong: "that", category: "grammar", sub: "relative_adverb" },
  { correct: /\bwhich has\b/i, wrong: "that have", category: "grammar", sub: "relative_pronoun" },
  { correct: /\bwhich\b/i, wrong: "that", category: "grammar", sub: "relative_pronoun" },
  { correct: /\bto strengthen\b/i, wrong: "strengthening", category: "grammar", sub: "infinitive" },
  { correct: /\billegal\b/i, wrong: "illegally", category: "grammar", sub: "adjective_adverb" },
  { correct: /\bgrowing\b/i, wrong: "declining", category: "vocabulary", sub: "increase_decrease" },
  { correct: /\bstrengthen\b/i, wrong: "weaken", category: "vocabulary", sub: "strengthen_weaken" },
  { correct: /\bworse\b/i, wrong: "better", category: "vocabulary", sub: "opposite_meaning" },
  { correct: /\billegal\b/i, wrong: "legal", category: "vocabulary", sub: "opposite_meaning" },
  { correct: /\bpermitted\b/i, wrong: "prevented", category: "vocabulary", sub: "similar_spelling" },
  { correct: /\bgarbage\b/i, wrong: "garage", category: "vocabulary", sub: "similar_spelling" },
  { correct: /\bdisgusting\b/i, wrong: "disgusted", category: "grammar", sub: "participle" },
  { correct: /\bConsistent\b/, wrong: "Inconsistent", category: "vocabulary", sub: "opposite_meaning" },
  { correct: /\bmore and more\b/i, wrong: "less and less", category: "vocabulary", sub: "increase_decrease" },
  { correct: /\bleaving\b/i, wrong: "left", category: "grammar", sub: "verb_form" },
  { correct: /\bhas left\b/i, wrong: "have left", category: "grammar", sub: "subject_verb_agreement" },
  // 어법 카탈로그 고빈도 쌍
  { correct: /\bwho\b/i, wrong: "which", category: "grammar", sub: "relative_pronoun" },
  { correct: /\bwhom\b/i, wrong: "who", category: "grammar", sub: "relative_pronoun" },
  { correct: /\bwhose\b/i, wrong: "who's", category: "grammar", sub: "relative_pronoun" },
  { correct: /\bwhat\b/i, wrong: "that", category: "grammar", sub: "relative_pronoun" },
  { correct: /\bbecause\b/i, wrong: "because of", category: "grammar", sub: "conjunction_preposition" },
  { correct: /\balthough\b/i, wrong: "despite", category: "grammar", sub: "conjunction_preposition" },
  { correct: /\bdespite\b/i, wrong: "although", category: "grammar", sub: "conjunction_preposition" },
  { correct: /\bduring\b/i, wrong: "while", category: "grammar", sub: "conjunction_preposition" },
  { correct: /\bwhile\b/i, wrong: "during", category: "grammar", sub: "conjunction_preposition" },
  { correct: /\binterested\b/i, wrong: "interesting", category: "grammar", sub: "participle" },
  { correct: /\binteresting\b/i, wrong: "interested", category: "grammar", sub: "participle" },
  { correct: /\bsurprised\b/i, wrong: "surprising", category: "grammar", sub: "participle" },
  { correct: /\bsurprising\b/i, wrong: "surprised", category: "grammar", sub: "participle" },
  { correct: /\bhardly\b/i, wrong: "hard", category: "grammar", sub: "adjective_adverb" },
  { correct: /\blate\b/i, wrong: "lately", category: "grammar", sub: "adjective_adverb" },
  { correct: /\bnearly\b/i, wrong: "near", category: "grammar", sub: "adjective_adverb" },
];

/** 7단계 오류 심기: PDF 우선 (where→which, which→that, to strengthen→strengthening) */
const STAGE7_PLANTS: Array<[RegExp, string, string, string]> = [
  [/\bwhere\b/i, "which", "where", "relative_adverb"],
  [/\bwhich has\b/i, "that has", "which has", "relative_pronoun"],
  [/\bwhich\b/i, "that", "which", "relative_pronoun"],
  [/\bto strengthen\b/i, "strengthening", "to strengthen", "infinitive"],
  [/\bwho\b/i, "which", "who", "relative_pronoun"],
  [/\bwhom\b/i, "who", "whom", "relative_pronoun"],
  [/\bis desperately\b/i, "are desperately", "is desperately", "subject_verb_agreement"],
  [/\battracts\b/i, "attract", "attracts", "subject_verb_agreement"],
  [/\bhave been\b/i, "has been", "have been", "subject_verb_agreement"],
  [/\bare leaving\b/i, "is leaving", "are leaving", "subject_verb_agreement"],
];

export type SeedSentence = Pick<
  ExamPassageSentence,
  | "id"
  | "english_text"
  | "korean_text"
  | "sentence_order"
  | "paragraph_number"
  | "vocabulary"
  | "is_important_writing"
>;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSpan(
  haystack: string,
  needle: string,
  from = 0
): { start: number; end: number } | null {
  if (!needle) return null;
  const start = haystack.indexOf(needle, from);
  if (start < 0) return null;
  return { start, end: start + needle.length };
}

function findSpanCi(haystack: string, needle: string): { start: number; end: number; text: string } | null {
  if (!needle) return null;
  const re = new RegExp(escapeRe(needle), "i");
  const m = haystack.match(re);
  if (!m || m.index == null) return null;
  return { start: m.index, end: m.index + m[0].length, text: m[0] };
}

function contentEnglishTokens(english: string): string[] {
  return english
    .replace(/["""'']/g, "")
    .split(/\s+/)
    .map((t) => t.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ""))
    .filter((t) => t.length >= 4 && !EN_STOP.has(t.toLowerCase()));
}

function lemmaCue(answer: string): string {
  const w = answer.toLowerCase().replace(/[^a-z']/g, "");
  if (w === "been" || w === "being" || w === "is" || w === "are" || w === "was" || w === "were") {
    return "be";
  }
  if (w === "has" || w === "had" || w === "have") return "have";
  if (w === "does" || w === "did" || w === "done" || w === "doing") return "do";
  if (w === "thanks" || w === "thanked" || w === "thanking") return "thank";
  if (w === "left") return "leave";
  if (w === "made") return "make";
  if (w === "taken") return "take";
  if (w === "given") return "give";
  if (w === "seen") return "see";
  if (w === "gone") return "go";
  if (w === "come" || w === "came") return "come";
  if (w.endsWith("ying") && w.length > 5) return `${w.slice(0, -4)}y`;
  if (w.endsWith("ing") && w.length > 5) {
    const base = w.slice(0, -3);
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    // leaving → leave, having → have
    if (base.endsWith("v")) return `${base}e`;
    return base;
  }
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ed") && w.length > 4) {
    const base = w.slice(0, -2);
    if (base.endsWith("i")) return `${base.slice(0, -1)}y`;
    // permitted → permit, stopped → stop
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

const WEAK_CHOICE_WORD = new Set(
  "a an the is are was were be been being have has had do does did will would can could may might should my mine your yours his her hers its our ours their theirs i we you they he she it them this that these those and or but not".split(
    " "
  )
);

function overlaps(
  used: Array<{ a: number; b: number }>,
  start: number,
  end: number
) {
  return used.some((u) => start < u.b && end > u.a);
}

/** 어법 카탈로그 pairForms → [a/b] 후보 */
function catalogChoicePlants(): typeof CHOICE_PLANTS {
  const out: typeof CHOICE_PLANTS = [];
  const seen = new Set<string>();
  for (const unit of GRAMMAR_UNIT_BANKS) {
    for (const c of unit.cases) {
      for (const group of c.pairForms.split("·")) {
        const parts = group.split("/").map((p) => p.trim()).filter(Boolean);
        if (parts.length !== 2) continue;
        const [a, b] = parts;
        if (!a || !b || a.length < 2 || b.length < 2) continue;
        if (/\s{2,}/.test(a) || a.length > 40) continue;
        // 닫힌 어휘만의 is/are·have/has 등은 워크북 [a/b]로 약함
        if (
          !a.includes(" ") &&
          !b.includes(" ") &&
          WEAK_CHOICE_WORD.has(a.toLowerCase()) &&
          WEAK_CHOICE_WORD.has(b.toLowerCase())
        ) {
          continue;
        }
        const key = `${a.toLowerCase()}|${b.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const sub = unit.key;
        out.push({
          correct: new RegExp(`\\b${escapeRe(a)}\\b`, "i"),
          wrong: b,
          category: "grammar",
          sub,
        });
        const key2 = `${b.toLowerCase()}|${a.toLowerCase()}`;
        if (!seen.has(key2)) {
          seen.add(key2);
          out.push({
            correct: new RegExp(`\\b${escapeRe(b)}\\b`, "i"),
            wrong: a,
            category: "grammar",
            sub,
          });
        }
      }
    }
  }
  return out;
}

const ALL_CHOICE_PLANTS: typeof CHOICE_PLANTS = [
  ...CHOICE_PLANTS,
  ...catalogChoicePlants(),
];

/** 2단계: 중요 어휘·표현을 문장 전반에 분산 */
export function buildStage2Drafts(sentences: SeedSentence[]): BlankDraft[] {
  const drafts: BlankDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const korean = String(s.korean_text ?? "");
    if (!korean.trim()) continue;
    const marks = parseVocabMarks(s.vocabulary);
    const used: Array<{ a: number; b: number }> = [];
    const wordEntries: Array<{ text: string; start: number; end: number; index: number }> = [];
    let cursor = 0;
    let wi = 0;
    for (const part of korean.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        cursor += part.length;
        continue;
      }
      wordEntries.push({
        text: part,
        start: cursor,
        end: cursor + part.length,
        index: wi++,
      });
      cursor += part.length;
    }

    const maxPerSentence = blankPickCount(Math.max(wordEntries.length, 1), "medium", {
      max: 5,
    });

    // 1) 어휘 마크 — 위치 분산
    const markCands = marks
      .map((m) => {
        const needle = (m.koreanText || "").trim();
        if (!needle || needle.length < 2) return null;
        const span = findSpan(korean, needle);
        if (!span) return null;
        const wIdx =
          wordEntries.find((w) => w.start <= span.start && span.end <= w.end)?.index ??
          wordEntries.findIndex((w) => w.text.includes(needle));
        return {
          mark: m,
          span,
          index: wIdx >= 0 ? wIdx : 0,
          score: 20 + needle.length,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const pickedMarks = pickSpreadByScore(markCands, maxPerSentence);
    for (const p of pickedMarks) {
      if (overlaps(used, p.span.start, p.span.end)) continue;
      used.push({ a: p.span.start, b: p.span.end });
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: p.mark.koreanText.trim(),
        accepted_answers: [],
        korean_start: p.span.start,
        korean_end: p.span.end,
        linked_vocabulary_mark_id: p.mark.id,
        linked_english_text: p.mark.englishText || null,
        hint: p.mark.meaning || null,
        is_required: true,
      });
    }

    // 2) 부족하면 중요 우리말 분산 보충
    if (used.length < Math.min(2, maxPerSentence)) {
      const scored = wordEntries
        .map((w) => ({
          ...w,
          score: scoreKoreanBlank(w.text),
        }))
        .filter((w) => w.score > 0 && !overlaps(used, w.start, w.end));
      const need = maxPerSentence - used.length;
      for (const p of pickSpreadByScore(scored, need)) {
        if (overlaps(used, p.start, p.end)) continue;
        used.push({ a: p.start, b: p.end });
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: p.text.replace(/[.,!?;:'"()\-]+$/g, ""),
          accepted_answers: [],
          korean_start: p.start,
          korean_end: p.end,
          is_required: true,
        });
      }
    }
  }
  return drafts;
}

/** 3단계: 중요 영어 어휘·표현을 문장 전반에 분산 */
export function buildStage3Drafts(sentences: SeedSentence[]): Stage3BlankDraft[] {
  const drafts: Stage3BlankDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    if (!english.trim()) continue;
    const marks = parseVocabMarks(s.vocabulary);
    const used: Array<{ a: number; b: number }> = [];

    const wordEntries: Array<{ text: string; start: number; end: number; index: number }> = [];
    let cursor = 0;
    let wi = 0;
    for (const part of english.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        cursor += part.length;
        continue;
      }
      wordEntries.push({
        text: part,
        start: cursor,
        end: cursor + part.length,
        index: wi++,
      });
      cursor += part.length;
    }

    const maxPerSentence = blankPickCount(Math.max(wordEntries.length, 1), "medium", {
      max: 5,
    });

    const markCands = marks
      .map((m) => {
        const needle = (m.englishText || "").trim();
        if (!needle || needle.length < 3) return null;
        const span = findSpanCi(english, needle);
        if (!span) return null;
        const wIdx =
          wordEntries.find((w) => w.start <= span.start && span.end <= w.end)?.index ??
          wordEntries.findIndex((w) =>
            w.text.toLowerCase().includes(needle.toLowerCase().split(/\s+/)[0]!)
          );
        return {
          mark: m,
          span,
          index: wIdx >= 0 ? wIdx : 0,
          score: 20 + needle.length,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    for (const p of pickSpreadByScore(markCands, maxPerSentence)) {
      if (overlaps(used, p.span.start, p.span.end)) continue;
      used.push({ a: p.span.start, b: p.span.end });
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: p.span.text,
        accepted_answers: [],
        english_start: p.span.start,
        english_end: p.span.end,
        selected_text: p.span.text,
        linked_vocabulary_mark_id: p.mark.id,
        linked_korean_text: p.mark.koreanText || null,
        is_required: true,
      });
    }

    if (used.length < Math.min(2, maxPerSentence)) {
      const scored = wordEntries
        .map((w) => ({
          ...w,
          score: scoreEnglishBlank(w.text),
        }))
        .filter((w) => w.score > 0 && !overlaps(used, w.start, w.end));
      const need = maxPerSentence - used.length;
      for (const p of pickSpreadByScore(scored, need)) {
        if (overlaps(used, p.start, p.end)) continue;
        used.push({ a: p.start, b: p.end });
        const answer = p.text.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") || p.text;
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: answer,
          accepted_answers: [],
          english_start: p.start,
          english_end: p.end,
          selected_text: p.text,
          is_required: true,
        });
      }
    }
  }
  return drafts;
}

type VerbHit = {
  start: number;
  end: number;
  answer: string;
  cues: string[];
  category: string;
};

/** 동사구·준동사·분사형 — PDF처럼 문장당 여러 빈칸 */
function findVerbHits(english: string): VerbHit[] {
  const hits: VerbHit[] = [];
  const used: Array<{ a: number; b: number }> = [];
  const push = (start: number, end: number, cues: string[], category: string) => {
    if (overlaps(used, start, end)) return;
    const answer = english.slice(start, end);
    if (!answer.trim()) return;
    used.push({ a: start, b: end });
    hits.push({ start, end, answer, cues, category });
  };

  const patterns: Array<{
    re: RegExp;
    cues: (m: RegExpExecArray) => string[];
    cat: string;
    skip?: (m: RegExpExecArray, full: string) => boolean;
  }> = [
    {
      re: /\b((?:have|has|had)\s+been\s+\w+ing)\b/gi,
      cues: (m) => {
        const parts = m[1]!.split(/\s+/);
        return ["have", "be", lemmaCue(parts[parts.length - 1]!)];
      },
      cat: "perfect_progressive",
    },
    {
      re: /\b((?:have|has|had)\s+(?:\w+(?:ed|en|n)|left|made|done|gone|seen|taken|given|been|come|become|built|felt|kept|lost|meant|met|paid|put|read|said|sent|set|shown|sold|spent|stood|taught|thought|told|understood|won|written))\b/gi,
      cues: (m) => {
        const parts = m[1]!.split(/\s+/);
        return ["have", lemmaCue(parts[1]!)];
      },
      cat: "present_perfect",
    },
    {
      // PDF: it (be) illegal
      re: /\b(it(?:['’]s| is))\b(?=\s+(?:illegal|legal|important|necessary|possible|clear|true|false))/gi,
      cues: () => ["be"],
      cat: "linking_be",
    },
    {
      re: /\b((?:is|are|was|were)\s+(?:not\s+)?\w+ing)\b/gi,
      cues: (m) => {
        const parts = m[1]!.replace(/\bnot\b/i, "").trim().split(/\s+/);
        return ["be", lemmaCue(parts[parts.length - 1]!)];
      },
      cat: "present_progressive",
    },
    {
      re: /\b((?:is|are|was|were)\s+\w+ly\s+\w+ed)\b/gi,
      cues: (m) => {
        const parts = m[1]!.split(/\s+/);
        return [lemmaCue(parts[1]!), lemmaCue(parts[2]!)];
      },
      cat: "passive_voice",
    },
    {
      re: /\b((?:is|are|was|were)\s+\w+ed)\b/gi,
      cues: (m) => {
        const parts = m[1]!.split(/\s+/);
        return ["be", lemmaCue(parts[1]!)];
      },
      cat: "passive_voice",
    },
    {
      // PDF: it (not, permit) ← it's not permitted
      re: /\b(it(?:['’]s| is)\s+not\s+\w+ed)\b/gi,
      cues: (m) => {
        const last = m[1]!.split(/\s+/).pop()!;
        return ["not", lemmaCue(last)];
      },
      cat: "passive_voice",
    },
    {
      re: /\b(to\s+[a-z]+)\b/g,
      cues: (m) => [lemmaCue(m[1]!.replace(/^to\s+/i, ""))],
      cat: "infinitive",
      skip: (m) => {
        const verb = m[1]!.replace(/^to\s+/i, "");
        // To Whom / To Fix(대문자 문두 제외는 아래 별도) — 전치사+고유명사 스킵
        if (/^[A-Z]/.test(verb) && verb !== "Fix") return true;
        if (/^(whom|which|whose|where|what|this|that|these|those|the|a|an)$/i.test(verb)) {
          return true;
        }
        return false;
      },
    },
  ];

  for (const p of patterns) {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(english)) !== null) {
      if (m.index == null) continue;
      if (p.skip?.(m, english)) continue;
      push(m.index, m.index + m[0].length, p.cues(m), p.cat);
    }
  }

  // PDF: (Fix) this (grow) … / (Thank) you …
  const leadVerb = /\b(To\s+fix|Thank)\b/g;
  let lm: RegExpExecArray | null;
  while ((lm = leadVerb.exec(english)) !== null) {
    if (lm.index == null) continue;
    push(lm.index, lm.index + lm[0].length, [lemmaCue(lm[1]!.replace(/^To\s+/i, ""))], "infinitive");
  }

  // 단독 정동사 / 분사형 (형용사·명사 오탐 최소화)
  const FINITE =
    /\b(attracts?|urges?|leaves?|needs?|gets?|fixes?|grows?|dumps?|permits?|thanks?|protects?|strengthens?|weakens?|makes?|takes?|gives?|comes?|goes?|seems?|appears?|becomes?|remains?|keeps?|helps?|shows?|provides?|requires?|suggests?|causes?|creates?|allows?|prevents?|reduces?|increases?|improves?|supports?|includes?|contains?|offers?|asks?|tells?|says?|thinks?|knows?|feels?|wants?|tries?|begins?|starts?|ends?|continues?|happens?|occurs?)\b/gi;
  let fm: RegExpExecArray | null;
  while ((fm = FINITE.exec(english)) !== null) {
    if (fm.index == null) continue;
    const w = fm[1]!;
    push(fm.index, fm.index + w.length, [lemmaCue(w)], "finite_verb");
  }

  const participle =
    /\b([A-Za-z]+(?:ing|ed))\b/g;
  let pm: RegExpExecArray | null;
  while ((pm = participle.exec(english)) !== null) {
    if (pm.index == null) continue;
    const w = pm[1]!;
    const low = w.toLowerCase();
    if (EN_STOP.has(low) || NON_VERB_FORM.has(low)) continue;
    if (/^(being|been)$/i.test(w)) continue;
    // 관사/형용사 뒤 분사 수식 (a disgusting state / this growing problem / illegal dumping)
    const before = english.slice(Math.max(0, pm.index - 12), pm.index);
    const after = english.slice(pm.index + w.length, pm.index + w.length + 12);
    const looksLikeModifier =
      /\b(a|an|the|this|that|these|those|illegal|large|strict)\s+$/i.test(before) ||
      /^\s+(problem|state|situation|issue|dumping|waste|garbage|people|animals)\b/i.test(
        after
      );
    const looksLikeGerundObject = /\bof\s+$/i.test(before) && /ing$/i.test(w);
    if (!looksLikeModifier && !looksLikeGerundObject) continue;
    push(pm.index, pm.index + w.length, [lemmaCue(w)], "participle");
  }

  return hits.sort((a, b) => a.start - b.start);
}

export function buildStage5Drafts(sentences: SeedSentence[]): Stage5ItemDraft[] {
  const drafts: Stage5ItemDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    const hits = findVerbHits(english);
    for (const h of hits) {
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: h.answer,
        accepted_answers: [],
        english_start: h.start,
        english_end: h.end,
        selected_text: h.answer,
        cue_words: [...new Set(h.cues.map((c) => c.toLowerCase()).filter(Boolean))],
        grammar_category: [h.category],
        is_required: true,
      });
    }
  }
  return drafts;
}

/** 6단계: 문장 안 [a / b] 두 선택지 (어법·어휘) */
export function buildStage6Drafts(sentences: SeedSentence[]): Stage6ItemDraft[] {
  const drafts: Stage6ItemDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    const used: Array<{ a: number; b: number }> = [];
    let added = 0;

    for (const plant of ALL_CHOICE_PLANTS) {
      if (added >= 4) break;
      plant.correct.lastIndex = 0;
      const m = plant.correct.exec(english);
      if (!m || m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (overlaps(used, start, end)) continue;
      const answer = m[0];
      if (answer.toLowerCase() === plant.wrong.toLowerCase()) continue;
      // 단독 조동사·대명사 [is/are] 류는 워크북 품질이 낮아 제외 (where/which 등은 유지)
      if (
        !answer.includes(" ") &&
        WEAK_CHOICE_WORD.has(answer.toLowerCase()) &&
        WEAK_CHOICE_WORD.has(plant.wrong.toLowerCase().split(/\s+/)[0]!)
      ) {
        continue;
      }
      used.push({ a: start, b: end });
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: answer,
        english_start: start,
        english_end: end,
        selected_text: answer,
        choice_options: [
          { id: `opt-c-${order}-0`, text: answer, isCorrect: true },
          { id: `opt-w-${order}-1`, text: plant.wrong, isCorrect: false },
        ],
        question_category: plant.category,
        grammar_subcategory: plant.category === "grammar" ? [plant.sub] : [],
        vocabulary_subcategory: plant.category === "vocabulary" ? [plant.sub] : [],
        shuffle_options: true,
        is_required: true,
      });
      added += 1;
    }

    // 부족하면 어휘 마크 기반 [원형 / 형태 변형]
    if (added < 1) {
      const marks = parseVocabMarks(s.vocabulary);
      for (const m of marks.slice(0, 2)) {
        const span = findSpanCi(english, m.englishText);
        if (!span || overlaps(used, span.start, span.end)) continue;
        used.push({ a: span.start, b: span.end });
        const answer = span.text;
        const wrong = answer.toLowerCase().endsWith("ing")
          ? answer.replace(/ing$/i, "ed")
          : answer.toLowerCase().endsWith("ed")
            ? `${answer.slice(0, -2)}ing`
            : `${answer}s`;
        if (wrong.toLowerCase() === answer.toLowerCase()) continue;
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: answer,
          english_start: span.start,
          english_end: span.end,
          selected_text: answer,
          choice_options: [
            { id: `opt-c-${order}-0`, text: answer, isCorrect: true },
            { id: `opt-w-${order}-1`, text: wrong, isCorrect: false },
          ],
          question_category: "vocabulary",
          grammar_subcategory: [],
          vocabulary_subcategory: ["word_form"],
          shuffle_options: true,
          is_required: true,
        });
        added += 1;
      }
    }
  }
  return drafts;
}

export function buildStage7Seed(sentences: SeedSentence[]): {
  displays: Array<{ sentenceId: string; stage7DisplayText: string }>;
  candidates: Stage7CandidateDraft[];
  requiredErrorCount: number;
} {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const displayMap = new Map<string, string>();
  for (const s of ordered) {
    displayMap.set(s.id, String(s.english_text ?? ""));
  }

  const candidates: Stage7CandidateDraft[] = [];
  let order = 1;
  const targetErrors = 3;
  const usedSentenceErrors = new Set<string>();

  // 1차: PDF·우선 패턴을 지문 전체에서 최대 3개 심기
  for (const [re, wrong, correct, cat] of STAGE7_PLANTS) {
    if (candidates.filter((c) => c.is_error).length >= targetErrors) break;
    for (const s of ordered) {
      if (candidates.filter((c) => c.is_error).length >= targetErrors) break;
      if (usedSentenceErrors.has(s.id)) continue;
      let display = displayMap.get(s.id) ?? "";
      const m = display.match(re);
      if (!m || m.index == null) continue;
      // where→which 후 which→that 이 같은 문장에 겹치지 않게
      const matched = m[0];
      let replacement = wrong;
      if (
        matched[0] === matched[0]!.toUpperCase() &&
        matched[0] !== matched[0]!.toLowerCase()
      ) {
        replacement = wrong[0]!.toUpperCase() + wrong.slice(1);
      }
      display =
        display.slice(0, m.index) +
        replacement +
        display.slice(m.index + matched.length);
      displayMap.set(s.id, display);
      candidates.push({
        sentence_id: s.id,
        blank_order: order++,
        english_start: m.index,
        english_end: m.index + replacement.length,
        displayed_text: replacement,
        is_error: true,
        correction_text: matched,
        accepted_corrections: [matched, correct],
        error_subcategory: [cat],
      });
      usedSentenceErrors.add(s.id);
      break;
    }
  }

  // 2차: 오류 없는 문장에 함정 밑줄
  for (const s of ordered) {
    const display = displayMap.get(s.id) ?? "";
    if (usedSentenceErrors.has(s.id)) continue;
    const tok = contentEnglishTokens(display).find(
      (t) => !/^(which|that|where|who)$/i.test(t)
    );
    if (!tok) continue;
    const span = findSpanCi(display, tok);
    if (!span) continue;
    candidates.push({
      sentence_id: s.id,
      blank_order: order++,
      english_start: span.start,
      english_end: span.end,
      displayed_text: span.text,
      is_error: false,
      correction_text: "",
      accepted_corrections: [],
      error_subcategory: [],
    });
  }

  const errorCount = candidates.filter((c) => c.is_error).length;
  return {
    displays: ordered.map((s) => ({
      sentenceId: s.id,
      stage7DisplayText: displayMap.get(s.id) ?? "",
    })),
    candidates,
    requiredErrorCount: Math.max(1, Math.min(3, errorCount || 1)),
  };
}

/** PDF형 어구 카드 — 긴 구를 우선 묶고 나머지를 1~2어절로 */
function phraseChunks(text: string): Stage8Chunk[] {
  const trimmed = text.trim().replace(/[,;:.!?]+$/u, "");
  if (!trimmed) return [];

  const MULTI: RegExp[] = [
    /\beven though\b/gi,
    /\bmore and more\b/gi,
    /\bnot permitted\b/gi,
    /\bin areas of\b/gi,
    /\bour neighborhood\b/gi,
    /\bstreet corners\b/gi,
    /\bbus stops\b/gi,
    /\bthe large buildup of\b/gi,
    /\banimals and insects\b/gi,
    /\bmanagement and supervision\b/gi,
    /\bin the community\b/gi,
    /\bof our neighborhood\b/gi,
    /\bthe cleanliness\b/gi,
    /\bdesperately needed\b/gi,
    /\bto protect\b/gi,
    /\band strict\b/gi,
    /\bsome of\b/gi,
    /\bmy neighbors\b/gi,
    /\btheir garbage\b/gi,
    /\btheir waste\b/gi,
    /\bto leave\b/gi,
    /\bin those areas\b/gi,
    /\bthe situation\b/gi,
    /\bare doing\b/gi,
    /\bis getting\b/gi,
    /\bhas left\b/gi,
    /\bin a\b/gi,
    /\bto fix\b/gi,
    /\bthis growing problem\b/gi,
    /\bgrowing problem\b/gi,
    /\billegal dumping\b/gi,
    /\bon street corners\b/gi,
    /\band at\b/gi,
    /\bThank you for your time and consideration\b/gi,
  ];

  type Span = { start: number; end: number; text: string };
  const locked: Span[] = [];
  for (const re of MULTI) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(trimmed)) !== null) {
      if (m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (locked.some((u) => start < u.end && end > u.start)) continue;
      locked.push({ start, end, text: trimmed.slice(start, end) });
    }
  }
  locked.sort((a, b) => a.start - b.start);

  const groups: string[] = [];
  let cursor = 0;
  const flushTokens = (slice: string) => {
    const tokens = slice
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t && !/^[.,!?;:]+$/.test(t))
      .map((t) => t.replace(/^[.,!?;:]+|[.,!?;:]+$/g, ""))
      .filter(Boolean);
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i]!.toLowerCase().replace(/[^a-z']/g, "");
      if (
        ["in", "on", "at", "of", "to", "for", "with", "from", "by", "into"].includes(t) &&
        i + 2 < tokens.length
      ) {
        groups.push(tokens.slice(i, i + 3).join(" "));
        i += 3;
        continue;
      }
      if (
        ["the", "a", "an", "our", "my", "their", "this", "those", "some"].includes(t) &&
        i + 1 < tokens.length
      ) {
        const next = tokens[i + 1]!.toLowerCase().replace(/[^a-z']/g, "");
        if (["and", "or"].includes(next) && i + 3 < tokens.length) {
          groups.push(tokens.slice(i, i + 4).join(" "));
          i += 4;
          continue;
        }
        groups.push(tokens.slice(i, i + 2).join(" "));
        i += 2;
        continue;
      }
      if (["have", "has", "had", "been", "are", "is", "was", "were"].includes(t)) {
        groups.push(tokens[i]!);
        i += 1;
        continue;
      }
      groups.push(tokens[i]!);
      i += 1;
    }
  };

  for (const lock of locked) {
    if (cursor < lock.start) flushTokens(trimmed.slice(cursor, lock.start));
    groups.push(lock.text);
    cursor = lock.end;
  }
  if (cursor < trimmed.length) flushTokens(trimmed.slice(cursor));

  // 카드가 너무 적으면 긴 구를 단어 단위로 분해
  let finalGroups = groups.map((g) => g.trim()).filter(Boolean);
  while (finalGroups.length < 3 && finalGroups.some((g) => g.split(/\s+/).length > 1)) {
    const idx = finalGroups.findIndex((g) => g.split(/\s+/).length > 1);
    if (idx < 0) break;
    const parts = finalGroups[idx]!.split(/\s+/);
    finalGroups = [
      ...finalGroups.slice(0, idx),
      ...parts,
      ...finalGroups.slice(idx + 1),
    ];
  }

  return finalGroups.map((chunkText, idx) => ({
    id: newChunkId(),
    chunkOrder: idx + 1,
    chunkText,
  }));
}

export function buildStage8Drafts(sentences: SeedSentence[]): Stage8GroupDraft[] {
  const drafts: Stage8GroupDraft[] = [];
  let order = 1;

  const pushGroup = (sentenceId: string, english: string, start: number, end: number) => {
    const original = english.slice(start, end).replace(/^\s+|\s+$/g, "");
    // trim만 반영한 실제 범위
    const realStart = english.indexOf(original, start);
    if (realStart < 0) return;
    const realEnd = realStart + original.length;
    // 끝 문장부호·콤마는 배열 구간에서 제외 (카드·검증 단순화)
    const noTerminal = original.replace(/[,;:.!?]+$/u, "").trimEnd();
    if (noTerminal.split(/\s+/).filter(Boolean).length < 3) return;
    const spanEnd = realStart + noTerminal.length;
    const chunks = phraseChunks(noTerminal);
    if (chunks.length < 3) return;
    drafts.push({
      sentence_id: sentenceId,
      blank_order: order++,
      english_start: realStart,
      english_end: spanEnd,
      original_text: noTerminal,
      chunks,
      is_required: true,
    });
  };

  for (const s of sentences) {
    const english = String(s.english_text ?? "").trim();
    if (english.split(/\s+/).length < 4) continue;

    // 콤마·마침표 기준 절 분할 (PDF 3·4·6번)
    const ranges: Array<{ start: number; end: number }> = [];
    {
      let start = 0;
      for (let i = 0; i < english.length; i++) {
        const ch = english[i];
        if (ch === "," || ch === ";" || ch === ".") {
          const end = i + 1;
          // 절에 단어 3개 이상일 때만
          const slice = english.slice(start, end).trim();
          if (slice.split(/\s+/).filter(Boolean).length >= 3) {
            ranges.push({ start, end });
            // skip following spaces
            let j = end;
            while (j < english.length && /\s/.test(english[j]!)) j++;
            start = j;
            i = j - 1;
          }
        }
      }
      if (start < english.length) {
        ranges.push({ start, end: english.length });
      }
    }

    if (ranges.length >= 2 && english.split(/\s+/).length >= 10) {
      let added = 0;
      for (const r of ranges) {
        const before = drafts.length;
        pushGroup(s.id, english, r.start, r.end);
        if (drafts.length > before) added += 1;
      }
      if (added > 0) continue;
    }

    pushGroup(s.id, english, 0, english.length);
  }
  return drafts;
}

export function buildStage9Config(sentences: SeedSentence[]): Stage9ConfigDraft | null {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  if (ordered.length < 2) return null;

  const body = ordered.filter(
    (s) =>
      !/^(to whom|sincerely|dear|thank you)/i.test(s.english_text.trim()) &&
      !/morgan|sincerely/i.test(s.english_text)
  );
  const use = body.length >= 3 ? body : ordered;

  const n = Math.min(3, use.length);
  if (n < 2) return null;
  const size = Math.ceil(use.length / n);
  const blocks = [];
  for (let i = 0; i < n; i++) {
    const slice = use.slice(i * size, (i + 1) * size);
    if (slice.length === 0) continue;
    blocks.push({
      sentence_ids: slice.map((x) => x.id),
      blank_order: blocks.length + 1,
      is_required: true as const,
    });
  }
  if (blocks.length < 2) return null;

  const prefix = ordered
    .filter((s) => /^(to whom|dear)/i.test(s.english_text.trim()))
    .map((s) => s.english_text)
    .join(" ");
  const suffix = ordered
    .filter((s) => /sincerely/i.test(s.english_text) || /morgan/i.test(s.english_text))
    .map((s) => s.english_text)
    .join("\n");

  return {
    fixedPrefix: prefix,
    fixedSuffix: suffix,
    answerMode: "label_sequence",
    structureHint: null,
    blocks,
  };
}

/** PDF형: 고정 접속·전치사구 + 빈칸 토큰 슬롯 */
function buildGuidedWritingSegments(english: string): Stage10Segment[] {
  const GLUE: RegExp[] = [
    /^To Whom It May Concern:\s*/i,
    /\bin areas of\b/gi,
    /\bwhere it(?:['’]s| is)\s+/gi,
    /\bin those areas\b/gi,
    /,\s*recently more and more\s+/gi,
    /\band at\b/gi,
    /\bin the community\.?/gi,
    /\bThank you for your time and consideration\.?/gi,
    /\bSincerely,?\s*/gi,
    /\bEven though it(?:['’]s| is)\s+/gi,
    /\bwhich\s+/gi,
    /\bin a\b/gi,
    /\sof\s+(?=(?:garbage|waste|illegal|our)\b)/gi,
    /\band\s+(?=insects\b)/gi,
    /,\s*I\s+/gi,
    /\bin the\b(?=\s+community)/gi,
  ];

  type Span = { start: number; end: number };
  const glues: Span[] = [];
  for (const re of GLUE) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(english)) !== null) {
      if (m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (glues.some((g) => start < g.end && end > g.start)) continue;
      glues.push({ start, end });
    }
  }
  glues.sort((a, b) => a.start - b.start);
  if (glues.length === 0) return [];

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
    const t = text;
    if (!t.trim()) return;
    segs.push({
      id: newSegId(),
      segmentOrder: order++,
      segmentType: "answer_segment",
      originalAnswerText: t,
      answerTokens: tokenizeAnswerText(t),
      acceptedAnswers: [],
      englishStart: start,
      englishEnd: end,
      ignoreExtraSpaces: true,
      ignoreTerminalPunctuation: true,
    });
  };

  for (const g of glues) {
    if (cursor < g.start) pushAnswer(english.slice(cursor, g.start), cursor, g.start);
    pushFixed(english.slice(g.start, g.end));
    cursor = g.end;
  }
  if (cursor < english.length) pushAnswer(english.slice(cursor), cursor, english.length);

  const hasAnswer = segs.some((s) => s.segmentType === "answer_segment");
  return hasAnswer ? segs : [];
}

/** 10단계: 우리말 + 제시어(원형) + 고정/영작 구간 */
export function buildStage10Drafts(sentences: SeedSentence[]): Stage10ItemDraft[] {
  const drafts: Stage10ItemDraft[] = [];
  let order = 1;
  const list = sentences.filter((s) => String(s.english_text ?? "").trim().length > 15);

  for (const s of list) {
    const english = String(s.english_text ?? "").trim();
    const korean = String(s.korean_text ?? "").trim();
    if (!english || !korean) continue;

    const marks = parseVocabMarks(s.vocabulary);
    let segments = buildGuidedWritingSegments(english);
    if (segments.length < 1) {
      // 폴백: 앞 1~2어 고정 + 나머지 영작 (인사문 제외)
      const words = english.split(/\s+/);
      if (words.length >= 6 && /^(People|Some|Even|The|Consistent|To)\b/.test(english)) {
        const headN = /^(Even though|Some of|To Whom)/i.test(english) ? 2 : 1;
        const head = words.slice(0, headN).join(" ");
        const rest = words.slice(headN).join(" ");
        segments = [
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
            englishEnd: english.length,
            ignoreExtraSpaces: true,
            ignoreTerminalPunctuation: true,
          },
        ];
      } else {
        segments = proposeFullSentenceSegments(english);
      }
    }

    const answerTexts = segments
      .filter((x) => x.segmentType === "answer_segment")
      .map((x) => x.originalAnswerText ?? "")
      .join(" ");

    const cueSource =
      marks.length > 0
        ? marks.map((m) => lemmaCue(m.englishText))
        : contentEnglishTokens(answerTexts || english).map(lemmaCue);

    const cueTexts = cueSource
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 6);

    const answerSeg = segments.find((x) => x.segmentType === "answer_segment");
    const cues = cueTexts.map((text, i) => ({
      id: newCueId(),
      cueOrder: i + 1,
      cueText: text,
      linkedSegmentId: answerSeg?.id ?? null,
      linkedAnswerText: null as string | null,
    }));
    if (cues.length < 1) {
      const first = tokenizeAnswerText(english)[0];
      if (first) {
        cues.push({
          id: newCueId(),
          cueOrder: 1,
          cueText: lemmaCue(first),
          linkedSegmentId: answerSeg?.id ?? null,
          linkedAnswerText: null,
        });
      }
    }

    drafts.push({
      blank_order: order++,
      sentence_ids: [s.id],
      korean_prompt: korean,
      full_english: english,
      writing_segments: segments,
      writing_cues: cues,
      writing_input_mode: "guided_segments",
      writing_blank_display_mode: "token_slots",
      is_required: true,
    });
  }
  return drafts;
}
