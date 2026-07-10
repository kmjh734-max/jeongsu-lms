import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import { findAingkaOption } from "@/lib/question-generator/question-types";
import { cleanQuestionText } from "@/lib/question-generator/text-utils";
import type { QuestionTypeOption } from "@/lib/question-generator/types";
import type {
  GeneratedQuestionPayload,
  PassageAnalysis,
} from "@/lib/question-generator/types";

function typeRules(option: QuestionTypeOption): string {
  const code = option.aingkaCode || "";
  const en = option.choiceLanguage === "english";
  const ko = option.choiceLanguage === "korean";

  switch (option.type) {
    case "content_false":
      return `${en ? "5 ENGLISH" : "5 Korean"} factual choices about the WHOLE passage.
Ask which does NOT match. Exactly ONE false; the other four must be true.
Style like Korean HS mock exams (효자/학력평가 내용불일치).
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer falsehood, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — subtle falsehood, close distractors, longer choices OK"
            : "standard"
      }. questionText empty.`;
    case "content_true":
      return `${en ? "5 ENGLISH" : "5 Korean"} factual choices about the WHOLE passage.
Ask which DOES match. Exactly ONE true; the other four must be false.
Style like Korean HS mock exams (효자/학력평가 내용일치).
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct fact, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — nuanced correct answer, competitive distractors"
            : "standard"
      }. questionText empty.`;
    case "content_count":
      return `일치개수 SHORT-ANSWER (NOT MCQ). Format like Korean school worksheets.
- instruction is fixed (count how many <보기> items do NOT match the passage).
- questionText = <보기> statements only, labeled (1) (2) (3) ... each on its own line.
- Language of statements: ${en ? "ENGLISH" : "Korean"}.
- Statement count: ${
        option.difficulty === "high" ? "exactly 8" : "exactly 6"
      }.
- Mix true and false statements; correctAnswer = the COUNT of FALSE (non-matching) statements as an integer string (e.g. "3").
- choices: omit or empty array. No ①~⑤ options.
- Do NOT change the passage; omit passageModified.
- explanation: list which numbers are false and why (Korean, brief).
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer true/false"
          : option.difficulty === "high"
            ? "HIGH (상) — subtler distinctions"
            : "standard"
      }.`;
    case "topic":
      return `${en ? "5 ENGLISH" : "5 Korean"} topic phrases. Exactly one correct. Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct answer, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — competitive distractors, nuanced"
            : "standard"
      }.`;
    case "title":
      return `${en ? "5 ENGLISH Title Case titles" : "5 Korean titles"}. Exactly one correct. Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct answer, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — competitive distractors, nuanced"
            : "standard"
      }.`;
    case "summary_mcq":
      // 요약문완성(빈칸 (A)(B) · …… 쌍)은 폐기됨. 요지 객관식만 허용.
      return `요지 MCQ only (NOT 요약문완성).
- 5 FULL Korean sentence/phrase choices for the main point (요지).
- Do NOT invent a summary sentence with blanks (A)/(B).
- Do NOT use …… / ... pair choices (e.g. "성공 …… 노력").
- questionText must be empty.
- Exactly one correct. Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하)"
          : option.difficulty === "high"
            ? "HIGH (상)"
            : "standard"
      }.`;
    case "sentence_blank":
      if (code === "연결어빈칸") {
        return `In passageModified put discourse blanks (A) and (B). 5 ENGLISH pair choices like "However …… Therefore". Exactly one correct.`;
      }
      return `Blank a key phrase/clause in passageModified with ______. 5 English choices. Exactly one correct.`;
    case "order":
      return `Lead-in + paragraphs A/B/C. 5 order choices. Exactly one correct.`;
    case "sentence_insertion":
      return `One sentence to insert + ①~⑤ slots in passageModified. correctAnswer 1-5.`;
    case "irrelevant_sentence":
      return `Label five sentences (A)~(E) in passageModified; exactly ONE is irrelevant. correctAnswer 1-5.`;
    case "grammar":
      if (code === "어법연결") {
        return `In passageModified mark ⓐ, ⓑ, ⓒ with two alternatives in parentheses. 5 ENGLISH connection choices. Exactly one correct.`;
      }
      if (code === "어법고쳐쓰기") {
        return `No MCQ. Student finds one grammar error and rewrites. Model rewrite in correctAnswer.`;
      }
      return `Mark 5 underlined spots in passageModified. Exactly ONE grammatically wrong.`;
    case "vocabulary":
      return `Mark 5 underlined words. Exactly ONE contextually wrong.`;
    case "underlined_inference":
      if (code === "목적추론") {
        return `5 ENGLISH purpose choices (To + verb). Exactly one correct.`;
      }
      if (code === "심경추론") {
        return `5 English emotion-change choices like "worried → relieved". Exactly one correct.`;
      }
      if (code === "함축의미추론") {
        return `Underline the target expression. 5 Korean meaning choices. Exactly one correct.`;
      }
      return `Underline a key expression. 5 Korean meaning choices.`;
    case "writing":
      return `Korean prompt + <조건> + given words. Model answer in correctAnswer.`;
    case "summary_short":
    case "short_title":
    case "short_topic":
      return `Short constructed response. Model answer in correctAnswer.`;
    default:
      return `Follow Korean high-school 학력평가 mock-exam variation style (고1 level).`;
  }
}

/** 지문 표지(①~⑤)와 정답이 묶인 유형은 셔플하면 안 됨 */
const NO_SHUFFLE_TYPES = new Set([
  "grammar",
  "vocabulary",
  "irrelevant_sentence",
  "sentence_insertion",
  "content_count",
]);

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function parseChoiceAnswer(raw: unknown): number | null {
  if (typeof raw === "number" && raw >= 1 && raw <= 5) return raw;
  if (typeof raw === "string") {
    const m = raw.trim().match(/^([1-5])/);
    if (m) return Number(m[1]);
    const ci = CIRCLED.indexOf(raw.trim());
    if (ci >= 0) return ci + 1;
  }
  return null;
}

/** 객관식 선택지를 섞고 정답 번호를 맞춤 (① 편향 방지) */
function shuffleObjectiveChoices(
  choices: Array<{ number: number; text: string }>,
  correctAnswer: number,
  explanation: string
): {
  choices: Array<{ number: number; text: string }>;
  correctAnswer: number;
  explanation: string;
} {
  const n = choices.length;
  if (n < 2 || correctAnswer < 1 || correctAnswer > n) {
    return { choices, correctAnswer, explanation };
  }

  const texts = choices.map((c) => c.text);
  const correctText = texts[correctAnswer - 1]!;

  for (let i = texts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = texts[i]!;
    texts[i] = texts[j]!;
    texts[j] = tmp;
  }

  const newCorrect = texts.findIndex((t) => t === correctText) + 1;
  const newChoices = texts.map((text, i) => ({ number: i + 1, text }));

  let nextExplanation = explanation;
  if (newCorrect !== correctAnswer && explanation) {
    const from = CIRCLED[correctAnswer - 1]!;
    const to = CIRCLED[newCorrect - 1]!;
    nextExplanation = explanation
      .split(from)
      .join(to)
      .replace(
        new RegExp(`정답\\s*[:：]?\\s*${correctAnswer}\\s*번?`, "g"),
        `정답: ${newCorrect}번`
      )
      .replace(
        new RegExp(`답\\s*[:：]?\\s*${correctAnswer}\\b`, "g"),
        `답: ${newCorrect}`
      );
  }

  return {
    choices: newChoices,
    correctAnswer: newCorrect || correctAnswer,
    explanation: nextExplanation,
  };
}

function normalizePayload(
  raw: Record<string, unknown>,
  option: QuestionTypeOption,
  passage: string,
  forcedInstruction: string
): GeneratedQuestionPayload {
  let choices = Array.isArray(raw.choices)
    ? raw.choices
        .map((c, i) => {
          const row = (c ?? {}) as Record<string, unknown>;
          return {
            number: typeof row.number === "number" ? row.number : i + 1,
            text: String(row.text ?? ""),
          };
        })
        .filter((c) => c.text.trim())
    : undefined;

  // 일치개수는 기입형 — 선택지 제거
  if (option.type === "content_count") {
    choices = undefined;
  }

  let correctAnswer: string | number | number[] = raw.correctAnswer as
    | string
    | number
    | number[];
  let explanation = String(raw.explanation ?? "");

  if (option.type === "content_count") {
    const n =
      typeof correctAnswer === "number"
        ? correctAnswer
        : parseInt(String(correctAnswer ?? "").replace(/[^\d]/g, ""), 10);
    correctAnswer = Number.isFinite(n) ? String(n) : "0";
  } else {
  const parsed = parseChoiceAnswer(correctAnswer);
  if (
    option.isObjective &&
    choices &&
    choices.length >= 2 &&
    !NO_SHUFFLE_TYPES.has(option.type)
  ) {
    const before = parsed ?? 1;
    const shuffled = shuffleObjectiveChoices(choices, before, explanation);
    choices = shuffled.choices;
    correctAnswer = shuffled.correctAnswer;
    explanation = shuffled.explanation;
  } else if (correctAnswer == null) {
    correctAnswer = parsed ?? 1;
  }
  }

  return {
    type: option.type,
    category: option.category,
    difficulty: option.difficulty,
    choiceLanguage: option.choiceLanguage,
    passageOriginal: passage,
    passageModified:
      typeof raw.passageModified === "string" ? raw.passageModified : undefined,
    instruction: forcedInstruction,
    questionText: cleanQuestionText(String(raw.questionText ?? "")),
    choices,
    correctAnswer,
    acceptableAnswers: Array.isArray(raw.acceptableAnswers)
      ? raw.acceptableAnswers.map((x) => String(x))
      : undefined,
    explanation,
    evidence: [],
    scoringGuide:
      raw.scoringGuide && typeof raw.scoringGuide === "object"
        ? (raw.scoringGuide as GeneratedQuestionPayload["scoringGuide"])
        : undefined,
  };
}

export function assertBasicQuestionShape(
  q: GeneratedQuestionPayload,
  option: QuestionTypeOption
): string | null {
  if (!q.instruction.trim()) return "발문이 비어 있습니다.";
  if (!q.explanation.trim()) return "해설이 비어 있습니다.";
  if (option.isObjective && option.choiceLanguage) {
    if (!q.choices || q.choices.length < 5) {
      return "객관식 선택지가 5개 미만입니다.";
    }
  }
  if (option.type === "content_count") {
    const qt = (q.questionText || "").trim();
    if (!qt || !/\(1\)/.test(qt)) {
      return "일치개수 문항은 <보기> (1)(2)… 진술이 필요합니다.";
    }
    if (q.choices && q.choices.length > 0) {
      // 객관식 선택지는 쓰지 않음
      q.choices = undefined;
    }
    const ans = String(q.correctAnswer ?? "").trim();
    if (!/^\d+$/.test(ans)) {
      return "일치개수 정답은 숫자(개수)여야 합니다.";
    }
  }
  return null;
}

export async function generateOneQuestion(opts: {
  passage: string;
  analysis: PassageAnalysis;
  option: QuestionTypeOption;
  grade: string;
  overallDifficulty: string;
  sourceDetail?: string;
}): Promise<GeneratedQuestionPayload> {
  const { option, passage, analysis } = opts;
  const meta = findAingkaOption(option.key);
  const forcedInstruction =
    meta?.koreanStem ||
    option.koreanStem ||
    "윗글의 내용과 일치하지 않는 것은?";

  const slimAnalysis = {
    overallTopic: analysis.overallTopic,
    overallMainIdea: analysis.overallMainIdea,
    titleCandidates: (analysis.titleCandidates ?? []).slice(0, 4),
  };

  const needsModified = [
    "grammar",
    "vocabulary",
    "sentence_blank",
    "order",
    "sentence_insertion",
    "irrelevant_sentence",
  ].includes(option.type);

  const needsQuestionText = option.type === "content_count";

  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `Korean HS English exam writer. ONE question JSON only. Fast & concise.
- instruction EXACTLY: ${JSON.stringify(forcedInstruction)}
- No meta tags. ${needsQuestionText ? "Fill questionText with (A)~(E) statements." : 'questionText usually "".'}
- NEVER create 요약문완성 (Korean summary with (A)/(B) blanks and …… pair choices). That type is removed.
- ${needsModified ? "Use passageModified when needed." : "Do NOT change passage; omit passageModified."}
- explanation: 1-2 Korean sentences.
- For MCQ: correctAnswer is 1-5. Prefer varied positions (not always 1).
${typeRules(option)}`,
    user: JSON.stringify({
      grade: opts.grade,
      difficulty: option.difficulty,
      forcedInstruction,
      passage,
      hint: slimAnalysis,
      schema: {
        choices: [{ number: 1, text: "string" }],
        correctAnswer: "integer 1-5 (vary; not always 1)",
        explanation: "ko",
        ...(needsModified ? { passageModified: "string" } : {}),
        ...(needsQuestionText
          ? {
              questionText:
                "(1) ...\\n(2) ...\\n(3) ...\\n(4) ...\\n(5) ...\\n(6) ...",
              correctAnswer: "integer count of FALSE statements",
              choices: [],
            }
          : {}),
      },
    }),
    temperature: 0.25,
    maxTokens: 1600,
  })) as Record<string, unknown>;

  const payload = normalizePayload(raw, option, passage, forcedInstruction);
  const shapeError = assertBasicQuestionShape(payload, option);
  if (shapeError) throw new Error(shapeError);
  return payload;
}
