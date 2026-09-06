import { createHash } from "node:crypto";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

export type TranslationSource = "teacher" | "generated" | "legacy";

export type StoredSentenceTranslation = {
  sentenceId: string;
  order: number;
  english: string;
  koreanTranslation: string;
  sourceHash: string;
  translationSource: TranslationSource;
  updatedAt: string;
};

export function computeSentenceSourceHash(english: string): string {
  const n = formatWorkbookPassage(english).toLowerCase().trim();
  return createHash("sha256").update(n).digest("hex").slice(0, 24);
}

export function readTranslationMeta(
  pack: { sentenceTranslations?: StoredSentenceTranslation[] | null } | null | undefined
): Map<string, StoredSentenceTranslation> {
  const map = new Map<string, StoredSentenceTranslation>();
  for (const row of pack?.sentenceTranslations ?? []) {
    if (row?.sentenceId) map.set(row.sentenceId, row);
  }
  return map;
}

/** Structural readiness for workbook (no AI / no quality judgment). */
export function translationsReadyForWorkbook(input: {
  sentences: Array<{ id: string; english: string; korean: string | null }>;
  meta: Map<string, StoredSentenceTranslation>;
}): { ok: true } | { ok: false; reason: "missing" | "hash_mismatch" } {
  for (const s of input.sentences) {
    const en = String(s.english ?? "").trim();
    if (!en) continue;
    const ko = String(s.korean ?? "").trim();
    if (!ko) return { ok: false, reason: "missing" };
    const hash = computeSentenceSourceHash(en);
    const meta = input.meta.get(s.id);
    if (meta?.sourceHash && meta.sourceHash !== hash) {
      return { ok: false, reason: "hash_mismatch" };
    }
  }
  return { ok: true };
}
