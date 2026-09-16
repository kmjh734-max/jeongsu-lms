/**
 * 유형별 생성 모델 등급.
 *
 * 한 세트를 전부 gpt-5.5로 만들면 문항당 값이 가장 크다. 그래서 쉬운 중등 유형만 싼 모델로
 * 내릴 수 있게 등급을 나눠 두고, 같은 자리(중2 심정·전화 목적, 중3 시각·한 일) 4문항을
 * gpt-5.5 / gpt-5 / gpt-5-mini로 만들어 quality-rubric.md로 채점했다(2026-09-16).
 *
 * | 모델 | 문항당 값 | 루브릭 평균 | 문제 |
 * |---|---|---|---|
 * | gpt-5.5 | 74원 | 9.5/10 | 없음 |
 * | gpt-5 | 51원 | 8.0/10 | 4문항 중 2문항이 추론 토큰을 다 써서 빈 응답(finish_reason=length) |
 * | gpt-5-mini | 5원 | 7.0/10 | 분량 이탈(시각 143단어), 화자 표시 누락, 정답이 둘로 읽히는 문항 |
 *
 * 값은 gpt-5-mini가 15배 싸지만 루브릭이 2.5점 떨어져(D4 분량·D6 형식·D1 모호) 기본값으로 쓰지 않는다.
 * 등급 구조와 환경변수는 남겨 두어, 더 싼 모델이 나오면 유형별로 바꿔 끼울 수 있게 한다.
 *   OPENAI_MODEL_LISTENING_SIMPLE=gpt-5-mini  → 쉬운 유형만 싼 모델
 *   OPENAI_MODEL_LISTENING_HARD=...           → 어려운 유형 모델
 */
import {
  LISTENING_MODEL_FALLBACK,
  LISTENING_MODEL_PRIMARY,
  getListeningGeneratorModelCandidates,
} from "@/lib/listening/openai-listening-model";
import type { ListeningTypeKey } from "@/lib/listening/type-catalog";

/** hard = 비싼 모델 유지, simple = 싼 모델 */
export type ListeningModelTier = "hard" | "simple";

/**
 * 비싼 모델을 유지하는 유형.
 * - 표·금액: 조건 적용·계산이 틀리면 정답이 무너진다(price-check가 잡아내는 실패가 가장 많던 자리)
 * - 응답: 루브릭 B(재진술)·lastEcho 기준이 가장 까다롭다
 * - 불일치·언급X·표 정보 불일치: 선택지 순서 = 대본 순서를 지켜야 한다
 * - 상황에 맞는 말·어색한 대화·그림 상황: 대본 구조 자체가 복잡하다
 * - 양식 빈칸·표현의 뜻: 값 두 개를 짝짓거나 관용 표현의 뜻을 다뤄 오답이 자주 났다
 */
const HARD_KEYS = new Set<ListeningTypeKey>([
  "M_AMOUNT",
  "M_TABLE_MISMATCH",
  "M_TABLE_SELECT",
  "M_FLYER_BLANKS",
  "M_RESPONSE",
  "M_MISMATCH_DIALOGUE",
  "M_NOT_MENTIONED_MONO",
  "M_NOT_MENTIONED_DIALOGUE",
  "M_SITUATION_SAY",
  "M_AWKWARD_DIALOGUE",
  "M_PICTURE_SITUATION",
  "M_EXPRESSION_MEANING",
  "M_DESCRIBE",
  // 고등은 전부 비싼 모델 (분량·재진술 기준이 중등보다 훨씬 빡빡하다)
  "H_PURPOSE",
  "H_OPINION",
  "H_GIST",
  "H_PICTURE_MISMATCH",
  "H_TODO",
  "H_AMOUNT",
  "H_REASON",
  "H_NOT_MENTIONED",
  "H_MISMATCH",
  "H_TABLE",
  "H_RESP_SHORT",
  "H_RESP_LONG",
  "H_SITUATION",
  "H_SET_TOPIC",
  "H_SET_MENTION",
]);

export function listeningModelTier(key: ListeningTypeKey | undefined | null): ListeningModelTier {
  if (!key) return "hard";
  return HARD_KEYS.has(key) ? "hard" : "simple";
}

/** 등급별 기본 모델 (환경변수로 덮어쓸 수 있다) */
export function listeningModelForTier(tier: ListeningModelTier): string {
  if (tier === "simple") {
    // 기본은 비싼 모델과 같다 — 싼 모델은 루브릭이 떨어져, 환경변수로 켤 때만 쓴다
    return process.env.OPENAI_MODEL_LISTENING_SIMPLE?.trim() || LISTENING_MODEL_PRIMARY;
  }
  return process.env.OPENAI_MODEL_LISTENING_HARD?.trim() || LISTENING_MODEL_PRIMARY;
}

/**
 * 유형에 쓸 모델 후보. 싼 모델이 실패하면 비싼 모델로 넘어간다.
 * OPENAI_MODEL_LISTENING_GENERATOR를 지정한 경우에는 예전처럼 그 값만 쓴다(실험·수동 재생성용).
 */
export function generatorModelsForTypeKey(key: ListeningTypeKey | undefined | null): string[] {
  if (process.env.OPENAI_MODEL_LISTENING_GENERATOR?.trim()) {
    return getListeningGeneratorModelCandidates();
  }
  const tier = listeningModelTier(key);
  const primary = listeningModelForTier(tier);
  const out = [primary];
  const hard = listeningModelForTier("hard");
  if (!out.includes(hard)) out.push(hard);
  const fallback = LISTENING_MODEL_FALLBACK;
  if (!out.includes(fallback)) out.push(fallback);
  return out;
}
