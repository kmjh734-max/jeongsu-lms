import { analyzePassage } from "@/lib/question-generator/analyze-passage";
import { generateOneQuestion, SkipQuestionError } from "@/lib/question-generator/generate-question";
import { findAingkaOption } from "@/lib/question-generator/question-types";
import { WORKBOOK_VARIANT_STEPS } from "@/lib/exam-prep/presets";
import type { GeneratedQuestionDraft } from "@/lib/exam-prep/generate-rule-questions";
import type { ExamStepType } from "@/lib/exam-prep/types";

function optionKeysForStep(
  stepType: string,
  settings?: Record<string, unknown> | null
): string[] {
  const fromSettings = settings?.optionKeys;
  if (Array.isArray(fromSettings) && fromSettings.every((x) => typeof x === "string")) {
    return fromSettings as string[];
  }
  const pack = WORKBOOK_VARIANT_STEPS.find((s) => s.step_type === stepType);
  return pack?.optionKeys ?? [];
}

function circledAnswer(n: number): string {
  const map = ["①", "②", "③", "④", "⑤"];
  return map[n - 1] ?? String(n);
}

/**
 * 지문 전체 기준 PDF형 유형별 객관식 생성 (AI 변형문제 엔진 재사용).
 */
export async function generateVariantQuestionsForStep(opts: {
  stepType: ExamStepType | string;
  passageText: string;
  grade?: string;
  difficulty?: string;
  settings?: Record<string, unknown> | null;
  sourceDetail?: string;
}): Promise<{
  questions: GeneratedQuestionDraft[];
  errors: string[];
}> {
  const passage = opts.passageText.trim();
  const errors: string[] = [];
  if (!passage) {
    return { questions: [], errors: ["지문 본문이 없습니다."] };
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { questions: [], errors: ["OPENAI_API_KEY 없음"] };
  }

  const keys = optionKeysForStep(opts.stepType, opts.settings);
  if (keys.length === 0) {
    return { questions: [], errors: ["이 세트에 출제 유형이 없습니다."] };
  }

  let analysis;
  try {
    analysis = await analyzePassage({
      passage,
      grade: opts.grade ?? "고1",
      overallDifficulty: opts.difficulty ?? "medium",
    });
  } catch (e) {
    return {
      questions: [],
      errors: [e instanceof Error ? e.message : "지문 분석 실패"],
    };
  }

  const out: GeneratedQuestionDraft[] = [];
  let order = 1;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const option = findAingkaOption(key);
    if (!option) {
      errors.push(`알 수 없는 유형: ${key}`);
      continue;
    }
    try {
      const payload = await generateOneQuestion({
        passage,
        analysis,
        option,
        grade: opts.grade ?? "고1",
        overallDifficulty: opts.difficulty ?? "medium",
        sourceDetail: opts.sourceDetail,
        diversitySlot: { index: i, total: keys.length, label: option.aingkaCode ?? option.label },
      });

      const choices = (payload.choices ?? []).map((c) => ({
        id: String(c.number),
        number: c.number,
        text: c.text,
      }));

      const correctNum =
        typeof payload.correctAnswer === "number"
          ? payload.correctAnswer
          : typeof payload.correctAnswer === "string" &&
              /^\d+$/.test(payload.correctAnswer)
            ? Number(payload.correctAnswer)
            : Array.isArray(payload.correctAnswer)
              ? Number(payload.correctAnswer[0])
              : 1;

      const passageSummary = [
        analysis.overallTopic,
        analysis.overallMainIdea,
      ]
        .filter((x) => typeof x === "string" && x.trim())
        .map((x) => String(x).trim());

      out.push({
        sentence_id: null,
        question_type: "csat_mcq",
        question_order: order++,
        question_text: payload.instruction || option.koreanStem || option.label,
        question_data: {
          format: "csat_variant",
          optionKey: key,
          aingkaCode: option.aingkaCode ?? null,
          instruction: payload.instruction,
          passageOriginal: payload.passageOriginal || passage,
          passageModified: payload.passageModified || passage,
          choices,
          choiceLanguage: payload.choiceLanguage,
          hardWords: payload.hardWords ?? [],
          passageSummary,
        },
        correct_answer: {
          optionId: String(correctNum),
          choiceNumber: correctNum,
          display: circledAnswer(correctNum),
        },
        acceptable_answers: [String(correctNum), circledAnswer(correctNum)],
        explanation: payload.explanation || null,
        difficulty:
          typeof payload.difficulty === "string"
            ? payload.difficulty
            : opts.difficulty ?? "medium",
        points: 1,
        ai_generated: true,
      });
    } catch (e) {
      if (e instanceof SkipQuestionError) {
        errors.push(e.message);
        continue;
      }
      errors.push(
        `${option.aingkaCode ?? key}: ${
          e instanceof Error ? e.message : "생성 실패"
        }`
      );
    }
  }

  return { questions: out, errors };
}
