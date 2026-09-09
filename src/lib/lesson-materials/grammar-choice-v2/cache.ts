import { createHash } from "node:crypto";
import {
  GRAMMAR_CHOICE_V2_AUDITOR,
  GRAMMAR_CHOICE_V2_CACHE_SCHEMA,
  GRAMMAR_CHOICE_V2_ENGINE,
  GRAMMAR_CHOICE_V2_ONTOLOGY,
  GRAMMAR_CHOICE_V2_PROMPT,
  GRAMMAR_CHOICE_V2_VALIDATOR,
} from "@/lib/lesson-materials/grammar-choice-v2/types";
import { GRAMMAR_ONTOLOGY } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { promptDigest } from "@/lib/lesson-materials/grammar-choice-v2/snapshot-store";
import type { WorkbookGrammarChoiceSection } from "@/lib/lesson-materials/workbook-types";

export type GrammarChoiceV2CacheKey = {
  passageHash: string;
  cacheSchemaVersion: string;
  engineVersion: string;
  ontologyVersion: string;
  analyzerModel: string;
  analyzerReasoningEffort: string;
  runtimePromptVersion: string;
  localValidatorVersion: string;
  auditorVersion: string;
  auditorReasoningEffort: string;
  reviewerModel: string;
  promptDigest: string;
  ontologyRuleDigest: string;
};

export type StoredGrammarChoiceV2Row = {
  key: GrammarChoiceV2CacheKey;
  section: WorkbookGrammarChoiceSection;
  createdAt: string;
};

export type StoredGrammarChoiceV2Analysis = {
  key: GrammarChoiceV2CacheKey;
  responseModel: string;
  detected: import("@/lib/lesson-materials/grammar-choice-v2/types").DetectedGrammarPoint[];
  candidates: import("@/lib/lesson-materials/grammar-choice-v2/types").GrammarCandidate[];
  audits: import("@/lib/lesson-materials/grammar-choice-v2/types").AuditResult[];
};

export type StoredGrammarChoiceV2Cache = {
  engineVersion: typeof GRAMMAR_CHOICE_V2_ENGINE;
  cacheSchemaVersion: typeof GRAMMAR_CHOICE_V2_CACHE_SCHEMA;
  byPassageId: Record<string, StoredGrammarChoiceV2Row>;
  analysisByPassageId?: Record<string, StoredGrammarChoiceV2Analysis>;
};

export function buildV2CacheKey(input: {
  passageHash: string;
  analyzerModel: string;
  analyzerReasoningEffort: string;
  auditorModel: string;
  auditorReasoningEffort: string;
}): GrammarChoiceV2CacheKey {
  return {
    passageHash: input.passageHash,
    cacheSchemaVersion: GRAMMAR_CHOICE_V2_CACHE_SCHEMA,
    engineVersion: GRAMMAR_CHOICE_V2_ENGINE,
    ontologyVersion: GRAMMAR_CHOICE_V2_ONTOLOGY,
    analyzerModel: input.analyzerModel,
    analyzerReasoningEffort: input.analyzerReasoningEffort,
    runtimePromptVersion: GRAMMAR_CHOICE_V2_PROMPT,
    localValidatorVersion: GRAMMAR_CHOICE_V2_VALIDATOR,
    auditorVersion: GRAMMAR_CHOICE_V2_AUDITOR,
    auditorReasoningEffort: input.auditorReasoningEffort,
    reviewerModel: input.auditorModel,
    promptDigest: promptDigest(),
    ontologyRuleDigest: createHash("sha256")
      .update(
        GRAMMAR_ONTOLOGY.map((row) =>
          [row.code, row.priority, row.chapter, row.referenceChapter ?? ""].join(":")
        ).join("|")
      )
      .digest("hex"),
  };
}

export function cacheKeyDigest(key: GrammarChoiceV2CacheKey): string {
  return createHash("sha256").update(JSON.stringify(key)).digest("hex");
}

function sameKey(a: GrammarChoiceV2CacheKey, b: GrammarChoiceV2CacheKey): boolean {
  return cacheKeyDigest(a) === cacheKeyDigest(b);
}

function currentV2Cache(
  cache: StoredGrammarChoiceV2Cache | null | undefined
): cache is StoredGrammarChoiceV2Cache {
  return (
    !!cache &&
    cache.engineVersion === GRAMMAR_CHOICE_V2_ENGINE &&
    cache.cacheSchemaVersion === GRAMMAR_CHOICE_V2_CACHE_SCHEMA
  );
}

export function getCachedGrammarChoiceV2(
  cache: StoredGrammarChoiceV2Cache | null | undefined,
  passageId: string,
  key: GrammarChoiceV2CacheKey
): StoredGrammarChoiceV2Row | null {
  if (!currentV2Cache(cache)) return null;
  const row = cache.byPassageId?.[passageId];
  if (!row) return null;
  if (!sameKey(row.key, key)) return null;
  if (!row.section?.items?.length) return null;
  return row;
}

export function getCachedGrammarChoiceV2Analysis(
  cache: StoredGrammarChoiceV2Cache | null | undefined,
  passageId: string,
  key: GrammarChoiceV2CacheKey
): StoredGrammarChoiceV2Analysis | null {
  if (!currentV2Cache(cache)) return null;
  const row = cache.analysisByPassageId?.[passageId];
  if (!row) return null;
  if (!sameKey(row.key, key)) return null;
  return row;
}

export function upsertGrammarChoiceV2Analysis(
  cache: StoredGrammarChoiceV2Cache | null | undefined,
  passageId: string,
  row: StoredGrammarChoiceV2Analysis
): StoredGrammarChoiceV2Cache {
  return {
    engineVersion: GRAMMAR_CHOICE_V2_ENGINE,
    cacheSchemaVersion: GRAMMAR_CHOICE_V2_CACHE_SCHEMA,
    byPassageId: { ...(cache?.byPassageId ?? {}) },
    analysisByPassageId: {
      ...(cache?.analysisByPassageId ?? {}),
      [passageId]: row,
    },
  };
}

export function upsertGrammarChoiceV2Cache(
  cache: StoredGrammarChoiceV2Cache | null | undefined,
  passageId: string,
  row: StoredGrammarChoiceV2Row
): StoredGrammarChoiceV2Cache {
  return {
    engineVersion: GRAMMAR_CHOICE_V2_ENGINE,
    cacheSchemaVersion: GRAMMAR_CHOICE_V2_CACHE_SCHEMA,
    byPassageId: {
      ...(cache?.byPassageId ?? {}),
      [passageId]: row,
    },
    analysisByPassageId: cache?.analysisByPassageId,
  };
}
