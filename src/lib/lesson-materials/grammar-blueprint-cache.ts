import type { GrammarBlueprint } from "@/lib/lesson-materials/grammar-blueprint-types";
import { GRAMMAR_BLUEPRINT_VERSION } from "@/lib/lesson-materials/grammar-choice-constants";

export type StoredGrammarBlueprintCache = {
  algorithmVersion: string;
  byPassageId: Record<string, GrammarBlueprint>;
};

export function getCachedGrammarBlueprint(
  cache: StoredGrammarBlueprintCache | null | undefined,
  passageId: string,
  sourceHash: string
): GrammarBlueprint | null {
  if (!cache || cache.algorithmVersion !== GRAMMAR_BLUEPRINT_VERSION) {
    return null;
  }
  const row = cache.byPassageId?.[passageId];
  if (!row) return null;
  if (row.sourceHash !== sourceHash) return null;
  if (row.grammarBlueprintVersion !== GRAMMAR_BLUEPRINT_VERSION) return null;
  if (!row.sentences?.length) return null;
  if (row.analyzedSentenceCount !== row.sentenceCount) return null;
  return row;
}

export function upsertGrammarBlueprintCache(
  cache: StoredGrammarBlueprintCache | null | undefined,
  blueprint: GrammarBlueprint
): StoredGrammarBlueprintCache {
  return {
    algorithmVersion: GRAMMAR_BLUEPRINT_VERSION,
    byPassageId: {
      ...(cache?.byPassageId ?? {}),
      [blueprint.passageId]: blueprint,
    },
  };
}
