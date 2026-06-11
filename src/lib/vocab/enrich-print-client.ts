import type { EnrichPrintKind } from "@/lib/vocab/enrich-print-vocabulary";
import type { VocabPrintEnrichment } from "@/lib/vocab/vocab-print-types";

export async function fetchPrintEnrichment(
  kind: EnrichPrintKind,
  items: { word: string; meaning: string }[]
): Promise<
  | { ok: true; items: ({ word: string } & VocabPrintEnrichment)[] }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch("/api/vocab/enrich-print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, items }),
      credentials: "same-origin",
    });

    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      items?: ({ word: string } & VocabPrintEnrichment)[];
    };

    if (!data.ok || !data.items) {
      return { ok: false, message: data.message ?? "AI 생성에 실패했습니다." };
    }

    return { ok: true, items: data.items };
  } catch {
    return { ok: false, message: "AI 생성에 실패했습니다." };
  }
}

/** 40개씩 나눠 순차 호출 */
export async function fetchPrintEnrichmentBatched(
  kind: EnrichPrintKind,
  items: { word: string; meaning: string }[]
): Promise<
  | { ok: true; byWord: Map<string, VocabPrintEnrichment> }
  | { ok: false; message: string }
> {
  const byWord = new Map<string, VocabPrintEnrichment>();
  const chunkSize = 40;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const result = await fetchPrintEnrichment(kind, chunk);
    if (!result.ok) return result;
    for (const row of result.items) {
      byWord.set(row.word.trim().toLowerCase(), {
        example_sentence: row.example_sentence,
        example_meaning: row.example_meaning,
        companion_words: row.companion_words,
      });
    }
  }

  return { ok: true, byWord };
}
