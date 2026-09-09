import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AUDITOR_SYSTEM_PROMPT,
  ANALYZER_SYSTEM_PROMPT,
} from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import {
  GRAMMAR_CHOICE_V2_AUDITOR,
  GRAMMAR_CHOICE_V2_ENGINE,
  GRAMMAR_CHOICE_V2_ONTOLOGY,
  GRAMMAR_CHOICE_V2_PROMPT,
  GRAMMAR_CHOICE_V2_VALIDATOR,
} from "@/lib/lesson-materials/grammar-choice-v2/types";
import type { WorkbookGrammarChoiceSection } from "@/lib/lesson-materials/workbook-types";

export const SNAPSHOT_SCHEMA_VERSION = 1;

const SENSITIVE_KEY = /^(api[_-]?key|authorization|secret|password|service[_-]?role|supabase|bearer|env)$/i;

export function isSnapshotCaptureEnabled(): boolean {
  return process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT?.trim() === "1";
}

export function snapshotRunDir(): string {
  const override = process.env.GRAMMAR_CHOICE_V2_SNAPSHOT_DIR?.trim();
  if (override) return override;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join("scripts", "snapshots", "grammar-choice-v2", stamp);
}

export function promptDigest(): string {
  return createHash("sha256")
    .update(ANALYZER_SYSTEM_PROMPT)
    .update("\n---\n")
    .update(AUDITOR_SYSTEM_PROMPT)
    .digest("hex");
}

export function ontologyDigest(): string {
  return createHash("sha256")
    .update(`${GRAMMAR_CHOICE_V2_ONTOLOGY}|${GRAMMAR_CHOICE_V2_VALIDATOR}|${GRAMMAR_CHOICE_V2_AUDITOR}`)
    .digest("hex");
}

export function atomicWriteJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${randomBytes(6).toString("hex")}.tmp`;
  writeFileSync(tmp, JSON.stringify(redact(data), null, 2), "utf8");
  try {
    unlinkSync(path);
  } catch {
    // first write
  }
  renameSync(tmp, path);
}

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (typeof child === "string" && /sk-[A-Za-z0-9]/.test(child)) continue;
    out[key] = redact(child);
  }
  return out;
}

export function writeCheckpoint(dir: string, relativePath: string, data: unknown): string {
  const path = join(dir, relativePath);
  atomicWriteJson(path, data);
  return path;
}

export function captureMetadata(input: {
  sourceId?: string;
  generatorModel: string;
  generatorReasoningEffort: string;
  reviewerModel: string;
  reviewerReasoningEffort: string;
  forceRegenerate: boolean;
  cacheHit: boolean;
  fallback: boolean;
}) {
  return {
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    engineVersion: GRAMMAR_CHOICE_V2_ENGINE,
    ontologyVersion: GRAMMAR_CHOICE_V2_ONTOLOGY,
    ontologyDigest: ontologyDigest(),
    promptVersion: GRAMMAR_CHOICE_V2_PROMPT,
    promptDigest: promptDigest(),
    validatorVersion: GRAMMAR_CHOICE_V2_VALIDATOR,
    auditorVersion: GRAMMAR_CHOICE_V2_AUDITOR,
    generatorModel: input.generatorModel,
    generatorReasoningEffort: input.generatorReasoningEffort,
    reviewerModel: input.reviewerModel,
    reviewerReasoningEffort: input.reviewerReasoningEffort,
    capturedAt: new Date().toISOString(),
    sourceId: input.sourceId ?? null,
    forceRegenerate: input.forceRegenerate,
    cacheHit: input.cacheHit,
    fallback: input.fallback,
  };
}

export function studentReplayDigest(section: {
  sourcePassage: string;
  segments: WorkbookGrammarChoiceSection["segments"];
  items: WorkbookGrammarChoiceSection["items"];
  diagnostics?: WorkbookGrammarChoiceSection["diagnostics"];
}, extras?: {
  exclusions?: unknown;
  occurrences?: unknown;
}) {
  return {
    passage: section.segments
      .map((seg) =>
        seg.type === "text" ? seg.text ?? "" : `(${seg.number}) [${seg.leftText} / ${seg.rightText}]`
      )
      .join(""),
    questions: section.items.map((item) => ({
      number: item.number,
      correct: item.correctText,
      wrong: item.incorrectText,
      left: item.leftText,
      right: item.rightText,
      correctSide: item.correctSide,
      explanationKo: item.explanationKo,
      incorrectReasonKo: item.incorrectReasonKo,
      code: item.grammarCategoryId,
      subtype: item.internalProvenance?.subtype ?? null,
      priority: item.internalProvenance?.priority ?? null,
      assessmentAxis: item.internalProvenance?.assessmentAxis ?? null,
      occurrenceId: item.internalProvenance?.occurrenceId ?? null,
      sourceSpan: item.internalProvenance?.sourceSpan ?? item.originalText,
      candidateId: item.internalProvenance?.candidateId ?? item.choiceId,
    })),
    exclusions: extras?.exclusions ?? null,
    occurrences: extras?.occurrences ?? null,
    coverage: {
      detectedMandatoryOccurrences: section.diagnostics?.detectedMandatoryOccurrences ?? null,
      analysisOnlyMandatoryOccurrences: section.diagnostics?.analysisOnlyMandatoryOccurrences ?? null,
      eligibleMandatoryOccurrences: section.diagnostics?.eligibleMandatoryOccurrences ?? null,
      validExcludedMandatoryOccurrences: section.diagnostics?.validExcludedMandatoryOccurrences ?? null,
      renderedMandatoryOccurrences: section.diagnostics?.renderedMandatoryOccurrences ?? null,
      missingEligibleMandatoryOccurrences: section.diagnostics?.missingEligibleMandatoryOccurrences ?? null,
      totalEligibleQuestions: section.diagnostics?.totalEligibleQuestions ?? null,
      totalRenderedQuestions: section.diagnostics?.totalRenderedQuestions ?? null,
      totalExcludedOccurrences: section.diagnostics?.totalExcludedOccurrences ?? null,
      sectionStatus: section.diagnostics?.sectionStatus ?? null,
    },
  };
}
