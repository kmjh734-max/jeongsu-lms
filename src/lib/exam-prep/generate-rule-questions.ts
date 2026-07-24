import type { ExamPassageSentence, ExamStepType } from "@/lib/exam-prep/types";

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
    const core = t.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "").toLowerCase();
    return core.length >= 3 && !STOP.has(core);
  });
}

function blankRatioCount(n: number, difficulty: string): number {
  if (n <= 0) return 0;
  if (difficulty === "easy") return Math.max(1, Math.min(2, Math.ceil(n * 0.25)));
  if (difficulty === "hard") return Math.max(2, Math.ceil(n * 0.55));
  return Math.max(1, Math.ceil(n * 0.4));
}

function buildEnglishBlank(
  sentence: ExamPassageSentence,
  order: number,
  difficulty: string
): GeneratedQuestionDraft {
  const words = tokens(sentence.english_text);
  const candidates = contentWords(sentence.english_text);
  const pickCount = blankRatioCount(candidates.length, difficulty);
  const picked = candidates.slice(0, pickCount);
  const blanks: Array<{
    id: string;
    answer: string;
    acceptableAnswers: string[];
  }> = [];
  let blankIdx = 0;
  const displayParts = words.map((w) => {
    const core = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (picked.includes(w) || picked.some((p) => p === w)) {
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
    }
    // also match by core
    const match = picked.find(
      (p) => p.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") === core
    );
    if (match && !blanks.some((b) => b.answer === core)) {
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
    }
    return w;
  });

  // ensure at least one blank
  if (blanks.length === 0 && words.length > 0) {
    const i = Math.min(2, words.length - 1);
    const w = words[i];
    const core = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") || w;
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
    question_text: "우리말 해석을 참고하여 영문 빈칸을 채우세요.",
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

function buildGrammarChoice(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const words = contentWords(sentence.english_text);
  if (words.length < 2) return null;
  const target = words[0].replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
  if (!target) return null;
  const distractor =
    words.find((w) => {
      const c = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
      return c && c.toLowerCase() !== target.toLowerCase();
    })?.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") ?? `${target}s`;

  const options = [
    { id: "a", text: target },
    { id: "b", text: distractor },
  ];
  const display = sentence.english_text.replace(
    new RegExp(`\\b${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`),
    "____"
  );

  return {
    sentence_id: sentence.id,
    question_type: "grammar_vocab_choice",
    question_order: order,
    question_text: "문맥에 알맞은 표현을 고르세요.",
    question_data: {
      displayText: display,
      options,
      shuffle: true,
      choiceKind: "vocab",
    },
    correct_answer: { optionId: "a" },
    acceptable_answers: ["a"],
    explanation: `정답은 "${target}"입니다.`,
    difficulty: "medium",
    points: 1,
    ai_generated: false,
  };
}

function buildSentenceOrder(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const words = tokens(sentence.english_text);
  if (words.length < 3) return null;

  // 의미 단위: 2~3 단어씩 묶기
  const chunks: string[] = [];
  for (let i = 0; i < words.length; ) {
    const remain = words.length - i;
    const size = remain <= 4 ? remain : remain >= 6 ? 3 : 2;
    chunks.push(words.slice(i, i + size).join(" "));
    i += size;
  }
  if (chunks.length < 2) return null;

  const items = chunks.map((text, i) => ({
    id: `item_${i + 1}`,
    text,
  }));
  const correctOrder = items.map((it) => it.id);

  return {
    sentence_id: sentence.id,
    question_type: "sentence_order",
    question_order: order,
    question_text: "조각을 올바른 순서로 배열하세요.",
    question_data: {
      items,
      correctOrder,
      koreanHint: sentence.korean_text,
    },
    correct_answer: { order: correctOrder },
    acceptable_answers: [correctOrder],
    explanation: null,
    difficulty: "medium",
    points: 1,
    ai_generated: false,
  };
}

function buildWriting(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft {
  const cues = contentWords(sentence.english_text)
    .slice(0, 4)
    .map((w) => w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ""));
  return {
    sentence_id: sentence.id,
    question_type: "writing",
    question_order: order,
    question_text: "제시어를 사용하여 영어 문장을 쓰세요.",
    question_data: {
      koreanPrompt: sentence.korean_text ?? "(해석 없음)",
      cueWords: cues,
    },
    correct_answer: { text: sentence.english_text },
    acceptable_answers: [sentence.english_text],
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
    question_text: "영문과 해석을 읽고 이해했으면 확인하세요.",
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
    // 해석 없으면 영문 빈칸으로 대체하지 않고 스킵
    return null;
  }
  const parts = korean.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  const contentIdx = parts
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => w.replace(/[^\uAC00-\uD7A3]/g, "").length >= 2);
  const pickN =
    difficulty === "easy"
      ? Math.max(1, Math.min(2, Math.ceil(contentIdx.length * 0.25)))
      : difficulty === "hard"
        ? Math.max(2, Math.ceil(contentIdx.length * 0.5))
        : Math.max(1, Math.ceil(contentIdx.length * 0.35));
  const picked = contentIdx.slice(0, pickN);
  const blanks: Array<{
    id: string;
    answer: string;
    acceptableAnswers: string[];
  }> = [];
  const display = parts.map((w, i) => {
    const hit = picked.find((p) => p.i === i);
    if (!hit) return w;
    const core = w.replace(/[^\uAC00-\uD7A3A-Za-z0-9]+$/g, "");
    const trail = w.slice(core.length);
    const id = `blank_${blanks.length + 1}`;
    blanks.push({
      id,
      answer: core,
      acceptableAnswers: [core],
    });
    return `____${trail}`;
  });
  if (blanks.length === 0) return null;
  return {
    sentence_id: sentence.id,
    question_type: "korean_blank",
    question_order: order,
    question_text: "영문을 보고 우리말 해석의 빈칸을 채우세요.",
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
    question_text: "영어 문장을 우리말로 해석하세요.",
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

function buildVerbForm(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const words = tokens(sentence.english_text);
  const targets: Array<{ word: string; index: number; base: string }> = [];
  words.forEach((w, i) => {
    const core = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (!core) return;
    let base = core.toLowerCase();
    if (/ing$/i.test(core) && core.length > 4) {
      base = core.replace(/ing$/i, "").toLowerCase();
      // dumping → dump (rough: doubled consonant before -ing)
      if (base.length >= 2 && base.at(-1) === base.at(-2)) {
        base = base.slice(0, -1);
      }
      targets.push({ word: core, index: i, base });
    } else if (/ed$/i.test(core) && core.length > 3) {
      base = core.replace(/ed$/i, "").toLowerCase();
      if (base.length >= 2 && base.at(-1) === base.at(-2)) {
        base = base.slice(0, -1);
      }
      targets.push({ word: core, index: i, base });
    }
  });
  if (targets.length === 0) {
    const cw = contentWords(sentence.english_text);
    if (cw.length === 0) return null;
    const core = cw[0].replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (!core) return null;
    const idx = words.findIndex(
      (w) => w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") === core
    );
    targets.push({
      word: core,
      index: idx >= 0 ? idx : 0,
      base: core.toLowerCase(),
    });
  }
  const t = targets[0];
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
    question_text: `동사 기본형 [${t.base}] 를 문맥에 맞게 활용하세요.`,
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

function buildErrorCorrection(
  sentence: ExamPassageSentence,
  order: number
): GeneratedQuestionDraft | null {
  const words = tokens(sentence.english_text);
  if (words.length < 4) return null;
  // content word 하나를 의도적으로 변형
  const candidates = contentWords(sentence.english_text);
  if (candidates.length === 0) return null;
  const target = candidates[0];
  const core = target.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
  if (!core) return null;
  // 간단한 오류: 복수/시제 왜곡
  const wrong =
    /s$/i.test(core) ? core.replace(/s$/i, "") : `${core}s`;
  const corrupted = words.map((w) => {
    const c = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
    if (c === core) {
      const lead = w.match(/^[^A-Za-z']+/)?.[0] ?? "";
      const trail = w.match(/[^A-Za-z']+$/)?.[0] ?? "";
      return `${lead}${wrong}${trail}`;
    }
    return w;
  });
  return {
    sentence_id: sentence.id,
    question_type: "error_correction",
    question_order: order,
    question_text: "어색한 부분을 찾아 올바른 문장으로 고쳐 쓰세요.",
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
    question_text: "문장(문단)을 흐름에 맞게 배열하세요.",
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
    return out;
  }

  if (stepType === "paragraph_order") {
    const q = buildParagraphOrder(sentences, order);
    if (q) out.push(q);
    return out;
  }

  if (stepType === "writing") {
    const important = sentences.filter((s) => s.is_important_writing);
    const list = important.length > 0 ? important : sentences.slice(0, 5);
    for (const s of list) {
      out.push(buildWriting(s, order++));
    }
    return out;
  }

  // 알 수 없는 유형
  for (const s of sentences.slice(0, 3)) {
    out.push(buildComprehension(s, order++));
  }
  return out;
}
