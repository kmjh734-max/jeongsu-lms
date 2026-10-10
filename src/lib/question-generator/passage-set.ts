/**
 * 1지문 다문항(세트) — 지문 하나에 문항 2~3개를 붙이고 시험지에는 지문을 한 번만 찍는다.
 *
 * 다른 학원 요청(2026-10-10), 선생님 결정: 지문당 2문항·3문항을 고를 수 있게, 모든 학원에 연다.
 * 한 지문을 함께 쓰려면 지문 모양이 하나여야 한다.
 *  - 원문 그대로 푸는 유형(주제·제목·요지·일치·불일치·일치개수·요약문)은 몇 개든 함께 쓴다.
 *  - 지문에 빈칸·밑줄을 치는 유형(빈칸·어법·어휘·함축)은 세트에 하나만 — 둘이면 한 지문에 표시가 겹친다.
 *    그 문항의 지문이 세트 공용 지문이 된다(수능 41~42번: 제목 + 어휘 밑줄).
 *  - 지문을 자르거나 문장을 빼는 유형(삽입·순서·무관·제시어배열·어법 수정형)은 세트에 넣지 않는다.
 */

/** 원문 그대로 푸는 유형 */
const READ_CODES = new Set([
  "주제추론",
  "제목추론",
  "요지추론",
  "내용일치",
  "내용불일치",
  "일치개수",
  "요약문빈칸2단어",
  "요약문빈칸3단어",
  "요약문빈칸영작",
]);

/** 지문에 빈칸·밑줄을 치는 유형 — 세트에 하나만 */
const MARK_CODES = new Set(["빈칸추론", "어법추론", "어법개수", "어휘추론", "어휘개수", "함축의미추론"]);

/*
 * 빈칸·함축은 글의 핵심 문장에 치는 일이 많아, 주제·제목·요지·요약문의 정답이 그 답을 그대로 풀어 말하게 된다
 * (시험 2026-10-10: 빈칸 정답 「craving additional wealth had obscured the worth of being satisfied」와
 * 주제 정답 「craving for greater territory obscures the worth of what he owns」). 수능 41~42번도 제목은 어휘와 묶는다.
 */
const KEY_SENTENCE_CODES = new Set(["빈칸추론", "함축의미추론"]);
const GIST_CODES = new Set(["주제추론", "제목추론", "요지추론", "요약문빈칸2단어", "요약문빈칸3단어", "요약문빈칸영작"]);
const clashes = (keys: string[]) =>
  keys.some((k) => KEY_SENTENCE_CODES.has(codeOf(k))) && keys.some((k) => GIST_CODES.has(codeOf(k)));

export const PASSAGE_SET_SIZES = [2, 3] as const;
export type PassageSetSize = (typeof PASSAGE_SET_SIZES)[number];

export interface PassageSetConfig {
  size: PassageSetSize;
  /** 세트 안 문항 차례대로 유형 키(option key). 길이 = size */
  keys: string[];
}

const codeOf = (key: string) => String(key ?? "").split(":").pop() ?? "";

export const isSetMarkKey = (key: string) => MARK_CODES.has(codeOf(key));
export const isSetAllowedKey = (key: string) => READ_CODES.has(codeOf(key)) || MARK_CODES.has(codeOf(key));

/** 세트 구성이 맞는지. 틀리면 선생님께 보일 까닭, 맞으면 null */
export function passageSetProblem(set: PassageSetConfig | null | undefined): string | null {
  if (!set) return null;
  if (!PASSAGE_SET_SIZES.includes(set.size as PassageSetSize)) return "지문당 문항 수는 2문항이나 3문항입니다.";
  if (!Array.isArray(set.keys) || set.keys.length !== set.size || set.keys.some((k) => !k)) {
    return `세트의 문항 ${set.size}개 유형을 모두 골라 주세요.`;
  }
  if (set.keys.some((k) => !isSetAllowedKey(k))) {
    return "문장삽입·순서·무관한문장·제시어배열·어법 수정형은 지문을 바꿔서 세트에 넣을 수 없습니다.";
  }
  if (set.keys.filter(isSetMarkKey).length > 1) {
    return "지문에 표시하는 유형(빈칸·어법·어휘·함축)은 세트에 하나만 넣을 수 있습니다.";
  }
  if (clashes(set.keys)) {
    return "빈칸·함축은 주제·제목·요지·요약문과 같은 세트에 넣을 수 없습니다. 빈칸 정답이 곧 글의 요지라 서로 답을 알려 줍니다.";
  }
  return null;
}

/** 세트 구성을 유형별 개수로(크레딧 계산·기존 개수 칸과 맞춘다) */
export function passageSetCounts(set: PassageSetConfig): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const k of set.keys) counts[k] = (counts[k] ?? 0) + 1;
  return counts;
}

/** 세트에서 다른 유형으로 바꿔 만들 때 쓸 수 있는 후보인가 — 표시형이 이미 있으면 읽기형만 */
export function setFallbackAllowed(candidateKey: string, otherKeys: string[]): boolean {
  if (!isSetAllowedKey(candidateKey)) return false;
  if (isSetMarkKey(candidateKey) && otherKeys.some(isSetMarkKey)) return false;
  if (clashes([candidateKey, ...otherKeys])) return false;
  return true;
}
