/**
 * 저장된 문항 → 유형 키·모듈 번호.
 *
 * DB에는 유형 키 칸이 없고 question_type(한글 이름)·지시문·번호만 있다. 그래서
 *   1) 한글 이름(카탈로그 이름 + 예전에 쓰던 이름)
 *   2) 지시문 틀
 *   3) 문항 번호 — 중등은 항상 중1 배치로 본다(예전 중2·중3 세트는 중1 배치를 복사해 만들었다)
 * 순서로 유형을 정한다. 번호만 보고 유형을 정하면 중2·중3 새 배치에서 다른 유형이 된다
 * (중3 20번 = 상황에 맞는 말인데 옛 번호로는 "응답"이 되어 "Woman: ___"이 인쇄되는 식).
 */
import { getGradeBlueprint } from "@/lib/listening/grade-blueprints";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import {
  allTypeDefs,
  directionOfCode,
  engineForDirection,
  getTypeDef,
  isResponseTypeKey,
  responseDirectionOf,
  typeCode,
  type ListeningTypeKey,
  type ResponseDirection,
} from "@/lib/listening/type-catalog";

type Family = "middle" | "high";

export interface TypedQuestionLike {
  question_type?: string | null;
  instruction?: string | null;
  order_index?: number | null;
  question_text?: string | null;
  blank_speaker?: string | null;
  segments?: Array<{ speaker: string }>;
}

/** 예전 생성본·자유 모드에서 모델이 붙인 이름 → 유형 키 (null = 이름만으로 못 정함 → 지시문으로) */
const LEGACY_LABELS: Record<string, { middle?: ListeningTypeKey | null; high?: ListeningTypeKey | null }> = {
  "구매·선택 대화": { middle: "M_PICTURE_SELECT" },
  "주문/선택 정보 파악": { middle: "M_PICTURE_SELECT" },
  "대화 주제": { middle: "M_TOPIC_DIALOGUE" },
  "대화 내용": { middle: "M_TOPIC_DIALOGUE" },
  "대화 주제/내용": { middle: "M_TOPIC_DIALOGUE" },
  "대화 직후 할 일": { middle: "M_TODO_NOW" },
  "마지막 말에 이어질 응답": { middle: "M_RESPONSE" },
  "이어 말하기": { middle: "M_RESPONSE" },
  "이어 말하기 (남→여)": { middle: "M_RESPONSE" },
  "이어 말하기 (여→남)": { middle: "M_RESPONSE" },
  "장래 희망": { middle: "M_DREAM_JOB" },
  "직업 희망": { middle: "M_DREAM_JOB" },
  "장래 희망/직업 희망": { middle: "M_DREAM_JOB" },
  "장소 파악": { middle: "M_PLACE" },
  "특정 시점에 할 일": { middle: "M_PLAN_AT_TIME" },
  "표/정보 불일치": { middle: "M_TABLE_MISMATCH" },
  "표·안내 불일치": { middle: "M_TABLE_MISMATCH" },
  "할 일·계획": { middle: "M_PLAN_AT_TIME", high: "H_TODO" },
  // "함께 할 일"은 직후 할 일·특정 시점 할 일 둘 다 쓰였다 → 지시문으로 정한다
  "함께 할 일": { middle: null, high: "H_TODO" },
};

function norm(s: string | null | undefined): string {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s*\)\s*/g, ")");
}

function familyOf(grade: ListeningGradeLevel | undefined): Family | undefined {
  if (!grade) return undefined;
  return isHighSchoolListeningGrade(grade) ? "high" : "middle";
}

/** 학년을 모를 때: 번호 18~20이나 중등 지시문이면 중등 */
function guessFamily(q: TypedQuestionLike): Family {
  // 한 학년군에만 있는 이름이면 그 학년군 ("짧은 응답"은 고등, "응답 고르기"는 중등)
  const label = norm(q.question_type);
  if (label) {
    const families = new Set(allTypeDefs().filter((d) => d.label === label).map((d) => d.family));
    if (families.size === 1) return [...families][0]!;
  }
  if ((q.order_index ?? 0) > 17) return "middle";
  const ins = String(q.instruction ?? "");
  if (/이어질|‘I’|'I'|대화하는 장소|장래 희망|이동할 방법/.test(ins)) return "middle";
  if (/하는 말의 요지|의견으로|언급된 .*아닌 것|주제로 가장 적절한 것은/.test(ins)) return "high";
  return "middle";
}

/** 카탈로그 이름·예전 이름으로 */
function keyFromLabel(label: string, family: Family): ListeningTypeKey | null | undefined {
  if (!label) return undefined;
  const exact = allTypeDefs().filter((d) => d.family === family && d.label === label);
  if (exact.length >= 1) return exact[0]!.key;
  const legacy = LEGACY_LABELS[label];
  if (legacy && family in legacy) return legacy[family];
  return undefined;
}

/** 이름이 카탈로그 이름을 품거나 그 반대일 때 (예전 코드와 같은 느슨한 맞춤) */
function keyFromLooseLabel(label: string, family: Family): ListeningTypeKey | undefined {
  if (label.length < 2) return undefined;
  const defs = allTypeDefs().filter((d) => d.family === family);
  return defs.find((d) => label.includes(d.label) || d.label.includes(label))?.key;
}

/** 지시문 틀로 */
export function keyFromInstruction(instruction: string, family: Family): ListeningTypeKey | undefined {
  const s = instruction.replace(/\s+/g, " ");
  if (!s.trim()) return undefined;
  const dialogue = /대화를 듣고/.test(s);
  if (family === "high") {
    if (/하는 말의 목적/.test(s)) return "H_PURPOSE";
    if (/의견으로/.test(s)) return "H_OPINION";
    if (/요지로/.test(s)) return "H_GIST";
    if (/그림에서/.test(s)) return "H_PICTURE_MISMATCH";
    if (/지불할 금액/.test(s)) return "H_AMOUNT";
    if (/이유/.test(s)) return "H_REASON";
    if (/언급된 .*아닌 것/.test(s)) return "H_SET_MENTION";
    if (/주제로/.test(s)) return "H_SET_TOPIC";
    if (/언급되지 않은|언급하지 않은/.test(s)) return "H_NOT_MENTIONED";
    if (/일치하지 않는/.test(s)) return "H_MISMATCH";
    if (/표를 보면서/.test(s)) return "H_TABLE";
    if (/상황 설명을 듣고/.test(s)) return "H_SITUATION";
    if (/마지막 말에 대한/.test(s)) return undefined; // 짧은/긴 응답은 번호·길이로
    if (/할 일|부탁한 일/.test(s)) return "H_TODO";
    return undefined;
  }
  if (/‘I’|'I'|‘this’|'this'|‘these’|'these'|가리키는 것/.test(s)) return "M_RIDDLE";
  if (/무엇에 관한 설명/.test(s)) return "M_DESCRIBE";
  if (/그림의 상황에/.test(s)) return "M_PICTURE_SITUATION";
  if (/대화가 어색한/.test(s)) return "M_AWKWARD_DIALOGUE";
  if (/\(A\).*\(B\)/.test(s)) return "M_FLYER_BLANKS";
  if (/의미하는 바/.test(s)) return "M_EXPRESSION_MEANING";
  if (/방송의 목적/.test(s)) return "M_PURPOSE_ANNOUNCE";
  if (/상황 설명을 듣고/.test(s)) return "M_SITUATION_SAY";
  if (/마지막 말에 이어질|마지막 말에 대한/.test(s)) return "M_RESPONSE";
  if (/마지막 말의 의도/.test(s)) return "M_INTENT";
  if (/날씨/.test(s)) return "M_WEATHER";
  if (/표에서 일치하지|표의 내용과 일치하지/.test(s)) return "M_TABLE_MISMATCH";
  if (/표를 보면서/.test(s)) return "M_TABLE_SELECT";
  if (/시각을 고르시오/.test(s)) return "M_TIME";
  if (/날짜를 고르시오|요일을 고르시오/.test(s)) return "M_DATE";
  if (/거스름돈|지불할 금액|지불해야 할 금액/.test(s)) return "M_AMOUNT";
  if (/장래 희망/.test(s)) return "M_DREAM_JOB";
  if (/심정/.test(s)) return "M_EMOTION";
  if (/대화 직후에 할 일/.test(s)) return "M_TODO_NOW";
  if (/무엇에 관한 내용/.test(s)) return "M_TOPIC_DIALOGUE";
  if (/하는 말의 내용/.test(s)) return "M_TOPIC_MONO";
  if (/이동할 방법|교통수단/.test(s)) return "M_TRANSPORT";
  if (/목적으로/.test(s)) return "M_PURPOSE_CALL";
  if (/이유/.test(s)) return "M_REASON";
  if (/대화하는 장소/.test(s)) return "M_PLACE";
  if (/관계로/.test(s)) return "M_RELATION";
  if (/부탁한 일/.test(s)) return "M_REQUEST";
  if (/제안한 것/.test(s)) return "M_SUGGEST";
  if (/직업으로/.test(s)) return "M_JOB";
  if (/한 일로/.test(s)) return "M_DID";
  if (/할 일로/.test(s)) return "M_PLAN_AT_TIME";
  if (/언급하지 않은|언급되지 않은/.test(s)) {
    return dialogue ? "M_NOT_MENTIONED_DIALOGUE" : "M_NOT_MENTIONED_MONO";
  }
  if (/일치하지 않는/.test(s)) return "M_MISMATCH_DIALOGUE";
  if (/가져올|구입할 물품|선택할/.test(s)) return "M_SPECIFIC";
  if (/구입할|주문할|만든|구입한|주문한|디자인한/.test(s)) return "M_PICTURE_SELECT";
  return undefined;
}

/** 번호로 — 중등은 중1 배치(예전 중2·중3 세트도 이 배치로 만들어졌다) */
function keyFromOrder(order: number | null | undefined, family: Family): ListeningTypeKey | undefined {
  if (!order) return undefined;
  const bp = getGradeBlueprint(family === "high" ? "high1" : "middle1");
  return bp.find((s) => s.position === order)?.key;
}

/**
 * 저장된 문항의 유형 키. 이름 → 지시문 → 번호(중등은 중1 배치) 순서.
 * 학년을 모르면 번호·지시문으로 중등/고등을 짐작한다.
 */
export function resolveQuestionTypeKey(
  q: TypedQuestionLike,
  grade?: ListeningGradeLevel
): ListeningTypeKey | undefined {
  const family = familyOf(grade) ?? guessFamily(q);
  const label = norm(q.question_type);
  const byLabel = keyFromLabel(label, family);
  if (byLabel) return byLabel;
  const ins = String(q.instruction ?? "");
  const byInstruction = keyFromInstruction(ins, family);
  if (byInstruction) return byInstruction;
  // 이름만으로 못 정한 예전 이름("함께 할 일")은 지시문이 없으면 특정 시점 할 일로
  if (byLabel === null && family === "middle") return "M_PLAN_AT_TIME";
  const loose = label ? keyFromLooseLabel(label, family) : undefined;
  if (loose) return loose;
  return keyFromOrder(q.order_index, family);
}

/** 응답 문항의 방향 (지시문·빈칸 화자·마지막 화자, 모르면 번호) */
function responseDirection(
  q: TypedQuestionLike,
  key: ListeningTypeKey,
  family: Family
): ResponseDirection | undefined {
  const order = q.order_index ?? 0;
  if (family === "high") {
    // 고등은 예전처럼 번호가 짧은/긴 응답 짝(11·12 / 13·14) 안이면 번호를 따른다
    const pair = key === "H_RESP_SHORT" ? [11, 12] : [13, 14];
    if (pair.includes(order)) return directionOfCode(order, "high");
  }
  const dir = responseDirectionOf({
    instruction: q.instruction ?? undefined,
    blank_speaker: q.blank_speaker ?? undefined,
    question_text: q.question_text ?? undefined,
    segments: q.segments,
  });
  if (dir) return dir;
  if (family === "middle" && (order === 19 || order === 20)) return directionOfCode(order, "middle");
  return undefined;
}

/**
 * 저장된 문항의 유형 모듈 번호 (fix-typeN·검수가 쓰는 번호).
 * 유형을 전혀 못 정하면 문항 번호를 그대로 돌려준다(예전 동작).
 */
export function questionTypeCode(q: TypedQuestionLike, grade?: ListeningGradeLevel): number {
  const family = familyOf(grade) ?? guessFamily(q);
  let key = resolveQuestionTypeKey(q, grade);
  // 고등 "짧은 응답/긴 응답" 이름이 없고 지시문만 있을 때: 번호로
  if (!key && family === "high") key = keyFromOrder(q.order_index, "high");
  if (!key) return q.order_index ?? 0;
  if (getTypeDef(key).family !== family) {
    // 학년과 다른 학년군의 이름이 붙은 문항 — 번호로 정한다
    const byOrder = keyFromOrder(q.order_index, family);
    if (!byOrder) return q.order_index ?? 0;
    key = byOrder;
  }
  if (isResponseTypeKey(key)) {
    const dir = responseDirection(q, key, family);
    return dir ? engineForDirection(key, dir)! : typeCode(key);
  }
  return typeCode(key);
}

/**
 * 저장된 문항의 지시문 변형 (응답 방향, 'this'/'these', 심정 선택지 언어, 시각 대상).
 * 변형 칸이 DB에 없어 지시문·선택지에서 읽는다.
 */
export function variantOfStoredQuestion(
  key: ListeningTypeKey,
  q: TypedQuestionLike & { choices?: string[] | null }
): string | undefined {
  const ins = String(q.instruction ?? "");
  if (isResponseTypeKey(key)) {
    return (
      responseDirectionOf({
        instruction: ins,
        blank_speaker: q.blank_speaker ?? undefined,
        question_text: q.question_text ?? undefined,
        segments: q.segments,
      }) ?? undefined
    );
  }
  if (key === "M_RIDDLE") {
    if (/‘this’|'this'/.test(ins)) return "this";
    if (/‘these’|'these'/.test(ins)) return "these";
    return undefined;
  }
  if (key === "M_EMOTION") {
    const choices = (q.choices ?? []).map(String);
    if (choices.length && choices.every((c) => /^[a-z\s-]+$/i.test(c.trim()))) return "en";
    if (choices.length && choices.every((c) => /[가-힣]/.test(c))) return "ko";
    return undefined;
  }
  if (key === "M_TIME") {
    if (/현재 시각/.test(ins)) return "current";
    if (/예약한 시각/.test(ins)) return "reserve";
    if (/시작하는 시각/.test(ins)) return "start";
    return undefined;
  }
  if (key === "M_AMOUNT") return /거스름돈/.test(ins) ? "change" : undefined;
  if (key === "M_DATE") return /요일을/.test(ins) ? "weekday" : undefined;
  return undefined;
}
