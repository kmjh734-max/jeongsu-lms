import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import { KOREAN_INSTRUCTION_BY_KEY } from "@/lib/question-generator/question-types";
import type { QuestionTypeOption } from "@/lib/question-generator/types";
import type {
  GeneratedQuestionPayload,
  PassageAnalysis,
} from "@/lib/question-generator/types";

function typeRules(option: QuestionTypeOption): string {
  const key = option.key;
  if (key.includes(":binary")) {
    return `Create a grammar/vocabulary binary-choice passage.
Rewrite the passage with several [optionA / optionB] brackets (5~8 places).
One side is correct, the other is a plausible distractor (grammar or vocabulary).
correctAnswer must be a JSON array of the correct words/phrases in order.
Also provide Korean translation of the full passage in questionText or explanation.
instruction must be exactly the Korean stem provided.`;
  }
  if (key.includes(":underline") || option.type === "grammar") {
    if (key.includes(":rewrite")) {
      return `Create a rewrite-practice item: passage with several (wrongForm) parentheses.
Student must correct each to the proper form.
correctAnswer: array of corrected forms. explanation lists each fix with reason.
Do not destroy overall meaning.`;
    }
    if (option.type === "grammar" && key.includes(":underline")) {
      return `Mark exactly 5 underlined spots in passageModified using forms like ①word ②word ...
Exactly ONE is grammatically wrong; the other four must be correct.
correctAnswer is the number 1-5 of the wrong item.
Choices may be omitted or be just ①~⑤.`;
    }
  }
  switch (option.type) {
    case "content_false":
      return `5 Korean choices. Ask which is NOT true. Exactly one false choice. Others must be true.`;
    case "content_true":
      return `5 Korean choices. Ask which IS true. Exactly one true choice.`;
    case "vocabulary":
      return `Mark 5 underlined words in passageModified. Exactly ONE is contextually inappropriate. correctAnswer 1-5.`;
    case "sentence_insertion":
      return `Provide one sentence to insert. Mark ①~⑤ slots in passageModified. correctAnswer 1-5.`;
    case "irrelevant_sentence":
      return `Number sentences ①~⑤ in passageModified; one is irrelevant. correctAnswer 1-5.`;
    case "order":
      return `Give a lead-in paragraph, then A/B/C paragraphs. 5 order choices like (A)-(C)-(B). Exactly one correct order.`;
    case "summary_short":
      return `Provide full Korean translation first, then English passage with several _____ blanks for key words.
correctAnswer: array of answers for blanks. acceptableAnswers optional.`;
    case "topic":
    case "title":
      return `5 Korean choices. Exactly one correct. Cover whole passage, not a detail.`;
    case "sentence_blank":
      return `Blank a key phrase in passageModified. 5 English choices. Exactly one correct.`;
    case "writing":
      return `Korean prompt + list of given English words the student must use.
Provide model English answer and scoringGuide with requiredKeywords.`;
    default:
      return `Follow standard Korean high-school exam format for this type.`;
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

  const evidence = Array.isArray(raw.evidence)
    ? raw.evidence.map((e) => {
        const row = (e ?? {}) as Record<string, unknown>;
        return {
          sentence: String(row.sentence ?? ""),
          description: String(row.description ?? ""),
        };
      })
    : [];

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
    questionText: String(raw.questionText ?? ""),
    choices,
    correctAnswer,
    acceptableAnswers: Array.isArray(raw.acceptableAnswers)
      ? raw.acceptableAnswers.map((x) => String(x))
      : undefined,
    explanation: String(raw.explanation ?? ""),
    evidence,
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
  if (option.isObjective && option.type !== "grammar") {
    if (!q.choices || q.choices.length < 5) {
      // grammar underline may use ①~⑤ only in passage
      if (option.type !== "vocabulary" && !option.key.includes(":underline")) {
        return "객관식 선택지가 5개 미만입니다.";
      }
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
}): Promise<GeneratedQuestionPayload> {
  const { option, passage, analysis } = opts;
  const forcedInstruction =
    KOREAN_INSTRUCTION_BY_KEY[option.key] ??
    "다음 글을 읽고 물음에 답하시오.";

  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `You are an expert Korean high-school English 내신 변형문제 writer (WooJack/SkunkWorks 11-step style).
Return ONLY valid JSON for ONE question.
CRITICAL:
- instruction MUST be exactly this Korean string: ${JSON.stringify(forcedInstruction)}
- Do NOT write English stems/instructions.
- Keep original passage wording unless the type requires a modified display passage.
- Choices for content/topic/title must be natural Korean (not translationese).
- Provide evidence and Korean explanation.
${typeRules(option)}`,
    user: JSON.stringify({
      grade: opts.grade,
      overallDifficulty: opts.overallDifficulty,
      optionKey: option.key,
      optionLabel: option.label,
      requestedType: option.type,
      forcedInstruction,
      passage,
      analysis,
      outputSchema: {
        instruction: forcedInstruction,
        questionText: "string (extra prompt, Korean translation, given words, etc.)",
        passageModified: "string|optional",
        choices: [{ number: 1, text: "string" }],
        correctAnswer: "number|string|array",
        acceptableAnswers: ["string"],
        explanation: "string in Korean",
        evidence: [{ sentence: "string", description: "string" }],
        scoringGuide: {
          totalPoints: 5,
          fullScoreCondition: "string",
          partialScoreConditions: [{ points: 2, condition: "string" }],
          requiredKeywords: ["string"],
        },
        validation: {
          singleCorrectAnswer: true,
          answerMatchesExplanation: true,
          evidenceExists: true,
          ambiguityRisk: "low",
          difficultyMatch: true,
          grammarChecked: true,
          overallScore: 90,
          warnings: [],
        },
      },
    }),
    temperature: 0.35,
    maxTokens: 4500,
  })) as Record<string, unknown>;

  const payload = normalizePayload(raw, option, passage, forcedInstruction);
  if (raw.validation && typeof raw.validation === "object") {
    const v = raw.validation as Record<string, unknown>;
    payload.validation = {
      singleCorrectAnswer: Boolean(v.singleCorrectAnswer ?? true),
      answerMatchesExplanation: Boolean(v.answerMatchesExplanation ?? true),
      evidenceExists: Boolean(v.evidenceExists ?? true),
      ambiguityRisk:
        v.ambiguityRisk === "medium" || v.ambiguityRisk === "high"
          ? v.ambiguityRisk
          : "low",
      difficultyMatch: Boolean(v.difficultyMatch ?? true),
      grammarChecked: Boolean(v.grammarChecked ?? true),
      overallScore:
        typeof v.overallScore === "number" ? v.overallScore : 80,
      warnings: Array.isArray(v.warnings)
        ? v.warnings.map((x) => String(x))
        : [],
      typeMatch: true,
    };
  }
  const shapeError = assertBasicQuestionShape(payload, option);
  if (shapeError) throw new Error(shapeError);
  return payload;
}
