/**
 * One live V2 run on the four stored passages. Does not invent fixture text.
 * Run: npx tsx --env-file=.env.local scripts/test-grammar-choice-v2-real.ts
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateWorkbookGrammarChoiceV2 } from "../src/lib/lesson-materials/grammar-choice-v2/generate";

const IDS = [
  "0cd85cff-26cb-44be-ba52-824855a4170e",
  "ff6fa8a9-b3b6-4c0b-99d7-09b8b06efc8c",
  "3b01c20a-c147-4d30-b062-53d4f2efd9ac",
  "15887084-262f-4c77-9c90-023c2551151f",
];

async function main() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: projects } = await admin
    .from("lesson_material_projects")
    .select("id,title")
    .in("id", IDS);
  const { data: items } = await admin
    .from("lesson_material_items")
    .select("id,project_id,order_index,english_text")
    .in("project_id", IDS)
    .order("order_index", { ascending: true });

  const passages = IDS.map((id) => {
    const sentences = (items ?? [])
      .filter((r) => r.project_id === id)
      .map((s) => ({ id: String(s.id), english: String(s.english_text ?? "") }));
    const joined = sentences.map((s) => s.english).join("\n");
    return {
      projectId: id,
      title: projects?.find((p) => p.id === id)?.title ?? id,
      source: null,
      sentences,
      sourceHash: createHash("sha256").update(joined).digest("hex"),
      characterLength: joined.length,
      sentenceCount: sentences.length,
    };
  });

  const started = Date.now();
  const result = await generateWorkbookGrammarChoiceV2({
    forceRegenerate: true,
    passages,
  });
  writeFileSync(
    "scripts/_gc-v2-real-run.json",
    JSON.stringify(
      {
        ms: Date.now() - started,
        openAI: result.timing.openAiRequestCount,
        promptChars: result.promptChars,
        skipped: result.skipped,
        sources: passages.map(({ sentences, ...rest }) => rest),
        sections: result.sections.map((s) => ({
          title: s.title,
          projectId: s.projectId,
          restored: s.diagnostics?.passageRestored,
          items: s.items.map((it) => ({
            n: it.number,
            sentenceId: it.sentenceId,
            pointCode: it.grammarCategoryId,
            sourceSpan: it.correctText,
            distractor: it.incorrectText,
            left: it.leftText,
            right: it.rightText,
          })),
        })),
        reports: result.reports,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(
    JSON.stringify({
      ms: Date.now() - started,
      openAI: result.timing.openAiRequestCount,
      skipped: result.skipped,
      counts: result.sections.map((s) => [s.title, s.items.length]),
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
