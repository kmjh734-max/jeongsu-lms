import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { callGrammarChoiceV2Json, parseModelJson } from "@/lib/lesson-materials/grammar-choice-v2/openai-call";
import { UNIQUENESS_SYSTEM_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import type {
  ExactSentence,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

export const UNIQUENESS_OUTPUT_TOKEN_CAP = 3_000;

/** 한 호출에 넣는 판정 항목 수. 판정 자체가 짧아 묶어도 품질이 잘 떨어지지 않는다. */
export const UNIQUENESS_ITEMS_PER_CALL = 12;

export const UNIQUENESS_CONCURRENCY = 3;

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
  let from = 0;
  let at = -1;
  for (let i = 0; i <= Math.max(0, occurrenceIndex); i++) {
    at = sentence.indexOf(span, from);
    if (at < 0) return null;
    from = at + span.length;
  }
  if (at < 0) return null;
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

  const bySentence = new Map(input.sentences.map((s) => [s.sentenceId, s.text]));

  type Prepared = {
    candidateId: string;
    slotSentence: string;
    optionA: string;
    optionB: string;
    correctIsA: boolean;
  };

  const prepared: Prepared[] = [];
  const verdicts: UniquenessVerdict[] = [];

  for (const item of input.items) {
    const sentence = bySentence.get(item.sentenceId) ?? "";
    const wrong = item.distractors[0] ?? "";
    const slotSentence = sentence
      ? buildSlotSentence(sentence, item.sourceSpan, item.occurrenceIndex)
      : null;
    // 슬롯을 못 파면 판정 자체가 불가능하다. 통과시키지 않고 그대로 둔다.
    if (!slotSentence || !wrong || normalize(wrong) === normalize(item.correctAnswer)) {
      continue;
    }
    // candidateId 길이의 홀짝으로 좌우를 섞는다. 재실행해도 같은 배치가 나온다.
    const correctIsA = item.candidateId.length % 2 === 0;
    prepared.push({
      candidateId: item.candidateId,
      slotSentence,
      optionA: correctIsA ? item.correctAnswer : wrong,
      optionB: correctIsA ? wrong : item.correctAnswer,
      correctIsA,
    });
  }

  if (prepared.length === 0) return empty;

  const chunks: Prepared[][] = [];
  for (let i = 0; i < prepared.length; i += UNIQUENESS_ITEMS_PER_CALL) {
    chunks.push(prepared.slice(i, i + UNIQUENESS_ITEMS_PER_CALL));
  }

  const started = Date.now();
  const calls = await runWithConcurrency(
    chunks,
    Math.min(UNIQUENESS_CONCURRENCY, chunks.length),
    async (chunk) =>
      callGrammarChoiceV2Json({
        stage: "REVIEWER",
        apiKey: input.apiKey,
        model: input.model,
        reasoningEffort: input.reasoningEffort,
        system: UNIQUENESS_SYSTEM_PROMPT,
        user: JSON.stringify({
          items: chunk.map((row) => ({
            itemId: row.candidateId,
            sentence: row.slotSentence,
            optionA: row.optionA,
            optionB: row.optionB,
          })),
        }),
        schemaName: "grammar_choice_v2_uniqueness",
        schema: UNIQUENESS_SCHEMA as unknown as Record<string, unknown>,
        maxCompletionTokens: UNIQUENESS_OUTPUT_TOKEN_CAP,
      })
  );

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
    const parsed = parseModelJson<{
      results?: Array<{
        itemId?: string;
        aGrammatical?: unknown;
        bGrammatical?: unknown;
      }>;
    }>(called.content);
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
