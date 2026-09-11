import { runWithConcurrency } from "@/lib/run-with-concurrency";
import type { Limiter } from "@/lib/lesson-materials/grammar-choice-v2/limiter";
import { chunkByGroup } from "@/lib/lesson-materials/grammar-choice-v2/chunk-by-group";
import { findOccurrences } from "@/lib/lesson-materials/grammar-choice-v2/span-resolver";
import { callGrammarChoiceV2Json, parseModelJson } from "@/lib/lesson-materials/grammar-choice-v2/openai-call";
import { UNIQUENESS_SYSTEM_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import type {
  ExactSentence,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

/**
 * 유일성 판정도 출력이 항목 수에 비례한다. 고정 상한을 두면 지문을 여러 개
 * 돌릴 때만 응답이 잘려서 판정이 통째로 사라진다(검수와 같은 함정).
 * 항목당 실측치보다 넉넉히 잡되, 상한은 천장일 뿐 실제 지출이 아니다.
 */
export const UNIQUENESS_OUTPUT_TOKENS_PER_ITEM = 260;
export const UNIQUENESS_OUTPUT_TOKEN_FLOOR = 1_200;

/**
 * 한 호출에 넣는 판정 항목 수.
 *
 * 8이던 것을 3으로 내렸다. 분석 단계에서 문장 하나당 호출 하나로 쪼갠 것과 같은
 * 이유다 — 지연은 그 호출이 뱉는 토큰 수에 비례하고, 묶음 안의 항목들은 서로
 * 독립이라 직렬로 판정할 이유가 없다. 8개씩 묶었을 때 유일성 호출 하나가
 * 최대 38초까지 걸려 전체 실행의 절반을 차지했다.
 */
export const UNIQUENESS_ITEMS_PER_CALL = 3;

/**
 * 유일성 풀은 지문 전체를 합친 전역 풀이라 지문 수에 비례해 커진다.
 * 동시성이 3이면 여기가 전체 실행의 병목이 된다(후보 400개 = 10웨이브).
 */
export const UNIQUENESS_CONCURRENCY = 10;

export function uniquenessOutputTokenCap(itemCount: number): number {
  return Math.min(
    12_000,
    Math.max(
      UNIQUENESS_OUTPUT_TOKEN_FLOOR,
      itemCount * UNIQUENESS_OUTPUT_TOKENS_PER_ITEM
    )
  );
}

const SLOT = "[[SLOT]]";

const UNIQUENESS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["itemId", "aGrammatical", "bGrammatical"],
        properties: {
          itemId: { type: "string" },
          aGrammatical: { type: "boolean" },
          bGrammatical: { type: "boolean" },
        },
      },
    },
  },
} as const;

export type UniquenessVerdict = {
  candidateId: string;
  /** 정답만 문법적이어서 출제 가능한 상태인지. */
  unique: boolean;
  /** unique가 false일 때 왜 탈락했는지. */
  reason?: "BOTH_GRAMMATICAL" | "NEITHER_GRAMMATICAL" | "CORRECT_ANSWER_WRONG";
};

/**
 * 두 번째 오답이 있는 후보는 그 짝도 함께 판정한다.
 * 유일성 게이트가 검수보다 앞이므로, 여기서 구제 경로를 만들어 두지 않으면
 * 첫 오답만 나빠도 문항 자체가 사라진다. applyAudits의 #alt 규칙과 같은 형태다.
 */
export function expandUniquenessItems(
  items: ResolvedCandidate[]
): ResolvedCandidate[] {
  const out: ResolvedCandidate[] = [];
  for (const item of items) {
    out.push(item);
    const alt = item.distractors[1];
    if (alt && alt !== item.distractors[0]) {
      out.push({
        ...item,
        candidateId: `${item.candidateId}#alt`,
        distractors: [alt, item.distractors[0]!],
      });
    }
  }
  return out;
}

/**
 * 문장에서 정답 자리를 슬롯으로 바꾼다.
 * occurrenceIndex를 존중해 같은 표현이 여러 번 나오는 문장에서도 제자리를 판다.
 */
export function buildSlotSentence(
  sentence: string,
  sourceSpan: string,
  occurrenceIndex: number
): string | null {
  const span = sourceSpan.trim();
  if (!span) return null;
  // 순번은 낱말 경계로 센 것이다(findOccurrences). indexOf로 세면 in이 feeling 안에서 잡힌다.
  const at = findOccurrences(sentence, span)[Math.max(0, occurrenceIndex)];
  if (at == null) return null;
  return `${sentence.slice(0, at)}${SLOT}${sentence.slice(at + span.length)}`;
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/[’]/g, "'");
}

/**
 * 생성 호출과 분리된 블라인드 문법성 판정.
 *
 * 정답이 어느 쪽인지 알려주지 않고 optionA/optionB의 문법성만 각각 묻는다.
 * 같은 호출 안에서 생성과 검증을 함께 시키면 모델이 자기 답을 추인해버리므로,
 * 이 판정은 반드시 별도 호출이어야 한다.
 *
 * 정답/오답의 좌우 배치는 candidateId 해시로 섞어 위치 편향도 제거한다.
 */
export async function verifyChoiceUniqueness(input: {
  apiKey: string;
  model: string;
  reasoningEffort: string;
  sentences: ExactSentence[];
  items: ResolvedCandidate[];
  /** 묶음이 지문 경계를 넘지 않게 하는 키. 없으면 전부 한 덩어리로 본다. */
  groupKeyOf?: (item: ResolvedCandidate) => string;
  /** 지문들이 공유하는 판정 호출 게이트. 없으면 이 호출만의 상한을 쓴다. */
  limiter?: Limiter;
}): Promise<{
  verdicts: UniquenessVerdict[];
  responseModel: string;
  calls: number;
  rawJson: string[];
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  fallback: boolean;
}> {
  const empty = {
    verdicts: [] as UniquenessVerdict[],
    responseModel: input.model,
    calls: 0,
    rawJson: [] as string[],
    latencyMs: 0,
    inputTokens: null,
    outputTokens: null,
    fallback: false,
  };
  if (input.items.length === 0) return empty;

  const bySentence = new Map(input.sentences.map((s) => [s.sentenceId, s]));

  /**
   * 해소된 위치로 슬롯을 판다. 네모를 줄이면(further and further / further and far
   * → 두 번째 further 하나) sourceSpan은 줄인 낱말인데 occurrenceIndex는 원래 구의
   * 것이라, 낱말+순번으로 찾으면 앞쪽의 같은 낱말에 슬롯을 판다. 위치가 원문과
   * 맞지 않을 때만(테스트·옛 입력) 낱말+순번으로 찾는다.
   */
  const slotFor = (item: ResolvedCandidate, sentence: ExactSentence): string | null => {
    const at = item.passageStart - sentence.passageStart;
    const span = item.sourceSpan;
    if (span && at >= 0 && sentence.text.slice(at, at + span.length) === span) {
      return `${sentence.text.slice(0, at)}${SLOT}${sentence.text.slice(at + span.length)}`;
    }
    return buildSlotSentence(sentence.text, span, item.occurrenceIndex);
  };

  /**
   * 바로 앞 문장. 과거 서술 속 과거완료(there was an athlete who [had won / has won])처럼
   * 시점이 앞 문장에서 정해지는 시제 문항은 한 문장만 보면 둘 다 문법적이라 떨어졌다.
   */
  const previousText = new Map(
    input.sentences.map((s, i) => [s.sentenceId, input.sentences[i - 1]?.text ?? ""])
  );

  type Prepared = {
    candidateId: string;
    context: string;
    slotSentence: string;
    optionA: string;
    optionB: string;
    correctIsA: boolean;
    groupKey: string;
  };

  const prepared: Prepared[] = [];
  const verdicts: UniquenessVerdict[] = [];

  for (const item of input.items) {
    const sentence = bySentence.get(item.sentenceId);
    const wrong = item.distractors[0] ?? "";
    const slotSentence = sentence ? slotFor(item, sentence) : null;
    // 슬롯을 못 파면 판정 자체가 불가능하다. 판정이 없으므로 applyUniqueness에서 떨어진다.
    if (!slotSentence || !wrong || normalize(wrong) === normalize(item.correctAnswer)) {
      continue;
    }
    // candidateId 길이의 홀짝으로 좌우를 섞는다. 재실행해도 같은 배치가 나온다.
    const correctIsA = item.candidateId.length % 2 === 0;
    prepared.push({
      groupKey: input.groupKeyOf ? input.groupKeyOf(item) : "all",
      candidateId: item.candidateId,
      context: previousText.get(item.sentenceId) ?? "",
      slotSentence,
      optionA: correctIsA ? item.correctAnswer : wrong,
      optionB: correctIsA ? wrong : item.correctAnswer,
      correctIsA,
    });
  }

  if (prepared.length === 0) return empty;

  const chunks = chunkByGroup(
    prepared,
    UNIQUENESS_ITEMS_PER_CALL,
    (row) => row.groupKey
  );

  const started = Date.now();
  /**
   * 묶음 하나가 실패해도 나머지 판정은 살린다. 판정이 없는 후보는
   * applyUniqueness에서 게이트를 통과하지 못한 것으로 처리되므로,
   * 실패를 삼켜도 "둘 다 맞는" 문항이 새어 나가지는 않는다.
   */
  const gate = input.limiter;
  const runGated = <T>(task: () => Promise<T>): Promise<T> =>
    gate ? gate(task) : task();
  const calls = (
    await runWithConcurrency(
      chunks,
      input.limiter ? chunks.length : Math.min(UNIQUENESS_CONCURRENCY, chunks.length),
      async (chunk) => {
        try {
          return await runGated(() => callGrammarChoiceV2Json({
            stage: "REVIEWER",
            apiKey: input.apiKey,
            model: input.model,
            reasoningEffort: input.reasoningEffort,
            system: UNIQUENESS_SYSTEM_PROMPT,
            user: JSON.stringify({
              items: chunk.map((row) => ({
                itemId: row.candidateId,
                context: row.context,
                sentence: row.slotSentence,
                optionA: row.optionA,
                optionB: row.optionB,
              })),
            }),
            schemaName: "grammar_choice_v2_uniqueness",
            schema: UNIQUENESS_SCHEMA as unknown as Record<string, unknown>,
            maxCompletionTokens: uniquenessOutputTokenCap(chunk.length),
          }));
        } catch {
          return null;
        }
      }
    )
  ).filter((row): row is NonNullable<typeof row> => row !== null);

  const byId = new Map(prepared.map((row) => [row.candidateId, row]));
  const rawJson: string[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let fallback = false;
  let responseModel = input.model;

  for (const called of calls) {
    rawJson.push(called.rawJson);
    inputTokens += called.inputTokens ?? 0;
    outputTokens += called.outputTokens ?? 0;
    fallback = fallback || called.fallback;
    responseModel = called.responseModel;
    let parsed: {
      results?: Array<{
        itemId?: string;
        aGrammatical?: unknown;
        bGrammatical?: unknown;
      }>;
    };
    try {
      parsed = parseModelJson(called.content);
    } catch {
      continue;
    }
    for (const row of parsed.results ?? []) {
      const id = String(row.itemId ?? "");
      const source = byId.get(id);
      if (!source) continue;
      const aOk = row.aGrammatical === true;
      const bOk = row.bGrammatical === true;
      const correctOk = source.correctIsA ? aOk : bOk;
      const wrongOk = source.correctIsA ? bOk : aOk;

      if (correctOk && !wrongOk) {
        verdicts.push({ candidateId: id, unique: true });
        continue;
      }
      verdicts.push({
        candidateId: id,
        unique: false,
        reason:
          correctOk && wrongOk
            ? "BOTH_GRAMMATICAL"
            : !correctOk && wrongOk
              ? "CORRECT_ANSWER_WRONG"
              : "NEITHER_GRAMMATICAL",
      });
    }
  }

  return {
    verdicts,
    responseModel,
    calls: chunks.length,
    rawJson,
    latencyMs: Date.now() - started,
    inputTokens,
    outputTokens,
    fallback,
  };
}
