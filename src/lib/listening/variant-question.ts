/**
 * 비슷한 문항 만들기 — 이미 검수를 통과한 문항의 겉만 바꿔 평행 문항을 만든다.
 *
 * 선생님 말씀(2026-09-16): "기존 자료를 활용해서 단어 몇 개만 바꿔도 되잖아."
 * 새로 만드는 길은 유형 규칙·난이도·분량·오답 설계를 모두 프롬프트로 설명해야 해서 값이 크다
 * (중등 한 문항 약 43원). 여기서는 이미 맞는 문항을 그대로 주고 이름·장소·물건·숫자만 바꾸게 하므로
 * 프롬프트가 10분의 1이고 생각할 것도 적어 싼 모델로 충분하다.
 *
 * 바꾸지 않는 것: 유형, 지시문 틀, 대본 구조(발화 수·화자 순서), 정답 자리, 난이도, 문장 길이.
 * 바꾸는 것: 사람 이름, 장소, 물건, 숫자(시각·금액·날짜·개수), 그에 딸린 표현.
 * 바꾼 뒤 answer_clue·price_calculation·표 행·받아쓰기 빈칸 같은 파생값은 규칙 보정에서 다시 계산한다.
 */
import { examTypeCode, templateForSlot, type ExamTypeTemplate } from "@/lib/listening/exam-types";
import { finalizeListeningQuestionFast } from "@/lib/listening/finalize-listening-question";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import { parseQuestionsFromPayload } from "@/lib/listening/generate-questions";
import type { ValidatedListeningQuestion } from "@/lib/listening/run-question-validation";
import { keyForCode } from "@/lib/listening/type-catalog";
import { isHighSchoolListeningGrade } from "@/lib/listening/grade-level";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 겉만 바꾸는 작업이라 싼 모델로 충분하다 (환경변수로 바꿔 끼울 수 있게 둔다) */
function variantModels(): string[] {
  const configured = process.env.OPENAI_MODEL_LISTENING_VARIANT?.trim();
  return configured ? [configured, "gpt-5"] : ["gpt-5-mini", "gpt-5"];
}

/** DB에 저장된 문항 한 개 (비슷한 문항의 원본) */
export interface StoredQuestionForVariant {
  order_index: number;
  question_type?: string | null;
  instruction?: string | null;
  question_text?: string | null;
  script_text?: string | null;
  script_translation?: string | null;
  choices?: unknown;
  correct_answer?: number | null;
  answer_clue?: string | null;
  explanation?: string | null;
  table_data?: unknown;
  previous_turn?: string | null;
  blank_speaker?: string | null;
}

function segmentsFromScript(script: string): Array<{ speaker: string; text: string }> {
  const out: Array<{ speaker: string; text: string }> = [];
  for (const raw of String(script ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(ANN|M|W)\s*:\s*(.+)$/);
    if (m) out.push({ speaker: m[1]!, text: m[2]!.trim() });
  }
  return out;
}

/**
 * 원본 문항을 그대로 보여 주고 "겉만 바꿔라"고 시키는 프롬프트.
 * 유형 설명·난이도 표·출제 요령을 넣지 않는 것이 값을 낮추는 핵심이다 (원본이 이미 그 규칙을 지켰다).
 */
export function buildVariantPrompt(
  stored: StoredQuestionForVariant,
  gradeLevel: ListeningGradeLevel,
  swapHints?: { names?: string[]; scenario?: string }
): string {
  const choices = Array.isArray(stored.choices) ? stored.choices.map(String) : [];
  const segments = segmentsFromScript(String(stored.script_text ?? ""));
  const turnCount = segments.length;
  const wordCount = segments.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0);
  const nameLine = swapHints?.names?.length
    ? `- 사람 이름은 이 목록에서만 고른다: ${swapHints.names.join(", ")}\n`
    : "";
  const scenarioLine = swapHints?.scenario ? `- 새 상황·소재: ${swapHints.scenario}\n` : "";

  return `아래는 이미 검수를 통과한 듣기 문항이다. 이 문항과 "같은 문제이되 소재만 다른" 평행 문항 1개를 만든다.

[반드시 그대로 두는 것]
- 유형과 지시문 틀(instruction): 글자 그대로 같게 쓴다. 다만 지시문 안에 사람 이름이 들어 있으면 새 이름으로 바꾼다.
- 대본 구조: 발화 ${turnCount}개, 화자 순서(${segments.map((s) => s.speaker).join("-")})를 그대로.
- 대본 분량: 영어 ${wordCount}단어에서 ±10% 안.
- 정답 자리: correct_answer = ${stored.correct_answer ?? 1} 로 그대로 둔다(선택지 순서를 옮기지 않는다).
- 각 선택지의 길이·형식(한국어/영어, 단어 수)과 오답이 함정이 되는 방식.
- 난이도: 문장 길이와 어휘 수준을 원본과 같게.

[바꾸는 것 — 겉에 드러나는 것만]
- 사람 이름, 장소, 물건, 활동, 요일, 시각·날짜·금액·개수 같은 숫자와 그에 딸린 표현.
- 정답의 "내용"도 새 소재에 맞게 바꾼다(정답이 놓이는 번호만 그대로).
- 원본 문장을 그대로 베끼지 않는다. 뜻이 같아도 새 소재에 맞게 다시 쓴다.
${nameLine}${scenarioLine}
[반드시 다시 계산하는 것]
- answer_clue: 새 대본에서 정답 근거가 되는 문장을 그대로 옮겨 적는다(원본 문장이 아니라 새 문장).
- 금액 유형이면 새 단가·수량·할인으로 계산한 값이 정답과 맞아야 하고, 최종 금액은 대본에서 말하지 않는다.
- 표가 있으면 table_data.rows를 새 값으로 다시 쓰고 mismatch_no는 원본과 같게 둔다.
- explanation·script_translation도 새 대본에 맞게 다시 쓴다(한국어).

[원본 문항]
${JSON.stringify(
  {
    order_index: stored.order_index,
    question_type: stored.question_type ?? "",
    instruction: stored.instruction ?? "",
    question_text: stored.question_text ?? "",
    segments,
    choices,
    correct_answer: stored.correct_answer ?? 1,
    answer_clue: stored.answer_clue ?? "",
    table_data: stored.table_data ?? null,
    previous_turn: stored.previous_turn ?? null,
    blank_speaker: stored.blank_speaker ?? null,
  },
  null,
  1
)}

[출력]
{"questions":[{ 원본과 같은 키를 모두 채운 문항 1개 }]}
JSON만 출력한다. order_index는 ${stored.order_index}. 화자는 M, W, ANN만 쓴다.
학년: ${gradeLevel}${isHighSchoolListeningGrade(gradeLevel) ? " (고등)" : " (중등)"}`;
}

function templateForStored(
  stored: StoredQuestionForVariant,
  gradeLevel: ListeningGradeLevel
): ExamTypeTemplate | undefined {
  const code = inferExamTypeIdForFixes(
    {
      order_index: Number(stored.order_index),
      question_type: String(stored.question_type ?? ""),
      instruction: String(stored.instruction ?? ""),
    },
    gradeLevel
  );
  const key = keyForCode(code, isHighSchoolListeningGrade(gradeLevel) ? "high" : "middle");
  return templateForSlot({ typeId: stored.order_index, slotIndex: stored.order_index, typeKey: key }, gradeLevel);
}

/**
 * 비슷한 문항 1개 생성 (모델 호출 1번 + 무료 규칙 검수).
 * 검수에서 치명적 문제가 나오면 한 번만 다시 부른다 — 그래도 새로 만드는 길보다 훨씬 싸다.
 */
export async function generateVariantQuestion(
  apiKey: string,
  stored: StoredQuestionForVariant,
  gradeLevel: ListeningGradeLevel,
  swapHints?: { names?: string[]; scenario?: string }
): Promise<ValidatedListeningQuestion> {
  const template = templateForStored(stored, gradeLevel);
  const system =
    "You rewrite an already-verified Korean middle/high school English listening item, changing only surface details. Output JSON only.";
  const user = buildVariantPrompt(stored, gradeLevel, swapHints);

  let last: ValidatedListeningQuestion | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const payload = await listeningChatJson<unknown>(apiKey, {
      system,
      user: attempt === 0 ? user : `${user}\n\n앞선 시도에서 규칙 검수에 걸렸다. 위 규칙을 다시 확인하고 만든다.`,
      temperature: 0.7,
      models: variantModels(),
    });
    const parsed = parseQuestionsFromPayload(
      payload,
      true,
      template ? [template] : undefined,
      gradeLevel
    );
    const first = parsed.questions[0];
    if (!first) continue;
    const finalized = finalizeListeningQuestionFast(
      { ...first, order_index: stored.order_index },
      template,
      gradeLevel
    );
    last = finalized;
    if (!finalized.needs_review) return finalized;
  }
  if (!last) throw new Error("비슷한 문항을 만들지 못했습니다.");
  return last;
}

/** 원본과 유형 모듈 번호가 같은지 (저장 전 확인용) */
export function variantKeepsType(
  stored: StoredQuestionForVariant,
  made: GeneratedListeningQuestion,
  gradeLevel: ListeningGradeLevel
): boolean {
  const a = inferExamTypeIdForFixes(
    {
      order_index: Number(stored.order_index),
      question_type: String(stored.question_type ?? ""),
      instruction: String(stored.instruction ?? ""),
    },
    gradeLevel
  );
  const b = inferExamTypeIdForFixes(made, gradeLevel);
  const t = templateForStored(stored, gradeLevel);
  return a === b || (t != null && examTypeCode(t) === b);
}
