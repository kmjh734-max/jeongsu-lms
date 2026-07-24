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

  if (stepType === "english_blank") {
    for (const s of sentences) {
      out.push(buildEnglishBlank(s, order++, difficulty));
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

  if (stepType === "writing") {
    const important = sentences.filter((s) => s.is_important_writing);
    const list = important.length > 0 ? important : sentences.slice(0, 5);
    for (const s of list) {
      out.push(buildWriting(s, order++));
    }
    return out;
  }

  // 미구현 단계: comprehension 스타일 placeholder
  for (const s of sentences.slice(0, 3)) {
    out.push({
      ...buildComprehension(s, order++),
      question_text: `[준비중] ${stepType} — 문장을 확인하세요.`,
      question_type: String(stepType),
    });
  }
  return out;
}
