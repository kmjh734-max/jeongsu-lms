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
      return en
        ? `5 ENGLISH factual choices. Ask which does NOT match the passage. Exactly one false; distractors must be close but wrong.`
        : `5 Korean choices. Ask which is NOT true. Exactly one false.`;
    case "content_true":
      return en
        ? `5 ENGLISH factual choices. Ask which DOES match the passage. Exactly one true.`
        : `5 Korean choices. Ask which IS true. Exactly one true.`;
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
      if (code === "요약문추론") {
        return `Create a one-sentence Korean summary with blanks (A) and (B). 5 choices as word pairs like ① success …… effort. Exactly one correct.`;
      }
      return `5 Korean choices for the main point (요지). Exactly one correct. Difficulty: ${
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

function normalizePayload(
  raw: Record<string, unknown>,
  option: QuestionTypeOption,
  passage: string,
  forcedInstruction: string
): GeneratedQuestionPayload {
  const choices = Array.isArray(raw.choices)
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

  let correctAnswer: string | number | number[] = raw.correctAnswer as
    | string
    | number
    | number[];
  if (correctAnswer == null) correctAnswer = 1;

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
    explanation: String(raw.explanation ?? ""),
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

  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `Korean HS English exam writer. ONE question JSON only. Fast & concise.
- instruction EXACTLY: ${JSON.stringify(forcedInstruction)}
- No meta tags. questionText usually "".
- ${needsModified ? "Use passageModified when needed." : "Do NOT change passage; omit passageModified."}
- explanation: 1-2 Korean sentences.
${typeRules(option)}`,
    user: JSON.stringify({
      grade: opts.grade,
      difficulty: option.difficulty,
      forcedInstruction,
      passage,
      hint: slimAnalysis,
      schema: {
        choices: [{ number: 1, text: "string" }],
        correctAnswer: 1,
        explanation: "ko",
        ...(needsModified ? { passageModified: "string" } : {}),
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
