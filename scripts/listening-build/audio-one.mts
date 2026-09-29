/**
 * 한 세트의 음성만 다시 만든다 (Edge 목소리, 값 0원).
 *
 *   node --env-file=.env.local --experimental-strip-types --import ./scripts/tmp-rv/register-alias.mjs \
 *     scripts/listening-build/audio-one.mts "중2 32회" [--전부]
 *
 * 기본은 아직 음성이 없는 문항만 만든다. --전부 를 붙이면 모두 다시 만든다.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSetQuestionAudio } from "@/lib/listening/generate-audio";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";

const title = process.argv[2];
if (!title) throw new Error('쓰는 법: node ... audio-one.mts "<세트 제목>" [--전부]');
const all = process.argv.includes("--전부");

const admin = createAdminClient();
const { data: set } = await admin
  .from("listening_sets")
  .select("id, title, speech_speed")
  .eq("title", title)
  .single();
if (!set) throw new Error(`세트를 못 찾음: ${title}`);

const t = Date.now();
const res = await generateSetQuestionAudio({
  setId: set.id as string,
  speechSpeed: (set.speech_speed as number) ?? undefined,
  skipExisting: !all,
});
const ok = res.filter((r) => r.ok !== false).length;
console.log(`${set.title} — 음성 ${ok}/${res.length}개 · ${Math.round((Date.now() - t) / 1000)}초`);

try {
  await ensureDictationPreparedForSet(set.id as string, { includeVariants: false });
  console.log("받아쓰기 준비 끝");
} catch (e) {
  console.log("받아쓰기 준비 건너뜀:", (e as Error).message);
}
