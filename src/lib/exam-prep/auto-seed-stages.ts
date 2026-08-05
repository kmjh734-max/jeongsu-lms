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

/** 동사구·준동사·분사형 — PDF처럼 문장당 여러 빈칸 */
type VerbHit = {
  start: number;
  end: number;
  answer: string;
  cues: string[];
  category: string;
};

const NEVER_VERB = new Set(
  "every each all most other another such same own next last first second many much more few little good bad big small long short high low new old great real true false only even still already often usually really somehow something everything anything nothing someone anyone everyone nobody everybody perhaps maybe however therefore thus hence although though while during before after above below between through against among within without upon whether until unless because since across around toward towards garbage ocean plastic problem people rats tourists laws day days year years time times way ways part parts place places thing things fact case state world country city school student students child children man men woman women".split(
    " "
  )
);

const IRREGULAR_VERBS = new Set(
  `left made done gone seen taken given been come became become built felt kept lost meant met paid put read said sent set shown sold spent stood taught thought told understood won written wrote broke broken chose chosen drove driven ate eaten fell fallen flew flown forgot forgotten froze frozen grew grown hid hidden held hurt knew known laid lain led lent lit rode ridden rang rung rose risen ran sang sung sank sunk sat slept spoke spoken stole stolen swam swum threw thrown wore worn woke woken began begun brought bought caught fought found heard quit shut spread cost cut let hit wet drew drawn drank drunk hung sprang sprung swore sworn tore torn bound ground spun`.split(
    " "
  )
);

const AUX_VERBS = new Set(
  "am is are was were be been being have has had do does did can could will would may might must should shall".split(
    " "
  )
);

/**
 * 5단계: 문장 안 동사형을 **여러 개** 빈칸 (PDF: (have)(be)(dump) …).
 * 구 전체를 한 칸으로 묶지 않는다.
 */
function findVerbHits(english: string): VerbHit[] {
  const hits: VerbHit[] = [];
  const used: Array<{ a: number; b: number }> = [];
  const push = (start: number, end: number, cues: string[], category: string) => {
    if (start < 0 || end <= start) return;
    if (overlaps(used, start, end)) return;
    const answer = english.slice(start, end);
    if (!answer.trim()) return;
    used.push({ a: start, b: end });
    hits.push({ start, end, answer, cues, category });
  };

  const tokenRe = /[A-Za-z']+/g;
  let m: RegExpExecArray | null;
  const tokens: Array<{ text: string; start: number; end: number; low: string }> =
    [];
  while ((m = tokenRe.exec(english)) !== null) {
    tokens.push({
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      low: m[0].toLowerCase(),
    });
  }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    const before = english.slice(Math.max(0, t.start - 16), t.start);
    const after = english.slice(t.end, t.end + 16);

    // 전치사 to + 명사/관계사 스킵 (to whom / to the)
    if (
      prev &&
      /^to$/i.test(prev.low) &&
      /^(whom|which|whose|where|what|this|that|these|those|the|a|an|my|your|his|her|our|their)$/i.test(
        t.low
      )
    ) {
      continue;
    }

    if (NON_VERB_FORM.has(t.low)) continue;
    if (NEVER_VERB.has(t.low)) continue;

    // it's / he's → be
    if (/^(?:it|he|she|that|what|who)'(?:s)$/i.test(t.low)) {
      push(t.start, t.end, ["be"], "simple_present");
      continue;
    }

    // 1) 조동사·be·have·do
    if (AUX_VERBS.has(t.low)) {
      const cue =
        /^(am|is|are|was|were|been|being)$/i.test(t.low)
          ? "be"
          : /^(have|has|had)$/i.test(t.low)
            ? "have"
            : /^(do|does|did)$/i.test(t.low)
              ? "do"
              : t.low;
      let cat = "other";
      if (/^(am|is|are)$/i.test(t.low)) cat = "simple_present";
      else if (/^(was|were)$/i.test(t.low)) cat = "simple_past";
      else if (/^(been|being|be)$/i.test(t.low)) cat = "other";
      else if (/^(have|has)$/i.test(t.low)) cat = "present_perfect";
      else if (/^had$/i.test(t.low)) cat = "past_perfect";
      push(t.start, t.end, [cue], cat);
      continue;
    }

    if (EN_STOP.has(t.low)) continue;

    // 2) to + 원형
    if (prev && /^to$/i.test(prev.low) && t.low.length >= 3) {
      if (/^[A-Z]/.test(t.text) && !/^(Fix|Thank)$/.test(t.text)) continue;
      push(t.start, t.end, [lemmaCue(t.text)], "infinitive");
      continue;
    }

    // 3) -ing (동사·분사·동명사)
    if (/ing$/i.test(t.low) && t.low.length > 4) {
      let cat = "gerund";
      if (prev && /^(is|are|was|were|am|be|been|being)$/i.test(prev.low)) {
        cat = "present_progressive";
      }
      if (prev && /^(been)$/i.test(prev.low)) cat = "perfect_progressive";
      // 관사·형용사 뒤면 현재분사 수식
      if (/\b(a|an|the|this|that|these|those|illegal|growing|large)\s+$/i.test(before)) {
        cat = "present_participle";
      }
      push(t.start, t.end, [lemmaCue(t.text)], cat);
      continue;
    }

    // 4) -ed / 불규칙 pp·과거 (have/be 뒤 또는 서술 동사)
    if (IRREGULAR_VERBS.has(t.low) || (/ed$/i.test(t.low) && t.low.length > 3)) {
      let cat = "past_participle";
      if (prev && /^(have|has|had)$/i.test(prev.low)) cat = "present_perfect";
      if (prev && /^(is|are|was|were|am|be|been|being)$/i.test(prev.low)) {
        cat = "passive_voice";
      }
      if (
        prev &&
        /ly$/i.test(prev.low) &&
        tokens[i - 2] &&
        /^(is|are|was|were)$/i.test(tokens[i - 2]!.low)
      ) {
        cat = "passive_voice";
      }
      // 불규칙 과거(서술) — have/be 앞이 아니면 단순과거로
      if (
        IRREGULAR_VERBS.has(t.low) &&
        !/ed$/i.test(t.low) &&
        !(prev && /^(have|has|had|is|are|was|were|be|been|being)$/i.test(prev.low))
      ) {
        cat = "simple_past";
      }
      push(t.start, t.end, [lemmaCue(t.text)], cat);
      continue;
    }

    // 5) 사역·지각 뒤 원형
    if (
      prev &&
      /^(see|saw|hear|heard|watch|watched|feel|felt|make|made|let|have|had|help|helped)$/i.test(
        prev.low
      ) === false &&
      tokens[i - 2] &&
      /^(see|saw|hear|heard|watch|watched|feel|felt|make|made|let|have|had|help|helped)$/i.test(
        tokens[i - 2]!.low
      ) &&
      t.low.length >= 3
    ) {
      push(t.start, t.end, [lemmaCue(t.text)], "infinitive");
      continue;
    }

    // 6) 3인칭 -s / 일반 정동사 (화이트리스트 + 휴리스틱)
    const FINITE_HINT =
      /^(attracts?|urges?|leaves?|needs?|gets?|fixes?|grows?|dumps?|permits?|thanks?|protects?|strengthens?|weakens?|makes?|takes?|gives?|comes?|goes?|seems?|appears?|becomes?|remains?|keeps?|helps?|shows?|provides?|requires?|suggests?|causes?|creates?|allows?|prevents?|reduces?|increases?|improves?|supports?|includes?|contains?|offers?|asks?|tells?|says?|thinks?|knows?|feels?|wants?|tries?|begins?|starts?|ends?|continues?|happens?|occurs?|means?|depends?|exists?|leads?|follows?|works?|plays?|lives?|looks?|uses?|calls?|changes?|moves?|turns?|brings?|holds?|finds?|believes?|considers?|decides?|explains?|produces?|represents?|serves?|stands?|understands?|writes?|reads?|runs?|walks?|talks?|speaks?|listens?|watches?|eats?|drinks?|sleeps?|opens?|closes?|adds?|removes?|replaces?|develops?|encourages?|enables?|forces?|fails?|succeeds?|proves?|argues?|claims?|states?|notes?|reports?|describes?|mentions?|refers?|relates?|applies?|compares?|differs?|varies?|tends?|seems?|proves?)$/i;
    if (FINITE_HINT.test(t.low)) {
      push(t.start, t.end, [lemmaCue(t.text)], "simple_present");
      continue;
    }

    // 7) 동사처럼 보이는 3인칭 -s
    if (
      /[a-z]s$/i.test(t.low) &&
      !/ss$/i.test(t.low) &&
      t.low.length >= 5 &&
      !/^(this|thus|towards|across|perhaps|always|sometimes|others|thanks)$/i.test(
        t.low
      )
    ) {
      const looksVerbal =
        /\b(he|she|it|who|which|that|one|people|process|problem|system|machine|student|child|anyone|everyone|something)\b/i.test(
          before
        ) ||
        /^\s+(a|an|the|to|that|how|why|what|when|where|not|also|often|usually|really|very|more|most|much|many|their|its|his|her|our|my|your)\b/i.test(
          after
        );
      if (looksVerbal) {
        push(t.start, t.end, [lemmaCue(t.text)], "simple_present");
      }
    }
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
