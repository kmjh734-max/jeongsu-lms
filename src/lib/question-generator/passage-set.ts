/**
 * 1지문 다문항(세트) — 지문 하나에 문항 2~3개를 붙이고 시험지에는 지문을 한 번만 찍는다.
 *
 * 다른 학원 요청(2026-10-10), 선생님 결정: 지문당 2문항·3문항을 고를 수 있게, 모든 학원에 연다.
 * 유형은 무엇이든 넣을 수 있다(2026-10-11 완화). 지문을 함께 쓰는 방식:
 *  - 원문 그대로 푸는 유형(주제·제목·요지·일치·불일치·일치개수·요약문)은 공용 지문을 함께 쓴다.
 *  - 지문에 빈칸·밑줄을 치는 유형(빈칸·어법·어휘·함축)이 하나면 그 문항의 지문이 세트 공용 지문이 된다
 *    (수능 41~42번: 제목 + 어휘 밑줄).
 *  - 표시형이 둘 이상이거나, 지문을 자르거나 문장을 빼는 유형(삽입·순서·무관·제시어배열·어법 수정형)은
 *    시험지에서 그 문항만 자기 지문을 따로 찍는다.
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

/** 지문에 빈칸·밑줄을 치는 유형 — 하나면 그 지문이 세트 공용 지문 */
const MARK_CODES = new Set(["빈칸추론", "어법추론", "어법개수", "어휘추론", "어휘개수", "함축의미추론"]);

export const PASSAGE_SET_SIZES = [2, 3] as const;
export type PassageSetSize = (typeof PASSAGE_SET_SIZES)[number];

export interface PassageSetConfig {
  size: PassageSetSize;
  /** 세트 안 문항 차례대로 유형 키(option key). 길이 = size. 구성이 여럿이면 첫 구성 */
  keys: string[];
  /**
   * 세트 구성 여럿(구성 A·B…). 지문 차례대로 A·B·A·B… 번갈아 붙인다(선생님 결정 2026-10-10: 「절반씩」).
   * 없으면 keys 하나만 쓴다.
   */
  variants?: string[][];
}

/** 세트 구성은 4개까지 */
export const MAX_SET_VARIANTS = 4;

const codeOf = (key: string) => String(key ?? "").split(":").pop() ?? "";

export const isSetMarkKey = (key: string) => MARK_CODES.has(codeOf(key));
export const isSetAllowedKey = (key: string) => READ_CODES.has(codeOf(key)) || MARK_CODES.has(codeOf(key));

/** 이 세트 설정의 구성 목록 */
export function setVariants(set: PassageSetConfig): string[][] {
  return Array.isArray(set.variants) && set.variants.length > 0 ? set.variants : [set.keys];
}

/** pi번째 지문(0부터)에 붙일 구성 — 번갈아 붙인다 */
export function setKeysForPassage(set: PassageSetConfig, pi: number): string[] {
  const list = setVariants(set);
  return list[pi % list.length]!;
}

/**
 * 구성 하나가 맞는지 — 문항 수만 본다.
 *
 * 선생님 결정(2026-10-11): 「문제가 안 만들어지는 게 아니면 겹치는 유형을 완화하라, 너무 타이트하다」.
 * 처음에는 표시형 하나만·지문을 바꾸는 유형 금지·빈칸과 주제 금지로 막았지만, 어느 것도 못 만드는 것은 아니다.
 *  - 지문 모양이 다른 문항(두 번째 표시형, 삽입·순서·무관·제시어배열)은 시험지에서 자기 지문을 따로 찍는다(인쇄 bySet).
 *  - 빈칸 정답과 주제·제목 정답이 겹쳐도 둔다 — 연습용이라 괜찮다(선생님, 같은 날).
 *    그래서 문항끼리 답이 새는지 보던 세트 검수(passage-set-check)도 뺐다.
 */
function variantProblem(size: number, keys: string[]): string | null {
  if (!Array.isArray(keys) || keys.length !== size || keys.some((k) => !k)) {
    return `세트의 문항 ${size}개 유형을 모두 골라 주세요.`;
  }
  return null;
}

/** 세트 안 지문이 한 모양으로 모이지 않는 구성인가(지문을 따로 찍는 문항이 생긴다) — 안내용 */
export function setPrintsExtraPassage(keys: string[]): boolean {
  return keys.filter(isSetMarkKey).length > 1 || keys.some((k) => !isSetAllowedKey(k));
}

/** 세트 구성이 맞는지. 틀리면 선생님께 보일 까닭, 맞으면 null */
export function passageSetProblem(set: PassageSetConfig | null | undefined): string | null {
  if (!set) return null;
  if (!PASSAGE_SET_SIZES.includes(set.size as PassageSetSize)) return "지문당 문항 수는 2문항이나 3문항입니다.";
  const list = setVariants(set);
  if (list.length > MAX_SET_VARIANTS) return `세트 구성은 ${MAX_SET_VARIANTS}개까지 넣을 수 있습니다.`;
  for (const [i, keys] of list.entries()) {
    const problem = variantProblem(set.size, keys);
    if (problem) return list.length > 1 ? `구성 ${"ABCD"[i]}: ${problem}` : problem;
  }
  return null;
}

/** 세트 구성을 유형별 개수로(크레딧 계산·기존 개수 칸과 맞춘다) */
export function passageSetCounts(set: PassageSetConfig): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const k of set.keys) counts[k] = (counts[k] ?? 0) + 1;
  return counts;
}

/** 세트에서 다른 유형으로 바꿔 만들 때 먼저 고를 후보인가 — 공용 지문을 흔들지 않는 유형을 앞에 둔다 */
export function setFallbackPreferred(candidateKey: string, otherKeys: string[]): boolean {
  if (!isSetAllowedKey(candidateKey)) return false;
  return !(isSetMarkKey(candidateKey) && otherKeys.some(isSetMarkKey));
}
