/**
 * Grammar Choice V2 quality gates. Real passages come from lesson_material_items.
 * Run: npx tsx --env-file=.env.local scripts/test-grammar-choice-v2-quality.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { validateMinimalPair } from "../src/lib/lesson-materials/grammar-choice-v2/minimal-pair";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { measureRuntimePrompt, buildAnalyzerUserPayload } from "../src/lib/lesson-materials/grammar-choice-v2/runtime-prompt";

const IDS = {
  loa: "0cd85cff-26cb-44be-ba52-824855a4170e",
  movement: "ff6fa8a9-b3b6-4c0b-99d7-09b8b06efc8c",
  uncertainty: "3b01c20a-c147-4d30-b062-53d4f2efd9ac",
  darwin: "15887084-262f-4c77-9c90-023c2551151f",
};

assert.equal(
  validateMinimalPair({
    pointCode: "PARALLEL_CLAUSES",
    sourceSpan: "one can bring about",
    distractor: "one bringing about",
    sentence: "one can bring about positive results",
  }),
  "IMPLAUSIBLE_CLAUSE_REWRITE"
);
assert.equal(
  validateMinimalPair({
    pointCode: "PARALLEL_CLAUSES",
    sourceSpan: "yet we don’t allow",
    distractor: "yet we not allowing",
    sentence: "yet we don’t allow ourselves",
  }),
  "IMPLAUSIBLE_CLAUSE_REWRITE"
);
assert.equal(
  validateMinimalPair({
    pointCode: "CONDITIONAL_SECOND",
    sourceSpan: "If we all had the same kind of mind",
    distractor: "If we all would have the same kind of mind",
    sentence: "If we all had the same kind of mind",
  }),
  "NON_MINIMAL_SPAN"
);
assert.equal(localTemplateDistractor("CONDITIONAL_SECOND", "had"), null);
assert.equal(localTemplateDistractor("CONDITIONAL_SECOND", "were"), null);
assert.equal(localTemplateDistractor("RELATIVE_NONRESTRICTIVE", "which"), "that");

async function main() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: projects, error: pErr } = await admin
    .from("lesson_material_projects")
    .select("id,title")
    .in("id", Object.values(IDS));
  if (pErr) throw pErr;
  const { data: items, error: iErr } = await admin
    .from("lesson_material_items")
    .select("id,project_id,order_index,english_text")
    .in("project_id", Object.values(IDS))
    .order("order_index", { ascending: true });
  if (iErr) throw iErr;

  const summaries = Object.entries(IDS).map(([key, sourceId]) => {
    const sentences = (items ?? []).filter((r) => r.project_id === sourceId);
    const joined = sentences.map((s) => String(s.english_text ?? "")).join("\n");
    return {
      key,
      sourceId,
      title: projects?.find((p) => p.id === sourceId)?.title ?? "",
      sentenceCount: sentences.length,
      characterLength: joined.length,
      sourceHash: createHash("sha256").update(joined).digest("hex"),
      restoredHash: createHash("sha256").update(joined).digest("hex"),
      text: joined,
    };
  });

  const uncertainty = summaries.find((s) => s.key === "uncertainty")!;
  const darwin = summaries.find((s) => s.key === "darwin")!;
  assert.ok(uncertainty.text.includes("between planning and thinking"));
  assert.ok(uncertainty.text.includes("gathering the courage to face"));
  assert.ok(!uncertainty.text.includes("between fear and curiosity"));
  assert.ok(!uncertainty.text.includes("about facing uncertainty"));
  assert.ok(darwin.text.includes("If we all had the same kind of mind"));
  assert.ok(darwin.text.includes("if there were only one human nature"));
  for (const row of summaries) {
    assert.equal(row.sourceHash, row.restoredHash);
    assert.ok(row.sentenceCount > 0);
  }

  const prompt = measureRuntimePrompt(
    buildAnalyzerUserPayload({
      passageId: IDS.loa,
      sentences: [{ sentenceId: "s1", text: summaries[0]!.text.slice(0, 200) }],
    })
  );
  console.log(JSON.stringify({ summaries: summaries.map(({ text, ...rest }) => rest), promptChars: prompt }, null, 2));
  assert.ok(prompt < 12000, `prompt too long ${prompt}`);
  console.log("grammar-choice-v2 quality gates: PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
