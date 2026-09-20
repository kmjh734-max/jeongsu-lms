/**
 * 모든 듣기 세트의 음성을 Edge 목소리로 다시 굽는다 (값 0원).
 *
 * - 세트에 정해 둔 배속을 그대로 쓴다(중등 0.75, 고등 0.9).
 * - 어디까지 했는지 파일에 적어 두어, 끊겨도 이어서 할 수 있다.
 *   이어서 하기: node ... rebuild-all-audio.mts
 *   처음부터   : node ... rebuild-all-audio.mts --처음부터
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQuestionAudio } from "@/lib/listening/generate-audio";

const PROGRESS = join(tmpdir(), "listening-edge-audio-progress.json");
const CONCURRENCY = 8;

const fresh = process.argv.includes("--처음부터");
const done = new Set<string>(
  !fresh && existsSync(PROGRESS) ? (JSON.parse(readFileSync(PROGRESS, "utf8")) as string[]) : []
);
function markDone(id: string) {
  done.add(id);
  writeFileSync(PROGRESS, JSON.stringify([...done]), "utf8");
}

const admin = createAdminClient();
const { data: prof } = await admin
  .from("profiles")
  .select("academy_id")
  .eq("username", "js83719392")
  .single();

const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title, grade_level, speech_speed")
  .eq("academy_id", prof!.academy_id)
  .order("grade_level")
  .order("title");

let okCount = 0;
let failCount = 0;
let skipCount = 0;
const started = Date.now();

for (const s of sets ?? []) {
  const { data: qs } = await admin
    .from("listening_questions")
    .select("id, order_index")
    .eq("set_id", s.id)
    .order("order_index");
  if (!qs?.length) continue;

  const todo = qs.filter((q) => !done.has(q.id as string));
  skipCount += qs.length - todo.length;
  if (!todo.length) {
    console.log(`${s.title}: 이미 끝남`);
    continue;
  }

  const t = Date.now();
  let setOk = 0;
  let setFail = 0;

  // 문항 몇 개씩 동시에 — 한 문항 안에서는 대사 줄이 차례로 만들어진다
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (q) => {
        try {
          await generateQuestionAudio({ setId: s.id as string, questionId: q.id as string });
          markDone(q.id as string);
          setOk++;
        } catch (e) {
          setFail++;
          console.log(`  ${s.title} ${q.order_index}번 실패: ${e instanceof Error ? e.message : e}`);
        }
      })
    );
  }

  okCount += setOk;
  failCount += setFail;
  console.log(
    `${s.title} (${s.grade_level} · ${s.speech_speed}배): ${setOk}/${todo.length}개 · ${Math.round(
      (Date.now() - t) / 1000
    )}초 · 누적 ${okCount}개`
  );
}

console.log(
  `\n== 끝 · 만듦 ${okCount}개 · 실패 ${failCount}개 · 건너뜀 ${skipCount}개 · ${Math.round(
    (Date.now() - started) / 60000
  )}분 ==`
);
