/**
 * Seed 중1 듣기 커리큘럼: 20회 × 20문항, 보통 속도(0.75), 잠금.
 *
 * Usage:
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-middle1-listening.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-middle1-listening.ts --from=3 --to=5
 *   npx --yes tsx --tsconfig tsconfig.json scripts/seed-middle1-listening.ts --audio-only
 */
import { readFileSync } from "fs";
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
import { assertListeningOpenAiEnv } from "../src/lib/listening/assert-listening-openai";
import { generateExamQuestionsFromSlots } from "../src/lib/listening/generate-exam-from-slots";
import { generateSetQuestionAudio } from "../src/lib/listening/generate-audio";
import { planRandomGenerationSlots } from "../src/lib/listening/generation-slots";
import { getExamTypesForGrade } from "../src/lib/listening/exam-types";
import { persistGeneratedQuestions } from "../src/lib/listening/persist-questions";
import { CURRICULUM_LOCK_MARKER } from "../src/lib/listening/listening-api-auth";
import { syncListeningCurriculumToAllAcademies } from "../src/lib/listening/clone-curriculum";

const ACADEMY_ID = "79ea0a71-d148-46ac-8c8f-a3a3e4961838"; // 정수학원
const OWNER_ID = "a20cf497-b12e-471d-b826-64e38cf42b3b"; // admin@gmail.com
const FOLDER_NAME = "중1 듣기 DB";
const SPEECH_SPEED = 0.75;
const ROUNDS = 20;

const args = process.argv.slice(2);
function argNum(name: string, fallback: number) {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const n = Number(hit.split("=")[1]);
  return Number.isFinite(n) ? n : fallback;
}
const fromRound = argNum("from", 1);
const toRound = argNum("to", ROUNDS);
const audioOnly = args.includes("--audio-only");
const questionsOnly = args.includes("--questions-only");

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function ensureFolder(): Promise<string> {
  const { data: existing } = await admin
    .from("listening_set_folders")
    .select("id")
    .eq("academy_id", ACADEMY_ID)
    .eq("name", FOLDER_NAME)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data, error } = await admin
    .from("listening_set_folders")
    .insert({
      name: FOLDER_NAME,
      teacher_id: OWNER_ID,
      created_by: OWNER_ID,
      academy_id: ACADEMY_ID,
      order_index: 0,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "folder create failed");
  return data.id as string;
}

async function ensureSet(folderId: string, round: number): Promise<string> {
  const title = `중1 ${round}회`;
  const { data: existing } = await admin
    .from("listening_sets")
    .select("id")
    .eq("academy_id", ACADEMY_ID)
    .eq("folder_id", folderId)
    .eq("title", title)
    .maybeSingle();
  if (existing?.id) {
    const patch: Record<string, unknown> = {
      speech_speed: SPEECH_SPEED,
      grade_level: "middle1",
      description: CURRICULUM_LOCK_MARKER,
      is_published: true,
      is_locked: true,
    };
    let { error } = await admin
      .from("listening_sets")
      .update(patch)
      .eq("id", existing.id);
    if (error && /is_locked/i.test(error.message)) {
      delete patch.is_locked;
      ({ error } = await admin
        .from("listening_sets")
        .update(patch)
        .eq("id", existing.id));
    }
    if (error) throw new Error(error.message);
    return existing.id as string;
  }

  const row: Record<string, unknown> = {
    title,
    description: CURRICULUM_LOCK_MARKER,
    folder_id: folderId,
    grade_level: "middle1",
    speech_speed: SPEECH_SPEED,
    teacher_id: OWNER_ID,
    created_by: OWNER_ID,
    is_published: true,
    order_index: round,
    academy_id: ACADEMY_ID,
    is_locked: true,
  };

  let { data, error } = await admin
    .from("listening_sets")
    .insert(row)
    .select("id")
    .single();

  if (error && /is_locked/i.test(error.message)) {
    delete row.is_locked;
    ({ data, error } = await admin
      .from("listening_sets")
      .insert(row)
      .select("id")
      .single());
  }
  if (error || !data) throw new Error(error?.message ?? "set create failed");
  return data.id as string;
}

async function questionCount(setId: string): Promise<number> {
  const { count } = await admin
    .from("listening_questions")
    .select("*", { count: "exact", head: true })
    .eq("set_id", setId);
  return count ?? 0;
}

async function generateQuestions(setId: string, round: number) {
  const { apiKey } = assertListeningOpenAiEnv();
  const examTypes = getExamTypesForGrade("middle1");
  const slots = planRandomGenerationSlots({
    questionCount: 20,
    examTypes,
  });
  console.log(`[${round}회] generating ${slots.length} questions…`);
  const questions = await generateExamQuestionsFromSlots(
    apiKey,
    slots,
    "auto",
    "middle1"
  );
  if (questions.length !== slots.length) {
    throw new Error(
      `${round}회: expected ${slots.length} got ${questions.length}`
    );
  }
  await persistGeneratedQuestions(
    setId,
    questions.map((q, i) => ({
      ...q,
      order_index: slots[i]?.slotIndex ?? i + 1,
    })),
    { replaceAll: true }
  );
  console.log(`[${round}회] questions saved`);
}

async function generateAudio(setId: string, round: number) {
  console.log(`[${round}회] generating audio @ ${SPEECH_SPEED}…`);
  const results = await generateSetQuestionAudio({
    setId,
    speechSpeed: SPEECH_SPEED,
    skipExisting: true,
  });
  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok);
  console.log(`[${round}회] audio ${ok}/${results.length} ok`);
  if (fail.length) {
    for (const f of fail.slice(0, 5)) {
      console.warn(`  Q${f.orderIndex}: ${f.message}`);
    }
  }
}

async function main() {
  console.log(
    `Seed middle1 rounds ${fromRound}–${toRound} (audioOnly=${audioOnly}, questionsOnly=${questionsOnly})`
  );
  const folderId = await ensureFolder();
  console.log("folder", folderId);

  for (let round = fromRound; round <= toRound; round++) {
    const setId = await ensureSet(folderId, round);
    console.log(`\n=== ${round}회 set=${setId} ===`);
    const qn = await questionCount(setId);

    if (!audioOnly) {
      if (qn >= 20) {
        console.log(`[${round}회] already has ${qn} questions — skip gen`);
      } else {
        await generateQuestions(setId, round);
      }
    }

    if (!questionsOnly) {
      await generateAudio(setId, round);
    }

    // Push newly completed rounds to other academies (Born English, …)
    try {
      const synced = await syncListeningCurriculumToAllAcademies(OWNER_ID);
      for (const row of synced) {
        if (row.result.setsCloned > 0) {
          console.log(
            `synced → ${row.slug}: +${row.result.setsCloned} sets, +${row.result.questionsCloned} Qs`
          );
        }
      }
    } catch (e) {
      console.warn("curriculum sync warn:", e instanceof Error ? e.message : e);
    }
  }
  console.log("\nDONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
