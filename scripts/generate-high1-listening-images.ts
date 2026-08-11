/**
 * 고1 듣기 1~20회 「그림 불일치」(4번) 이미지 일괄 생성
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/generate-high1-listening-images.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/generate-high1-listening-images.ts --from=1 --to=20
 *   npx --yes tsx --tsconfig tsconfig.json scripts/generate-high1-listening-images.ts --force
 */
import fs from "fs";
import path from "path";
import {
  generateAndSaveChoiceImages,
  propagateChoiceImageUrls,
} from "../src/lib/listening/generate-choice-images";
import { createAdminClient } from "../src/lib/supabase/admin";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1]!.trim();
    let v = m[2]!.trim();
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

function argNum(name: string, fallback: number): number {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const n = Number(hit.split("=")[1]);
  return Number.isFinite(n) ? n : fallback;
}

const fromN = argNum("from", 1);
const toN = argNum("to", 20);
const force = process.argv.includes("--force");

function setRound(title: string): number | null {
  const m = String(title).match(/고1\s*듣기\s*(\d+)\s*회/);
  return m ? Number(m[1]) : null;
}

async function main() {
  const admin = createAdminClient();

  // 템플릿(정수) 학원
  const { data: academy } = await admin
    .from("academies")
    .select("id")
    .eq("slug", "jeongsu")
    .maybeSingle();
  if (!academy?.id) throw new Error("jeongsu 학원을 찾을 수 없습니다.");

  const { data: sets, error: setsErr } = await admin
    .from("listening_sets")
    .select("id, title")
    .eq("academy_id", academy.id)
    .eq("grade_level", "high1")
    .ilike("title", "고1 듣기 %회")
    .order("title");
  if (setsErr) throw new Error(setsErr.message);

  const targetSets = (sets ?? [])
    .map((s) => ({
      id: s.id as string,
      title: s.title as string,
      round: setRound(s.title as string),
    }))
    .filter(
      (s) => s.round != null && s.round >= fromN && s.round <= toN
    )
    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0));

  console.log(
    `고1 그림 생성: ${targetSets.length}개 세트 (${fromN}~${toN}회)${force ? " [force]" : ""}`
  );

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const set of targetSets) {
    const { data: qs, error: qErr } = await admin
      .from("listening_questions")
      .select(
        "id, order_index, question_type, needs_image_choices, choice_image_prompts, choice_image_urls"
      )
      .eq("set_id", set.id)
      .eq("order_index", 4)
      .maybeSingle();
    if (qErr) {
      console.error(`✗ ${set.title}: ${qErr.message}`);
      failed += 1;
      continue;
    }
    if (!qs) {
      console.error(`✗ ${set.title}: 4번 문항 없음`);
      failed += 1;
      continue;
    }

    const prompts = Array.isArray(qs.choice_image_prompts)
      ? (qs.choice_image_prompts as string[]).map((p) => String(p).trim()).filter(Boolean)
      : [];
    if (prompts.length === 0) {
      console.error(`✗ ${set.title}: choice_image_prompts 비어 있음`);
      failed += 1;
      continue;
    }

    // 고1 4번은 합성 장면 1장
    const usePrompts = prompts.slice(0, 1);

    try {
      console.log(`→ ${set.title} 생성 중…`);
      const result = await generateAndSaveChoiceImages({
        setId: set.id,
        questionId: qs.id as string,
        prompts: usePrompts,
        force,
      });
      if (result.skipped) {
        console.log(`  skip (이미 있음) ${result.urls[0]?.slice(0, 60)}…`);
        skipped += 1;
      } else {
        console.log(`  ok ${result.urls[0]?.slice(0, 80)}`);
        ok += 1;
      }
      const copied = await propagateChoiceImageUrls({
        sourceQuestionId: qs.id as string,
        setTitle: set.title,
        orderIndex: 4,
      });
      if (copied > 0) {
        console.log(`  다른 학원 복사 ${copied}건`);
      }
    } catch (e) {
      failed += 1;
      console.error(
        `✗ ${set.title}:`,
        e instanceof Error ? e.message : e
      );
    }
  }

  console.log(`완료: 생성 ${ok} · 스킵 ${skipped} · 실패 ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
