/**
 * Engine default, V1 rollback, unknown-value diagnostic, and V2 cache schema isolation.
 * No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-engine-switch.ts
 */
import assert from "node:assert/strict";
import {
  GRAMMAR_CHOICE_V2_CACHE_SCHEMA,
  GRAMMAR_CHOICE_V2_ENGINE,
} from "../src/lib/lesson-materials/grammar-choice-v2/types";
import {
  buildV2CacheKey,
  getCachedGrammarChoiceV2,
  getCachedGrammarChoiceV2Analysis,
  upsertGrammarChoiceV2Cache,
} from "../src/lib/lesson-materials/grammar-choice-v2/cache";
import {
  resolveGrammarChoiceEngineVersion,
  stampGrammarChoiceEngineDiagnostics,
} from "../src/lib/lesson-materials/grammar-choice-v2/generate";
import { GRAMMAR_CHOICE_GENERATOR_VERSION } from "../src/lib/lesson-materials/grammar-choice-constants";

const previous = process.env.GRAMMAR_CHOICE_ENGINE_VERSION;

function select(value: string | undefined) {
  if (value == null) delete process.env.GRAMMAR_CHOICE_ENGINE_VERSION;
  else process.env.GRAMMAR_CHOICE_ENGINE_VERSION = value;
  return resolveGrammarChoiceEngineVersion();
}

function restore() {
  if (previous == null) delete process.env.GRAMMAR_CHOICE_ENGINE_VERSION;
  else process.env.GRAMMAR_CHOICE_ENGINE_VERSION = previous;
}

try {
  const unset = select(undefined);
  assert.equal(unset.version, "v2");
  assert.equal(unset.unknownValue, null);

  const explicitV2 = select("v2");
  assert.equal(explicitV2.version, "v2");
  assert.equal(explicitV2.unknownValue, null);

  const explicitV1 = select("v1");
  assert.equal(explicitV1.version, "v1");
  assert.equal(explicitV1.unknownValue, null);

  const unknown = select("v3");
  assert.equal(unknown.version, "v2");
  assert.equal(unknown.unknownValue, "v3");

  const stamped = stampGrammarChoiceEngineDiagnostics(
    [
      {
        diagnostics: {
          generatorVersion: GRAMMAR_CHOICE_V2_ENGINE,
          engineVersion: "v2" as const,
        },
      },
    ],
    unknown
  );
  assert.equal(stamped[0]?.diagnostics?.engineVersion, "v2");
  assert.match(stamped[0]?.diagnostics?.engineSelectionNote ?? "", /unknown GRAMMAR_CHOICE_ENGINE_VERSION=v3/);

  const v1Stamped = stampGrammarChoiceEngineDiagnostics(
    [
      {
        diagnostics: {
          generatorVersion: GRAMMAR_CHOICE_GENERATOR_VERSION,
        },
      },
    ],
    select("v1")
  );
  assert.equal(v1Stamped[0]?.diagnostics?.engineVersion, "v1");
  assert.equal(v1Stamped[0]?.diagnostics?.engineSelectionNote, undefined);

  const key = buildV2CacheKey({
    passageHash: "abc",
    analyzerModel: "gpt-5.6-sol",
    analyzerReasoningEffort: "medium",
    auditorModel: "gpt-5.6-sol",
    auditorReasoningEffort: "medium",
  });
  assert.equal(key.cacheSchemaVersion, GRAMMAR_CHOICE_V2_CACHE_SCHEMA);
  assert.equal(key.cacheSchemaVersion, "2");
  assert.ok(key.promptDigest);
  assert.ok(key.ontologyRuleDigest);
  assert.equal(key.analyzerModel, "gpt-5.6-sol");
  assert.equal(key.reviewerModel, "gpt-5.6-sol");

  const row = {
    key,
    section: { items: [{ choiceId: "1" }] },
    createdAt: "2026-09-09T00:00:00.000Z",
  };
  const current = upsertGrammarChoiceV2Cache(null, "p1", row as never);
  assert.equal(getCachedGrammarChoiceV2(current, "p1", key)?.key.cacheSchemaVersion, "2");

  const previousSchema = {
    ...current,
    cacheSchemaVersion: "1",
  };
  assert.equal(getCachedGrammarChoiceV2(previousSchema as never, "p1", key), null);
  assert.equal(getCachedGrammarChoiceV2Analysis(previousSchema as never, "p1", key), null);

  const missingSchema = {
    engineVersion: GRAMMAR_CHOICE_V2_ENGINE,
    byPassageId: current.byPassageId,
  };
  assert.equal(getCachedGrammarChoiceV2(missingSchema as never, "p1", key), null);

  assert.equal(GRAMMAR_CHOICE_GENERATOR_VERSION, "grammar-choice-generator-v9");
  console.log("engine-switch: ok");
} finally {
  restore();
}
