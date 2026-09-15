/**
 * 한 세트(슬롯 목록) 전체에 걸친 소재 영역·정답 자리 배정.
 * 5문항씩 나눠 병렬로 만들면 모델이 다른 묶음을 못 봐서 한 세트에 "동아리 부스"가 서너 번 나왔고,
 * 선택지 순서가 대본·표 순서로 정해지는 유형은 모델이 정답을 ④·⑤에 몰았다(고1 표 ④ 14/20, 중등 표 ④ 32/60).
 * 섞으면 대본 순서가 깨져 정답만 튀므로(고1 9번: 정답 선택지만 대본 순서를 벗어남) 자리를 미리 정해 준다.
 */
import { hasAnswerVarietyPool } from "@/lib/listening/answer-variety-pool";
import { buildBalancedCorrectAnswerSlots } from "@/lib/listening/balance-correct-answer";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";

export interface SlotPlan {
  /** 소재 영역 (세트 안에서 겹치지 않음) */
  domain?: string;
  /** 정답이 와야 할 선택지 자리 1~5 (선택지 순서가 대본·표로 정해지는 유형만) */
  answerSlot?: number;
  /** 지시문 변형 안내 (고등 5번: 할 일 / 부탁한 일 / ~를 위해 할 일) */
  variant?: string;
}

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

/** 선택지 순서가 대본 언급 순서·표 행·그림 라벨로 정해져 섞으면 안 되는 유형 */
export function isOrderBoundType(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  if (isHighSchoolListeningGrade(grade)) return [4, 8, 9, 10, 17].includes(typeId);
  return typeId === 5 || typeId === 14;
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
  // 고등 17은 16과 같은 대본
  if (isHighSchoolListeningGrade(grade) && typeId === 17) return true;
  return false;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function planSlotAssignments(
  slots: Array<{ typeId: number; slotIndex: number }>,
  grade: ListeningGradeLevel | undefined
): Map<number, SlotPlan> {
  const plans = new Map<number, SlotPlan>();
  const domains = shuffle(DOMAINS);
  let d = 0;
  const slotted = slots.filter((s) => needsAnswerSlot(s.typeId, grade));
  const positions = buildBalancedCorrectAnswerSlots(slotted.length);
  for (const s of slots) {
    const plan: SlotPlan = {};
    if (!hasOwnScenario(s.typeId, grade)) plan.domain = domains[d++ % domains.length];
    const pi = slotted.indexOf(s);
    if (pi >= 0) plan.answerSlot = positions[pi];
    if (isHighSchoolListeningGrade(grade) && s.typeId === 5) plan.variant = pickHigh5Variant();
    plans.set(s.slotIndex, plan);
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
  return `선택지 5개는 대본 언급 순서대로 쓰고, ${nth} 번째 선택지(${c})가 언급되지 않은 항목이 되게 한다(correct_answer=${slot}).`;
}

/** 슬롯 한 개의 배정 안내 (없으면 빈 문자열) */
export function formatSlotPlanBlock(
  slot: { typeId: number; slotIndex: number },
  plan: SlotPlan | undefined,
  grade: ListeningGradeLevel | undefined
): string {
  if (!plan || (!plan.domain && !plan.answerSlot && !plan.variant)) return "";
  const lines = [`## ${slot.slotIndex}번 문항(유형 ${slot.typeId}) 배정`];
  if (plan.domain) lines.push(`- 소재 영역: ${plan.domain} (이 영역 안에서 새로운 상황을 만든다)`);
  if (plan.answerSlot) lines.push(`- 정답 자리: ${answerSlotRule(slot.typeId, grade, plan.answerSlot)}`);
  if (plan.variant) lines.push(`- 지시문 변형: ${plan.variant}`);
  return lines.join("\n");
}
