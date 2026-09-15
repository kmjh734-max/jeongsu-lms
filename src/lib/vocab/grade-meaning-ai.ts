import { cleanMeaningFeedback, gradeMeaningAnswer } from "@/lib/vocab/grade-stage3";

export { cleanMeaningFeedback };

export interface MeaningGradeInput {
  word: string;
  correctMeaning: string;
  studentAnswer: string;
}

export interface MeaningGradeResult {
  isCorrect: boolean;
  feedback?: string;
}

/** 자동 채점을 못 했을 때 학생에게 보이는 안내 (내부 오류 문구는 절대 노출하지 않는다) */
export const MEANING_FALLBACK_FEEDBACK =
  "채점을 잠시 할 수 없었어요. 정답과 비교해 확인해 주세요.";

const SYSTEM_PROMPT = `너는 영어 단어 뜻 시험의 채점자다.

채점 기준:
- 학생 답이 정답 뜻과 의미상 같거나 거의 같으면 정답
- 유의어, 비슷한 표현, 자연스러운 의역은 정답
- 조사, 어미, 표현 차이는 정답
- 명백한 한글 오타이지만 의미를 알 수 있으면 정답
- 뜻이 다르면 오답
- 너무 넓거나 모호해서 정답으로 보기 어려우면 오답
- 피드백은 학생에게 보여 줄 짧고 친절한 한국어 한 문장. 채점 방식이나 시스템 이야기는 쓰지 않는다.
- 결과는 반드시 JSON으로만 반환`;

const MEANING_CHUNK_SIZE = 12;
const MEANING_AI_TIMEOUT_MS = 18_000;
const MEANING_CHUNK_CONCURRENCY = 2;

/** 서버 로그용 (학생 화면에는 쓰지 않음) */
function upstreamErrorMessage(status: number, bodyText: string): string {
  try {
    const body = JSON.parse(bodyText) as {
      error?: { message?: string; code?: string };
    };
    const msg = body.error?.message ?? "";
    if (body.error?.code === "insufficient_quota" || msg.includes("quota")) {
      return "quota exhausted";
    }
    if (msg) return msg;
  } catch {
    /* ignore */
  }
  return `HTTP ${status}`;
}

function buildBatchPrompt(items: MeaningGradeInput[]): string {
  const listText = items
    .map(
      (it, i) =>
        `${i + 1}. 영어 단어: ${it.word}\n   정답 뜻: ${it.correctMeaning}\n   학생 답: ${it.studentAnswer?.trim() || "(비어 있음)"}`
    )
    .join("\n\n");

  return `아래 ${items.length}개 항목을 채점하세요.

반환 형식 (JSON만):
{
  "results": [
    { "index": 1, "isCorrect": true, "feedback": "짧은 한국어 피드백" }
  ]
}

항목:
${listText}`;
}

function parseBatchResults(
  items: MeaningGradeInput[],
  content: string
): MeaningGradeResult[] | null {
  try {
    const graded = JSON.parse(content) as {
      results?: {
        index: number;
        isCorrect: boolean;
        feedback?: string;
        reason?: string;
      }[];
    };

    const byIndex = new Map(
      (graded.results ?? []).map((r) => [r.index, r])
    );

    return items.map((_, i) => {
      const row = byIndex.get(i + 1);
      const feedback = cleanMeaningFeedback(row?.feedback ?? row?.reason);
      return {
        isCorrect: Boolean(row?.isCorrect),
        feedback: feedback ?? undefined,
      };
    });
  } catch {
    return null;
  }
}

function fallbackResults(items: MeaningGradeInput[]): MeaningGradeResult[] {
  return items.map((input) => ({
    isCorrect: gradeMeaningFallback(input.correctMeaning, input.studentAnswer),
    feedback: MEANING_FALLBACK_FEEDBACK,
  }));
}

async function gradeMeaningChunkWithAi(
  items: MeaningGradeInput[]
): Promise<
  { ok: true; results: MeaningGradeResult[] } | { ok: false; message: string }
> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "grader key missing" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MEANING_AI_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildBatchPrompt(items) },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      return { ok: false, message: upstreamErrorMessage(res.status, bodyText) };
    }

    const parsed = JSON.parse(bodyText) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = parsed.choices?.[0]?.message?.content ?? "{}";
    const results = parseBatchResults(items, content);
    if (!results) {
      return { ok: false, message: "unparseable grading result" };
    }
    return { ok: true, results };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, message: "grading timeout" };
    }
    return { ok: false, message: "grading request failed" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 뜻 쓰기 일괄 채점 (나눠서 · 동시 요청 제한).
 * 실패한 묶음은 규칙 채점으로 대신하고, 학생에게는 친절한 안내만 남긴다.
 */
export async function gradeMeaningWithAi(
  items: MeaningGradeInput[]
): Promise<
  { ok: true; results: MeaningGradeResult[] } | { ok: false; message: string }
> {
  if (items.length === 0) {
    return { ok: true, results: [] };
  }

  const chunks: MeaningGradeInput[][] = [];
  for (let i = 0; i < items.length; i += MEANING_CHUNK_SIZE) {
    chunks.push(items.slice(i, i + MEANING_CHUNK_SIZE));
  }

  const allResults: MeaningGradeResult[] = [];

  for (let i = 0; i < chunks.length; i += MEANING_CHUNK_CONCURRENCY) {
    const batch = chunks.slice(i, i + MEANING_CHUNK_CONCURRENCY);
    const batchOutcomes = await Promise.all(
      batch.map(async (chunk) => {
        const result = await gradeMeaningChunkWithAi(chunk);
        if (result.ok) return result.results;
        console.error("[vocab] meaning grading fell back to rules:", result.message);
        return fallbackResults(chunk);
      })
    );
    for (const chunkResults of batchOutcomes) {
      allResults.push(...chunkResults);
    }
  }

  return { ok: true, results: allResults };
}

/** 규칙 채점 (부분 문자열 불인정) — grade-stage3의 뜻 채점과 같다 */
export function gradeMeaningFallback(
  correct: string,
  student: string
): boolean {
  return gradeMeaningAnswer(correct, student);
}
