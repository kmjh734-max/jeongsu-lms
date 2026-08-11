/**
 * Rebuild broken high1 Q10 table_data (value was "[object Object]").
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-high1-broken-tables.ts
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env: Record<string, string> = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  Object.assign(process.env, env);
}
loadEnv();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type Broken = {
  title: string;
  n: number;
  id: string;
  table_data: {
    title: string;
    mismatch_no: number;
    mismatch_reason: string;
    rows: { no: number; label: string; value: string }[];
  };
  script: string;
  explanation: string;
  correct: number;
};

function stringifyCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(stringifyCell).filter(Boolean).join(" / ");
  if (typeof v === "object") {
    return Object.values(v as Record<string, unknown>)
      .map(stringifyCell)
      .filter(Boolean)
      .join(" / ");
  }
  return String(v).trim();
}

async function chatJson(userPayload: unknown) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You rebuild Korean high-school English listening exam TYPE 10 tables.
Return JSON only:
{
  "title": string,
  "rows": [
    {"no":1,"label":"A or ① Name","value":"col1 / col2 / col3 / col4"},
    ... exactly 5 rows
  ],
  "mismatch_no": number 1-5,
  "mismatch_reason": string in Korean
}
Rules:
- value must be a single plain string with " / " separators (never an object).
- Exactly one row must uniquely satisfy ALL sequential filters in the dialogue; that row's no === correct_answer / mismatch_no.
- Other rows must fail exactly one earlier filter so elimination is unique.
- Keep existing title/labels style when sensible.
- Match English numbers/facts from the dialogue.`,
        },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as {
    title?: string;
    rows?: { no: number; label: string; value: string }[];
    mismatch_no?: number;
    mismatch_reason?: string;
  };
}

async function rebuildTable(b: Broken) {
  const parsed = await chatJson({
    set_title: b.title,
    existing_title: b.table_data.title,
    existing_labels: b.table_data.rows.map((r) => r.label),
    correct_answer: b.correct,
    mismatch_reason_hint: b.table_data.mismatch_reason,
    explanation: b.explanation,
    script: b.script,
  });

  const rows = (parsed.rows ?? []).slice(0, 5).map((r, i) => ({
    no: i + 1,
    label: String(r.label ?? b.table_data.rows[i]?.label ?? `${i + 1}`).trim(),
    value: stringifyCell(r.value),
  }));

  if (
    rows.length !== 5 ||
    rows.some((r) => !r.value || r.value === "[object Object]")
  ) {
    throw new Error(`${b.title}: invalid rebuilt rows ${JSON.stringify(rows)}`);
  }

  return {
    title: String(parsed.title ?? b.table_data.title).trim(),
    rows,
    mismatch_no: Number(parsed.mismatch_no ?? b.correct),
    mismatch_reason: String(
      parsed.mismatch_reason ?? b.table_data.mismatch_reason
    ).trim(),
  };
}

async function main() {
  const broken = JSON.parse(
    readFileSync("tmp/broken-tables.json", "utf8")
  ) as Broken[];

  for (const b of broken) {
    console.log(`→ ${b.title} 표 복구…`);
    const table = await rebuildTable(b);
    console.log(table.rows.map((r) => `${r.label}: ${r.value}`).join("\n"));

    const { data: allSets } = await admin
      .from("listening_sets")
      .select("id")
      .eq("title", b.title);

    for (const s of allSets ?? []) {
      const { error } = await admin
        .from("listening_questions")
        .update({ table_data: table })
        .eq("set_id", s.id)
        .eq("order_index", 10);
      if (error) throw new Error(error.message);
    }
    console.log(`  synced ${(allSets ?? []).length} academies`);
  }
  console.log("완료");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
