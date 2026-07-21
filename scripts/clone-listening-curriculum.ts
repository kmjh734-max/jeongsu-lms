/**
 * Clone curriculum listening from jeongsu → other academies (reuse audio URLs).
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/clone-listening-curriculum.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/clone-listening-curriculum.ts --academy=bornenglish
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
import {
  cloneListeningCurriculumToAcademy,
  syncListeningCurriculumToAllAcademies,
} from "../src/lib/listening/clone-curriculum";

const SUPER_ADMIN_ID = "3b34ef13-0dc3-47dd-a96e-4881d4e95f96";

const academySlug = process.argv
  .find((a) => a.startsWith("--academy="))
  ?.split("=")[1];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function ownerForAcademy(academyId: string): Promise<string> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("academy_id", academyId)
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  return (data?.id as string) || SUPER_ADMIN_ID;
}

async function main() {
  if (academySlug) {
    const { data: academy, error } = await admin
      .from("academies")
      .select("id, slug, name")
      .eq("slug", academySlug)
      .maybeSingle();
    if (error || !academy) {
      throw new Error(error?.message ?? `academy ${academySlug} not found`);
    }
    const owner = await ownerForAcademy(academy.id as string);
    const result = await cloneListeningCurriculumToAcademy({
      targetAcademyId: academy.id as string,
      ownerProfileId: owner,
    });
    console.log(academy.slug, JSON.stringify(result, null, 2));
    return;
  }

  const results = await syncListeningCurriculumToAllAcademies(SUPER_ADMIN_ID);
  for (const row of results) {
    console.log(row.slug, JSON.stringify(row.result, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
