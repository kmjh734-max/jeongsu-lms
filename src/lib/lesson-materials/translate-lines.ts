import {
  assessWorkbookTranslation,
  validateTranslationStructure,
} from "@/lib/lesson-materials/refine-workbook-translation";
import { computeSentenceSourceHash } from "@/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "@/lib/lesson-materials/translation-meta";

const TRANSLATION_SYSTEM = `당신은 대한민국 고등학교 영어 수업용 교안을 제작하는
전문 영어 강사이자 번역가이다.

입력된 영어 문장을 대한민국 고등학생이 이해하기 쉬운
자연스러운 한국어로 번역하되 원문의 모든 의미를 정확하게 유지한다.

[필수 규칙]

1. 영어 한 문장의 모든 절을 빠짐없이 번역한다.
2. 문장이 길어도 뒷부분을 생략하거나 요약하지 않는다.
3. and, but, yet, or로 연결된 병렬구조를 모두 반영한다.
4. 관계대명사절, 조건절, 부정어, 비교 표현을 누락하지 않는다.
5. 주어·목적어·원인·결과·비교 방향을 바꾸지 않는다.
6. 문맥상 의미를 고려하고 사전의 첫 번째 뜻을 기계적으로 적용하지 않는다.
7. 원문에 없는 설명을 임의로 추가하지 않는다.
8. 번역문만 읽어도 자연스러운 한국어가 되게 한다.
9. 각 sentenceId를 정확히 유지한다.
10. 영어 원문은 절대 수정하지 않는다.

[문맥 예시]
- magnetic → ‘끌어당기는 힘이 있는’ (매력적 금지)
- available for a career → ‘…를 받아들일 준비가 된’
- our design → ‘우리가 본래 창조된 모습’
- Movement is life to us. → ‘우리에게 움직임은 곧 생명이다’

확인 과정은 출력하지 말고 최종 해석만 반환한다.`;

export type TranslationInputSentence = {
  sentenceId: string;
  order: number;
  english: string;
};

export type TranslationOutputItem = {
  sentenceId: string;
  koreanTranslation: string;
};

async function callStructuredTranslate(
  apiKey: string,
  passageId: string,
  sentences: TranslationInputSentence[],
  signal: AbortSignal,
  extraNote?: string
): Promise<TranslationOutputItem[]> {
  const payload = {
    passageId,
    sentences: sentences.map((s) => ({
      sentenceId: s.sentenceId,
      order: s.order,
      english: s.english,
    })),
  };

  const body: Record<string, unknown> = {
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 8_192,
    messages: [
      { role: "system", content: TRANSLATION_SYSTEM },
      {
        role: "user",
        content: `${extraNote ? extraNote + "\n\n" : ""}다음 JSON의 각 문장을 번역하라. sentenceId를 유지하고 translations 배열로만 반환하라.\n\n${JSON.stringify(payload)}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "passage_translations",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["passageId", "translations"],
          properties: {
            passageId: { type: "string" },
            translations: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["sentenceId", "koreanTranslation"],
                properties: {
                  sentenceId: { type: "string" },
                  koreanTranslation: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  };

  let res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify(body),
  });
  let bodyText = await res.text();

  // Fallback: json_object without schema
  if (!res.ok && (bodyText.includes("json_schema") || res.status === 400)) {
    body.response_format = { type: "json_object" };
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify(body),
    });
    bodyText = await res.text();
  }

  if (!res.ok) {
    throw new Error(`한줄해석 생성 실패 (HTTP ${res.status})`);
  }

  const envelope = JSON.parse(bodyText) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = envelope.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as {
    translations?: Array<{ sentenceId?: string; koreanTranslation?: string }>;
  };
  const translations = (parsed.translations ?? []).map((t) => ({
    sentenceId: String(t.sentenceId ?? "").trim(),
    koreanTranslation: String(t.koreanTranslation ?? "").trim(),
  }));
  return translations;
}

/**
 * One OpenAI request for a whole passage (sentenceId-structured).
 * Failed sentences retried once; teacher rows must be filtered by caller.
 */
export async function translatePassageSentences(input: {
  passageId: string;
  sentences: TranslationInputSentence[];
}): Promise<TranslationOutputItem[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const sentences = input.sentences.filter((s) => s.english.trim());
  if (sentences.length === 0) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    let translations = await callStructuredTranslate(
      apiKey,
      input.passageId,
      sentences,
      controller.signal
    );

    const structure = validateTranslationStructure({
      sourceSentenceIds: sentences.map((s) => s.sentenceId),
      generated: translations,
    });
    if (!structure.ok) {
      translations = await callStructuredTranslate(
        apiKey,
        input.passageId,
        sentences,
        controller.signal,
        "이전 응답의 sentenceId/개수가 맞지 않았습니다. 모든 sentenceId에 대해 정확히 번역하라."
      );
      const again = validateTranslationStructure({
        sourceSentenceIds: sentences.map((s) => s.sentenceId),
        generated: translations,
      });
      if (!again.ok) throw new Error(again.message);
    }

    const byId = new Map(translations.map((t) => [t.sentenceId, t] as const));
    const failed = sentences.filter((s) => {
      const ko = byId.get(s.sentenceId)?.koreanTranslation ?? "";
      return !assessWorkbookTranslation(s.english, ko).ok;
    });

    if (failed.length > 0) {
      try {
        const retried = await callStructuredTranslate(
          apiKey,
          input.passageId,
          failed,
          controller.signal,
          "이전 번역이 절을 누락했거나 문맥 오역이 있었습니다. 모든 절·병렬구조를 빠짐없이 다시 번역하라."
        );
        for (const t of retried) {
          const src = failed.find((f) => f.sentenceId === t.sentenceId);
          if (!src || !t.koreanTranslation) continue;
          const prev = byId.get(t.sentenceId)?.koreanTranslation ?? "";
          if (
            assessWorkbookTranslation(src.english, t.koreanTranslation).ok ||
            t.koreanTranslation.length > prev.length
          ) {
            byId.set(t.sentenceId, t);
          }
        }
      } catch {
        /* keep first pass */
      }
    }

    return sentences.map((s) => ({
      sentenceId: s.sentenceId,
      koreanTranslation: byId.get(s.sentenceId)?.koreanTranslation ?? "",
    }));
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("한줄해석 생성 시간이 초과되었습니다.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Legacy helper: order-based batch (workspace single-line UX). */
export async function translateEnglishLinesToKorean(
  lines: string[]
): Promise<string[]> {
  const targets = lines.map((l) => l.trim()).filter(Boolean);
  if (targets.length === 0) return [];
  const out = await translatePassageSentences({
    passageId: "lines",
    sentences: targets.map((english, i) => ({
      sentenceId: `s${i + 1}`,
      order: i + 1,
      english,
    })),
  });
  return out.map((t) => t.koreanTranslation);
}

export function needsTranslationRefresh(
  english: string,
  korean: string | null | undefined
): boolean {
  const en = String(english ?? "").trim();
  const ko = String(korean ?? "").trim();
  if (!en) return false;
  if (!ko) return true;
  return !assessWorkbookTranslation(en, ko).ok;
}

export function buildStoredTranslation(input: {
  sentenceId: string;
  order: number;
  english: string;
  koreanTranslation: string;
  translationSource: "teacher" | "generated" | "legacy";
}): StoredSentenceTranslation {
  return {
    sentenceId: input.sentenceId,
    order: input.order,
    english: input.english,
    koreanTranslation: input.koreanTranslation,
    sourceHash: computeSentenceSourceHash(input.english),
    translationSource: input.translationSource,
    updatedAt: new Date().toISOString(),
  };
}
