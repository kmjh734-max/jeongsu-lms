import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import type { QuestionTypeOption } from "@/lib/question-generator/types";
import type {
  GeneratedQuestionPayload,
  PassageAnalysis,
} from "@/lib/question-generator/types";

const TYPE_RULES: Record<string, string> = {
  title:
    "Create a 5-choice title question. Exactly one correct answer. Correct title must cover the WHOLE passage, not a detail. Distractors use passage topics but wrong scope/focus.",
  topic:
    "Create a 5-choice main-idea/topic question. Distinguish topic from mere subject matter. Exactly one correct answer.",
  summary_mcq:
    "Create a one-sentence summary with 1-2 blanks and 5 choices. If two blanks, choices are word pairs. Avoid multiple grammatically possible answers.",
  content_true:
    "Create a 5-choice 'which is true' question. Each choice uses different evidence. Exactly one true choice.",
  content_false:
    "Create a 5-choice 'which is NOT true' question. Exactly one false choice; others must be true per passage.",
  content_count:
    "Provide exactly 5 statements. Ask how many are true (0-5). Store correctAnswer as that count. Evidence for each statement.",
  order:
    "Provide intro + paragraphs A/B/C. Five order choices. Exactly one coherent order using connectors/pronouns/time.",
  sentence_blank:
    "Blank a key phrase/sentence. 5 English choices. Answer must follow passage logic.",
  irrelevant_sentence:
    "Number sentences and insert one irrelevant sentence that is not too obvious. Exactly one answer.",
  sentence_insertion:
    "Give one sentence to insert and mark ①-⑤ positions in passageModified. Exactly one correct slot.",
  underlined_inference:
    "Underline a key expression; ask contextual meaning with 5 choices. Not dictionary-only.",
  grammar:
    "Mark 5 underlined spots in passageModified. Exactly ONE is grammatically wrong; others must be correct. Do not destroy meaning. Avoid controversial grammar.",
  vocabulary:
    "Mark 5 underlined words. Exactly ONE is contextually inappropriate. Store original vs replaced in explanation/evidence.",
  summary_short:
    "Subjective summary completion with blanks. Provide model answer and acceptableAnswers.",
  writing:
    "Korean prompt/conditions for English writing. Provide model answer, required keywords, scoringGuide.",
  short_title:
    "Ask student to write a title. Provide 2-3 model answers and required keywords. Default English answers.",
  short_topic:
    "Ask student to write the topic/main idea. Provide 2-3 model answers and required keywords.",
};

function difficultyGuide(d: QuestionTypeOption["difficulty"]): string {
  if (d === "low") return "Difficulty LOW: clearer contrast between correct and wrong answers.";
  if (d === "medium") return "Difficulty MEDIUM: requires paragraph-level understanding.";
  if (d === "high")
    return "Difficulty HIGH: subtle distractors; still exactly one correct answer.";
  return "Use a standard exam difficulty.";
}

function languageGuide(lang: QuestionTypeOption["choiceLanguage"]): string {
  if (lang === "english") return "Write choices in natural English.";
  if (lang === "korean") return "Write choices in natural Korean (not translationese).";
  return "Use the language appropriate for this question type.";
}

function normalizePayload(
  raw: Record<string, unknown>,
  option: QuestionTypeOption,
  passage: string
): GeneratedQuestionPayload {
  const choices = Array.isArray(raw.choices)
    ? raw.choices
        .map((c, i) => {
          const row = (c ?? {}) as Record<string, unknown>;
          return {
            number:
              typeof row.number === "number" ? row.number : i + 1,
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

  const scoring =
    raw.scoringGuide && typeof raw.scoringGuide === "object"
      ? (raw.scoringGuide as GeneratedQuestionPayload["scoringGuide"])
      : undefined;

  return {
    type: option.type,
    category: option.category,
    difficulty: option.difficulty,
    choiceLanguage: option.choiceLanguage,
    passageOriginal: passage,
    passageModified:
      typeof raw.passageModified === "string" ? raw.passageModified : undefined,
    instruction: String(raw.instruction ?? ""),
    questionText: String(raw.questionText ?? ""),
    choices,
    correctAnswer,
    acceptableAnswers: Array.isArray(raw.acceptableAnswers)
      ? raw.acceptableAnswers.map((x) => String(x))
      : undefined,
    explanation: String(raw.explanation ?? ""),
    evidence,
    scoringGuide: scoring,
  };
}

export function assertBasicQuestionShape(
  q: GeneratedQuestionPayload,
  option: QuestionTypeOption
): string | null {
  if (!q.instruction.trim() && !q.questionText.trim()) {
    return "발문/문제 텍스트가 비어 있습니다.";
  }
  if (!q.explanation.trim()) return "해설이 비어 있습니다.";
  if (option.isObjective) {
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
}): Promise<GeneratedQuestionPayload> {
  const { option, passage, analysis } = opts;
  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `You are an expert Korean English exam item writer for middle/high school.
Return ONLY valid JSON for ONE question.
Never rewrite the original passage wording unless the question type requires a modified display passage (grammar/vocab/insertion/irrelevant/order/blank). When modifying, keep meaning intact except for the intentional test point.
${TYPE_RULES[option.type] ?? ""}
${difficultyGuide(option.difficulty)}
${languageGuide(option.choiceLanguage)}
Include evidence from the passage. Include a validation object with overallScore 0-100.`,
    user: JSON.stringify({
      grade: opts.grade,
      overallDifficulty: opts.overallDifficulty,
      requestedType: option.type,
      requestedDifficulty: option.difficulty,
      choiceLanguage: option.choiceLanguage,
      optionLabel: option.label,
      passage,
      analysis,
      outputSchema: {
        instruction: "string",
        questionText: "string",
        passageModified: "string|optional",
        choices: [{ number: 1, text: "string" }],
        correctAnswer: "number|string|number[]",
        acceptableAnswers: ["string"],
        explanation: "string",
        evidence: [{ sentence: "string", description: "string" }],
        scoringGuide: {
          totalPoints: 5,
          fullScoreCondition: "string",
          partialScoreConditions: [{ points: 2, condition: "string" }],
          requiredKeywords: ["string"],
          requiredGrammar: ["string"],
        },
        validation: {
          singleCorrectAnswer: true,
          answerMatchesExplanation: true,
          evidenceExists: true,
          ambiguityRisk: "low|medium|high",
          difficultyMatch: true,
          grammarChecked: true,
          overallScore: 90,
          warnings: ["string"],
        },
      },
    }),
    temperature: 0.4,
    maxTokens: 4500,
  })) as Record<string, unknown>;

  const payload = normalizePayload(raw, option, passage);
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
