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
  buildPhraseChunkTexts,
  planPhraseReorderParts,
  toStage8Chunks,
} from "@/lib/exam-prep/phrase-reorder";
import { type Stage8GroupDraft } from "@/lib/exam-prep/stage8-types";
import type { Stage9ConfigDraft } from "@/lib/exam-prep/stage9-types";
import {
  proposeFullSentenceSegments,
  tokenizeAnswerText,
  type Stage10ItemDraft,
} from "@/lib/exam-prep/stage10-types";
import {
  buildPdfWritingSegments,
  buildWritingCues,
  pickWritingCueTexts,
} from "@/lib/exam-prep/guided-writing";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";
import {
  pickDiverseGrammarHits,
  pickPassageGrammarHits,
  pickStage7Errors,
  scanVocabChoiceHits,
  scanWorkbookGrammarHits,
} from "@/lib/exam-prep/grammar-workbook-plants";

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

function overlaps(
  used: Array<{ a: number; b: number }>,
  start: number,
  end: number
) {
  return used.some((u) => start < u.b && end > u.a);
}

function matchCase(replacement: string, matched: string): string {
  if (
    matched[0] &&
    matched[0] === matched[0].toUpperCase() &&
    matched[0] !== matched[0].toLowerCase()
  ) {
    return replacement[0]!.toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

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

/**
 * 6단계: 문장 안 [a / b]
 * 마더텅식 — 지문 전체에서 서로 다른 수능필수어법 포인트를 고른 뒤
 * 문장에 배치 (+ 어휘 혼동어)
 */
export function buildStage6Drafts(sentences: SeedSentence[]): Stage6ItemDraft[] {
  const drafts: Stage6ItemDraft[] = [];
  let order = 1;

  const passageHits = pickPassageGrammarHits(
    sentences.map((s) => ({
      id: s.id,
      english_text: String(s.english_text ?? ""),
      sentence_order: s.sentence_order,
    })),
    Math.min(10, Math.max(4, sentences.length * 2))
  );

  const grammarBySentence = new Map<string, typeof passageHits>();
  for (const row of passageHits) {
    const list = grammarBySentence.get(row.sentenceId) ?? [];
    list.push(row);
    grammarBySentence.set(row.sentenceId, list);
  }

  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    const used: Array<{ a: number; b: number }> = [];
    let added = 0;

    for (const row of grammarBySentence.get(s.id) ?? []) {
      const h = row.hit;
      if (overlaps(used, h.start, h.end)) continue;
      used.push({ a: h.start, b: h.end });
      const tip = [h.koLabel, h.koTip].filter(Boolean).join(" — ");
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: h.correct,
        english_start: h.start,
        english_end: h.end,
        selected_text: h.correct,
        choice_options: [
          {
            id: `opt-c-${order}-0`,
            text: h.correct,
            isCorrect: true,
            explanation: tip || null,
          },
          {
            id: `opt-w-${order}-1`,
            text: h.wrong,
            isCorrect: false,
            explanation: tip || null,
          },
        ],
        question_category: "grammar",
        grammar_subcategory: [h.stage6Sub],
        vocabulary_subcategory: [],
        shuffle_options: true,
        hint: h.koLabel || null,
        explanation: tip || null,
        is_required: true,
      });
      added += 1;
    }

    // 어휘 [a/b] — 마더텅 어휘편 혼동어
    if (added < 3) {
      for (const v of scanVocabChoiceHits(english)) {
        if (added >= 3) break;
        if (overlaps(used, v.start, v.end)) continue;
        used.push({ a: v.start, b: v.end });
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: v.correct,
          english_start: v.start,
          english_end: v.end,
          selected_text: v.correct,
          choice_options: [
            { id: `opt-c-${order}-0`, text: v.correct, isCorrect: true },
            { id: `opt-w-${order}-1`, text: v.wrong, isCorrect: false },
          ],
          question_category: "vocabulary",
          grammar_subcategory: [],
          vocabulary_subcategory: [v.sub],
          shuffle_options: true,
          is_required: true,
        });
        added += 1;
      }
    }

    // 문장에 포인트가 하나도 없으면 로컬 스캔 폴백
    if (added < 1) {
      const local = pickDiverseGrammarHits(scanWorkbookGrammarHits(english), 2, {
        forChoice: true,
      });
      for (const h of local) {
        if (overlaps(used, h.start, h.end)) continue;
        used.push({ a: h.start, b: h.end });
        const tip = [h.koLabel, h.koTip].filter(Boolean).join(" — ");
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: h.correct,
          english_start: h.start,
          english_end: h.end,
          selected_text: h.correct,
          choice_options: [
            {
              id: `opt-c-${order}-0`,
              text: h.correct,
              isCorrect: true,
              explanation: tip || null,
            },
            {
              id: `opt-w-${order}-1`,
              text: h.wrong,
              isCorrect: false,
              explanation: tip || null,
            },
          ],
          question_category: "grammar",
          grammar_subcategory: [h.stage6Sub],
          vocabulary_subcategory: [],
          shuffle_options: true,
          hint: h.koLabel || null,
          explanation: tip || null,
          is_required: true,
        });
        added += 1;
      }
    }

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

/**
 * 7단계: 서로 다른 어법 단원 오류 3개 심기 (QG·교재와 동일 뱅크)
 */
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
  const usedSentenceErrors = new Set<string>();

  for (const row of pickStage7Errors(ordered, 3)) {
    const { hit } = row;
    let display = displayMap.get(row.sentenceId) ?? "";
    // 원문 기준 span — display가 아직 원문과 같다고 가정 (문장당 1오류)
    const slice = display.slice(hit.start, hit.end);
    if (slice.toLowerCase() !== hit.correct.toLowerCase()) {
      const found = findSpanCi(display, hit.correct);
      if (!found) continue;
      const replacement = matchCase(hit.wrong, found.text);
      display =
        display.slice(0, found.start) +
        replacement +
        display.slice(found.end);
      displayMap.set(row.sentenceId, display);
      const tip = [hit.koLabel, hit.koTip].filter(Boolean).join(" — ");
      candidates.push({
        sentence_id: row.sentenceId,
        blank_order: order++,
        english_start: found.start,
        english_end: found.start + replacement.length,
        displayed_text: replacement,
        is_error: true,
        correction_text: found.text,
        accepted_corrections: [found.text, hit.correct],
        error_subcategory: [hit.stage7Sub],
        hint: hit.koLabel || null,
        explanation: tip || null,
      });
    } else {
      const replacement = matchCase(hit.wrong, slice);
      display =
        display.slice(0, hit.start) +
        replacement +
        display.slice(hit.end);
      displayMap.set(row.sentenceId, display);
      const tip = [hit.koLabel, hit.koTip].filter(Boolean).join(" — ");
      candidates.push({
        sentence_id: row.sentenceId,
        blank_order: order++,
        english_start: hit.start,
        english_end: hit.start + replacement.length,
        displayed_text: replacement,
        is_error: true,
        correction_text: slice,
        accepted_corrections: [slice, hit.correct],
        error_subcategory: [hit.stage7Sub],
        hint: hit.koLabel || null,
        explanation: tip || null,
      });
    }
    usedSentenceErrors.add(row.sentenceId);
  }

  // 함정 밑줄 (오류 없는 문장)
  for (const s of ordered) {
    const display = displayMap.get(s.id) ?? "";
    if (usedSentenceErrors.has(s.id)) continue;
    const tok = contentEnglishTokens(display).find(
      (t) => !/^(which|that|where|who|whom|whose)$/i.test(t)
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

export function buildStage8Drafts(sentences: SeedSentence[]): Stage8GroupDraft[] {
  const drafts: Stage8GroupDraft[] = [];
  let order = 1;

  for (const s of sentences) {
    const english = String(s.english_text ?? "").trim();
    if (english.split(/\s+/).length < 4) continue;

    const parts = planPhraseReorderParts(english);
    let added = 0;
    for (const p of parts) {
      if (p.type !== "reorder") continue;
      const texts = buildPhraseChunkTexts(p.text);
      if (texts.length < 3) continue;
      // 원문 슬라이스와 청크 합이 맞도록 original은 p.text
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        english_start: p.start,
        english_end: p.end,
        original_text: p.text,
        chunks: toStage8Chunks(texts),
        is_required: true,
      });
      added += 1;
    }

    if (added === 0) {
      // 폴백: 인사 제외 전체
      const body = english
        .replace(/^(To Whom It May Concern:\s*|Dear\s+[^:]+:\s*)/i, "")
        .replace(/[.!?]+$/u, "")
        .trim();
      const start = english.indexOf(body);
      if (start < 0 || body.split(/\s+/).length < 3) continue;
      const texts = buildPhraseChunkTexts(body);
      if (texts.length < 3) continue;
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        english_start: start,
        english_end: start + body.length,
        original_text: body,
        chunks: toStage8Chunks(texts),
        is_required: true,
      });
    }
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

/** 10단계: 우리말 + 제시어(원형) + 고정구 + 단어별 ______ */
export function buildStage10Drafts(sentences: SeedSentence[]): Stage10ItemDraft[] {
  const drafts: Stage10ItemDraft[] = [];
  let order = 1;
  const list = sentences.filter((s) => String(s.english_text ?? "").trim().length > 15);

  for (const s of list) {
    const english = String(s.english_text ?? "").trim();
    const korean = String(s.korean_text ?? "").trim();
    if (!english || !korean) continue;

    let segments = buildPdfWritingSegments(english);
    if (segments.length < 1) {
      segments = proposeFullSentenceSegments(english);
    }

    const answerTexts = segments
      .filter((x) => x.segmentType === "answer_segment")
      .map((x) => x.originalAnswerText ?? "")
      .join(" ");

    let cueTexts = pickWritingCueTexts(english, s.vocabulary, answerTexts);
    if (cueTexts.length < 1) {
      const first = tokenizeAnswerText(english)[0];
      if (first) cueTexts = [writingLemmaFallback(first)];
    }
    if (cueTexts.length < 1) cueTexts = ["word"];

    const cues = buildWritingCues(cueTexts, segments);

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

function writingLemmaFallback(answer: string): string {
  return answer.toLowerCase().replace(/[^a-z']/g, "") || answer;
}
