/**
 * 학년별 번호 배치표 (문항 번호 → 유형 키).
 * 근거: 2023~2026 시·도교육청 영어듣기능력평가 공식 문제지 24회(학년당 8회) 지시문 전수 확인,
 * 고등은 고1 전국연합 모의고사 교재 20회(번호별 유형 20/20 동일)와 수능 관례.
 * 번호 = 유형 구조를 버리고, 번호는 이 표로만 유형 키에 연결한다.
 */
import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { ListeningTypeKey } from "@/lib/listening/type-catalog";

export interface BlueprintSlot {
  position: number;
  key: ListeningTypeKey;
  /** 이 자리에서 쓸 수 있는 변형 (없으면 유형의 모든 변형을 학년 비율대로) */
  variants?: string[];
  /** 같은 방향으로 맞출 응답 묶음 (중1·중2 19~20: 한 회차 안에서 두 문항이 같은 방향) */
  pairGroup?: string;
  /** 드물게 다른 유형으로 바꿔 내는 자리 (중2 13번: 시각 1/8) */
  alternates?: Array<{ key: ListeningTypeKey; weight: number; variants?: string[] }>;
  /** 번호대 난이도 (프롬프트 어휘·문장 규칙) */
  tier: ListeningDifficultyTier;
}

function tierMiddle(position: number): ListeningDifficultyTier {
  if (position <= 6) return "foundation";
  if (position <= 12) return "standard";
  if (position <= 18) return "applied";
  return "advanced";
}

function tierHigh(position: number): ListeningDifficultyTier {
  if (position <= 5) return "foundation";
  if (position <= 10) return "standard";
  if (position <= 15) return "applied";
  return "advanced";
}

function middle(
  rows: Array<[ListeningTypeKey, Omit<BlueprintSlot, "position" | "key" | "tier">?]>
): BlueprintSlot[] {
  return rows.map(([key, extra], i) => ({ position: i + 1, key, tier: tierMiddle(i + 1), ...(extra ?? {}) }));
}

/** 중1 — 공식 8회: 현재 배치와 같다. 14번은 2025년부터 표 정보 불일치(담화+표), 17번은 특정 시점에 할 일(미래) */
const MIDDLE1: BlueprintSlot[] = middle([
  ["M_RIDDLE"],
  ["M_PICTURE_SELECT"],
  ["M_WEATHER"],
  ["M_INTENT"],
  ["M_NOT_MENTIONED_MONO"],
  ["M_TIME", { variants: ["meet", "current", "start"] }],
  ["M_DREAM_JOB"],
  ["M_EMOTION"],
  ["M_TODO_NOW"],
  ["M_TOPIC_DIALOGUE"],
  ["M_TRANSPORT"],
  ["M_REASON"],
  ["M_PLACE"],
  ["M_TABLE_MISMATCH"],
  ["M_REQUEST"],
  ["M_SUGGEST"],
  ["M_PLAN_AT_TIME"],
  ["M_JOB"],
  ["M_RESPONSE", { pairGroup: "resp" }],
  ["M_RESPONSE", { pairGroup: "resp" }],
]);

/** 중2 — 2026 공식 형식(17 양식 빈칸, 18 표현의 의미)이 기본. 13번은 거스름돈이 대부분, 시각은 드묾 */
const MIDDLE2: BlueprintSlot[] = middle([
  ["M_WEATHER"],
  ["M_PICTURE_SELECT"],
  ["M_EMOTION"],
  ["M_DID"],
  ["M_PLACE"],
  ["M_INTENT"],
  ["M_SPECIFIC"],
  ["M_TODO_NOW"],
  ["M_NOT_MENTIONED_DIALOGUE", { variants: ["two"] }],
  ["M_TOPIC_MONO"],
  ["M_MISMATCH_DIALOGUE"],
  ["M_PURPOSE_CALL"],
  ["M_AMOUNT", { alternates: [{ key: "M_TIME", weight: 1, variants: ["meet", "reserve"] }] }],
  ["M_RELATION"],
  ["M_REQUEST"],
  ["M_REASON"],
  ["M_FLYER_BLANKS"],
  ["M_EXPRESSION_MEANING"],
  ["M_RESPONSE", { pairGroup: "resp" }],
  ["M_RESPONSE", { pairGroup: "resp" }],
]);

/** 중3 — 공식 8회 20자리 모두 동일. 응답은 17 남→여, 18~19 여→남(공통 지시문) */
const MIDDLE3: BlueprintSlot[] = middle([
  ["M_PICTURE_SELECT"],
  ["M_NOT_MENTIONED_DIALOGUE", { variants: ["about"] }],
  ["M_PURPOSE_CALL", { variants: ["call", "visit"] }],
  ["M_TIME", { variants: ["meet", "start", "reserve"] }],
  ["M_EMOTION", { variants: ["en"] }],
  ["M_PICTURE_SITUATION"],
  ["M_REQUEST"],
  ["M_NOT_MENTIONED_MONO"],
  ["M_DESCRIBE"],
  ["M_AWKWARD_DIALOGUE"],
  ["M_TODO_NOW"],
  ["M_TABLE_SELECT"],
  ["M_DATE"],
  ["M_DID"],
  ["M_PURPOSE_ANNOUNCE"],
  ["M_AMOUNT", { variants: ["pay"] }],
  ["M_RESPONSE", { variants: ["mw"] }],
  ["M_RESPONSE", { variants: ["wm"] }],
  ["M_RESPONSE", { variants: ["wm"] }],
  ["M_SITUATION_SAY"],
]);

/** 고1~고3 — 17문항 고정. 응답 방향은 교재 관례대로 11 여→남, 12 남→여, 13 남→여, 14 여→남 */
const HIGH: BlueprintSlot[] = (
  [
    ["H_PURPOSE"],
    ["H_OPINION"],
    ["H_GIST"],
    ["H_PICTURE_MISMATCH"],
    ["H_TODO"],
    ["H_AMOUNT"],
    ["H_REASON"],
    ["H_NOT_MENTIONED"],
    ["H_MISMATCH"],
    ["H_TABLE"],
    ["H_RESP_SHORT", { variants: ["wm"] }],
    ["H_RESP_SHORT", { variants: ["mw"] }],
    ["H_RESP_LONG", { variants: ["mw"] }],
    ["H_RESP_LONG", { variants: ["wm"] }],
    ["H_SITUATION"],
    ["H_SET_TOPIC", { pairGroup: "set" }],
    ["H_SET_MENTION", { pairGroup: "set" }],
  ] as Array<[ListeningTypeKey, Omit<BlueprintSlot, "position" | "key" | "tier">?]>
).map(([key, extra], i) => ({ position: i + 1, key, tier: tierHigh(i + 1), ...(extra ?? {}) }));

/**
 * 선생님 요청(2026-09-16): 중1·중2·중3은 유형을 같게 하고 난이도만 학년으로 조절한다.
 * 공통 배치는 가장 최근 형식인 중3 표를 쓴다. 학년 차이는 대본 길이·어휘·속도(quality-craft)와
 * 심정 선택지 언어(중1은 한국어)로만 준다. 학년별 실제 시험 배치는 MIDDLE1/MIDDLE2에 남겨 둔다.
 */
const MIDDLE_COMMON: BlueprintSlot[] = MIDDLE3;
const MIDDLE_COMMON_1: BlueprintSlot[] = MIDDLE_COMMON.map((slot) =>
  slot.key === "M_EMOTION" ? { ...slot, variants: ["ko"] } : slot
);

const BLUEPRINTS: Record<ListeningGradeLevel, BlueprintSlot[]> = {
  middle1: MIDDLE_COMMON_1,
  middle2: MIDDLE_COMMON,
  middle3: MIDDLE3,
  high1: HIGH,
  high2: HIGH,
  high3: HIGH,
};

export function getGradeBlueprint(grade: ListeningGradeLevel): BlueprintSlot[] {
  return BLUEPRINTS[grade] ?? MIDDLE1;
}

/**
 * 예전 세트(중1~중3 모두 중1 배치로 만들었다)의 번호 → 유형 되찾기용 표.
 * 공통 배치를 바꿔도 예전 문항의 유형 판단은 흔들리면 안 되므로 따로 내보낸다.
 */
export const LEGACY_MIDDLE_ORDER: BlueprintSlot[] = MIDDLE1;
export const OFFICIAL_MIDDLE2_ORDER: BlueprintSlot[] = MIDDLE2;

export function blueprintSlot(grade: ListeningGradeLevel, position: number): BlueprintSlot | undefined {
  return getGradeBlueprint(grade).find((s) => s.position === position);
}

/** 이 학년 배치표에서 이 유형이 처음 나오는 번호 (없으면 undefined) */
export function positionOfKey(grade: ListeningGradeLevel, key: ListeningTypeKey): number | undefined {
  return getGradeBlueprint(grade).find((s) => s.key === key || s.alternates?.some((a) => a.key === key))
    ?.position;
}
