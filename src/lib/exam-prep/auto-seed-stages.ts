/**
 * 지문 문장만으로 1~10단계 초안을 규칙 기반으로 만든다.
 * (영어 원문은 수정하지 않는다. 7단계만 표시문장에 의도적 오류를 넣는다.)
 */
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import type { BlankDraft } from "@/lib/exam-prep/stage2-types";
import type { Stage3BlankDraft } from "@/lib/exam-prep/stage3-types";
import type { Stage5ItemDraft } from "@/lib/exam-prep/stage5-types";
import type { Stage6ItemDraft } from "@/lib/exam-prep/stage6-types";
import type { Stage7CandidateDraft } from "@/lib/exam-prep/stage7-types";
import {
  proposeChunksFromText,
  type Stage8GroupDraft,
} from "@/lib/exam-prep/stage8-types";
import type { Stage9ConfigDraft } from "@/lib/exam-prep/stage9-types";
import {
  newCueId,
  proposeFullSentenceSegments,
  tokenizeAnswerText,
  type Stage10ItemDraft,
} from "@/lib/exam-prep/stage10-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

const EN_STOP = new Set(
  `the a an of to in on for and or is are was were be been being it this that with as by from at have has had do does did will would can could may might should not but so if than then into over under about their its his her our your my we you they he she i am`.split(
    " "
  )
);

const ERROR_SWAP: Array<[RegExp, string, string, string]> = [
  [/\bis\b/i, "is", "are", "subject_verb_agreement"],
  [/\bare\b/i, "are", "is", "subject_verb_agreement"],
  [/\bwas\b/i, "was", "were", "subject_verb_agreement"],
  [/\bwere\b/i, "were", "was", "subject_verb_agreement"],
  [/\bhas\b/i, "has", "have", "subject_verb_agreement"],
  [/\bhave\b/i, "have", "has", "subject_verb_agreement"],
  [/\btheir\b/i, "their", "there", "other"],
  [/\bthere\b/i, "there", "their", "other"],
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

function findSpan(haystack: string, needle: string): { start: number; end: number } | null {
  if (!needle) return null;
  const start = haystack.indexOf(needle);
  if (start < 0) return null;
  return { start, end: start + needle.length };
}

function contentEnglishTokens(english: string): string[] {
  return english
    .replace(/["""'']/g, "")
    .split(/\s+/)
    .map((t) => t.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ""))
    .filter((t) => t.length >= 4 && !EN_STOP.has(t.toLowerCase()));
}

function contentKoreanTokens(korean: string): string[] {
  return korean
    .split(/\s+/)
    .map((t) => t.replace(/[.,!?;:'"()\-]/g, "").trim())
    .filter((t) => t.length >= 2);
}

function cueFromAnswer(answer: string): string {
  const w = answer.toLowerCase().replace(/[^a-z']/g, "");
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3) || w;
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2) || w;
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("s") && w.length > 3 && !w.endsWith("ss")) return w.slice(0, -1);
  return w || answer;
}

function distractors(correct: string): string[] {
  const c = correct.trim();
  const lower = c.toLowerCase();
  const pool = [
    lower.endsWith("s") ? lower.slice(0, -1) : `${lower}s`,
    lower.endsWith("ing") ? lower.slice(0, -3) : `${lower}ing`,
    lower.endsWith("ed") ? lower.slice(0, -2) : `${lower}ed`,
    `${lower}ly`,
    lower.replace(/a/g, "e") || `${lower}e`,
  ]
    .map((x) => x.trim())
    .filter((x) => x && x.toLowerCase() !== lower && x.length > 1);
  return [...new Set(pool)].slice(0, 3);
}

export function buildStage2Drafts(sentences: SeedSentence[]): BlankDraft[] {
  const drafts: BlankDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const korean = String(s.korean_text ?? "");
    if (!korean.trim()) continue;
    const marks = parseVocabMarks(s.vocabulary);
    const used: Array<{ a: number; b: number }> = [];
    let added = 0;

    for (const m of marks) {
      if (added >= 2) break;
      const needle = m.koreanText?.trim();
      if (!needle || !korean.includes(needle)) continue;
      const span = findSpan(korean, needle);
      if (!span) continue;
      if (used.some((u) => span.start < u.b && span.end > u.a)) continue;
      used.push({ a: span.start, b: span.end });
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: needle,
        accepted_answers: [],
        korean_start: span.start,
        korean_end: span.end,
        linked_vocabulary_mark_id: m.id,
        linked_english_text: m.englishText || null,
        hint: m.meaning || null,
        is_required: true,
      });
      added += 1;
    }

    if (added === 0) {
      const tokens = contentKoreanTokens(korean).sort((a, b) => b.length - a.length);
      for (const tok of tokens.slice(0, 2)) {
        const span = findSpan(korean, tok);
        if (!span) continue;
        if (used.some((u) => span.start < u.b && span.end > u.a)) continue;
        used.push({ a: span.start, b: span.end });
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: tok,
          accepted_answers: [],
          korean_start: span.start,
          korean_end: span.end,
          is_required: true,
        });
        added += 1;
        if (added >= 1) break;
      }
    }
  }
  return drafts;
}

export function buildStage3Drafts(sentences: SeedSentence[]): Stage3BlankDraft[] {
  const drafts: Stage3BlankDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    if (!english.trim()) continue;
    const marks = parseVocabMarks(s.vocabulary);
    const used: Array<{ a: number; b: number }> = [];
    let added = 0;

    for (const m of marks) {
      if (added >= 2) break;
      const needle = m.englishText?.trim();
      if (!needle) continue;
      const span = findSpan(english, needle);
      if (!span) continue;
      if (used.some((u) => span.start < u.b && span.end > u.a)) continue;
      used.push({ a: span.start, b: span.end });
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: english.slice(span.start, span.end),
        accepted_answers: [],
        english_start: span.start,
        english_end: span.end,
        selected_text: english.slice(span.start, span.end),
        is_required: true,
      });
      added += 1;
    }

    if (added === 0) {
      for (const tok of contentEnglishTokens(english).slice(0, 2)) {
        const span = findSpan(english, tok);
        if (!span) continue;
        if (used.some((u) => span.start < u.b && span.end > u.a)) continue;
        used.push({ a: span.start, b: span.end });
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: tok,
          accepted_answers: [],
          english_start: span.start,
          english_end: span.end,
          selected_text: tok,
          is_required: true,
        });
        added += 1;
        if (added >= 1) break;
      }
    }
  }
  return drafts;
}

export function buildStage5Drafts(sentences: SeedSentence[]): Stage5ItemDraft[] {
  const drafts: Stage5ItemDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    const candidates = contentEnglishTokens(english).filter((t) =>
      /(ing|ed|en|s)$/i.test(t) || /^(is|are|was|were|have|has|been|being)$/i.test(t)
    );
    const pick = candidates[0] ?? contentEnglishTokens(english)[0];
    if (!pick) continue;
    const span = findSpan(english, pick);
    if (!span) continue;
    const answer = english.slice(span.start, span.end);
    drafts.push({
      sentence_id: s.id,
      blank_order: order++,
      answer_text: answer,
      accepted_answers: [],
      english_start: span.start,
      english_end: span.end,
      selected_text: answer,
      cue_words: [cueFromAnswer(answer)],
      grammar_category: ["other"],
      is_required: true,
    });
  }
  return drafts;
}

export function buildStage6Drafts(sentences: SeedSentence[]): Stage6ItemDraft[] {
  const drafts: Stage6ItemDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    const marks = parseVocabMarks(s.vocabulary);
    const needle =
      marks.find((m) => m.englishText && english.includes(m.englishText))
        ?.englishText ?? contentEnglishTokens(english)[0];
    if (!needle) continue;
    const span = findSpan(english, needle);
    if (!span) continue;
    const answer = english.slice(span.start, span.end);
    const wrongs = distractors(answer);
    while (wrongs.length < 3) wrongs.push(`${answer.toLowerCase()}x${wrongs.length}`);
    drafts.push({
      sentence_id: s.id,
      blank_order: order++,
      answer_text: answer,
      english_start: span.start,
      english_end: span.end,
      selected_text: answer,
      choice_options: [
        { id: `opt-c-${order}`, text: answer, isCorrect: true },
        ...wrongs.slice(0, 3).map((t, i) => ({
          id: `opt-w-${order}-${i}`,
          text: t,
          isCorrect: false,
        })),
      ],
      question_category: "vocabulary",
      grammar_subcategory: [],
      vocabulary_subcategory: ["contextual_meaning"],
      shuffle_options: true,
      is_required: true,
    });
  }
  return drafts;
}

export function buildStage7Seed(sentences: SeedSentence[]): {
  displays: Array<{ sentenceId: string; stage7DisplayText: string }>;
  candidates: Stage7CandidateDraft[];
  requiredErrorCount: number;
} {
  const displays: Array<{ sentenceId: string; stage7DisplayText: string }> = [];
  const candidates: Stage7CandidateDraft[] = [];
  let order = 1;
  let errorCount = 0;

  for (const s of sentences) {
    const original = String(s.english_text ?? "");
    if (!original.trim()) continue;
    let display = original;
    let madeError = false;

    if (errorCount < Math.max(3, Math.min(5, Math.ceil(sentences.length / 2)))) {
      for (const [re, correct, wrong, cat] of ERROR_SWAP) {
        const m = original.match(re);
        if (!m || m.index == null) continue;
        const matched = m[0];
        const replacement =
          matched[0] === matched[0]!.toUpperCase()
            ? wrong[0]!.toUpperCase() + wrong.slice(1)
            : wrong;
        display =
          original.slice(0, m.index) +
          replacement +
          original.slice(m.index + matched.length);
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
        madeError = true;
        errorCount += 1;
        break;
      }
    }

    if (!madeError) {
      // distractor underline: correct word marked as non-error candidate
      const tok = contentEnglishTokens(original)[0];
      if (tok) {
        const span = findSpan(display, tok);
        if (span) {
          candidates.push({
            sentence_id: s.id,
            blank_order: order++,
            english_start: span.start,
            english_end: span.end,
            displayed_text: display.slice(span.start, span.end),
            is_error: false,
            correction_text: "",
            accepted_corrections: [],
            error_subcategory: [],
          });
        }
      }
    }

    displays.push({ sentenceId: s.id, stage7DisplayText: display });
  }

  return {
    displays,
    candidates,
    requiredErrorCount: Math.max(1, Math.min(3, errorCount || 1)),
  };
}

export function buildStage8Drafts(sentences: SeedSentence[]): Stage8GroupDraft[] {
  const drafts: Stage8GroupDraft[] = [];
  let order = 1;
  for (const s of sentences) {
    const english = String(s.english_text ?? "");
    const tokens = english.trim().split(/\s+/).filter(Boolean);
    if (tokens.length < 4) continue;
    // 가운데 구간만 배열 (앞뒤 고정)
    const startTok = Math.max(1, Math.floor(tokens.length * 0.2));
    const endTok = Math.min(tokens.length - 1, Math.ceil(tokens.length * 0.8));
    if (endTok - startTok < 3) continue;
    const mid = tokens.slice(startTok, endTok).join(" ");
    const start = english.indexOf(mid);
    if (start < 0) continue;
    const end = start + mid.length;
    const chunks = proposeChunksFromText(mid);
    if (chunks.length < 3) continue;
    drafts.push({
      sentence_id: s.id,
      blank_order: order++,
      english_start: start,
      english_end: end,
      original_text: mid,
      chunks,
      is_required: true,
    });
  }
  return drafts;
}

export function buildStage9Config(sentences: SeedSentence[]): Stage9ConfigDraft | null {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  if (ordered.length < 2) return null;

  const byPara = new Map<number, string[]>();
  for (const s of ordered) {
    const p = Number(s.paragraph_number) || 1;
    const list = byPara.get(p) ?? [];
    list.push(s.id);
    byPara.set(p, list);
  }

  let blocks = [...byPara.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, ids], i) => ({
      sentence_ids: ids,
      blank_order: i + 1,
      is_required: true as const,
    }));

  if (blocks.length < 2) {
    // 문단이 1개면 문장 단위로 분리
    blocks = ordered.map((s, i) => ({
      sentence_ids: [s.id],
      blank_order: i + 1,
      is_required: true as const,
    }));
  }

  if (blocks.length < 2) return null;

  return {
    fixedPrefix: "",
    fixedSuffix: "",
    answerMode: "label_sequence",
    structureHint: null,
    blocks,
  };
}

export function buildStage10Drafts(sentences: SeedSentence[]): Stage10ItemDraft[] {
  const drafts: Stage10ItemDraft[] = [];
  let order = 1;
  const targets = sentences.filter(
    (s) => s.is_important_writing || String(s.english_text ?? "").trim().length > 20
  );
  const list = targets.length > 0 ? targets : sentences;

  for (const s of list) {
    const english = String(s.english_text ?? "").trim();
    const korean = String(s.korean_text ?? "").trim();
    if (!english || !korean) continue;
    const segments = proposeFullSentenceSegments(english);
    const marks = parseVocabMarks(s.vocabulary);
    const cueWords =
      marks.map((m) => cueFromAnswer(m.englishText)).filter(Boolean).slice(0, 6);
    const fallback = contentEnglishTokens(english)
      .map(cueFromAnswer)
      .slice(0, 4);
    const cues = (cueWords.length > 0 ? cueWords : fallback).map((text, i) => ({
      id: newCueId(),
      cueOrder: i + 1,
      cueText: text,
      linkedSegmentId: segments.find((x) => x.segmentType === "answer_segment")?.id,
      linkedAnswerText: null as string | null,
    }));
    if (cues.length < 1) {
      const first = tokenizeAnswerText(english)[0];
      if (first) {
        cues.push({
          id: newCueId(),
          cueOrder: 1,
          cueText: cueFromAnswer(first),
          linkedSegmentId: segments.find((x) => x.segmentType === "answer_segment")?.id,
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
