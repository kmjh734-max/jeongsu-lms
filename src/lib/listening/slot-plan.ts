/**
 * 한 세트(슬롯 목록) 전체에 걸친 소재 영역·정답 자리 배정.
 * 5문항씩 나눠 병렬로 만들면 모델이 다른 묶음을 못 봐서 한 세트에 "동아리 부스"가 서너 번 나왔고,
 * 선택지 순서가 대본·표 순서로 정해지는 유형은 모델이 정답을 ④·⑤에 몰았다(고1 표 ④ 14/20, 중등 표 ④ 32/60).
 * 섞으면 대본 순서가 깨져 정답만 튀므로(고1 9번: 정답 선택지만 대본 순서를 벗어남) 자리를 미리 정해 준다.
 */
import { hasAnswerVarietyPool } from "@/lib/listening/answer-variety-pool";
import { buildBalancedCorrectAnswerSlots } from "@/lib/listening/balance-correct-answer";
import { examTypeCode, templateForSlot } from "@/lib/listening/exam-types";
import { blueprintSlot } from "@/lib/listening/grade-blueprints";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import {
  findVariant,
  getTypeDef,
  instructionFor,
  isOrderBoundTypeKey,
  keyForCode,
  pickVariant,
  typeCode,
  type ListeningTypeKey,
} from "@/lib/listening/type-catalog";

export interface SlotPlan {
  /** 소재 영역 (세트 안에서 겹치지 않음) */
  domain?: string;
  /** 정답이 와야 할 선택지 자리 1~5 (선택지 순서가 대본·표로 정해지는 유형만) */
  answerSlot?: number;
  /** 지시문 변형 안내 (고등 5번: 할 일 / 부탁한 일 / ~를 위해 할 일, 중등 변형 지시문) */
  variant?: string;
  /** 고른 변형 id — 템플릿 지시문·모듈 번호에 반영한다(중등). 고등 5번은 안내만 하고 템플릿은 그대로 */
  variantId?: string;
  /** 배치표의 드문 대체 유형을 고른 경우 그 유형 (중2 13번: 거스름돈 대신 시각) */
  typeKey?: ListeningTypeKey;
  /** 유형 모듈 번호 (변형 반영) */
  code?: number;
}

type PlanSlotInput = {
  typeId: number;
  slotIndex: number;
  typeKey?: ListeningTypeKey;
  variant?: string;
};

/**
 * 고등 5번 지시문 변형 — 교재 20회 기준 할 일 약 70%, 부탁한 일 약 20%, ~를 위해 할 일 약 10%.
 * 항상 "할 일"만 나와 실제 시험의 변형을 연습할 수 없었다.
 */
function pickHigh5Variant(): string | undefined {
  const r = Math.random();
  if (r < 0.7) return undefined;
  if (r < 0.9) {
    return "지시문을 「대화를 듣고, (남자/여자)가 (여자/남자)에게 부탁한 일로 가장 적절한 것을 고르시오.」로 쓴다. 부탁하는 사람과 받는 사람을 대본과 맞추고, 오답은 부탁하지 않은 일·스스로 하겠다고 한 일로.";
  }
  return "지시문을 「대화를 듣고, (남자/여자)가 (여자/남자)를 위해 할 일로 가장 적절한 것을 고르시오.」로 쓴다. 정답은 대상 화자가 상대를 위해 하겠다고 한 일, 오답은 이미 한 일·상대가 스스로 할 일로.";
}

const DOMAINS = [
  "가족·집안일", "이웃·아파트 생활", "옷·신발 쇼핑", "온라인 주문·배송 문제", "식당·카페 주문",
  "요리·장보기", "병원·약국·건강", "운동·스포츠 경기 관람", "여행 계획·숙소 예약", "대중교통·길 찾기",
  "캠핑·등산·야외 활동", "박물관·미술관 관람", "도서관·책 대출", "영화·공연 예매", "악기·음악 연습",
  "반려동물 돌보기", "재활용·환경 보호 실천", "지역 봉사활동", "아르바이트·용돈 관리", "진로·직업 체험",
  "수업 과제·조별 발표", "시험 공부 계획", "친구 생일·선물", "스마트폰 앱·게임", "사진·영상 만들기",
  "고장 난 물건 수리(자전거·노트북)", "방 꾸미기·이사", "동네 시장·지역 축제", "과학 관찰·자연 체험",
  "외국어·다른 나라 문화", "날씨 때문에 바뀐 계획", "분실물 찾기", "학교 급식·건강한 식습관", "수영장·체육관 이용",
];

function familyOf(grade: ListeningGradeLevel | undefined): "middle" | "high" {
  return isHighSchoolListeningGrade(grade) ? "high" : "middle";
}

/**
 * 선택지 순서가 대본 언급 순서·표 행·그림 라벨·음성 번호로 정해져 섞으면 안 되는 유형 (typeId = 모듈 번호).
 * 고등 4·8·9·10·17, 중등 5·14와 새 유형(언급X 대화·불일치 대화·그림 상황·양식 빈칸·어색한 대화·표 선택).
 */
export function isOrderBoundType(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  const key = keyForCode(typeId, familyOf(grade));
  return key ? isOrderBoundTypeKey(key) : false;
}

/** 정답 자리를 프롬프트로 미리 정하는 유형 (고등 4번은 다양화 풀이 그림 라벨로 이미 정함) */
function needsAnswerSlot(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  if (!isOrderBoundType(typeId, grade)) return false;
  return !(isHighSchoolListeningGrade(grade) && typeId === 4);
}

/** 이미 상황·소재를 정해 주는 풀이 있는 유형은 소재 영역을 따로 주지 않는다 */
function hasOwnScenario(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  if (hasAnswerVarietyPool(typeId, grade)) return true;
  if (!isHighSchoolListeningGrade(grade) && (typeId === 1 || typeId === 19 || typeId === 20)) return true;
  // 어색한 대화는 서로 관계없는 짧은 대화 5개라 한 영역으로 묶지 않는다
  if (!isHighSchoolListeningGrade(grade) && keyForCode(typeId, "middle") === "M_AWKWARD_DIALOGUE") return true;
  // 고등 17은 16과 같은 대본
  if (isHighSchoolListeningGrade(grade) && typeId === 17) return true;
  return false;
}

/** 슬롯의 유형 키·모듈 번호 (변형을 정하기 전, 기본 템플릿 기준) */
function resolveSlotBase(
  s: PlanSlotInput,
  grade: ListeningGradeLevel | undefined
): { key?: ListeningTypeKey; code: number } {
  const t = templateForSlot(s, grade ?? "middle1");
  return { key: t?.key, code: t ? examTypeCode(t) : s.typeId };
}

/** 변형 안내 문구 (지시문이 바뀌거나 선택지 형식 안내가 있는 변형만) */
function variantNote(key: ListeningTypeKey, variantId: string): string | undefined {
  const v = findVariant(key, variantId);
  if (!v) return undefined;
  const parts: string[] = [];
  if (v.instruction) parts.push(`지시문을 「${instructionFor(key, variantId)}」로 쓴다(○○만 채움).`);
  if (v.note) parts.push(v.note);
  return parts.length ? parts.join(" ") : undefined;
}

/** 드문 대체 유형 (배치표 weight = 8회 중 횟수) */
function pickAlternate(
  s: PlanSlotInput,
  grade: ListeningGradeLevel
): { key: ListeningTypeKey; variants?: string[] } | undefined {
  if (s.typeKey || s.variant !== undefined) return undefined;
  const bp = blueprintSlot(grade, s.typeId);
  if (!bp?.alternates?.length) return undefined;
  let r = Math.random() * 8;
  for (const alt of bp.alternates) {
    r -= alt.weight;
    if (r < 0) return { key: alt.key, variants: alt.variants };
  }
  return undefined;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * 세트 전체의 소재 영역·정답 자리·지시문 변형을 한 번에 정한다.
 * 변형: 슬롯에 variant가 있으면 그대로("" = 기본 지시문), 없으면 학년 비율대로 고른다.
 * 같은 묶음(중1·중2 19~20 응답)은 첫 문항의 방향을 따른다. 드문 대체 유형(중2 13번 시각)도 여기서 고른다.
 * 무작위 순서는 예전과 같게 둔다(소재 섞기 → 정답 자리 → 고등 5번 → 새 변형) — 예전 학년의 프롬프트가 그대로 나오게.
 */
export function planSlotAssignments(
  slots: PlanSlotInput[],
  grade: ListeningGradeLevel | undefined
): Map<number, SlotPlan> {
  const plans = new Map<number, SlotPlan>();
  const g = grade ?? "middle1";
  const base = new Map(slots.map((s) => [s, resolveSlotBase(s, grade)]));
  const domains = shuffle(DOMAINS);
  let d = 0;
  const slotted = slots.filter((s) => needsAnswerSlot(base.get(s)!.code, grade));
  const positions = buildBalancedCorrectAnswerSlots(slotted.length);
  for (const s of slots) {
    const { code } = base.get(s)!;
    const plan: SlotPlan = { code };
    if (!hasOwnScenario(code, grade)) plan.domain = domains[d++ % domains.length];
    const pi = slotted.indexOf(s);
    if (pi >= 0) plan.answerSlot = positions[pi];
    if (isHighSchoolListeningGrade(grade) && code === 5) plan.variant = pickHigh5Variant();
    plans.set(s.slotIndex, plan);
  }
  if (isHighSchoolListeningGrade(grade)) return plans;

  // 중등: 드문 대체 유형 → 지시문 변형 (같은 묶음은 같은 변형)
  const pairChoice = new Map<string, string>();
  for (const s of slots) {
    const plan = plans.get(s.slotIndex)!;
    let key = base.get(s)!.key;
    let allowed = s.typeKey ? undefined : blueprintSlot(g, s.typeId)?.variants;
    const alt = pickAlternate(s, g);
    if (alt) {
      key = alt.key;
      allowed = alt.variants;
      plan.typeKey = alt.key;
      plan.code = typeCode(alt.key);
      delete plan.answerSlot;
      if (!plan.domain && !hasOwnScenario(plan.code, grade)) plan.domain = domains[d++ % domains.length];
    }
    if (!key || !getTypeDef(key).variants?.length) continue;
    let variantId = s.variant;
    const group = s.typeKey || alt ? undefined : blueprintSlot(g, s.typeId)?.pairGroup;
    if (variantId === undefined && group && pairChoice.has(group)) variantId = pairChoice.get(group);
    if (variantId === undefined) variantId = pickVariant(key, g, allowed);
    if (group && variantId !== undefined && !pairChoice.has(group)) pairChoice.set(group, variantId);
    if (!variantId) continue;
    plan.variantId = variantId;
    plan.code = typeCode(key, variantId);
    const note = variantNote(key, variantId);
    if (note) plan.variant = note;
  }
  return plans;
}

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function answerSlotRule(typeId: number, grade: ListeningGradeLevel | undefined, slot: number): string {
  const c = CIRCLED[slot - 1]!;
  const nth = ["첫", "두", "세", "네", "다섯"][slot - 1]!;
  if (isHighSchoolListeningGrade(grade)) {
    if (typeId === 10) return `표의 ${nth} 번째 행(${c})이 조건을 모두 만족하는 정답 행이 되게 한다(mismatch_no=${slot}, correct_answer=${slot}).`;
    if (typeId === 9) return `선택지 5개는 대본 순서대로 쓰고, ${nth} 번째 선택지(${c})가 대본과 다른 내용이 되게 한다(correct_answer=${slot}).`;
    return `선택지 5개는 대본 언급 순서대로 쓰고, ${nth} 번째 선택지(${c})가 대본에 나오지 않는 항목이 되게 한다(correct_answer=${slot}).`;
  }
  if (typeId === 14) return `table_data.rows는 대본 언급 순서대로 쓰고, ${nth} 번째 행(${c})이 대본과 다른 행이 되게 한다(mismatch_no=${slot}, correct_answer=${slot}).`;
  const key = keyForCode(typeId, "middle");
  const spoken = ["one", "two", "three", "four", "five"][slot - 1]!;
  if (key === "M_TABLE_SELECT") return `표의 ${nth} 번째 행(${c})이 조건을 모두 만족하는 정답 행이 되게 한다(mismatch_no=${slot}, correct_answer=${slot}).`;
  if (key === "M_MISMATCH_DIALOGUE") return `선택지 5개는 대본 순서대로 쓰고, ${nth} 번째 선택지(${c})가 대본과 다른 내용이 되게 한다(correct_answer=${slot}).`;
  if (key === "M_PICTURE_SITUATION") return `${nth} 번째 대화("Number ${spoken}.")가 그림과 맞는 대화가 되게 한다(correct_answer=${slot}).`;
  if (key === "M_AWKWARD_DIALOGUE") return `${nth} 번째 대화("Number ${spoken}.")가 어색한 대화가 되게 한다(correct_answer=${slot}).`;
  if (key === "M_FLYER_BLANKS") return `선택지 5개는 (A) 값이 작은(이른) 것부터 늘어놓고, ${nth} 번째 선택지(${c})가 정답 짝이 되게 한다(correct_answer=${slot}).`;
  return `선택지 5개는 대본 언급 순서대로 쓰고, ${nth} 번째 선택지(${c})가 언급되지 않은 항목이 되게 한다(correct_answer=${slot}).`;
}

/** 슬롯 한 개의 배정 안내 (없으면 빈 문자열) */
export function formatSlotPlanBlock(
  slot: { typeId: number; slotIndex: number },
  plan: SlotPlan | undefined,
  grade: ListeningGradeLevel | undefined
): string {
  if (!plan || (!plan.domain && !plan.answerSlot && !plan.variant)) return "";
  // 유형 번호는 모듈 번호(프롬프트의 "N번 유형" 블록과 같은 번호) — 중2·중3은 문항 번호와 다르다
  const code = plan.code ?? slot.typeId;
  const lines = [`## ${slot.slotIndex}번 문항(유형 ${code}) 배정`];
  if (plan.domain) lines.push(`- 소재 영역: ${plan.domain} (이 영역 안에서 새로운 상황을 만든다)`);
  if (plan.answerSlot) lines.push(`- 정답 자리: ${answerSlotRule(code, grade, plan.answerSlot)}`);
  if (plan.variant) lines.push(`- 지시문 변형: ${plan.variant}`);
  return lines.join("\n");
}
