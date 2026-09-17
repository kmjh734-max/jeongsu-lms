/**
 * 유형별 출제 설계서(참고 교재 분석).
 *
 * 선생님 지적(2026-09-17): 참고 파일을 줬는데도 문항이 틀리거나 매번 비슷하게 나온다.
 * 그래서 중1·2·3, 고1 교재를 유형마다 25문항 넘게 읽어 흐름·정답 숨기는 법·오답 재료·금지 사항·
 * 뼈대를 정리했고(data/*.json), 문항을 만들 때 그 유형의 규칙과 함께 뼈대 하나·상황 하나·
 * 정답 틀 하나·끝맺는 방식 하나를 무작위로 골라 건넨다. 규칙은 매번 같고, 소재와 구성은 매번 달라진다.
 *
 * 저작권: 교재 문장·이름·가격·소재는 옮기지 않았다. 뼈대는 자리표시로 된 흐름이고, 목록은 새로 쓴 한국어 이름표다.
 * 분량(단어·턴)은 여기서 주지 않는다 — quality-craft의 학년별 실측 기준이 정한다.
 */
import type { ListeningTypeKey } from "@/lib/listening/type-catalog";
import H_AMOUNT from "./data/H_AMOUNT.json";
import H_GIST from "./data/H_GIST.json";
import H_MISMATCH from "./data/H_MISMATCH.json";
import H_NOT_MENTIONED from "./data/H_NOT_MENTIONED.json";
import H_OPINION from "./data/H_OPINION.json";
import H_PICTURE_MISMATCH from "./data/H_PICTURE_MISMATCH.json";
import H_PURPOSE from "./data/H_PURPOSE.json";
import H_REASON from "./data/H_REASON.json";
import H_RESP_LONG from "./data/H_RESP_LONG.json";
import H_RESP_SHORT from "./data/H_RESP_SHORT.json";
import H_SET_MENTION from "./data/H_SET_MENTION.json";
import H_SET_TOPIC from "./data/H_SET_TOPIC.json";
import H_SITUATION from "./data/H_SITUATION.json";
import H_TABLE from "./data/H_TABLE.json";
import H_TODO from "./data/H_TODO.json";
import M_AMOUNT from "./data/M_AMOUNT.json";
import M_AWKWARD_DIALOGUE from "./data/M_AWKWARD_DIALOGUE.json";
import M_DID from "./data/M_DID.json";
import M_EMOTION from "./data/M_EMOTION.json";
import M_NOT_MENTIONED_DIALOGUE from "./data/M_NOT_MENTIONED_DIALOGUE.json";
import M_NOT_MENTIONED_MONO from "./data/M_NOT_MENTIONED_MONO.json";
import M_PURPOSE_ANNOUNCE from "./data/M_PURPOSE_ANNOUNCE.json";
import M_PURPOSE_CALL from "./data/M_PURPOSE_CALL.json";
import M_REQUEST from "./data/M_REQUEST.json";
import M_RESPONSE from "./data/M_RESPONSE.json";
import M_SITUATION_SAY from "./data/M_SITUATION_SAY.json";
import M_TODO_NOW from "./data/M_TODO_NOW.json";
import M_TIME from "./data/M_TIME.json";
import M_TABLE_SELECT from "./data/M_TABLE_SELECT.json";
import M_PICTURE_SITUATION from "./data/M_PICTURE_SITUATION.json";
import M_PICTURE_SELECT from "./data/M_PICTURE_SELECT.json";
import M_DESCRIBE from "./data/M_DESCRIBE.json";
import M_DATE from "./data/M_DATE.json";

type Skeleton = { turns?: number; beats: string[]; answerType?: string; distractors?: string[]; trap?: string };
type Distractor = { source: string; share?: string; rule: string };
export type TypeRecipe = {
  key: string;
  instructions?: string[];
  script?: { speakers?: string; flow?: string[]; answerCluePosition?: string };
  answerConcealment?: string[];
  distractorDesign?: Distractor[];
  mustNot?: string[];
  scenarioBank?: string[];
  answerBank?: string[];
  finalLineVariety?: string[];
  selfCheck?: string[];
  skeletons?: Skeleton[];
  [extra: string]: unknown;
};

const RECIPES: Partial<Record<string, TypeRecipe>> = {
  H_AMOUNT: H_AMOUNT as unknown as TypeRecipe,
  H_GIST: H_GIST as unknown as TypeRecipe,
  H_MISMATCH: H_MISMATCH as unknown as TypeRecipe,
  H_NOT_MENTIONED: H_NOT_MENTIONED as unknown as TypeRecipe,
  H_OPINION: H_OPINION as unknown as TypeRecipe,
  H_PICTURE_MISMATCH: H_PICTURE_MISMATCH as unknown as TypeRecipe,
  H_PURPOSE: H_PURPOSE as unknown as TypeRecipe,
  H_REASON: H_REASON as unknown as TypeRecipe,
  H_RESP_LONG: H_RESP_LONG as unknown as TypeRecipe,
  H_RESP_SHORT: H_RESP_SHORT as unknown as TypeRecipe,
  H_SET_MENTION: H_SET_MENTION as unknown as TypeRecipe,
  H_SET_TOPIC: H_SET_TOPIC as unknown as TypeRecipe,
  H_SITUATION: H_SITUATION as unknown as TypeRecipe,
  H_TABLE: H_TABLE as unknown as TypeRecipe,
  H_TODO: H_TODO as unknown as TypeRecipe,
  M_AMOUNT: M_AMOUNT as unknown as TypeRecipe,
  M_AWKWARD_DIALOGUE: M_AWKWARD_DIALOGUE as unknown as TypeRecipe,
  M_DID: M_DID as unknown as TypeRecipe,
  M_EMOTION: M_EMOTION as unknown as TypeRecipe,
  M_NOT_MENTIONED_DIALOGUE: M_NOT_MENTIONED_DIALOGUE as unknown as TypeRecipe,
  M_NOT_MENTIONED_MONO: M_NOT_MENTIONED_MONO as unknown as TypeRecipe,
  M_PURPOSE_ANNOUNCE: M_PURPOSE_ANNOUNCE as unknown as TypeRecipe,
  M_PURPOSE_CALL: M_PURPOSE_CALL as unknown as TypeRecipe,
  M_REQUEST: M_REQUEST as unknown as TypeRecipe,
  M_RESPONSE: M_RESPONSE as unknown as TypeRecipe,
  M_SITUATION_SAY: M_SITUATION_SAY as unknown as TypeRecipe,
  M_TODO_NOW: M_TODO_NOW as unknown as TypeRecipe,
  M_TIME: M_TIME as unknown as TypeRecipe,
  M_TABLE_SELECT: M_TABLE_SELECT as unknown as TypeRecipe,
  M_PICTURE_SITUATION: M_PICTURE_SITUATION as unknown as TypeRecipe,
  M_PICTURE_SELECT: M_PICTURE_SELECT as unknown as TypeRecipe,
  M_DESCRIBE: M_DESCRIBE as unknown as TypeRecipe,
  M_DATE: M_DATE as unknown as TypeRecipe,
};

/** 규칙 목록 밖에 유형마다 따로 둔 설계(계산 틀·그림 명세·표 명세 등). 이름 → 제목 */
const EXTRA_TITLES: Record<string, string> = {
  calculationFrames: "계산 틀",
  choiceSetRules: "선택지 묶음 규칙",
  choiceWording: "선택지 문구",
  mismatchDimensions: "불일치 종류",
  pictureSpec: "그림 설명 규칙",
  tableSpec: "표 만드는 규칙",
  eliminationDesign: "행 빼기 설계",
};

/** 설계서를 같이 쓰는 유형: "I" 수수께끼는 설명 대상 설계서가 중1 1인칭 수수께끼까지 다룬다. */
const SHARED: Partial<Record<ListeningTypeKey, ListeningTypeKey>> = { M_RIDDLE: "M_DESCRIBE" };

export function getTypeRecipe(key: ListeningTypeKey | undefined | null): TypeRecipe | undefined {
  return key ? RECIPES[SHARED[key] ?? key] : undefined;
}

function pick<T>(list: T[] | undefined, rand: () => number): T | undefined {
  if (!list || list.length === 0) return undefined;
  return list[Math.floor(rand() * list.length) % list.length];
}

function bullets(list: string[] | undefined): string {
  return (list ?? []).map((s) => `  - ${s}`).join("\n");
}

function extraText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((v) => `  - ${typeof v === "string" ? v : JSON.stringify(v)}`).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `  - ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n");
  }
  return typeof value === "string" ? `  - ${value}` : "";
}

/**
 * 한 문항을 만들 때 프롬프트에 붙이는 설계서 블록.
 * rand는 시험에서 고정값을 넣으려고 받는다.
 */
export function buildTypeRecipeBlock(
  key: ListeningTypeKey | undefined | null,
  rand: () => number = Math.random
): string {
  const r = getTypeRecipe(key);
  if (!r) return "";
  const skeleton = pick(r.skeletons, rand);
  const scenario = pick(r.scenarioBank, rand);
  const answer = pick(r.answerBank, rand);
  const ending = pick(r.finalLineVariety, rand);

  const parts: string[] = [`[이 유형 출제 설계서 — 참고 교재 분석. 아래 규칙을 모두 지킨다]`];
  if (r.script?.speakers) parts.push(`화자 구성: ${r.script.speakers}`);
  if (r.script?.flow?.length) parts.push(`흐름:
${bullets(r.script.flow)}`);
  if (r.script?.answerCluePosition) parts.push(`정답 단서 위치: ${r.script.answerCluePosition}`);
  if (r.answerConcealment?.length) parts.push(`정답을 숨기는 법:
${bullets(r.answerConcealment)}`);
  if (r.distractorDesign?.length) {
    parts.push(
      `오답 설계(재료마다 "분명히 틀리게 하는 조건"을 반드시 대본에 넣는다):
${r.distractorDesign
        .map((d) => `  - ${d.source}${d.share ? ` (${d.share})` : ""} → ${d.rule}`)
        .join("\n")}`
    );
  }
  for (const [name, title] of Object.entries(EXTRA_TITLES)) {
    const text = extraText(r[name]);
    if (text) parts.push(`${title}:
${text}`);
  }
  if (r.mustNot?.length) parts.push(`금지:
${bullets(r.mustNot)}`);

  const plan: string[] = [];
  if (scenario) plan.push(`  - 상황: ${scenario} (이 상황을 새로 구체화한다. 이름·물건·숫자는 새로 정한다. 위에 소재 영역이 배정되어 있고 이 상황과 맞지 않으면 배정을 따른다)`);
  if (answer) plan.push(`  - 정답 종류: ${answer} (위에 정답이 배정되어 있으면 배정을 따르고, 상황과 맞지 않으면 상황에 맞는 정답 종류로 바꾼다)`);
  if (skeleton) {
    plan.push(
      `  - 구성 뼈대(소재는 버리고 위 상황으로 바꾼다. 누가 무엇을 제안·거절·결정하는지 구조만 따르고, 학년 분량에 맞게 턴을 늘리거나 줄인다):
${skeleton.beats
        .map((b) => `      ${b}`)
        .join("\n")}${skeleton.distractors?.length ? `
    오답 구성: ${skeleton.distractors.join(" / ")}` : ""}${
        skeleton.trap ? `
    함정: ${skeleton.trap}` : ""
      }`
    );
  }
  if (ending) plan.push(`  - 마지막 발화 방식: ${ending}`);
  if (plan.length) parts.push(`이번 문항 구성(매번 다르게 뽑은 것):
${plan.join("\n")}`);
  if (r.selfCheck?.length) parts.push(`다 쓴 뒤 스스로 확인:
${bullets(r.selfCheck)}`);
  return parts.join("\n");
}
