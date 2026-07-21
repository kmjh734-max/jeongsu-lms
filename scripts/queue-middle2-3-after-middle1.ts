/**
 * Wait until 중1 20회가 완성된 뒤 중2 → 중3 시드 실행.
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/queue-middle2-3-after-middle1.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { spawn } from "child_process";

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
import { CURRICULUM_LOCK_MARKER } from "../src/lib/listening/listening-api-auth";

const ACADEMY_ID = "79ea0a71-d148-46ac-8c8f-a3a3e4961838";
const NEED = 20;

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function countCompleteMiddle1(): Promise<{
  sets: number;
  withAudio: number;
}> {
  const { data: sets } = await admin
    .from("listening_sets")
    .select("id")
    .eq("academy_id", ACADEMY_ID)
    .eq("grade_level", "middle1")
    .ilike("description", `%${CURRICULUM_LOCK_MARKER}%`);

  const setIds = (sets ?? []).map((s) => s.id as string);
  if (setIds.length === 0) return { sets: 0, withAudio: 0 };

  let withAudio = 0;
  for (const id of setIds) {
    const { count: qn } = await admin
      .from("listening_questions")
      .select("*", { count: "exact", head: true })
      .eq("set_id", id);
    const { count: an } = await admin
      .from("listening_questions")
      .select("*", { count: "exact", head: true })
      .eq("set_id", id)
      .not("audio_url", "is", null)
      .neq("audio_url", "");
    if ((qn ?? 0) >= NEED && (an ?? 0) >= NEED) withAudio += 1;
  }
  return { sets: setIds.length, withAudio };
}

function runSeed(grade: "middle2" | "middle3"): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      "npx",
      [
        "--yes",
        "tsx",
        "--tsconfig",
        "tsconfig.json",
        "scripts/seed-middle-listening.ts",
        `--grade=${grade}`,
        "--from=1",
        "--to=20",
      ],
      {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
        env: process.env,
      }
    );
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${grade} seed exited ${code}`));
    });
  });
}

async function main() {
  console.log("Waiting for 중1 20회 (questions+audio) to finish…");
  for (;;) {
    const { sets, withAudio } = await countCompleteMiddle1();
    console.log(
      `[${new Date().toLocaleTimeString("ko-KR")}] 중1 complete: ${withAudio}/${NEED} (sets=${sets})`
    );
    if (withAudio >= NEED) break;
    await new Promise((r) => setTimeout(r, 60_000));
  }

  console.log("\n=== Starting 중2 ===");
  await runSeed("middle2");
  console.log("\n=== Starting 중3 ===");
  await runSeed("middle3");
  console.log("\nALL DONE middle1→2→3");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
