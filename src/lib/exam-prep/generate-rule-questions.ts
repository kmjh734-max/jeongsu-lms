import type { ExamPassageSentence, ExamStepType } from "@/lib/exam-prep/types";
import { workbookPromptForStepType } from "@/lib/exam-prep/presets";
import {
  blankPickCount,
  englishCore,
  koreanCore,
  splitKoreanParticle,
  pickSpreadByScore,
  scoreEnglishBlank,
  scoreKoreanBlank,
  vocabEnglishNeedles,
  vocabKoreanNeedles,
} from "@/lib/exam-prep/blank-importance";
import { buildStage6Drafts } from "@/lib/exam-prep/auto-seed-stages";
import { newOptionId } from "@/lib/exam-prep/stage6-types";
import {
  buildPdfReorderDisplay,
  buildPhraseChunkTexts,
} from "@/lib/exam-prep/phrase-reorder";
import {
  buildPdfWritingSegments,
  buildWritingCues,
  formatWritingSlotLine,
  pickWritingCueTexts,
} from "@/lib/exam-prep/guided-writing";

export type GeneratedQuestionDraft = {
  sentence_id: string | null;
  question_type: string;
  question_order: number;
  question_text: string;
  question_data: Record<string, unknown>;
  correct_answer: unknown;
  acceptable_answers: unknown;
  explanation: string | null;
  difficulty: string;
  points: number;
  ai_generated: boolean;
};

function stepPrompt(stepType: string, fallback: string): string {
  return workbookPromptForStepType(stepType) ?? fallback;
}

const STOP = new Set([
  "the",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "this",
  "that",
  "with",
  "as",
  "by",
  "from",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "not",
  "their",
  "our",
  "my",
  "your",
  "we",
  "you",
  "they",
  "he",
  "she",
  "i",
  "me",
  "him",
  "them",
  "us",
  "can",
  "could",
  "would",
  "should",
  "will",
  "may",
  "might",
  "must",
]);

function tokens(english: string): string[] {
  return english
    .replace(/[""]/g, '"')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function contentWords(english: string): string[] {
  return tokens(english).filter((t) => {
    const core = englishCore(t).toLowerCase();
    return core.length >= 3 && !STOP.has(core);
  });
}

function buildEnglishBlank(
  sentence: ExamPassageSentence,
  order: number,
  difficulty: string
): GeneratedQuestionDraft {
  const words = tokens(sentence.english_text);
  const vocab = vocabEnglishNeedles(sentence.vocabulary).map((v) => v.toLowerCase());

  const scored = words
    .map((w, index) => {
      const core = englishCore(w);
      let score = scoreEnglishBlank(w);
      if (vocab.some((v) => v === core.toLowerCase() || core.toLowerCase().includes(v) || v.includes(core.toLowerCase()))) {
        score = Math.max(score, 0) + 12;
      }
      return { index, word: w, core, score };
    })
    .filter((x) => x.score > 0 && x.core.length >= 3);

  const pickCount = blankPickCount(scored.length, difficulty, { max: 5 });
  const picked = pickSpreadByScore(scored, pickCount);
  const pickedIndex = new Set(picked.map((p) => p.index));

  const blanks: Array<{
    id: string;
    answer: string;
    acceptableAnswers: string[];
  }> = [];
  let blankIdx = 0;
  const displayParts = words.map((w, i) => {
    if (!pickedIndex.has(i)) return w;
    const core = englishCore(w);
    const lead = w.match(/^[^A-Za-z']+/)?.[0] ?? "";
    const trail = w.match(/[^A-Za-z']+$/)?.[0] ?? "";
    const id = `blank_${blankIdx + 1}`;
    blankIdx += 1;
    blanks.push({
      id,
      answer: core,
      acceptableAnswers: [core, core.toLowerCase()],
    });
    return `${lead}____${trail}`;
  });

  if (blanks.length === 0 && words.length > 0) {
    // 문장 중간의 가장 긴 content 단어
    const mid = scored.sort((a, b) => b.score - a.score)[0] ?? {
      index: Math.min(Math.floor(words.length / 2), words.length - 1),
      core: englishCore(words[Math.min(Math.floor(words.length / 2), words.length - 1)]!),
    };
    const i = mid.index;
    const w = words[i]!;
    const core = englishCore(w) || w;
    blanks.push({
      id: "blank_1",
      answer: core,
      acceptableAnswers: [core],
    });
    displayParts[i] = "____";
  }

  return {
    sentence_id: sentence.id,
    question_type: "english_blank",
    question_order: order,
    question_text: stepPrompt(
      "english_blank",
      "우리말 해석을 읽고 영문의 빈칸을 완성해 보세요."
    ),
    question_data: {
      displayText: displayParts.join(" "),
      koreanHint: sentence.korean_text,
      blanks,
    },
    correct_answer: { blanks },
    acceptable_answers: blanks.map((b) => b.acceptableAnswers),
    explanation: null,
    difficulty,
    points: blanks.length,
    ai_generated: false,
  };
}

/**
 * 6단계 PDF형: 문장 안 [a / b] (어법·어휘 2지 선택, 문장당 여러 개)
 */
function buildGrammarChoice(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const english = String(sentence.english_text ?? "").trim();
  if (!english) return null;

  let items = buildStage6Drafts([
    {
      id: sentence.id,
      english_text: english,
      korean_text: sentence.korean_text,
      sentence_order: sentence.sentence_order,
      paragraph_number: sentence.paragraph_number,
      vocabulary: sentence.vocabulary,
      is_important_writing: sentence.is_important_writing,
    },
  ]);

  // 시드가 비면 중요 어휘 1~2곳에 형태 쌍 폴백
  if (items.length === 0) {
    const words = tokens(english);
    const scored = words
      .map((w, index) => ({
        index,
        word: w,
        core: englishCore(w),
        score: scoreEnglishBlank(w),
      }))
      .filter((x) => x.score > 0 && x.core.length >= 4);
    const picked = pickSpreadByScore(scored, Math.min(3, Math.max(1, scored.length)));
    let cursorSearch = 0;
    items = picked.map((p, i) => {
      const core = p.core;
      const start = english.toLowerCase().indexOf(core.toLowerCase(), cursorSearch);
      const end = start >= 0 ? start + core.length : 0;
      if (start >= 0) cursorSearch = end;
      const wrong = core.endsWith("ing")
        ? `${core.slice(0, -3)}ed`
        : core.endsWith("ed")
          ? `${core.slice(0, -2)}ing`
          : core.endsWith("s")
            ? core.slice(0, -1)
            : `${core}s`;
      const matched = start >= 0 ? english.slice(start, end) : core;
      return {
        sentence_id: sentence.id,
        blank_order: i + 1,
        answer_text: matched,
        english_start: Math.max(0, start),
        english_end: Math.max(matched.length, end),
        selected_text: matched,
        choice_options: [
          { id: newOptionId(), text: matched, isCorrect: true },
          { id: newOptionId(), text: wrong, isCorrect: false },
        ],
        question_category: "vocabulary" as const,
        grammar_subcategory: [] as string[],
        vocabulary_subcategory: ["word_form"],
        shuffle_options: true,
        is_required: true,
      };
    });
  }

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.english_start - b.english_start);
  let display = english;
  // 뒤에서부터 치환해 인덱스 유지
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i]!;
    const opts = d.choice_options.map((o) => o.text).filter(Boolean);
    if (opts.length < 2) continue;
    // PDF처럼 좌우 순서 섞기 (정답이 항상 왼쪽이 아님)
    const show =
      d.shuffle_options !== false && Math.random() < 0.5
        ? [opts[1]!, opts[0]!]
        : [opts[0]!, opts[1]!];
    const bracket = `[${show.join(" / ")}]`;
    display =
      display.slice(0, d.english_start) + bracket + display.slice(d.english_end);
  }

  const choiceBlanks = sorted.map((d, i) => {
    const options = d.choice_options.map((o, j) => ({
      id: o.id || `opt_${i + 1}_${j}`,
      text: o.text,
    }));
    const correct =
      d.choice_options.find((o) => o.isCorrect) ?? d.choice_options[0]!;
    return {
      id: `blank_${i + 1}`,
      answer: d.answer_text,
      options,
      correctOptionId: correct.id || options[0]!.id,
      category: d.question_category,
    };
  });

  const first = choiceBlanks[0]!;

  return {
    sentence_id: sentence.id,
    question_type: "grammar_vocab_choice",
    question_order: order,
    question_text: stepPrompt(
      "grammar_vocab_choice",
      "괄호 안에서 옳은 어법과 어휘를 골라 보세요."
    ),
    question_data: {
      displayText: display,
      koreanHint: sentence.korean_text,
      format: "inline_ab",
      choiceBlanks,
      // 구형 UI 호환: 첫 슬롯 2지
      options: first.options.slice(0, 2),
      choiceKind: "mixed",
    },
    correct_answer: {
      optionId: first.correctOptionId,
      selections: Object.fromEntries(
        choiceBlanks.map((b) => [b.id, b.correctOptionId])
      ),
    },
    acceptable_answers: choiceBlanks.map((b) => b.correctOptionId),
    explanation: choiceBlanks
      .map((b) => `${b.answer}`)
      .join(" · "),
    difficulty: "medium",
    points: choiceBlanks.length,
    ai_generated: false,
  };
}

/**
 * 8단계 PDF형: 우리말 + (어구 / 어구 / …) 순서배열
 */
function buildSentenceOrder(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const english = String(sentence.english_text ?? "").trim();
  if (english.split(/\s+/).length < 3) return null;

  const { displayText, reorderChunks } = buildPdfReorderDisplay(english, true);
  const primary =
    reorderChunks.find((c) => c.length >= 3) ??
    reorderChunks[0] ??
    buildPhraseChunkTexts(english);
  if (primary.length < 2) return null;

  const items = primary.map((text, i) => ({
    id: `item_${i + 1}`,
    text,
  }));
  const correctOrder = items.map((it) => it.id);

  // 미리보기용: 섞인 순서는 displayText에 이미 반영. items는 정답 순서 유지(채점용)
  // 학습 UI는 items를 셔플해서 보여 줌
  const shuffledItems = [...items];
  for (let i = shuffledItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j]!, shuffledItems[i]!];
  }

  return {
    sentence_id: sentence.id,
    question_type: "sentence_order",
    question_order: order,
    question_text: stepPrompt(
      "sentence_order",
      "우리말과 같은 뜻이 되도록 주어진 단어를 바르게 배열해 보세요."
    ),
    question_data: {
      format: "pdf_phrase_reorder",
      displayText,
      items: shuffledItems,
      correctOrder,
      koreanHint: sentence.korean_text,
      allReorderGroups: reorderChunks.map((chunks, gi) => ({
        id: `g${gi + 1}`,
        items: chunks.map((text, i) => ({ id: `g${gi + 1}_${i + 1}`, text })),
      })),
    },
    correct_answer: { order: correctOrder },
    acceptable_answers: [correctOrder],
    explanation: null,
    difficulty: "medium",
    points: 1,
    ai_generated: false,
  };
}

/**
 * 10단계 PDF형: 우리말 + 제시어 + 고정구/단어 빈칸
 */
function buildWriting(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft {
  const english = String(sentence.english_text ?? "").trim();
  const korean = String(sentence.korean_text ?? "").trim() || "(해석 없음)";
  const segments = buildPdfWritingSegments(english);
  const answerTexts = segments
    .filter((s) => s.segmentType === "answer_segment")
    .map((s) => s.originalAnswerText ?? "")
    .join(" ");
  const cueWords = pickWritingCueTexts(english, sentence.vocabulary, answerTexts);
  const displayText =
    segments.length > 0
      ? formatWritingSlotLine(segments)
      : "______________";
  const cues = buildWritingCues(cueWords, segments);

  return {
    sentence_id: sentence.id,
    question_type: "writing",
    question_order: order,
    question_text: stepPrompt(
      "writing",
      "우리말과 같은 뜻이 되도록 주어진 단어를 순서대로 사용하여 영작하세요."
    ),
    question_data: {
      format: "pdf_guided_writing",
      koreanPrompt: korean,
      cueWords,
      displayText,
      writingSegments: segments,
      writingCues: cues,
    },
    correct_answer: { text: english },
    acceptable_answers: [english],
    explanation: null,
    difficulty: "hard",
    points: 2,
    ai_generated: false,
  };
}

function buildComprehension(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft {
  return {
    sentence_id: sentence.id,
    question_type: "comprehension",
    question_order: order,
    question_text: stepPrompt(
      "comprehension",
      "영문과 해석을 읽고 문장의 의미를 이해해 보세요."
    ),
    question_data: {
      english: sentence.english_text,
      korean: sentence.korean_text,
      vocabulary: sentence.vocabulary,
      grammar_points: sentence.grammar_points,
    },
    correct_answer: { confirmed: true },
    acceptable_answers: null,
    explanation: null,
    difficulty: "easy",
    points: 1,
    ai_generated: false,
  };
}

function buildKoreanBlank(
  sentence: ExamPassageSentence,
  order: number,
  difficulty: string
): GeneratedQuestionDraft | null {
  const korean = (sentence.korean_text ?? "").trim();
  if (!korean) {
    return {
      sentence_id: sentence.id,
      question_type: "korean_blank",
      question_order: order,
      question_text: stepPrompt(
        "korean_blank",
        "영문을 읽고 우리말 해석의 빈칸을 완성해 보세요."
      ),
      question_data: {
        displayText: "______________________________",
        englishHint: sentence.english_text,
        blanks: [
          {
            id: "blank_1",
            answer: "",
            acceptableAnswers: [],
          },
        ],
      },
      correct_answer: { blanks: [] },
      acceptable_answers: null,
      explanation: null,
      difficulty,
      points: 1,
      ai_generated: false,
    };
  }
  const parts = korean.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return {
      sentence_id: sentence.id,
      question_type: "korean_blank",
      question_order: order,
      question_text: stepPrompt(
        "korean_blank",
        "영문을 읽고 우리말 해석의 빈칸을 완성해 보세요."
      ),
      question_data: {
        displayText: "____",
        englishHint: sentence.english_text,
        blanks: [
          {
            id: "blank_1",
            answer: korean,
            acceptableAnswers: [korean],
          },
        ],
      },
      correct_answer: {
        blanks: [
          { id: "blank_1", answer: korean, acceptableAnswers: [korean] },
        ],
      },
      acceptable_answers: [[korean]],
      explanation: null,
      difficulty,
      points: 1,
      ai_generated: false,
    };
  }

  const vocab = vocabKoreanNeedles(sentence.vocabulary);
  const scored = parts
    .map((w, index) => {
      let score = scoreKoreanBlank(w);
      const core = koreanCore(w);
      if (vocab.some((v) => v === core || w.includes(v) || v.includes(core))) {
        score = Math.max(score, 0) + 12;
      }
      return { index, word: w, score };
    })
    .filter((x) => x.score > 0);

  const pickN = blankPickCount(scored.length || parts.length, difficulty, { max: 5 });
  const picked = pickSpreadByScore(
    scored.length > 0
      ? scored
      : parts.map((w, index) => ({
          index,
          word: w,
          score: Math.max(1, koreanCore(w).length),
        })),
    pickN
  );
  const pickedIndex = new Set(picked.map((p) => p.index));

  const blanks: Array<{
    id: string;
    answer: string;
    acceptableAnswers: string[];
  }> = [];
  const display = parts.map((w, i) => {
    if (!pickedIndex.has(i)) return w;
    const { stem, particle } = splitKoreanParticle(w);
    const answer = stem || w.replace(/[^\uAC00-\uD7A3A-Za-z0-9]+$/g, "");
    const trail = particle || w.slice(answer.length);
    const id = `blank_${blanks.length + 1}`;
    blanks.push({
      id,
      answer,
      acceptableAnswers: [answer, koreanCore(w)].filter(
        (x, idx, arr) => x && arr.indexOf(x) === idx
      ),
    });
    return `____${trail}`;
  });
  if (blanks.length === 0) return null;
  return {
    sentence_id: sentence.id,
    question_type: "korean_blank",
    question_order: order,
    question_text: stepPrompt(
      "korean_blank",
      "영문을 읽고 우리말 해석의 빈칸을 완성해 보세요."
    ),
    question_data: {
      displayText: display.join(" "),
      englishHint: sentence.english_text,
      blanks,
    },
    correct_answer: { blanks },
    acceptable_answers: blanks.map((b) => b.acceptableAnswers),
    explanation: null,
    difficulty,
    points: blanks.length,
    ai_generated: false,
  };
}

function buildTranslationPractice(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft {
  return {
    sentence_id: sentence.id,
    question_type: "translation_practice",
    question_order: order,
    question_text: stepPrompt(
      "translation_practice",
      "문장 전체의 자연스러운 해석을 써 보세요."
    ),
    question_data: {
      english: sentence.english_text,
    },
    correct_answer: {
      text: sentence.korean_text ?? "",
    },
    acceptable_answers: sentence.korean_text ? [sentence.korean_text] : [],
    explanation: sentence.korean_text
      ? "모범 해석과 의미가 같으면 정답으로 볼 수 있습니다."
      : "해석이 없어 강사 확인이 필요합니다.",
    difficulty: "medium",
    points: 2,
    ai_generated: false,
  };
}

const IRREGULAR_BASE: Record<string, string> = {
  was: "be",
  were: "be",
  been: "be",
  am: "be",
  is: "be",
  are: "be",
  being: "be",
  had: "have",
  has: "have",
  having: "have",
  did: "do",
  does: "do",
  done: "do",
  doing: "do",
  went: "go",
  gone: "go",
  going: "go",
  made: "make",
  making: "make",
  took: "take",
  taken: "take",
  taking: "take",
  came: "come",
  coming: "come",
  saw: "see",
  seen: "see",
  seeing: "see",
  got: "get",
  gotten: "get",
  getting: "get",
  said: "say",
  saying: "say",
  left: "leave",
  leaving: "leave",
  felt: "feel",
  feeling: "feel",
  found: "find",
  finding: "find",
  gave: "give",
  given: "give",
  giving: "give",
  knew: "know",
  known: "know",
  knowing: "know",
  thought: "think",
  thinking: "think",
  told: "tell",
  telling: "tell",
  became: "become",
  becoming: "become",
  began: "begin",
  begun: "begin",
  beginning: "begin",
  ran: "run",
  running: "run",
  wrote: "write",
  written: "write",
  writing: "write",
  spoke: "speak",
  spoken: "speak",
  speaking: "speak",
};

function guessVerbBase(core: string): string {
  const lower = core.toLowerCase();
  if (IRREGULAR_BASE[lower]) return IRREGULAR_BASE[lower]!;
  if (/ying$/i.test(core) && core.length > 5) {
    return core.replace(/ying$/i, "ie").toLowerCase();
  }
  if (/ing$/i.test(core) && core.length > 4) {
    let base = core.replace(/ing$/i, "").toLowerCase();
    if (base.length >= 2 && base.at(-1) === base.at(-2)) base = base.slice(0, -1);
    else if (!/[aeiou]/.test(base.at(-1) ?? "") && base.length >= 3) {
      // hoping → hope (rough)
      base = `${base}e`;
    }
    return base;
  }
  if (/ied$/i.test(core) && core.length > 4) {
    return core.replace(/ied$/i, "y").toLowerCase();
  }
  if (/ed$/i.test(core) && core.length > 3) {
    let base = core.replace(/ed$/i, "").toLowerCase();
    if (base.length >= 2 && base.at(-1) === base.at(-2)) base = base.slice(0, -1);
    return base;
  }
  if (/s$/i.test(core) && core.length > 3 && !/ss$/i.test(core)) {
    return core.replace(/s$/i, "").toLowerCase();
  }
  return lower;
}

function buildVerbForm(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const words = tokens(sentence.english_text);
  const targets: Array<{ word: string; index: number; base: string }> = [];
  words.forEach((w, i) => {
    const core = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (!core || core.length < 2) return;
    const lower = core.toLowerCase();
    const looksInflected =
      Boolean(IRREGULAR_BASE[lower]) ||
      /ing$/i.test(core) ||
      /ed$/i.test(core) ||
      (/s$/i.test(core) && !STOP.has(lower) && core.length >= 4);
    if (!looksInflected) return;
    if (STOP.has(lower) && !IRREGULAR_BASE[lower]) return;
    targets.push({ word: core, index: i, base: guessVerbBase(core) });
  });
  if (targets.length === 0) {
    const cw = contentWords(sentence.english_text);
    if (cw.length === 0) return null;
    const core = cw[0]!.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (!core) return null;
    const idx = words.findIndex(
      (w) => w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") === core
    );
    targets.push({
      word: core,
      index: idx >= 0 ? idx : 0,
      base: guessVerbBase(core),
    });
  }
  // prefer content-like verbs over aux
  const t =
    targets.find((x) => !["be", "have", "do"].includes(x.base)) ?? targets[0]!;
  const display = words.map((w, i) => {
    const core = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (i === t.index || core === t.word) {
      const lead = w.match(/^[^A-Za-z']+/)?.[0] ?? "";
      const trail = w.match(/[^A-Za-z']+$/)?.[0] ?? "";
      return `${lead}____${trail}`;
    }
    return w;
  });
  return {
    sentence_id: sentence.id,
    question_type: "verb_form",
    question_order: order,
    question_text: stepPrompt(
      "verb_form",
      "괄호 안에 주어진 단어를 알맞게 고쳐 쓰세요."
    ),
    question_data: {
      displayText: display.join(" "),
      baseForm: t.base,
      koreanHint: sentence.korean_text,
      blanks: [
        {
          id: "blank_1",
          answer: t.word,
          acceptableAnswers: [t.word, t.word.toLowerCase()],
        },
      ],
    },
    correct_answer: {
      blanks: [
        {
          id: "blank_1",
          answer: t.word,
          acceptableAnswers: [t.word, t.word.toLowerCase()],
        },
      ],
    },
    acceptable_answers: [t.word],
    explanation: `정답: ${t.word}`,
    difficulty: "medium",
    points: 1,
    ai_generated: false,
  };
}

function corruptWord(core: string): string {
  if (/^(a|an|the)$/i.test(core)) {
    if (/^a$/i.test(core)) return "an";
    if (/^an$/i.test(core)) return "a";
    return "a";
  }
  if (/s$/i.test(core) && core.length > 3) return core.replace(/s$/i, "");
  if (/ed$/i.test(core)) return core.replace(/ed$/i, "");
  if (/ing$/i.test(core)) return core.replace(/ing$/i, "");
  if (/^(is|are|was|were)$/i.test(core)) {
    const map: Record<string, string> = {
      is: "are",
      are: "is",
      was: "were",
      were: "was",
    };
    return map[core.toLowerCase()] ?? `${core}s`;
  }
  return `${core}s`;
}

function buildErrorCorrection(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const words = tokens(sentence.english_text);
  if (words.length < 4) return null;
  const candidates = contentWords(sentence.english_text);
  // also allow articles/aux near content
  const auxIdx = words.findIndex((w) =>
    /^(a|an|the|is|are|was|were)$/i.test(
      w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "")
    )
  );
  let targetWord =
    candidates[Math.min(1, candidates.length - 1)] ?? candidates[0];
  let targetIndex = words.findIndex(
    (w) =>
      w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") ===
      targetWord?.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "")
  );
  if (auxIdx >= 0 && Math.random() < 0.45) {
    targetIndex = auxIdx;
    targetWord = words[auxIdx]!;
  }
  if (!targetWord || targetIndex < 0) return null;
  const core = targetWord.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
  if (!core) return null;
  const wrong = corruptWord(core);
  if (wrong.toLowerCase() === core.toLowerCase()) return null;

  const corrupted = words.map((w, i) => {
    if (i !== targetIndex) return w;
    const lead = w.match(/^[^A-Za-z']+/)?.[0] ?? "";
    const trail = w.match(/[^A-Za-z']+$/)?.[0] ?? "";
    return `${lead}${wrong}${trail}`;
  });
  return {
    sentence_id: sentence.id,
    question_type: "error_correction",
    question_order: order,
    question_text: stepPrompt(
      "error_correction",
      "밑줄 친 부분 중 어법상 어색한 것을 세 개 찾아 알맞게 고쳐 쓰세요."
    ),
    question_data: {
      corruptedText: corrupted.join(" "),
      koreanHint: sentence.korean_text,
      errorWord: wrong,
    },
    correct_answer: {
      text: sentence.english_text,
      errorWord: wrong,
      fixWord: core,
    },
    acceptable_answers: [sentence.english_text],
    explanation: `"${wrong}" → "${core}"`,
    difficulty: "hard",
    points: 2,
    ai_generated: false,
  };
}

function buildParagraphOrder(
  sentences: ExamPassageSentence[],
  order: number
): GeneratedQuestionDraft | null {
  if (sentences.length < 2) return null;
  const items = sentences.map((s, i) => ({
    id: `item_${i + 1}`,
    text: s.english_text,
  }));
  const correctOrder = items.map((it) => it.id);
  return {
    sentence_id: null,
    question_type: "paragraph_order",
    question_order: order,
    question_text: stepPrompt(
      "paragraph_order",
      "다음 문단을 흐름상 알맞게 배열해 보세요."
    ),
    question_data: {
      items,
      correctOrder,
      mode: "sentence",
    },
    correct_answer: { order: correctOrder },
    acceptable_answers: [correctOrder],
    explanation: null,
    difficulty: "medium",
    points: 3,
    ai_generated: false,
  };
}

/** 규칙 기반 문항 생성 (AI 실패 시 폴백) */
export function generateRuleBasedQuestions(
  stepType: ExamStepType | string,
  sentences: ExamPassageSentence[],
  difficulty = "medium"
): GeneratedQuestionDraft[] {
  const out: GeneratedQuestionDraft[] = [];
  let order = 1;

  if (stepType === "comprehension") {
    for (const s of sentences) {
      out.push(buildComprehension(s, order++));
    }
    return out;
  }

  if (stepType === "korean_blank") {
    for (const s of sentences) {
      const q = buildKoreanBlank(s, order, difficulty);
      if (q) {
        out.push(q);
        order += 1;
      }
    }
    if (out.length === 0) {
      for (const s of sentences) {
        out.push(buildComprehension(s, order++));
      }
    }
    return out;
  }

  if (stepType === "english_blank") {
    for (const s of sentences) {
      out.push(buildEnglishBlank(s, order++, difficulty));
    }
    return out;
  }

  if (stepType === "translation_practice") {
    for (const s of sentences) {
      out.push(buildTranslationPractice(s, order++));
    }
    return out;
  }

  if (stepType === "verb_form") {
    for (const s of sentences) {
      const q = buildVerbForm(s, order);
      if (q) {
        out.push(q);
        order += 1;
      }
    }
    if (out.length === 0) {
      for (const s of sentences) {
        out.push(buildEnglishBlank(s, order++, difficulty));
      }
    }
    return out;
  }

  if (stepType === "grammar_vocab_choice") {
    for (const s of sentences) {
      const q = buildGrammarChoice(s, order);
      if (q) {
        out.push(q);
        order += 1;
      }
    }
    if (out.length === 0) {
      for (const s of sentences) {
        out.push(buildEnglishBlank(s, order++, difficulty));
      }
    }
    return out;
  }

  if (stepType === "error_correction") {
    for (const s of sentences) {
      const q = buildErrorCorrection(s, order);
      if (q) {
        out.push(q);
        order += 1;
      }
    }
    if (out.length === 0) {
      for (const s of sentences) {
        out.push(buildComprehension(s, order++));
      }
    }
    return out;
  }

  if (stepType === "sentence_order") {
    for (const s of sentences) {
      const q = buildSentenceOrder(s, order);
      if (q) {
        out.push(q);
        order += 1;
      }
    }
    if (out.length === 0) {
      for (const s of sentences) {
        out.push(buildWriting(s, order++));
      }
    }
    return out;
  }

  if (stepType === "paragraph_order") {
    const q = buildParagraphOrder(sentences, order);
    if (q) out.push(q);
    else {
      for (const s of sentences) {
        out.push(buildComprehension(s, order++));
      }
    }
    return out;
  }

  if (stepType === "writing") {
    const important = sentences.filter((s) => s.is_important_writing);
    const list = important.length > 0 ? important : sentences.slice(0, 5);
    for (const s of list) {
      out.push(buildWriting(s, order++));
    }
    if (out.length === 0) {
      for (const s of sentences) {
        out.push(buildWriting(s, order++));
      }
    }
    return out;
  }

  // 알 수 없는 유형
  for (const s of sentences.slice(0, 3)) {
    out.push(buildComprehension(s, order++));
  }
  return out;
}
