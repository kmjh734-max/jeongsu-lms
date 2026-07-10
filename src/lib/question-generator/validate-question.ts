import { VALIDATION_PASS_SCORE } from "@/lib/question-generator/constants";
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import type {
  GeneratedQuestionPayload,
  QuestionTypeOption,
  QuestionValidation,
} from "@/lib/question-generator/types";

function localValidate(
  q: GeneratedQuestionPayload,
  option: QuestionTypeOption
): QuestionValidation {
  const warnings: string[] = [];
  let score = 100;

  if (option.isObjective) {
    if (!q.choices || q.choices.length !== 5) {
      warnings.push("선택지 개수가 5개가 아닙니다.");
      score -= 25;
    }
    const nums = new Set((q.choices ?? []).map((c) => c.number));
    if (nums.size !== (q.choices?.length ?? 0)) {
      warnings.push("선택지 번호가 중복되었습니다.");
      score -= 10;
    }
  }

  if (!q.explanation.trim()) {
    warnings.push("해설이 없습니다.");
    score -= 20;
  }
  if (!q.evidence?.length) {
    warnings.push("본문 근거가 없습니다.");
    score -= 20;
  }
  if (q.type !== option.type) {
    warnings.push("요청 유형과 생성 유형이 다릅니다.");
    score -= 30;
  }

  const lengths = (q.choices ?? []).map((c) => c.text.length);
  if (lengths.length === 5) {
    const max = Math.max(...lengths);
    const min = Math.min(...lengths);
    if (max > min * 2.5 && max - min > 40) {
      warnings.push("정답만 유난히 길거나 구체적일 수 있습니다.");
      score -= 8;
    }
  }

  return {
    singleCorrectAnswer: true,
    answerMatchesExplanation: Boolean(q.explanation.trim()),
    evidenceExists: (q.evidence?.length ?? 0) > 0,
    ambiguityRisk: score < 70 ? "high" : score < 85 ? "medium" : "low",
    difficultyMatch: true,
    grammarChecked: option.type !== "grammar" || score >= 80,
    overallScore: Math.max(0, Math.min(100, score)),
    warnings,
    typeMatch: q.type === option.type,
  };
}

export async function validateGeneratedQuestion(opts: {
  passage: string;
  option: QuestionTypeOption;
  question: GeneratedQuestionPayload;
}): Promise<QuestionValidation> {
  const local = localValidate(opts.question, opts.option);

  try {
    const raw = (await questionGeneratorChatJsonWithRetry({
      system: `You are a strict Korean English exam QA reviewer.
Return ONLY JSON validation for the given question against the passage.
Score 0-100. Fail if multiple answers possible, no evidence, answer/explanation mismatch, wrong type, or grammar item has >1 error.`,
      user: JSON.stringify({
        passage: opts.passage,
        requested: {
          type: opts.option.type,
          difficulty: opts.option.difficulty,
          choiceLanguage: opts.option.choiceLanguage,
        },
        question: opts.question,
        outputSchema: {
          singleCorrectAnswer: true,
          answerMatchesExplanation: true,
          evidenceExists: true,
          ambiguityRisk: "low|medium|high",
          difficultyMatch: true,
          grammarChecked: true,
          typeMatch: true,
          overallScore: 90,
          warnings: ["string"],
        },
      }),
      temperature: 0.1,
      maxTokens: 1500,
    })) as Record<string, unknown>;

    const ai: QuestionValidation = {
      singleCorrectAnswer: Boolean(raw.singleCorrectAnswer ?? true),
      answerMatchesExplanation: Boolean(raw.answerMatchesExplanation ?? true),
      evidenceExists: Boolean(raw.evidenceExists ?? true),
      ambiguityRisk:
        raw.ambiguityRisk === "medium" || raw.ambiguityRisk === "high"
          ? raw.ambiguityRisk
          : "low",
      difficultyMatch: Boolean(raw.difficultyMatch ?? true),
      grammarChecked: Boolean(raw.grammarChecked ?? true),
      overallScore:
        typeof raw.overallScore === "number"
          ? raw.overallScore
          : local.overallScore,
      warnings: [
        ...local.warnings,
        ...(Array.isArray(raw.warnings)
          ? raw.warnings.map((x) => String(x))
          : []),
      ],
      typeMatch: Boolean(raw.typeMatch ?? true),
    };
    return ai;
  } catch {
    return local;
  }
}

export function shouldRegenerate(v: QuestionValidation): boolean {
  if (v.overallScore < VALIDATION_PASS_SCORE) return true;
  if (v.ambiguityRisk === "medium" || v.ambiguityRisk === "high") return true;
  if (!v.evidenceExists) return true;
  if (!v.answerMatchesExplanation) return true;
  if (!v.grammarChecked) return true;
  if (v.typeMatch === false) return true;
  if (!v.singleCorrectAnswer) return true;
  return false;
}
