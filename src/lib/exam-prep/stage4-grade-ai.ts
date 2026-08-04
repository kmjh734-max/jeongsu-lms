import {
  isBlankOrWhitespace,
  looksLikeEnglishCopy,
} from "@/lib/exam-prep/stage4-types";
import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
import {
  stage4AiGradeSchema,
  type KeyMeaningPoint,
  type Stage4AiGradeResult,
  STAGE4_DEFAULTS,
} from "@/lib/exam-prep/stage4-types";

const SYSTEM = `당신은 한국 중고등 영어 내신 「해석 연습」 채점 교사다.
반드시 JSON만 출력한다.

채점 원칙:
- 영어 원문, 모범 해석, 핵심 의미 요소, 허용 표현, 자주 발생하는 오역, 강사 해설만 기준으로 한다.
- 외부 지식으로 새 채점 기준을 만들지 않는다.
- 모범 해석과 표현이 달라도 의미가 동일하면 인정할 수 있다.
- 어순 차이만으로 감점하지 않는다.
- 자연스러운 의역은 의미가 유지되면 인정할 수 있다.
- 핵심 의미가 누락되면 해당 의미 요소를 감점한다.
- 반대 의미, 주체 오류, 시제 오류, 부정 오류는 중대한 오역이다.
- 고유명사·핵심 용어 오역을 확인한다.
- 사소한 띄어쓰기·문장부호는 크게 감점하지 않는다.
- 학생 답안을 대신 고쳐 쓰지 말고, 맞고 부족한 점을 설명한다.
- feedback·overallFeedback은 짧고 명확한 한국어.
- score는 0~maxScore 정수에 가깝게.
- meaningResults의 earnedScore 합은 score와 일치해야 한다.
- 의미 요소가 없으면 overall 의미 일치만으로 score를 산정한다.

JSON 형식:
{
  "score": 0-100,
  "isPass": true|false,
  "meaningResults":[{"meaningPointId":"...","status":"correct|partial|incorrect|missing","earnedScore":0,"feedback":"..."}],
  "missingMeanings":["..."],
  "mistranslations":["..."],
  "naturalnessFeedback":"...",
  "overallFeedback":"...",
  "requiresTeacherReview": false
}`;

export type Stage4GradeInput = {
  englishText: string;
  modelTranslation: string;
  studentAnswer: string;
  keyMeaningPoints: KeyMeaningPoint[];
  acceptedExpressions: string[];
  commonErrors: string[];
  teacherExplanation?: string | null;
  maxScore: number;
  minimumPassScore: number;
  nearPassBand?: number;
};

export function validateStage4AiResult(
  raw: unknown,
  input: Stage4GradeInput
): Stage4AiGradeResult | null {
  const parsed = stage4AiGradeSchema.safeParse(raw);
  if (!parsed.success) return null;
  const data = parsed.data;
  const max = input.maxScore || 100;
  let score = Math.round(Math.min(max, Math.max(0, data.score)));

  if (input.keyMeaningPoints.length > 0) {
    const sum = data.meaningResults.reduce(
      (n, m) => n + (Number(m.earnedScore) || 0),
      0
    );
    if (Math.abs(sum - score) > 2) {
      // force consistency toward meaning sum when close mismatch large
      if (Math.abs(sum - score) > 5) return null;
      score = Math.round(Math.min(max, Math.max(0, sum)));
    }
  }

  const band = input.nearPassBand ?? STAGE4_DEFAULTS.nearPassBand;
  const nearPass =
    Math.abs(score - input.minimumPassScore) <= band &&
    score !== input.minimumPassScore;

  const requiresTeacherReview =
    data.requiresTeacherReview ||
    nearPass ||
    input.keyMeaningPoints.length === 0;

  return {
    score,
    isPass: score >= input.minimumPassScore && !requiresTeacherReview
      ? data.isPass || score >= input.minimumPassScore
      : score >= input.minimumPassScore && !requiresTeacherReview,
    meaningResults: data.meaningResults,
    missingMeanings: data.missingMeanings ?? [],
    mistranslations: data.mistranslations ?? [],
    naturalnessFeedback: data.naturalnessFeedback ?? "",
    overallFeedback: data.overallFeedback,
    requiresTeacherReview,
  };
}

/** 사전 검증 — AI 호출 전 */
export function precheckStage4Answer(
  input: Stage4GradeInput
): Stage4AiGradeResult | "ok" {
  if (isBlankOrWhitespace(input.studentAnswer)) {
    return {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: input.keyMeaningPoints.map((p) => p.description),
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback: "해석을 입력해 주세요.",
      requiresTeacherReview: false,
    };
  }
  if (input.studentAnswer.trim().length < 4) {
    return {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback: "답안이 너무 짧아 선생님 확인이 필요합니다.",
      requiresTeacherReview: true,
    };
  }
  if (looksLikeEnglishCopy(input.studentAnswer, input.englishText)) {
    return {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: ["영어 원문을 그대로 옮긴 것으로 보입니다."],
      naturalnessFeedback: "",
      overallFeedback: "우리말 해석으로 다시 작성해 주세요.",
      requiresTeacherReview: true,
    };
  }
  if (!input.modelTranslation.trim()) {
    return {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback: "모범 해석이 없어 선생님 확인이 필요합니다.",
      requiresTeacherReview: true,
    };
  }
  return "ok";
}

export async function gradeStage4TranslationWithAi(
  input: Stage4GradeInput
): Promise<Stage4AiGradeResult | null> {
  const pre = precheckStage4Answer(input);
  if (pre !== "ok") return pre;

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback:
        "자동 채점을 사용할 수 없어 선생님 확인을 기다리고 있습니다.",
      requiresTeacherReview: true,
    };
  }

  try {
    const raw = await questionGeneratorChatJson({
      system: SYSTEM,
      user: JSON.stringify(
        {
          englishText: input.englishText.slice(0, 800),
          modelTranslation: input.modelTranslation.slice(0, 800),
          studentAnswer: input.studentAnswer.slice(0, 800),
          keyMeaningPoints: input.keyMeaningPoints,
          acceptedExpressions: input.acceptedExpressions,
          commonErrors: input.commonErrors,
          teacherExplanation: input.teacherExplanation ?? "",
          maxScore: input.maxScore,
          minimumPassScore: input.minimumPassScore,
        },
        null,
        2
      ),
      temperature: 0.2,
      maxTokens: 2500,
    });

    const validated = validateStage4AiResult(raw, input);
    if (!validated) {
      return {
        score: 0,
        isPass: false,
        meaningResults: [],
        missingMeanings: [],
        mistranslations: [],
        naturalnessFeedback: "",
        overallFeedback:
          "자동 피드백 형식 오류로 선생님 확인을 기다리고 있습니다.",
        requiresTeacherReview: true,
      };
    }

    // pass flag aligned to score
    const isPass =
      validated.score >= input.minimumPassScore &&
      !validated.requiresTeacherReview;
    return { ...validated, isPass };
  } catch {
    return {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback:
        "자동 피드백을 생성하지 못해 선생님 확인을 기다리고 있습니다.",
      requiresTeacherReview: true,
    };
  }
}
