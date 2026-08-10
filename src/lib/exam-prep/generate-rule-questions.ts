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
import { buildStage6Drafts, buildStage7Seed, findVerbHits } from "@/lib/exam-prep/auto-seed-stages";
import { isNonsenseChoicePair } from "@/lib/exam-prep/grammar-workbook-plants";
import { verbLemma } from "@/lib/exam-prep/verb-lemma";
import { newOptionId } from "@/lib/exam-prep/stage6-types";
import {
  buildPdfReorderDisplay,
  buildPhraseChunkTexts,
} from "@/lib/exam-prep/phrase-reorder";
import { assignShuffledLabels } from "@/lib/exam-prep/stage9-types";
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
  ]).filter((d) => {
    const wrong = d.choice_options.find((o) => !o.isCorrect)?.text ?? "";
    const correct =
      d.choice_options.find((o) => o.isCorrect)?.text ?? d.answer_text;
    return !isNonsenseChoicePair(correct, wrong);
  });

  // 형태 장난(sometime/sometimes, know/knowing) 폴백은 쓰지 않음
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

/**
 * 문장의 동사를 모두 빈칸으로. 기본형(cue) 제시.
 * sometimes 같은 비동사는 제외.
 */
function buildVerbForm(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const english = sentence.english_text ?? "";
  const hits = findVerbHits(english);
  if (hits.length === 0) return null;

  const blanks: Array<{
    id: string;
    answer: string;
    acceptableAnswers: string[];
    baseForm: string;
  }> = [];

  // 뒤에서부터 치환해 인덱스 유지
  let display = english;
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i]!;
    const core = h.answer.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") || h.answer;
    const lead = h.answer.match(/^[^A-Za-z']*/)?.[0] ?? "";
    const trail = h.answer.match(/[^A-Za-z']*$/)?.[0] ?? "";
    const base = (h.cues[0] || verbLemma(core)).toLowerCase();
    const id = `blank_${i + 1}`;
    blanks.unshift({
      id,
      answer: core,
      acceptableAnswers: [...new Set([core, core.toLowerCase(), h.answer.trim()])],
      baseForm: base,
    });
    display =
      display.slice(0, h.start) + `${lead}____${trail}` + display.slice(h.end);
  }

  const baseForms = blanks.map((b) => b.baseForm);
  const baseFormLabel = baseForms.map((b) => `(${b})`).join(" ");

  return {
    sentence_id: sentence.id,
    question_type: "verb_form",
    question_order: order,
    question_text: stepPrompt(
      "verb_form",
      "괄호 안에 주어진 단어를 문맥에 맞는 알맞은 형태로 고쳐 쓰세요."
    ),
    question_data: {
      displayText: display,
      baseForm: baseFormLabel,
      baseForms,
      koreanHint: sentence.korean_text,
      blanks,
    },
    correct_answer: { blanks },
    acceptable_answers: blanks.map((b) => b.acceptableAnswers),
    explanation: `정답: ${blanks.map((b) => b.answer).join(", ")}`,
    difficulty: "medium",
    points: Math.max(1, blanks.length),
    ai_generated: false,
  };
}

/**
 * 7단계: 변형문제 어법 플랜트로 오류 심기 (문장당 1오류 + 함정 밑줄)
 */
function buildErrorCorrection(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const seed = buildStage7Seed([
    {
      id: sentence.id,
      english_text: sentence.english_text,
      korean_text: sentence.korean_text,
      sentence_order: sentence.sentence_order,
      paragraph_number: sentence.paragraph_number,
      vocabulary: sentence.vocabulary,
      is_important_writing: sentence.is_important_writing,
    },
  ]);
  const display =
    seed.displays.find((d) => d.sentenceId === sentence.id)?.stage7DisplayText ??
    String(sentence.english_text ?? "");
  const cands = seed.candidates
    .filter((c) => c.sentence_id === sentence.id)
    .sort((a, b) => a.english_start - b.english_start);
  const error = cands.find((c) => c.is_error);
  if (!error) return null;
  if (isNonsenseChoicePair(error.correction_text, error.displayed_text)) {
    return null;
  }

  // 오류·함정 구간에 <u> 표시 (뒤에서부터)
  let marked = display;
  for (let i = cands.length - 1; i >= 0; i--) {
    const c = cands[i]!;
    marked =
      marked.slice(0, c.english_start) +
      `<u>${marked.slice(c.english_start, c.english_end)}</u>` +
      marked.slice(c.english_end);
  }

  return {
    sentence_id: sentence.id,
    question_type: "error_correction",
    question_order: order,
    question_text: stepPrompt(
      "error_correction",
      "밑줄 친 부분 중 어법상 어색한 곳을 찾아 알맞게 고쳐 쓰세요."
    ),
    question_data: {
      corruptedText: marked,
      displayText: marked,
      koreanHint: sentence.korean_text,
      format: "underline_fix",
      fixTargets: [
        {
          wrong: error.displayed_text,
          correct: error.correction_text,
        },
      ],
      underlines: cands.map((c) => ({
        text: c.displayed_text,
        isError: c.is_error,
        correct: c.is_error ? c.correction_text : null,
        start: c.english_start,
        end: c.english_end,
      })),
    },
    correct_answer: {
      text: sentence.english_text,
      errorWord: error.displayed_text,
      fixWord: error.correction_text,
      fixes: [
        { wrong: error.displayed_text, correct: error.correction_text },
      ],
    },
    acceptable_answers: [
      sentence.english_text,
      error.correction_text,
      ...(error.accepted_corrections ?? []),
    ],
    explanation:
      error.explanation ||
      `"${error.displayed_text}" → "${error.correction_text}"`,
    difficulty: "hard",
    points: 2,
    ai_generated: false,
  };
}

function buildParagraphOrder(
  sentences: ExamPassageSentence[],
  order: number
): GeneratedQuestionDraft | null {
  const ordered = [...sentences].sort(
    (a, b) => a.sentence_order - b.sentence_order
  );
  if (ordered.length < 2) return null;

  const paraMap = new Map<number, ExamPassageSentence[]>();
  for (const s of ordered) {
    const pn = Math.max(1, Number(s.paragraph_number) || 1);
    const arr = paraMap.get(pn) ?? [];
    arr.push(s);
    paraMap.set(pn, arr);
  }
  let groups = [...paraMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, ss]) => ss);

  if (groups.length < 2) {
    const flat = groups[0] ?? ordered;
    const blockCount = flat.length >= 6 ? 3 : 2;
    const size = Math.ceil(flat.length / blockCount);
    groups = [];
    for (let i = 0; i < blockCount; i++) {
      const slice = flat.slice(i * size, (i + 1) * size);
      if (slice.length > 0) groups.push(slice);
    }
  }
  while (groups.length > 4) {
    groups = [
      [...groups[0]!, ...groups[1]!],
      ...groups.slice(2),
    ];
  }
  if (groups.length < 2) return null;

  // blank_order(=원문 문단 순)에 셔플된 A/B/C 라벨 배정 → 표시는 라벨 순
  const labels = assignShuffledLabels(
    groups.length,
    `rule9:${ordered.map((s) => s.id).join("|").slice(0, 64)}`
  );
  const items = groups.map((g, i) => ({
    id: labels[i]!,
    label: labels[i]!,
    text: g.map((s) => s.english_text).join(" "),
  }));
  const displayItems = [...items].sort((a, b) =>
    a.label.localeCompare(b.label, "en")
  );
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
      items: displayItems,
      correctOrder,
      mode: "paragraph",
      answerBlank: items.map(() => "(   )").join(" - "),
    },
    correct_answer: {
      order: correctOrder,
      labelSequence: correctOrder.map((id) => `(${id})`).join(" - "),
    },
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
