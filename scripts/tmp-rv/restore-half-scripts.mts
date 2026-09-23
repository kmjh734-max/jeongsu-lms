/**
 * 대답이 빠진 대본을 되살리고, 그 문항의 음성과 받아쓰기를 다시 만든다.
 *
 *   node --env-file=.env.local --experimental-strip-types --import ./scripts/tmp-rv/register-alias.mjs \
 *     scripts/tmp-rv/restore-half-scripts.mts [--적용]
 *
 * 영어 대본만 묻는 말 세 줄로 잘려 있었다(한국어 해석에는 대답이 남아 있다).
 * 해석을 근거로 대답을 되살리고, 음성은 Edge 목소리로 다시 굽는다(값 0원).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSetQuestionAudio } from "@/lib/listening/generate-audio";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";

const apply = process.argv.includes("--적용");

const RESTORED: Array<{ set: string; no: number; script: string }> = [
  {
    set: "중2 4회",
    no: 8,
    script: [
      "M: Did you see the poster for the pottery class? I want to make a cup by hand.",
      "W: Yes, I signed up this morning. The class is on Saturday, May eighteenth.",
      "M: Great. What time does it start?",
      "W: It starts at ten in the morning. It will be in the art room on the second floor.",
      "M: Do we need to bring anything?",
      "W: We should bring an old towel and an apron. The teacher will give us clay and tools.",
    ].join("\n"),
  },
  {
    set: "중2 6회",
    no: 8,
    script: [
      "W: Hi, Minho. Is there a board game club meeting this week?",
      "M: Yes, it's on Friday. We'll meet in Room 203 after school.",
      "W: What time does it start?",
      "M: It starts at three thirty. Please bring a pencil and your student card.",
      "W: Okay. What will we do there?",
      "M: First we'll learn a new card game. Then we'll play in small groups.",
    ].join("\n"),
  },
  {
    set: "중2 7회",
    no: 8,
    script: [
      "W: Minho, can you tell me about our school festival booth? I missed the meeting.",
      "M: Sure. Our booth will be at Table B in the gym.",
      "W: Is it this weekend? I need to check my schedule.",
      "M: Yes, it opens on Saturday at twelve thirty. Please come a little early so we can set up.",
      "W: Okay. What should I bring?",
      "M: Bring napkins and some cash for change. We'll sell cookies and lemonade.",
    ].join("\n"),
  },
  {
    set: "중2 8회",
    no: 8,
    script: [
      "W: Excuse me, I want to join the school newspaper team. Can you tell me about the first meeting?",
      "M: Of course. We'll meet in the small media room next to the cafeteria.",
      "W: Okay. What day do you meet?",
      "M: We meet every Monday after school. Please come by three.",
      "W: Do I need to bring anything?",
      "M: Yes. Bring a notebook and your student card. We'll choose article ideas and team roles.",
    ].join("\n"),
  },
  {
    set: "중2 10회",
    no: 8,
    script: [
      "W: Mr. Brown, can you tell us about the summer camp activity?",
      "M: Of course. We'll gather at the small cabin by the lake.",
      "W: What day do we go there?",
      "M: It's on Friday morning. Please come by nine.",
      "W: Do we need to bring anything?",
      "M: Yes. Bring sunscreen and a water bottle.",
      "W: What will we do at camp?",
      "M: We'll play two outdoor games. We'll also learn the safety rules.",
    ].join("\n"),
  },
];

const admin = createAdminClient();
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title, speech_speed")
  .eq("academy_id", prof!.academy_id);

for (const r of RESTORED) {
  const s = sets!.find((x) => x.title === r.set);
  if (!s) {
    console.log(`[못 찾음] ${r.set}`);
    continue;
  }
  const { data: q } = await admin
    .from("listening_questions")
    .select("id, script_text")
    .eq("set_id", s.id)
    .eq("order_index", r.no)
    .single();
  if (!q) {
    console.log(`[못 찾음] ${r.set} ${r.no}번`);
    continue;
  }

  const before = String(q.script_text ?? "").split(/\r?\n/).length;
  const after = r.script.split("\n").length;
  console.log(`${r.set} ${r.no}번 — 대본 ${before}줄 → ${after}줄`);
  if (!apply) continue;

  const { error } = await admin
    .from("listening_questions")
    .update({ script_text: r.script, dictation_prepared_at: null })
    .eq("id", q.id);
  if (error) throw new Error(`${r.set} ${r.no}번: ${error.message}`);

  const res = await generateSetQuestionAudio({
    setId: s.id,
    speechSpeed: s.speech_speed ?? undefined,
    questionIds: [q.id],
    skipExisting: false,
  });
  console.log(`   음성: ${res.map((x) => (x.ok ? "됨" : `실패(${x.message})`)).join(", ")}`);

  const dict = await ensureDictationPreparedForSet(s.id);
  console.log(`   받아쓰기: 됨 ${dict.ok} · 건너뜀 ${dict.skipped} · 실패 ${dict.failed}`);
}

console.log(apply ? "적용함" : "미리보기 — 적용하려면 --적용 을 붙이세요.");
