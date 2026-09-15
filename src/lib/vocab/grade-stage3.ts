import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import type { Stage3QuestionType } from "@/lib/vocab/build-stage3-questions";

/** 뜻 구분자: 쉼표·세미콜론·슬래시·가운뎃점·줄바꿈·번호(①, 1.) */
const SENSE_SPLIT = /[,;/·、\n]|(?:^|\s)\d+[.)]\s*|[①-⑳]/;

/** 뜻 비교용 정규화: 괄호 설명·물결표·문장부호·공백 제거 */
function normalizeSense(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]|<[^>]*>/g, "")
    .replace(/[~∼…"'“”‘’`.!?:]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/** 조사·어미 차이 흡수 (제공하다 = 제공 = 제공하는). 남는 줄기가 2글자 이상일 때만 뗀다. */
const TRAILING_ENDINGS = [
  "하게하다",
  "시키다",
  "스러운",
  "스럽다",
  "적으로",
  "하다",
  "되다",
  "하는",
  "되는",
  "적인",
  "하게",
  "적",
  "한",
  "된",
  "의",
];

function stemSense(value: string): string {
  for (const end of TRAILING_ENDINGS) {
    if (value.endsWith(end) && value.length - end.length >= 2) {
      return value.slice(0, -end.length);
    }
  }
  return value;
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[b.length]!;
}

function splitSenses(value: string): string[] {
  return value
    .split(SENSE_SPLIT)
    .map(normalizeSense)
    .filter((s) => s.length > 0);
}

function senseMatches(sense: string, answer: string): boolean {
  if (sense === answer) return true;
  const s = stemSense(sense);
  const a = stemSense(answer);
  if (s.length >= 2 && s === a) return true;
  // 긴 뜻에서 한 글자 오타 정도는 봐준다
  if (s.length >= 4 && a.length >= 4 && editDistance(s, a) <= 1) return true;
  return false;
}

/**
 * 규칙 채점 (뜻 쓰기). 부분 문자열은 인정하지 않는다 — "는" 같은 한 글자 답은 오답.
 * 정답 뜻을 쉼표 등으로 나눈 뜻 가운데 하나와 통째로 맞아야 정답이다.
 * 학생이 여러 뜻을 적었으면 그중 하나가 맞으면 정답(최대 3개까지만 본다).
 */
export function gradeMeaningAnswer(
  correctMeaning: string,
  studentAnswer: string
): boolean {
  const whole = normalizeSense(studentAnswer);
  if (whole.length < 2) return false;

  const senses = splitSenses(correctMeaning);
  const fullCorrect = normalizeSense(correctMeaning);
  if (fullCorrect && whole === fullCorrect) return true;
  if (senses.length === 0) return false;

  const answers = splitSenses(studentAnswer)
    .filter((a) => a.length >= 2)
    .slice(0, 3);
  if (answers.length === 0) return false;

  return answers.some((a) => senses.some((s) => senseMatches(s, a)));
}

/** 채점 결과 피드백에 내부 동작·오류 이야기가 섞였으면 버린다 */
export function cleanMeaningFeedback(
  feedback: string | null | undefined
): string | null {
  if (!feedback) return null;
  // 예전에 저장된 "…(AI 채점 시간이 초과되었습니다.)" 같은 꼬리 제거
  const stripped = feedback
    .replace(/\s*\([^)]*(?:AI|OPENAI|API|HTTP|채점 (?:시간|요청|오류|결과))[^)]*\)/gi, "")
    .trim();
  if (!stripped) return null;
  if (/\bAI\b|OPENAI|\bAPI\b|HTTP|quota|사용 한도|시간이 초과|요청에 실패/i.test(stripped)) {
    return null;
  }
  return stripped;
}

export function gradeStage3Answer(
  questionType: Stage3QuestionType,
  correctAnswer: string,
  studentAnswer: string
): boolean {
  if (questionType === "spelling") {
    return gradeSpellingAnswer(correctAnswer, studentAnswer);
  }
  return gradeMeaningAnswer(correctAnswer, studentAnswer);
}
