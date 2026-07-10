import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import {
  buildAingkaTag,
  findAingkaOption,
} from "@/lib/question-generator/question-types";
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
    case "title":
      return `5 ${ko ? "Korean" : "English"} choices covering the WHOLE passage. Exactly one correct.`;
    case "summary_mcq":
      if (code === "요약문추론") {
        return `Create a one-sentence Korean summary with blanks (A) and (B). 5 choices as word pairs like ① success …… effort. Exactly one correct.`;
      }
      return `5 Korean choices for the main point (요지). Exactly one correct.`;
    case "sentence_blank":
      if (code === "연결어빈칸") {
        return `In passageModified put discourse blanks (A) and (B) (e.g. However / Therefore / For example / In addition). 5 ENGLISH pair choices like "However …… Therefore". Exactly one correct.`;
      }
      return `Blank a key phrase/clause in passageModified with ______. 5 English choices. Exactly one correct. Level: 고1 학력평가.`;
    case "order":
      return `Lead-in + paragraphs A/B/C. 5 order choices (e.g. (A)-(C)-(B)). Exactly one correct.`;
    case "sentence_insertion":
      return `One sentence to insert + ①~⑤ slots in passageModified. correctAnswer 1-5.`;
    case "irrelevant_sentence":
      return `Label five sentences (A)~(E) in passageModified; exactly ONE is irrelevant to the flow. correctAnswer maps to that letter's position 1-5.`;
    case "grammar":
      if (code === "어법연결") {
        return `In passageModified mark three grammar points as ⓐ, ⓑ, ⓒ with two alternatives in parentheses, e.g. (is / are). 5 ENGLISH connection choices like "is …… are …… has". Exactly one correct combination.`;
      }
      if (code === "어법고쳐쓰기") {
        return `No MCQ. Student finds one grammar error and rewrites correctly. Put model rewrite in correctAnswer (string) and list requiredKeywords if useful.`;
      }
      return `Mark 5 underlined spots ⓐ~ⓔ (or ①~⑤) in passageModified. Exactly ONE grammatically wrong.`;
    case "vocabulary":
      return `Mark 5 underlined words ⓐ~ⓔ (or ①~⑤). Exactly ONE contextually wrong.`;
    case "underlined_inference":
      if (code === "목적추론") {
        return `5 ENGLISH purpose choices (To + verb / infinitive). Exactly one correct. No need to underline unless natural.`;
      }
      if (code === "심경추론") {
        return `5 English emotion-change choices like "worried → relieved". Exactly one correct.`;
      }
      if (code === "함축의미추론") {
        return `Underline the target expression in passageModified. 5 Korean meaning choices. Exactly one correct.`;
      }
      return `Underline a key expression in passageModified. 5 Korean meaning choices.`;
    case "writing":
      return `Korean prompt + <조건> + given English words. Model answer in correctAnswer + requiredKeywords.`;
    case "summary_short":
    case "short_title":
    case "short_topic":
      return `Short constructed response. Put model answer in correctAnswer (string). Include scoringGuide if helpful.`;
    default:
      return `Follow Seoul 학력평가 + Aingka mock-exam variation style.`;
  }
}

function normalizePayload(
  raw: Record<string, unknown>,
  option: QuestionTypeOption,
  passage: string,
  forcedInstruction: string,
  metaTag: string
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

  // 아잉카: questionText 앞에 태그 저장 (인쇄용)
  const body = String(raw.questionText ?? "").trim();
  const questionText = body.startsWith("[")
    ? body
    : `${metaTag}\n${body}`.trim();

  return {
    type: option.type,
    category: option.category,
    difficulty: option.difficulty,
    choiceLanguage: option.choiceLanguage,
    passageOriginal: passage,
    passageModified:
      typeof raw.passageModified === "string" ? raw.passageModified : undefined,
    instruction: forcedInstruction,
    questionText,
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
  const aingka = findAingkaOption(option.key);
  const forcedInstruction =
    aingka?.koreanStem ||
    option.koreanStem ||
    "다음 글을 읽고 물음에 답하시오.";

  const gradeCode = /고\s*1|고1|H1/i.test(opts.grade)
    ? "H1"
    : /고\s*2|고2|H2/i.test(opts.grade)
      ? "H2"
      : /고\s*3|고3|H3/i.test(opts.grade)
        ? "H3"
        : /중\s*3|중3|M3/i.test(opts.grade)
          ? "M3"
          : "H1";

  const noMatch = opts.sourceDetail?.match(/(\d{1,2})\s*번/);
  const metaTag = buildAingkaTag({
    yearMonth: "202603",
    gradeCode,
    questionNo: noMatch?.[1],
    aingkaCode: aingka?.aingkaCode || option.aingkaCode || option.type,
  });

  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `You are an expert Korean high-school English exam writer.
Target level & style: 서울특별시교육청 학력평가 예상문제 (고1 3월) + 아잉카 모의 변형.
Return ONLY valid JSON for ONE question.
CRITICAL RULES:
- instruction MUST be exactly: ${JSON.stringify(forcedInstruction)}
- Stems are Korean only (often 「윗글의 …」). Never English stems.
- Put meta tag ${JSON.stringify(metaTag)} at the start of questionText on its own line.
- Keep original passage wording unless the type needs passageModified (grammar/vocab/blank/discourse/order/insertion/irrelevant).
- Choice language must match the type rules (English for 목적·내용불일치·연결어·어법연결 when specified).
- Distractors must be competitive (고1 학력평가 난이도) — not trivially wrong.
- Explanations in Korean with clear evidence from the passage.
${typeRules(option)}`,
    user: JSON.stringify({
      grade: opts.grade,
      overallDifficulty: opts.overallDifficulty,
      optionKey: option.key,
      optionLabel: option.label,
      aingkaCode: aingka?.aingkaCode,
      forcedInstruction,
      metaTag,
      passage,
      analysis,
      outputSchema: {
        instruction: forcedInstruction,
        questionText: `${metaTag}\\n(optional extra Korean notes)`,
        passageModified: "string|optional",
        choices: [{ number: 1, text: "string" }],
        correctAnswer: "number|string|array",
        explanation: "string in Korean",
        evidence: [{ sentence: "string", description: "string" }],
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

  const payload = normalizePayload(
    raw,
    option,
    passage,
    forcedInstruction,
    metaTag
  );
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
