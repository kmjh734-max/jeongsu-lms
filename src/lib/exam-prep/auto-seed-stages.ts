/**
 * 인천 10단계 WORKBOOK PDF + 어법 카탈로그 기준 규칙 시드.
 * 영어 원문은 수정하지 않는다. (7단계만 표시문에 오류 삽입)
 */
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import {
  blankPickCount,
  koreanCore,
  pickSpreadByScore,
  scoreEnglishBlank,
  scoreKoreanBlank,
  splitKoreanParticle,
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
import {
  assignShuffledLabels,
  type Stage9ConfigDraft,
} from "@/lib/exam-prep/stage9-types";
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
import {
  BE_HAVE_DO,
  COMMON_VERB_LEMMAS,
  isLikelyNonVerbToken,
  isLikelyNounSlot,
  MODAL_VERBS,
  VERB_LOOKALIKE_NOUNS,
  verbLemma,
} from "@/lib/exam-prep/verb-lemma";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";
import {
  isNonsenseChoicePair,
  pickDiverseGrammarHits,
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
    "sometimes",
    "always",
    "usually",
    "often",
    "never",
    "already",
    "still",
    "perhaps",
    "maybe",
    "really",
    "very",
    "towards",
    "toward",
    "afterwards",
    "besides",
    "otherwise",
    "somehow",
    "anyway",
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
  return verbLemma(answer);
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

/**
 * 어절 범위로 확장한 뒤, 끝 조사는 빈칸에서 제외한다.
 * 예: "전체" → 어절 "전체가" → 빈칸 "전체" + 조사 "가" 유지
 * 예: "구성하는" → "구성" + "하는"(표시상 는은 조사 분리, 하는 어미 peel)
 */
function refineKoreanBlankStem(stem: string, particle: string): string {
  if (!stem) return stem;
  // 구성하는 → 구성하+는 → 구성
  if (
    /^(는|고|며|면)$/.test(particle) &&
    stem.endsWith("하") &&
    stem.replace(/[^\uAC00-\uD7A3]/g, "").length >= 3
  ) {
    return stem.slice(0, -1);
  }
  // 효율적이라는 → 효율적이라+는 → 효율적
  if (particle === "는" && stem.endsWith("이라") && stem.length > 4) {
    return stem.slice(0, -2);
  }
  // 생산적이고 → 조사 미분리 시
  if (!particle && stem.endsWith("이고") && stem.length > 4) {
    return stem.slice(0, -2);
  }
  if (!particle && stem.endsWith("적일") && stem.length > 4) {
    return stem.slice(0, -1); // leave 적? 효율적일 → 효율적
  }
  if (stem.endsWith("적일") && stem.length > 3) {
    return `${stem.slice(0, -1)}`;
  }
  if (stem.endsWith("일") && stem.includes("적") && stem.length > 3) {
    return stem.slice(0, -1);
  }
  return stem;
}

function expandKoreanStemSpan(
  korean: string,
  start: number,
  end: number
): { start: number; end: number; text: string } {
  let a = start;
  while (a > 0 && !/\s/.test(korean[a - 1]!) && !/[.,!?;:'"()]/.test(korean[a - 1]!)) {
    a -= 1;
  }
  let b = end;
  while (
    b < korean.length &&
    !/\s/.test(korean[b]!) &&
    !/[.,!?;:'"()]/.test(korean[b]!)
  ) {
    b += 1;
  }
  const eojeol = korean.slice(a, b);
  const { stem, particle } = splitKoreanParticle(eojeol);
  const refined = refineKoreanBlankStem(stem || eojeol, particle);
  if (!refined) return { start: a, end: b, text: eojeol };
  const stemAt = eojeol.indexOf(refined);
  if (stemAt < 0) {
    const fallbackAt = eojeol.indexOf(stem);
    const stemStart = fallbackAt >= 0 ? a + fallbackAt : a;
    return {
      start: stemStart,
      end: stemStart + (stem || eojeol).length,
      text: stem || eojeol,
    };
  }
  return {
    start: a + stemAt,
    end: a + stemAt + refined.length,
    text: refined,
  };
}

/** 2단계: 중요 우리말 어간만 빈칸 (조사는 빈칸 밖) */
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

    const markCands = marks
      .map((m) => {
        const needle = (m.koreanText || "").trim();
        if (!needle || needle.length < 2) return null;
        const raw = findSpan(korean, needle);
        if (!raw) return null;
        const span = expandKoreanStemSpan(korean, raw.start, raw.end);
        if (scoreKoreanBlank(span.text) < 0 && scoreKoreanBlank(needle) < 0) {
          return null;
        }
        const wIdx =
          wordEntries.find((w) => w.start <= span.start && span.end <= w.end)?.index ??
          wordEntries.findIndex((w) => w.text.includes(needle));
        return {
          mark: m,
          span,
          index: wIdx >= 0 ? wIdx : 0,
          score: Math.max(20, scoreKoreanBlank(span.text) + 15),
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const maxPerSentence = Math.min(
      blankPickCount(Math.max(wordEntries.length, 1), "medium", { max: 5 }),
      Math.max(2, Math.ceil(wordEntries.filter((w) => scoreKoreanBlank(w.text) > 0).length))
    );

    const pickedMarks = pickSpreadByScore(markCands, maxPerSentence);
    for (const p of pickedMarks) {
      if (overlaps(used, p.span.start, p.span.end)) continue;
      used.push({ a: p.span.start, b: p.span.end });
      drafts.push({
        sentence_id: s.id,
        blank_order: order++,
        answer_text: p.span.text,
        accepted_answers: [
          p.span.text,
          p.mark.koreanText.trim(),
          koreanCore(p.span.text),
        ].filter((x, i, arr) => x && arr.indexOf(x) === i),
        korean_start: p.span.start,
        korean_end: p.span.end,
        linked_vocabulary_mark_id: p.mark.id,
        linked_english_text: p.mark.englishText || null,
        hint: p.mark.meaning || null,
        is_required: true,
      });
    }

    // 부족하면 중요 우리말 어간만 보충 (조사 제외)
    if (used.length < maxPerSentence) {
      const scored = wordEntries
        .map((w) => {
          const { stem, particle } = splitKoreanParticle(w.text);
          const refined = refineKoreanBlankStem(stem, particle);
          const stemAt = w.text.indexOf(refined);
          const start = stemAt >= 0 ? w.start + stemAt : w.start;
          return {
            text: refined,
            start,
            end: start + refined.length,
            index: w.index,
            score: scoreKoreanBlank(w.text),
          };
        })
        .filter(
          (w) =>
            w.score > 0 &&
            w.text.length >= 2 &&
            scoreKoreanBlank(w.text) > 0 &&
            !overlaps(used, w.start, w.end)
        );
      const need = maxPerSentence - used.length;
      for (const p of pickSpreadByScore(scored, need)) {
        if (overlaps(used, p.start, p.end)) continue;
        used.push({ a: p.start, b: p.end });
        const answer = p.text;
        drafts.push({
          sentence_id: s.id,
          blank_order: order++,
          answer_text: answer,
          accepted_answers: [answer, koreanCore(answer)].filter(
            (x, i, arr) => x && arr.indexOf(x) === i
          ),
          korean_start: p.start,
          korean_end: p.end,
          is_required: true,
        });
      }
    }
  }
  return drafts;
}

/** 3단계: 영문 빈칸을 더 많이 (문장당 최대 6) */
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

    const maxPerSentence = Math.min(
      Math.max(
        2,
        blankPickCount(Math.max(wordEntries.length, 1), "hard", { max: 5 })
      ),
      Math.max(2, wordEntries.filter((w) => scoreEnglishBlank(w.text) > 0).length || 2)
    );

    const markCands = marks
      .map((m) => {
        const needle = (m.englishText || "").trim();
        if (!needle || needle.length < 3) return null;
        const span = findSpanCi(english, needle);
        if (!span) return null;
        if (scoreEnglishBlank(span.text) < 0 && scoreEnglishBlank(needle) < 0) {
          return null;
        }
        const wIdx =
          wordEntries.find((w) => w.start <= span.start && span.end <= w.end)?.index ??
          wordEntries.findIndex((w) =>
            w.text.toLowerCase().includes(needle.toLowerCase().split(/\s+/)[0]!)
          );
        return {
          mark: m,
          span,
          index: wIdx >= 0 ? wIdx : 0,
          score: Math.max(20, scoreEnglishBlank(span.text) + 15),
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

    // 항상 max까지 중요 어휘로 채움
    if (used.length < maxPerSentence) {
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

/**
 * 5단계: PDF형 — 동사구·분사를 **한 칸**으로 두고 원형 cue를 여러 개 제시.
 * 예: (have, be, dump)→have been dumping / (not, permit)→is not permitted /
 *     (disgust)→disgusting / (be, get)→is getting
 */
export function findVerbHits(english: string): VerbHit[] {
  const hits: VerbHit[] = [];
  const consumed = new Set<number>();

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

  const pushSpan = (
    from: number,
    to: number,
    cues: string[],
    category: string
  ) => {
    if (from > to || from < 0 || to >= tokens.length) return;
    for (let i = from; i <= to; i++) {
      if (consumed.has(i)) return;
    }
    const start = tokens[from]!.start;
    const end = tokens[to]!.end;
    const answer = english.slice(start, end);
    if (!answer.trim()) return;
    const normCues = cues
      .map((c) => verbLemma(c) || c.toLowerCase())
      .filter(Boolean);
    if (normCues.length < 1) return;
    for (let i = from; i <= to; i++) consumed.add(i);
    hits.push({ start, end, answer, cues: [...new Set(normCues)], category });
  };

  const isBe = (low: string) =>
    /^(am|is|are|was|were|be|been|being)$/i.test(low) ||
    /^(i|he|she|it|that|what|who)'s$/i.test(low) ||
    /^(you|we|they)'re$/i.test(low);
  const isHave = (low: string) =>
    /^(have|has|had)$/i.test(low) || /^(i|you|we|they)'ve$/i.test(low);

  for (let i = 0; i < tokens.length; i++) {
    if (consumed.has(i)) continue;
    const t = tokens[i]!;
    const n1 = tokens[i + 1];
    const n2 = tokens[i + 2];
    const prev = tokens[i - 1];

    // To Whom / relative — skip
    if (
      prev &&
      /^to$/i.test(prev.low) &&
      /^(whom|which|whose|where|what)$/i.test(t.low)
    ) {
      continue;
    }

    // have/has/had + been + Ving
    if (
      isHave(t.low) &&
      n1 &&
      /^been$/i.test(n1.low) &&
      n2 &&
      /ing$/i.test(n2.low) &&
      n2.low.length > 4 &&
      !NON_VERB_FORM.has(n2.low)
    ) {
      pushSpan(i, i + 2, ["have", "be", lemmaCue(n2.text)], "perfect_progressive");
      continue;
    }

    // have/has/had + Ven
    if (
      isHave(t.low) &&
      n1 &&
      (IRREGULAR_VERBS.has(n1.low) || (/ed$/i.test(n1.low) && n1.low.length > 3)) &&
      !NON_VERB_FORM.has(n1.low)
    ) {
      pushSpan(i, i + 1, ["have", lemmaCue(n1.text)], "present_perfect");
      continue;
    }

    // be + ADV + Ven  (is desperately needed)
    if (
      isBe(t.low) &&
      n1 &&
      /ly$/i.test(n1.low) &&
      n2 &&
      (IRREGULAR_VERBS.has(n2.low) || /ed$/i.test(n2.low)) &&
      !NON_VERB_FORM.has(n2.low)
    ) {
      pushSpan(
        i,
        i + 2,
        [n1.low.replace(/ly$/, ""), lemmaCue(n2.text)],
        "passive_voice"
      );
      // PDF: (desperately, need) — keep adverb lemma as given form-ish
      const last = hits[hits.length - 1];
      if (last) last.cues = [n1.low, lemmaCue(n2.text)];
      continue;
    }

    // be + Ving
    if (
      isBe(t.low) &&
      n1 &&
      /ing$/i.test(n1.low) &&
      n1.low.length > 4 &&
      !NON_VERB_FORM.has(n1.low)
    ) {
      pushSpan(i, i + 1, ["be", lemmaCue(n1.text)], "present_progressive");
      continue;
    }

    // be + Ven (passive) — not after have
    if (
      isBe(t.low) &&
      n1 &&
      (IRREGULAR_VERBS.has(n1.low) || (/ed$/i.test(n1.low) && n1.low.length > 3)) &&
      !NON_VERB_FORM.has(n1.low)
    ) {
      pushSpan(i, i + 1, ["be", lemmaCue(n1.text)], "passive_voice");
      continue;
    }

    // it's/is/are + not + Ven  → (not, V)
    if (
      (isBe(t.low) || /^(it|he|she|that)'s$/i.test(t.low)) &&
      n1 &&
      /^not$/i.test(n1.low) &&
      n2 &&
      (IRREGULAR_VERBS.has(n2.low) || /ed$/i.test(n2.low) || /ing$/i.test(n2.low))
    ) {
      // PDF keeps "it" and blanks from be/not… : prefer span starting at not if contraction on it
      if (/^it$/i.test(t.low) && n1 && /^not$/i.test(n1.low)) {
        // "it not permitted" won't happen; "it is not permitted"
      }
      if (/^(it|he|she|that)'s$/i.test(t.low)) {
        // "'s not permitted" — blank whole contraction+not+Ven? PDF: it (not, permit)
        // Keep subject "it", blank "'s not permitted" approx as from 's
        pushSpan(i, i + 2, ["not", lemmaCue(n2.text)], "passive_voice");
      } else {
        pushSpan(i, i + 2, ["not", lemmaCue(n2.text)], "passive_voice");
      }
      continue;
    }

    // standalone "not" + Ven after be already consumed — rare

    // to + V (not To Whom)
    if (
      /^to$/i.test(t.low) &&
      n1 &&
      n1.low.length >= 3 &&
      !/^(whom|which|whose|where|what|the|a|an)$/i.test(n1.low) &&
      !NON_VERB_FORM.has(n1.low)
    ) {
      pushSpan(i + 1, i + 1, [lemmaCue(n1.text)], "infinitive");
      continue;
    }

    // adj/participle after determiner: a disgusting / this growing
    if (
      prev &&
      /^(a|an|the|this|that|these|those)$/i.test(prev.low) &&
      (/ing$/i.test(t.low) || /ed$/i.test(t.low) || /ous$|ive$|ful$|less$/i.test(t.low)) &&
      t.low.length > 4 &&
      !NON_VERB_FORM.has(t.low)
    ) {
      // allow disgusting, growing even if in NON_VERB? growing is often adj
      if (/^(disgusting|growing|living|rising|setting|winding|endless|dreadful)$/i.test(t.low) ||
          (/ing$/i.test(t.low) && !NON_VERB_FORM.has(t.low))) {
        pushSpan(i, i, [lemmaCue(t.text)], "present_participle");
        continue;
      }
    }

    // 조동사 + (부사) + 본동사 → PDF: (might, perish)
    // will/can + be/have 는 조동사만 건너뛰고 be/have를 개별 빈칸으로 둠
    if (MODAL_VERBS.has(t.low)) {
      let j = i + 1;
      while (
        j < tokens.length &&
        (NON_VERB_FORM.has(tokens[j]!.low) ||
          /^(not|never|also|even|still|just|really|quite|rather|always|often|usually|sometimes)$/i.test(
            tokens[j]!.low
          ) ||
          (/ly$/i.test(tokens[j]!.low) && tokens[j]!.low.length > 3))
      ) {
        j += 1;
      }
      const main = tokens[j];
      if (!main || consumed.has(j) || MODAL_VERBS.has(main.low) || NEVER_VERB.has(main.low)) {
        continue;
      }
      if (BE_HAVE_DO.has(main.low) || isBe(main.low) || isHave(main.low)) {
        continue;
      }
      if (
        !isLikelyNonVerbToken(main.low) &&
        (COMMON_VERB_LEMMAS.has(verbLemma(main.text)) ||
          IRREGULAR_VERBS.has(main.low) ||
          /ed$/i.test(main.low) ||
          /ing$/i.test(main.low))
      ) {
        if (j === i + 1) {
          // might perish → (might, perish)
          pushSpan(i, j, [t.low, lemmaCue(main.text)], "modal_verb");
        } else {
          // can sometimes assume → assume 만 (부사는 빈칸 밖)
          pushSpan(j, j, [lemmaCue(main.text)], "simple_present");
        }
      }
      continue;
    }

    // 문두·담화 동사: Suppose / Assume / Fix / Thank …
    if (
      (i === 0 || /^(Fix|Thank|Suppose|Assume|Consider|Imagine)$/i.test(t.text)) &&
      COMMON_VERB_LEMMAS.has(verbLemma(t.text)) &&
      !VERB_LOOKALIKE_NOUNS.has(t.low)
    ) {
      pushSpan(i, i, [lemmaCue(t.text)], "imperative");
      continue;
    }

    if (consumed.has(i)) continue;
    if (NON_VERB_FORM.has(t.low) || isLikelyNonVerbToken(t.low)) continue;
    if (NEVER_VERB.has(t.low)) continue;
    if (EN_STOP.has(t.low) && !BE_HAVE_DO.has(t.low)) continue;

    const nextTok = tokens[i + 1];
    // increase in / an increase / significant increase → 명사 자리 (동사형 빈칸 금지)
    if (isLikelyNounSlot(t.low, prev?.low, nextTok?.low)) {
      continue;
    }

    // 명사 자리: in charge / on board / as a result …
    if (
      VERB_LOOKALIKE_NOUNS.has(t.low) &&
      prev &&
      /^(a|an|the|this|that|these|those|my|your|our|their|his|her|its|in|on|at|of|for|with|from|by|into|onto|as)$/i.test(
        prev.low
      )
    ) {
      continue;
    }

    // single be/have/do finite left
    if (BE_HAVE_DO.has(t.low) || isBe(t.low) || isHave(t.low)) {
      pushSpan(i, i, [verbLemma(t.text)], "simple_present");
      continue;
    }

    // -ing / -ed / irregular / finite -s
    if (/ing$/i.test(t.low) && t.low.length > 4 && !NON_VERB_FORM.has(t.low)) {
      pushSpan(i, i, [lemmaCue(t.text)], "gerund");
      continue;
    }
    if (
      (IRREGULAR_VERBS.has(t.low) || (/ed$/i.test(t.low) && t.low.length > 3)) &&
      !NON_VERB_FORM.has(t.low)
    ) {
      pushSpan(i, i, [lemmaCue(t.text)], "simple_past");
      continue;
    }

    const lemma = verbLemma(t.text);
    const isKnownVerb =
      COMMON_VERB_LEMMAS.has(lemma) || COMMON_VERB_LEMMAS.has(t.low);
    // 주어/관계사 뒤 정형 동사: you know / that … / who need
    const afterSubject =
      !!prev &&
      /^(i|you|we|they|he|she|it|that|who|which|what|there|everyone|someone|anyone|people|one)$/i.test(
        prev.low
      );
    // 3인칭 -s: assumes, knows, seems
    const thirdPersonS =
      t.low !== lemma &&
      /s$/i.test(t.low) &&
      !/ss$/i.test(t.low) &&
      COMMON_VERB_LEMMAS.has(lemma);

    // 동사·명사 동형: 주어/3인칭 -s 문맥에서만 빈칸 (원형 단독 금지)
    const dualPos =
      VERB_LOOKALIKE_NOUNS.has(t.low) || VERB_LOOKALIKE_NOUNS.has(lemma);
    if (dualPos && !(afterSubject || thirdPersonS)) {
      continue;
    }

    if (isKnownVerb && (afterSubject || thirdPersonS || (!dualPos && t.low === lemma))) {
      pushSpan(i, i, [lemma], "simple_present");
      continue;
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
 * 5·6단계: 문장 안 [a / b]
 * - grammar: 워크북 5단계 (변형문제 어법 플랜트)
 * - vocabulary: 워크북 6단계 (어휘 혼동 플랜트)
 * - all: 혼합 (하위 호환)
 */
export function buildStage6Drafts(
  sentences: SeedSentence[],
  category: "grammar" | "vocabulary" | "all" = "all"
): Stage6ItemDraft[] {
  const drafts: Stage6ItemDraft[] = [];
  let order = 1;
  let usedSv = false;
  const usedUnitsGlobal = new Set<string>();

  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const wantGrammar = category === "grammar" || category === "all";
  const wantVocab = category === "vocabulary" || category === "all";

  for (const s of ordered) {
    const english = String(s.english_text ?? "");
    if (!english.trim()) continue;
    const used: Array<{ a: number; b: number }> = [];
    let added = 0;
    const wordCount = english.split(/\s+/).filter(Boolean).length;
    const target =
      category === "all"
        ? Math.min(4, Math.max(2, Math.ceil(wordCount / 12)))
        : Math.min(
            3,
            Math.max(wordCount <= 10 ? 1 : 2, Math.ceil(wordCount / 12))
          );

    const pushGrammar = (h: {
      start: number;
      end: number;
      correct: string;
      wrong: string;
      stage6Sub: string;
      koLabel: string;
      koTip: string;
      unitKey?: string;
    }) => {
      if (!wantGrammar) return false;
      if (added >= target) return false;
      if (overlaps(used, h.start, h.end)) return false;
      if (isNonsenseChoicePair(h.correct, h.wrong)) return false;
      if (h.unitKey === "sv") {
        if (usedSv) return false;
        usedSv = true;
      }
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
      if (h.unitKey) usedUnitsGlobal.add(h.unitKey);
      added += 1;
      return true;
    };

    const pushVocab = (h: {
      start: number;
      end: number;
      correct: string;
      wrong: string;
      sub: string;
    }) => {
      if (!wantVocab) return false;
      if (added >= target) return false;
      if (overlaps(used, h.start, h.end)) return false;
      if (isNonsenseChoicePair(h.correct, h.wrong)) return false;
      used.push({ a: h.start, b: h.end });
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
            explanation: null,
          },
          {
            id: `opt-w-${order}-1`,
            text: h.wrong,
            isCorrect: false,
            explanation: null,
          },
        ],
        question_category: "vocabulary",
        grammar_subcategory: [],
        vocabulary_subcategory: [h.sub],
        shuffle_options: true,
        hint: null,
        explanation: null,
        is_required: true,
      });
      added += 1;
      return true;
    };

    if (wantGrammar) {
      const grammarHits = pickDiverseGrammarHits(
        scanWorkbookGrammarHits(english),
        target,
        { forChoice: true }
      );
      const sortedGrammar = [...grammarHits].sort((a, b) => {
        const aUsed = usedUnitsGlobal.has(a.unitKey) ? 1 : 0;
        const bUsed = usedUnitsGlobal.has(b.unitKey) ? 1 : 0;
        return aUsed - bUsed || b.priority - a.priority;
      });
      for (const h of sortedGrammar) {
        pushGrammar(h);
      }
      if (added < (wordCount <= 8 ? 1 : 2)) {
        const more = pickDiverseGrammarHits(scanWorkbookGrammarHits(english), 4, {
          forChoice: true,
        });
        for (const h of more) {
          pushGrammar(h);
          if (added >= target) break;
        }
      }
    }

    if (wantVocab) {
      for (const h of scanVocabChoiceHits(english)) {
        if (!pushVocab(h)) break;
      }
    }

    if (category === "all" && added < target) {
      for (const h of scanVocabChoiceHits(english)) {
        if (!pushVocab(h)) break;
      }
    }
    if (category === "all" && added < 2) {
      const more = pickDiverseGrammarHits(scanWorkbookGrammarHits(english), 3, {
        forChoice: true,
      });
      for (const h of more) {
        pushGrammar(h);
        if (added >= 2) break;
      }
    }
  }

  return drafts;
}

export function buildStage6GrammarDrafts(
  sentences: SeedSentence[]
): Stage6ItemDraft[] {
  return buildStage6Drafts(sentences, "grammar");
}

export function buildStage6VocabDrafts(
  sentences: SeedSentence[]
): Stage6ItemDraft[] {
  return buildStage6Drafts(sentences, "vocabulary");
}

/**
 * 카테고리별 병합: AI 우선, 비는 문장만 규칙 플랜트로 채움.
 */
export function mergeStage6Drafts(
  primary: Stage6ItemDraft[],
  filler: Stage6ItemDraft[],
  sentenceIds: string[],
  opts?: {
    category?: "grammar" | "vocabulary" | "all";
    minPerSentence?: number;
  }
): Stage6ItemDraft[] {
  const category = opts?.category ?? "all";
  const minPer = opts?.minPerSentence ?? 1;
  const matchCat = (d: Stage6ItemDraft) => {
    if (category === "all") return true;
    return (d.question_category || "grammar") === category;
  };

  const bySent = new Map<string, Stage6ItemDraft[]>();
  for (const id of sentenceIds) bySent.set(id, []);

  const add = (d: Stage6ItemDraft) => {
    if (!matchCat(d)) return;
    const list = bySent.get(d.sentence_id) ?? [];
    if (list.length >= 4) return;
    if (
      list.some(
        (x) =>
          x.english_start < d.english_end && x.english_end > d.english_start
      )
    ) {
      return;
    }
    const wrong = d.choice_options?.find((o) => !o.isCorrect)?.text ?? "";
    if (
      wrong &&
      isNonsenseChoicePair(d.answer_text || d.selected_text || "", wrong)
    ) {
      return;
    }
    list.push(d);
    bySent.set(d.sentence_id, list);
  };

  for (const d of primary) add(d);
  for (const d of filler) {
    const list = bySent.get(d.sentence_id) ?? [];
    // 문장당 minPer까지 채움 (복수 어법 포인트 허용)
    if (list.length >= Math.max(minPer, 2)) continue;
    add(d);
  }

  let order = 1;
  const out: Stage6ItemDraft[] = [];
  for (const id of sentenceIds) {
    for (const d of bySent.get(id) ?? []) {
      out.push({ ...d, blank_order: order++ });
    }
  }
  if (out.length > 0) return out;
  const fallback = [...primary, ...filler].filter(matchCat);
  return fallback.length > 0 ? fallback : primary.length > 0 ? primary : filler;
}

/** 어법·어휘 초안을 blank_order 재부여하며 합친다 */
export function combineStage6Categories(
  grammar: Stage6ItemDraft[],
  vocab: Stage6ItemDraft[],
  sentenceIds: string[]
): Stage6ItemDraft[] {
  const bySent = new Map<string, Stage6ItemDraft[]>();
  for (const id of sentenceIds) bySent.set(id, []);
  const add = (d: Stage6ItemDraft) => {
    const list = bySent.get(d.sentence_id) ?? [];
    if (
      list.some(
        (x) =>
          x.english_start < d.english_end && x.english_end > d.english_start
      )
    ) {
      return;
    }
    list.push(d);
    bySent.set(d.sentence_id, list);
  };
  for (const d of grammar) add(d);
  for (const d of vocab) add(d);

  let order = 1;
  const out: Stage6ItemDraft[] = [];
  for (const id of sentenceIds) {
    const list = (bySent.get(id) ?? []).sort(
      (a, b) => a.english_start - b.english_start
    );
    for (const d of list) out.push({ ...d, blank_order: order++ });
  }
  return out;
}

export function stage6AiCoverageOk(
  ai: Stage6ItemDraft[],
  sentenceCount: number,
  category?: "grammar" | "vocabulary"
): boolean {
  if (sentenceCount <= 0 || ai.length === 0) return false;
  const filtered = category
    ? ai.filter((d) => (d.question_category || "grammar") === category)
    : ai;
  if (filtered.length === 0) return false;
  const covered = new Set(filtered.map((d) => d.sentence_id)).size;
  return (
    covered >= Math.ceil(sentenceCount * 0.9) &&
    filtered.length >= sentenceCount
  );
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
    // 인천 PDF: 오류 정확히 3개
    requiredErrorCount: errorCount >= 3 ? 3 : Math.max(1, errorCount),
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

function isStage9FixedLine(text: string): boolean {
  const t = text.trim();
  return (
    /^(to whom|sincerely|dear|thank you)/i.test(t) ||
    /morgan|sincerely/i.test(t)
  );
}

/** 문단 번호 기준으로 묶고, 부족하면 연속 문장 덩어리로 2~3분할. 라벨은 A/B/C 셔플. */
export function buildStage9Config(sentences: SeedSentence[]): Stage9ConfigDraft | null {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  if (ordered.length < 2) return null;

  const body = ordered.filter((s) => !isStage9FixedLine(s.english_text));
  const use = body.length >= 3 ? body : ordered;

  const paraMap = new Map<number, SeedSentence[]>();
  for (const s of use) {
    const pn = Math.max(1, Number(s.paragraph_number) || 1);
    const arr = paraMap.get(pn) ?? [];
    arr.push(s);
    paraMap.set(pn, arr);
  }
  let groups = [...paraMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, ss]) => ss);

  // 문단이 1개뿐이면 인천 PDF처럼 2~3개 블록으로 연속 분할
  if (groups.length < 2) {
    const flat = groups[0] ?? use;
    if (flat.length < 2) return null;
    const blockCount = flat.length >= 6 ? 3 : 2;
    const size = Math.ceil(flat.length / blockCount);
    groups = [];
    for (let i = 0; i < blockCount; i++) {
      const slice = flat.slice(i * size, (i + 1) * size);
      if (slice.length > 0) groups.push(slice);
    }
  }

  // 문단이 너무 많으면 인접 소블록부터 합쳐 최대 4개
  while (groups.length > 4) {
    let bestI = 0;
    let bestLen = Number.POSITIVE_INFINITY;
    for (let i = 0; i < groups.length - 1; i++) {
      const len = groups[i]!.length + groups[i + 1]!.length;
      if (len < bestLen) {
        bestLen = len;
        bestI = i;
      }
    }
    groups = [
      ...groups.slice(0, bestI),
      [...groups[bestI]!, ...groups[bestI + 1]!],
      ...groups.slice(bestI + 2),
    ];
  }

  if (groups.length < 2) return null;

  const labels = assignShuffledLabels(
    groups.length,
    `seed9:${use.map((s) => s.id).join("|").slice(0, 64)}`
  );

  const blocks = groups.map((slice, i) => ({
    sentence_ids: slice.map((x) => x.id),
    blank_order: i + 1,
    display_label: labels[i]!,
    is_required: true as const,
  }));

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
