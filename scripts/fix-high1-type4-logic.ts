/**
 * 고1 그림불일치: 대본이 "포스터에 이미 틀린 값이 있다"고 말하면
 * 그 틀린 값을 그린 그림과 앞뒤가 안 맞음 → 대본을 「올바른 사실」만 말하도록 수정 + 음원 재생성
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-high1-type4-logic.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { generateQuestionAudio } from "../src/lib/listening/generate-audio";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
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

const ACADEMY_ID = "79ea0a71-d148-46ac-8c8f-a3a3e4961838";

type Seg = { order_index: number; speaker_type: "M" | "W"; text: string };

type Fix = {
  title: string;
  segments: Seg[];
  script_translation: string;
  explanation: string;
  answer_clue: string;
};

/**
 * 대화 = 올바른 사실만 / 그림 = 그중 하나만 틀림
 */
const FIXES: Fix[] = [
  {
    title: "고1 듣기 1회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Here is the poster draft for our school eco fair." },
      { order_index: 1, speaker_type: "W", text: "Great. I see the big title at the top, labeled Green Day." },
      { order_index: 2, speaker_type: "M", text: "Yes, and the date is printed under it as June fifteenth." },
      { order_index: 3, speaker_type: "W", text: "The bicycle icon on the left looks nice for low-carbon travel." },
      { order_index: 4, speaker_type: "M", text: "I also placed three recycling bins at the bottom, each with a different color." },
      { order_index: 5, speaker_type: "W", text: "Good. And the event ends at three o'clock." },
      { order_index: 6, speaker_type: "M", text: "Yes, three. Then we can print the poster." },
    ],
    script_translation:
      "남: 우리 학교 환경 박람회 포스터 초안이 여기 있어. 여: 좋아. 맨 위에 Green Day라고 적힌 큰 제목이 보이네. 남: 응, 그리고 그 아래에 날짜가 6월 15일로 인쇄되어 있어. 여: 왼쪽의 자전거 아이콘은 저탄소 이동을 나타내기에 좋아 보여. 남: 아래쪽에는 서로 다른 색깔의 재활용 쓰레기통 세 개도 배치했어. 여: 좋아. 그리고 행사는 3시에 끝나. 남: 맞아, 3시. 그럼 포스터를 인쇄하자.",
    explanation:
      "대화에서는 종료 시간이 3시라고 했지만, 그림에는 4시로 표시되어 있어 불일치한다.",
    answer_clue: "the event ends at three o'clock",
  },
  {
    title: "고1 듣기 4회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Wow, the school festival poster looks almost ready for printing." },
      { order_index: 1, speaker_type: "W", text: "Yes. At the top, there is a large title, Spring Harmony Festival." },
      { order_index: 2, speaker_type: "M", text: "I also see two musical notes beside the title, which makes it cheerful." },
      { order_index: 3, speaker_type: "W", text: "In the center, a guitar is placed between two standing microphones." },
      { order_index: 4, speaker_type: "M", text: "Good. The date, May tenth, is written inside the box at the bottom." },
      { order_index: 5, speaker_type: "W", text: "And the location says outdoor stage, just under the date box." },
      { order_index: 6, speaker_type: "M", text: "The start time is five o'clock." },
      { order_index: 7, speaker_type: "W", text: "Perfect. Then we can send the file to the teacher." },
    ],
    script_translation:
      "남: 와, 학교 축제 포스터가 거의 인쇄할 준비가 된 것 같아. 여: 응. 맨 위에는 큰 제목인 Spring Harmony Festival이 있어. 남: 제목 옆에 음표 두 개도 보이는데, 포스터를 밝게 해 줘. 여: 가운데에는 기타가 두 개의 스탠드 마이크 사이에 놓여 있어. 남: 좋아. 날짜인 5월 10일은 아래쪽 상자 안에 쓰여 있어. 여: 그리고 장소는 날짜 상자 바로 아래에 outdoor stage라고 되어 있어. 남: 시작 시간은 5시야. 여: 완벽해. 그럼 선생님께 파일을 보내자.",
    explanation:
      "대화에서는 시작 시간이 5시라고 했지만, 그림에는 6시로 표시되어 있어 불일치한다.",
    answer_clue: "the start time is five o'clock",
  },
  {
    title: "고1 듣기 13회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at our club fair poster on the wall, Mina." },
      { order_index: 1, speaker_type: "W", text: "It looks bright. The title at the top says Green Club Fair." },
      { order_index: 2, speaker_type: "M", text: "Yes, and the large tree in the center catches attention well." },
      { order_index: 3, speaker_type: "W", text: "I also see three recycling bins placed under the tree." },
      { order_index: 4, speaker_type: "M", text: "The date is written as April fifteenth near the bottom." },
      { order_index: 5, speaker_type: "W", text: "Good. The fair ends at four o'clock." },
      { order_index: 6, speaker_type: "M", text: "Yes, four. That matches our schedule." },
      { order_index: 7, speaker_type: "W", text: "Then we can print more copies." },
    ],
    script_translation:
      "남: 벽에 있는 우리 동아리 박람회 포스터를 봐, 미나. 여: 밝아 보여. 위쪽 제목은 Green Club Fair야. 남: 응, 가운데 큰 나무도 눈에 잘 들어와. 여: 나무 아래 재활용 쓰레기통 세 개도 보여. 남: 날짜는 아래쪽에 4월 15일로 적혀 있어. 여: 좋아. 행사는 4시에 끝나. 남: 맞아, 4시. 우리 일정과 같아. 여: 그럼 더 인쇄하자.",
    explanation:
      "대화에서는 종료 시간이 4시라고 했지만, 그림에는 5시로 표시되어 있어 불일치한다.",
    answer_clue: "the fair ends at four o'clock",
  },
  {
    title: "고1 듣기 17회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Wow, this poster for the school movie night looks almost finished." },
      { order_index: 1, speaker_type: "W", text: "Yes. The big title at the top says Friday Film Night." },
      { order_index: 2, speaker_type: "M", text: "I like the large popcorn bucket in the center of the poster." },
      { order_index: 3, speaker_type: "W", text: "And the clock beside it shows seven thirty, our starting time." },
      { order_index: 4, speaker_type: "M", text: "There is also a small ticket icon in the lower left corner." },
      { order_index: 5, speaker_type: "W", text: "Right, and the event is in the auditorium." },
      { order_index: 6, speaker_type: "M", text: "Good. The star border around the poster also looks nice." },
      { order_index: 7, speaker_type: "W", text: "Let's print it." },
    ],
    script_translation:
      "남: 와, 학교 영화의 밤 포스터가 거의 완성된 것 같아. 여: 응. 위쪽 큰 제목은 Friday Film Night야. 남: 가운데 큰 팝콘 통이 마음에 들어. 여: 옆 시계는 시작 시간인 7시 30분을 가리켜. 남: 왼쪽 아래에는 작은 티켓 아이콘도 있어. 여: 맞아, 그리고 장소는 강당이야. 남: 좋아. 별 테두리도 멋져. 여: 인쇄하자.",
    explanation:
      "대화에서는 행사 장소가 강당(auditorium)이라고 했지만, 그림에는 도서관(library)으로 표시되어 있어 불일치한다.",
    answer_clue: "the event is in the auditorium",
  },
  {
    title: "고1 듣기 19회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at this poster for the school music night." },
      { order_index: 1, speaker_type: "W", text: "It looks bright. The title is written in large letters across the top." },
      { order_index: 2, speaker_type: "M", text: "I like the guitar picture under the title, next to the microphone." },
      { order_index: 3, speaker_type: "W", text: "Me, too. And the date is printed on the left side." },
      { order_index: 4, speaker_type: "M", text: "It says the concert is on Friday, May 24, at 6 p.m." },
      { order_index: 5, speaker_type: "W", text: "Good. I also see three stars around the stage picture at the bottom." },
      { order_index: 6, speaker_type: "M", text: "And the ticket price is free for all students." },
      { order_index: 7, speaker_type: "W", text: "Perfect. We can print more copies." },
    ],
    script_translation:
      "남: 학교 음악의 밤 포스터를 봐. 여: 밝아 보여. 위쪽에 큰 글씨로 제목이 있어. 남: 제목 아래 기타와 마이크 그림이 마음에 들어. 여: 나도. 날짜는 왼쪽에 인쇄되어 있어. 남: 콘서트는 5월 24일 금요일 오후 6시야. 여: 좋아. 아래 무대 그림 주변에 별 세 개도 보여. 남: 그리고 티켓은 모든 학생에게 무료야. 여: 완벽해. 더 인쇄하자.",
    explanation:
      "대화에서는 티켓이 모든 학생에게 무료라고 했지만, 그림에는 5달러로 표시되어 있어 불일치한다.",
    answer_clue: "the ticket price is free for all students",
  },
];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function scriptFromSegments(segs: Seg[]): string {
  return segs.map((s) => `${s.speaker_type}: ${s.text}`).join("\n");
}

async function applyFix(fix: Fix) {
  const { data: set } = await admin
    .from("listening_sets")
    .select("id, title")
    .eq("academy_id", ACADEMY_ID)
    .eq("title", fix.title)
    .maybeSingle();
  if (!set) throw new Error(`set 없음: ${fix.title}`);

  const { data: q } = await admin
    .from("listening_questions")
    .select("id")
    .eq("set_id", set.id)
    .eq("order_index", 4)
    .maybeSingle();
  if (!q) throw new Error(`4번 없음: ${fix.title}`);

  const script_text = scriptFromSegments(fix.segments);

  await admin
    .from("listening_questions")
    .update({
      script_text,
      script_translation: fix.script_translation,
      explanation: fix.explanation,
      answer_clue: fix.answer_clue,
    })
    .eq("id", q.id);

  // segments 교체
  await admin
    .from("listening_question_segments")
    .delete()
    .eq("question_id", q.id);

  const { error: insErr } = await admin.from("listening_question_segments").insert(
    fix.segments.map((s) => ({
      question_id: q.id,
      order_index: s.order_index,
      speaker_type: s.speaker_type,
      text: s.text,
    }))
  );
  if (insErr) throw new Error(insErr.message);

  console.log(`→ ${fix.title} 대본 수정`);
  // 음원은 별도: ElevenLabs 키가 유효할 때만
  if (!process.argv.includes("--text-only")) {
    try {
      console.log(`  음원 생성…`);
      const audio = await generateQuestionAudio({
        setId: set.id as string,
        questionId: q.id as string,
        skipRepair: true,
      });
      console.log(`  audio ${audio.audioUrl.slice(0, 80)}`);

      const { data: allSets } = await admin
        .from("listening_sets")
        .select("id")
        .eq("title", fix.title)
        .neq("id", set.id);
      for (const s of allSets ?? []) {
        const { data: tq } = await admin
          .from("listening_questions")
          .select("id")
          .eq("set_id", s.id)
          .eq("order_index", 4)
          .maybeSingle();
        if (!tq) continue;
        await admin
          .from("listening_questions")
          .update({
            script_text,
            script_translation: fix.script_translation,
            explanation: fix.explanation,
            answer_clue: fix.answer_clue,
            audio_url: audio.audioUrl,
          })
          .eq("id", tq.id);
        await admin
          .from("listening_question_segments")
          .delete()
          .eq("question_id", tq.id);
        await admin.from("listening_question_segments").insert(
          fix.segments.map((seg) => ({
            question_id: tq.id,
            order_index: seg.order_index,
            speaker_type: seg.speaker_type,
            text: seg.text,
          }))
        );
      }
      return;
    } catch (e) {
      console.warn(
        `  음원 실패(대본은 저장됨):`,
        e instanceof Error ? e.message : e
      );
    }
  }

  // 텍스트만 / 음원 실패 시에도 다른 학원 대본 동기화
  const { data: allSets } = await admin
    .from("listening_sets")
    .select("id")
    .eq("title", fix.title)
    .neq("id", set.id);
  for (const s of allSets ?? []) {
    const { data: tq } = await admin
      .from("listening_questions")
      .select("id")
      .eq("set_id", s.id)
      .eq("order_index", 4)
      .maybeSingle();
    if (!tq) continue;
    await admin
      .from("listening_questions")
      .update({
        script_text,
        script_translation: fix.script_translation,
        explanation: fix.explanation,
        answer_clue: fix.answer_clue,
      })
      .eq("id", tq.id);
    await admin
      .from("listening_question_segments")
      .delete()
      .eq("question_id", tq.id);
    await admin.from("listening_question_segments").insert(
      fix.segments.map((seg) => ({
        question_id: tq.id,
        order_index: seg.order_index,
        speaker_type: seg.speaker_type,
        text: seg.text,
      }))
    );
  }
}

async function main() {
  for (const fix of FIXES) {
    await applyFix(fix);
  }
  console.log("완료: 대본 논리 수정 + 음원 재생성", FIXES.map((f) => f.title).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
