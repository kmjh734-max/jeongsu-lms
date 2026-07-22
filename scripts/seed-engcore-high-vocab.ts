/**
 * Seed EngCore 올인원 고교기본 빈도별 단어장 (3400 words, 40/day × 85).
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-engcore-high-vocab.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-engcore-high-vocab.ts --from=1 --to=10
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-engcore-high-vocab.ts --enrich-only
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-engcore-high-vocab.ts --insert-only
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

import { createClient } from "@supabase/supabase-js";
import { joinExamplePairs } from "../src/lib/vocab/multi-example";

const ACADEMY_ID = "79ea0a71-d148-46ac-8c8f-a3a3e4961838"; // 정수학원
const OWNER_ID = "a20cf497-b12e-471d-b826-64e38cf42b3b"; // admin@gmail.com
const FOLDER_NAME = "EngCore 올인원 고교기본";
const CURRICULUM_LOCK_MARKER = "curriculum_locked";
const DATA_PATH = resolve(process.cwd(), "tmp/engcore-vocab-3400.json");
const CACHE_PATH = resolve(process.cwd(), "tmp/engcore-vocab-ai-cache.json");
const BATCH_SIZE = 20;
const CONCURRENCY = 3;

type SourceWord = {
  day: number;
  no: number;
  global_no: number;
  word: string;
  meaning: string;
  freq: 1 | 2 | 3 | 4 | 5;
  stars: string;
  source: string;
  band: string;
};

type AiCacheEntry = {
  example_sentence: string;
  example_meaning: string;
  synonyms: string;
  antonyms: string;
};

const TIER: Record<
  1 | 2 | 3 | 4 | 5,
  { label: string; stars: string }
> = {
  5: { label: "최빈출 단어", stars: "★★★★★" },
  4: { label: "핵심 빈출 단어", stars: "★★★★" },
  3: { label: "주요 필수 단어", stars: "★★★" },
  2: { label: "기본 확장 단어", stars: "★★" },
  1: { label: "추가 학습 단어", stars: "★" },
};

const args = process.argv.slice(2);
function argVal(name: string): string | undefined {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit?.split("=")[1];
}
function argNum(name: string, fallback: number) {
  const n = Number(argVal(name));
  return Number.isFinite(n) ? n : fallback;
}

const fromDay = argNum("from", 1);
const toDay = argNum("to", 85);
const insertOnly = args.includes("--insert-only");
const enrichOnly = args.includes("--enrich-only");

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function setTitle(day: number, freq: 1 | 2 | 3 | 4 | 5) {
  const t = TIER[freq];
  return `EngCore 올인원 고교기본 Day${day} ${t.label} ${t.stars}`;
}

function majorityFreq(words: SourceWord[]): 1 | 2 | 3 | 4 | 5 {
  const counts = new Map<number, number>();
  for (const w of words) counts.set(w.freq, (counts.get(w.freq) ?? 0) + 1);
  let best: 1 | 2 | 3 | 4 | 5 = 5;
  let bestN = -1;
  for (const [f, n] of counts) {
    if (n > bestN || (n === bestN && f > best)) {
      best = f as 1 | 2 | 3 | 4 | 5;
      bestN = n;
    }
  }
  return best;
}

function loadSource(): SourceWord[] {
  if (!existsSync(DATA_PATH)) {
    throw new Error(`Missing ${DATA_PATH}. Re-export Excel first.`);
  }
  return JSON.parse(readFileSync(DATA_PATH, "utf8")) as SourceWord[];
}

function loadCache(): Record<string, AiCacheEntry> {
  if (!existsSync(CACHE_PATH)) return {};
  return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Record<
    string,
    AiCacheEntry
  >;
}

function saveCache(cache: Record<string, AiCacheEntry>) {
  mkdirSync(resolve(process.cwd(), "tmp"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0), "utf8");
}

function cacheKey(word: string, meaning: string) {
  return `${word.trim().toLowerCase()}::${meaning.trim()}`;
}

async function ensureFolder(): Promise<string> {
  const { data: existing } = await admin
    .from("vocab_folders")
    .select("id")
    .eq("academy_id", ACADEMY_ID)
    .eq("name", FOLDER_NAME)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data, error } = await admin
    .from("vocab_folders")
    .insert({
      name: FOLDER_NAME,
      teacher_id: OWNER_ID,
      created_by: OWNER_ID,
      academy_id: ACADEMY_ID,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "folder create failed");
  return data.id as string;
}

async function ensureSet(
  folderId: string,
  day: number,
  title: string
): Promise<string> {
  const { data: existing } = await admin
    .from("vocab_sets")
    .select("id")
    .eq("academy_id", ACADEMY_ID)
    .eq("folder_id", folderId)
    .eq("title", title)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    title,
    description: CURRICULUM_LOCK_MARKER,
    folder_id: folderId,
    teacher_id: OWNER_ID,
    created_by: OWNER_ID,
    academy_id: ACADEMY_ID,
    is_published: true,
    is_locked: true,
    school_band: "고등",
    order_index: day,
  };

  if (existing?.id) {
    const { error } = await admin
      .from("vocab_sets")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return existing.id as string;
  }

  const { data, error } = await admin
    .from("vocab_sets")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "set create failed");
  return data.id as string;
}

async function replaceItems(
  setId: string,
  words: SourceWord[],
  cache: Record<string, AiCacheEntry>
) {
  const { error: delErr } = await admin
    .from("vocab_items")
    .delete()
    .eq("set_id", setId);
  if (delErr) throw new Error(delErr.message);

  const rows = words.map((w, i) => {
    const ai = cache[cacheKey(w.word, w.meaning)];
    return {
      set_id: setId,
      word: w.word.trim(),
      meaning: w.meaning.trim(),
      part_of_speech: null,
      example_sentence: ai?.example_sentence ?? null,
      example_meaning: ai?.example_meaning ?? null,
      synonyms: ai?.synonyms || null,
      antonyms: ai?.antonyms || null,
      order_index: i,
    };
  });

  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await admin.from("vocab_items").insert(chunk);
    if (error) throw new Error(error.message);
  }
}

async function openaiJson(prompt: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output only valid JSON. Never include markdown fences or extra text.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI ${response.status}: ${errText.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI content");
  return JSON.parse(content);
}

async function generateExamplesBatch(
  items: { word: string; meaning: string }[]
): Promise<
  Map<string, { example_sentence: string; example_meaning: string }>
> {
  const prompt = `You are an English teacher creating vocabulary examples for Korean high school students.

For each word below:
1. Look at the Korean meaning field. It may list 1–several senses.
2. Pick 2–3 representative senses useful for learners (prefer 2 examples; max 3).
3. Each example must be a natural English sentence at high school level. Word form may change.
4. Provide an accurate Korean translation for each example.
5. Do not invent unrelated senses. Avoid inappropriate content.

Return ONLY valid JSON:
{
  "items": [
    {
      "word": "exact word from input",
      "meaning": "exact meaning from input",
      "examples": [
        {
          "example_sentence": "English sentence 1",
          "example_meaning": "한국어 해석 1"
        }
      ]
    }
  ]
}

Words:
${JSON.stringify(items)}`;

  const parsed = (await openaiJson(prompt)) as {
    items?: Array<{
      word?: string;
      examples?: Array<{
        example_sentence?: string;
        example_meaning?: string;
      }>;
      example_sentence?: string;
      example_meaning?: string;
    }>;
  };

  const out = new Map<
    string,
    { example_sentence: string; example_meaning: string }
  >();
  for (const g of parsed.items ?? []) {
    const word = String(g.word ?? "")
      .trim()
      .toLowerCase();
    if (!word) continue;
    const fromList = (g.examples ?? [])
      .map((ex) => ({
        example_sentence: String(ex.example_sentence ?? "").trim(),
        example_meaning: String(ex.example_meaning ?? "").trim(),
      }))
      .filter((ex) => ex.example_sentence)
      .slice(0, 3);
    const joined =
      fromList.length > 0
        ? joinExamplePairs(fromList)
        : joinExamplePairs([
            {
              example_sentence: String(g.example_sentence ?? "").trim(),
              example_meaning: String(g.example_meaning ?? "").trim(),
            },
          ]);
    if (joined.example_sentence) out.set(word, joined);
  }
  return out;
}

async function generateRelatedBatch(
  items: { word: string; meaning: string }[]
): Promise<Map<string, { synonyms: string; antonyms: string }>> {
  const prompt = `You are an English vocabulary teacher for Korean high school students.

For each word, provide synonyms and/or antonyms ONLY when natural and useful.
- Synonyms: 0–4 words (comma-separated). Empty string if none fit well.
- Antonyms: 0–4 words (comma-separated). Empty string if none fit well.
- Do NOT force a fixed count. Prefer quality over quantity.

Return ONLY valid JSON:
{
  "items": [
    {
      "word": "exact word from input",
      "synonyms": "optional comma-separated list, or empty string",
      "antonyms": "optional comma-separated list, or empty string"
    }
  ]
}

Words:
${JSON.stringify(items)}`;

  const parsed = (await openaiJson(prompt)) as {
    items?: Array<{
      word?: string;
      synonyms?: string;
      antonyms?: string;
    }>;
  };

  const out = new Map<string, { synonyms: string; antonyms: string }>();
  for (const g of parsed.items ?? []) {
    const word = String(g.word ?? "")
      .trim()
      .toLowerCase();
    if (!word) continue;
    out.set(word, {
      synonyms: String(g.synonyms ?? "").trim(),
      antonyms: String(g.antonyms ?? "").trim(),
    });
  }
  return out;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}

async function enrichCache(
  words: SourceWord[],
  cache: Record<string, AiCacheEntry>
) {
  const missing = words.filter((w) => {
    const key = cacheKey(w.word, w.meaning);
    const hit = cache[key];
    return !(hit?.example_sentence);
  });

  console.log(
    `AI enrich: ${words.length - missing.length}/${words.length} cached, ${missing.length} to generate`
  );

  const batches: SourceWord[][] = [];
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    batches.push(missing.slice(i, i + BATCH_SIZE));
  }

  let done = 0;
  await mapPool(batches, CONCURRENCY, async (batch) => {
    const payload = batch.map((w) => ({
      word: w.word.trim(),
      meaning: w.meaning.trim(),
    }));

    let examples = new Map<
      string,
      { example_sentence: string; example_meaning: string }
    >();
    let related = new Map<string, { synonyms: string; antonyms: string }>();

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        [examples, related] = await Promise.all([
          generateExamplesBatch(payload),
          generateRelatedBatch(payload),
        ]);
        break;
      } catch (err) {
        console.warn(
          `  batch retry ${attempt}/3:`,
          err instanceof Error ? err.message : err
        );
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }

    for (const w of batch) {
      const key = cacheKey(w.word, w.meaning);
      const ex = examples.get(w.word.trim().toLowerCase());
      const rel = related.get(w.word.trim().toLowerCase());
      if (!ex?.example_sentence) continue;
      cache[key] = {
        example_sentence: ex.example_sentence,
        example_meaning: ex.example_meaning,
        synonyms: rel?.synonyms ?? "",
        antonyms: rel?.antonyms ?? "",
      };
    }

    done += batch.length;
    saveCache(cache);
    console.log(`  AI progress ${done}/${missing.length}`);
  });
}

async function enrichDbFromCache(
  setId: string,
  words: SourceWord[],
  cache: Record<string, AiCacheEntry>
) {
  const { data: items, error } = await admin
    .from("vocab_items")
    .select("id, word, meaning, example_sentence")
    .eq("set_id", setId);
  if (error) throw new Error(error.message);

  for (const item of items ?? []) {
    const word = String(item.word ?? "").trim();
    const meaning = String(item.meaning ?? "").trim();
    const ai = cache[cacheKey(word, meaning)];
    if (!ai?.example_sentence) continue;
    if (item.example_sentence) continue;

    const { error: upErr } = await admin
      .from("vocab_items")
      .update({
        example_sentence: ai.example_sentence,
        example_meaning: ai.example_meaning,
        synonyms: ai.synonyms || null,
        antonyms: ai.antonyms || null,
      })
      .eq("id", item.id);
    if (upErr) throw new Error(upErr.message);
  }
}

async function main() {
  const source = loadSource();
  const byDay = new Map<number, SourceWord[]>();
  for (const w of source) {
    if (w.day < fromDay || w.day > toDay) continue;
    const list = byDay.get(w.day) ?? [];
    list.push(w);
    byDay.set(w.day, list);
  }

  const days = [...byDay.keys()].sort((a, b) => a - b);
  console.log(
    `EngCore vocab seed: days ${fromDay}-${toDay} (${days.length} days, ${source.filter((w) => w.day >= fromDay && w.day <= toDay).length} words)`
  );

  const cache = loadCache();
  const folderId = await ensureFolder();
  console.log("folder", folderId);

  if (!insertOnly) {
    const slice = source.filter((w) => w.day >= fromDay && w.day <= toDay);
    await enrichCache(slice, cache);
  }

  if (enrichOnly) {
    for (const day of days) {
      const words = (byDay.get(day) ?? []).sort((a, b) => a.no - b.no);
      const freq = majorityFreq(words);
      const title = setTitle(day, freq);
      const { data: set } = await admin
        .from("vocab_sets")
        .select("id")
        .eq("academy_id", ACADEMY_ID)
        .eq("folder_id", folderId)
        .eq("title", title)
        .maybeSingle();
      if (!set?.id) {
        console.warn(`Day ${day}: set missing, skip enrich-db`);
        continue;
      }
      await enrichDbFromCache(set.id as string, words, cache);
      console.log(`Day ${day}: enriched from cache`);
    }
    console.log("done (enrich-only)");
    return;
  }

  for (const day of days) {
    const words = (byDay.get(day) ?? []).sort((a, b) => a.no - b.no);
    if (words.length !== 40) {
      console.warn(`Day ${day}: expected 40 words, got ${words.length}`);
    }
    const freq = majorityFreq(words);
    const title = setTitle(day, freq);
    const setId = await ensureSet(folderId, day, title);
    await replaceItems(setId, words, cache);
    const withEx = words.filter(
      (w) => cache[cacheKey(w.word, w.meaning)]?.example_sentence
    ).length;
    console.log(
      `Day ${day}: ${title} (${words.length} words, examples ${withEx})`
    );
  }

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
