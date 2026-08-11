/**
 * 고1 5~20회 그림불일치: 대본 논리 수정(+음원) 후 이미지 force 재생성
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-regen-high1-type4-5-20.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-regen-high1-type4-5-20.ts --images-only
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-regen-high1-type4-5-20.ts --scripts-only
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { generateQuestionAudio } from "../src/lib/listening/generate-audio";
import {
  generateAndSaveChoiceImages,
  propagateChoiceImageUrls,
  resolveMismatchLabel,
} from "../src/lib/listening/generate-choice-images";

function loadEnvLocal() {
  for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1]!.trim()] = m[2]!.trim().replace(/^['"]|['"]$/g, "");
  }
}
loadEnvLocal();

const ACADEMY = "79ea0a71-d148-46ac-8c8f-a3a3e4961838";
const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

type Seg = { order_index: number; speaker_type: "M" | "W"; text: string };
type Fix = {
  title: string;
  segments: Seg[];
  script_translation: string;
  explanation: string;
  answer_clue: string;
  /** 그림에 그릴 틀린 디테일 (프롬프트용) */
  mismatchDraw: string;
};

const FIXES: Fix[] = [
  {
    title: "고1 듣기 5회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at the poster for our school music night, Sora." },
      { order_index: 1, speaker_type: "W", text: "It looks nice. The title is written at the top in large letters." },
      { order_index: 2, speaker_type: "M", text: "Yes, and the date is shown as June fifteenth under the title." },
      { order_index: 3, speaker_type: "W", text: "I also see a guitar on the left side of the poster." },
      { order_index: 4, speaker_type: "M", text: "Right. The piano is on the right side, near the bottom." },
      { order_index: 5, speaker_type: "W", text: "There are three stars above the title, which makes it cheerful." },
      { order_index: 6, speaker_type: "M", text: "And the ticket price is written as five dollars in the lower center." },
      { order_index: 7, speaker_type: "W", text: "Great. This poster has all the information students need." },
    ],
    script_translation:
      "남: 학교 음악의 밤 포스터를 봐, 소라. 여: 멋져. 위쪽에 큰 제목이 있어. 남: 제목 아래 날짜는 6월 15일이야. 여: 왼쪽에는 기타도 보여. 남: 맞아. 피아노는 오른쪽 아래에 있어. 여: 제목 위 별 세 개도 밝아. 남: 아래 가운데 티켓은 5달러야. 여: 좋아. 필요한 정보가 다 있어.",
    explanation:
      "대화에서는 피아노가 오른쪽 아래에 있다고 했지만, 그림에는 왼쪽 아래에 있어 불일치한다.",
    answer_clue: "the piano is on the right side, near the bottom",
    mismatchDraw: "⑤ piano drawn on the LEFT bottom (dialogue says RIGHT bottom)",
  },
  {
    title: "고1 듣기 6회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at the poster draft for our club's science fair booth." },
      { order_index: 1, speaker_type: "W", text: "It looks good, and the banner at the top says Science Fair clearly." },
      { order_index: 2, speaker_type: "M", text: "I also placed a round clock showing ten o'clock on the wall." },
      { order_index: 3, speaker_type: "W", text: "Great, and the small robot is standing on the left table." },
      { order_index: 4, speaker_type: "M", text: "There are three chairs in front for visitors waiting." },
      { order_index: 5, speaker_type: "W", text: "Yes, three chairs will make the booth look welcoming." },
      { order_index: 6, speaker_type: "M", text: "Finally, I added a green plant beside the window." },
      { order_index: 7, speaker_type: "W", text: "Perfect. Let's print this version." },
    ],
    script_translation:
      "남: 우리 동아리 과학 박람회 부스 포스터 초안을 봐. 여: 좋아. 위 배너에 Science Fair가 잘 보여. 남: 벽에 10시를 가리키는 둥근 시계도 넣었어. 여: 왼쪽 테이블에 작은 로봇도 있어. 남: 앞에는 방문객용 의자 세 개가 있어. 여: 세 개면 환영하는 느낌이 나. 남: 창가에 초록 식물도 추가했어. 여: 완벽해. 이 버전으로 인쇄하자.",
    explanation:
      "대화에서는 의자가 세 개라고 했지만, 그림에는 두 개만 있어 불일치한다.",
    answer_clue: "there are three chairs in front for visitors waiting",
    mismatchDraw: "④ only TWO chairs in front (dialogue says three)",
  },
  {
    title: "고1 듣기 7회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Is this the poster for the school eco fair?" },
      { order_index: 1, speaker_type: "W", text: "Yes. At the top, there is a large title, Green Day Festival." },
      { order_index: 2, speaker_type: "M", text: "I see two trees on both sides of the title." },
      { order_index: 3, speaker_type: "W", text: "Good. Under the title, the date is written as June 12." },
      { order_index: 4, speaker_type: "M", text: "There is also a bicycle drawing in the lower left corner." },
      { order_index: 5, speaker_type: "W", text: "Right, and a recycling bin is in the lower right corner." },
      { order_index: 6, speaker_type: "M", text: "What about the booth information in the center?" },
      { order_index: 7, speaker_type: "W", text: "It says the plant swap booth opens at three in the gym." },
    ],
    script_translation:
      "남: 이게 학교 에코 페어 포스터야? 여: 응. 위쪽에 Green Day Festival 큰 제목이 있어. 남: 제목 양쪽에 나무 두 그루가 보여. 여: 좋아. 제목 아래 날짜는 6월 12일이야. 남: 왼쪽 아래에는 자전거 그림도 있어. 여: 맞아, 오른쪽 아래에는 재활용 쓰레기통이 있어. 남: 가운데 부스 정보는? 여: 식물 교환 부스가 체육관에서 3시에 열린다고 되어 있어.",
    explanation:
      "대화에서는 식물 교환 부스가 3시에 열린다고 했지만, 그림에는 2시로 표시되어 있어 불일치한다.",
    answer_clue: "the plant swap booth opens at three in the gym",
    mismatchDraw: "① plant swap booth time shown as 2:00 (dialogue says 3:00)",
  },
  {
    title: "고1 듣기 10회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at this poster for the school art festival, Mina." },
      { order_index: 1, speaker_type: "W", text: "It looks nice. The title is written at the top in big letters." },
      { order_index: 2, speaker_type: "M", text: "Yes, and there is a paintbrush crossing a palette in the center." },
      { order_index: 3, speaker_type: "W", text: "I also see three stars above the palette, which feels cheerful." },
      { order_index: 4, speaker_type: "M", text: "The date, May tenth, is printed under the picture." },
      { order_index: 5, speaker_type: "W", text: "Great. The festival starts at nine in the morning." },
      { order_index: 6, speaker_type: "M", text: "Yes, nine. That matches our schedule." },
      { order_index: 7, speaker_type: "W", text: "Right. The small school logo at the bottom looks fine." },
    ],
    script_translation:
      "남: 학교 미술 축제 포스터를 봐, 미나. 여: 멋져. 위쪽에 큰 제목이 있어. 남: 가운데 팔레트와 교차하는 붓도 있어. 여: 팔레트 위 별 세 개도 밝아. 남: 그림 아래 날짜는 5월 10일이야. 여: 좋아. 축제는 오전 9시에 시작해. 남: 맞아, 9시. 일정과 같아. 여: 아래 작은 학교 로고도 괜찮아.",
    explanation:
      "대화에서는 시작 시간이 9시라고 했지만, 그림에는 10시로 표시되어 있어 불일치한다.",
    answer_clue: "the festival starts at nine in the morning",
    mismatchDraw: "② start time shown as 10:00 (dialogue says 9:00)",
  },
  {
    title: "고1 듣기 11회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at the poster for our lunchtime music show." },
      { order_index: 1, speaker_type: "W", text: "It looks cheerful. The title is written across the top." },
      { order_index: 2, speaker_type: "M", text: "Yes, and a guitar is placed in the center of the poster." },
      { order_index: 3, speaker_type: "W", text: "I see two students singing beside the guitar, which fits the show." },
      { order_index: 4, speaker_type: "M", text: "There is also a small clock showing twelve thirty near the bottom." },
      { order_index: 5, speaker_type: "W", text: "Good. There are three music notes in the upper right corner." },
      { order_index: 6, speaker_type: "M", text: "Yes, three notes in the upper right. That looks complete." },
      { order_index: 7, speaker_type: "W", text: "Then everything is ready for printing." },
    ],
    script_translation:
      "남: 점심시간 음악 쇼 포스터를 봐. 여: 밝아. 위쪽에 제목이 있어. 남: 가운데에 기타가 있어. 여: 기타 옆에서 학생 두 명이 노래하고 있어. 남: 아래쪽에는 12시 30분을 가리키는 작은 시계도 있어. 여: 좋아. 오른쪽 위 모서리에 음표 세 개가 있어. 남: 맞아, 오른쪽 위 음표 세 개. 완성됐어. 여: 그럼 인쇄할 준비가 됐어.",
    explanation:
      "대화에서는 음표 세 개가 오른쪽 위 모서리에 있다고 했지만, 그림에는 다른 위치(또는 개수)로 표시되어 있어 불일치한다.",
    answer_clue: "there are three music notes in the upper right corner",
    mismatchDraw: "① music notes NOT in upper right (wrong corner or wrong count)",
  },
  {
    title: "고1 듣기 14회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at this poster for the school garden festival." },
      { order_index: 1, speaker_type: "W", text: "It looks almost ready. The title at the top says Green Day Festival." },
      { order_index: 2, speaker_type: "M", text: "Good. I also see a large tree in the center." },
      { order_index: 3, speaker_type: "W", text: "Yes, and there are three birds sitting on its branches." },
      { order_index: 4, speaker_type: "M", text: "The booth on the left is selling lemonade." },
      { order_index: 5, speaker_type: "W", text: "Right. The table on the right has flowerpots for the planting activity." },
      { order_index: 6, speaker_type: "M", text: "I like the two students watering plants near the bottom." },
      { order_index: 7, speaker_type: "W", text: "Me, too. And the date is May 18." },
    ],
    script_translation:
      "남: 학교 정원 축제 포스터를 봐. 여: 거의 완성됐어. 위 제목은 Green Day Festival이야. 남: 가운데 큰 나무도 보여. 여: 나뭇가지에 새 세 마리도 앉아 있어. 남: 왼쪽 부스는 레모네이드를 팔아. 여: 맞아. 오른쪽 테이블에는 심기 활동용 화분이 있어. 남: 아래에서 물 주는 학생 두 명이 마음에 들어. 여: 나도. 그리고 날짜는 5월 18일이야.",
    explanation:
      "대화에서는 날짜가 May 18이라고 했지만, 그림에는 May 28로 표시되어 있어 불일치한다.",
    answer_clue: "the date is May 18",
    mismatchDraw: "① date text exactly May 28 (dialogue says May 18)",
  },
  {
    title: "고1 듣기 16회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at the poster for our school art market." },
      { order_index: 1, speaker_type: "W", text: "It looks nice. The title is inside a large paint palette at the top." },
      { order_index: 2, speaker_type: "M", text: "Yes, and the date, June 12, is written under the title." },
      { order_index: 3, speaker_type: "W", text: "I also see three small booths lined up across the center." },
      { order_index: 4, speaker_type: "M", text: "The student holding a brush is standing on the left side." },
      { order_index: 5, speaker_type: "W", text: "Right. The donation box is placed beside the rightmost booth." },
      { order_index: 6, speaker_type: "M", text: "And there are two star-shaped balloons in the upper right corner." },
      { order_index: 7, speaker_type: "W", text: "Perfect. This poster clearly shows the main features of the event." },
    ],
    script_translation:
      "남: 학교 아트 마켓 포스터를 봐. 여: 멋져. 위쪽 큰 팔레트 안에 제목이 있어. 남: 제목 아래 날짜는 6월 12일이야. 여: 가운데 작은 부스 세 개도 보여. 남: 붓을 든 학생은 왼쪽에 서 있어. 여: 맞아. 기부 상자는 가장 오른쪽 부스 옆에 있어. 남: 오른쪽 위에는 별 모양 풍선 두 개도 있어. 여: 완벽해. 행사 특징이 잘 보여.",
    explanation:
      "대화에서는 기부 상자가 가장 오른쪽 부스 옆에 있다고 했지만, 그림에는 다른 위치에 있어 불일치한다.",
    answer_clue: "the donation box is placed beside the rightmost booth",
    mismatchDraw: "⑤ donation box NOT beside the rightmost booth",
  },
  {
    title: "고1 듣기 18회",
    segments: [
      { order_index: 0, speaker_type: "M", text: "Look at the poster for our Green School Day." },
      { order_index: 1, speaker_type: "W", text: "It looks nice. The title is at the top in large letters." },
      { order_index: 2, speaker_type: "M", text: "Yes, and there is a tree logo under the title." },
      { order_index: 3, speaker_type: "W", text: "I also see three recycling bins on the left side." },
      { order_index: 4, speaker_type: "M", text: "On the right, the poster shows students planting flowers together." },
      { order_index: 5, speaker_type: "W", text: "Good. The date says Friday, May tenth, near the bottom." },
      { order_index: 6, speaker_type: "M", text: "And the meeting place is the main gate." },
      { order_index: 7, speaker_type: "W", text: "Then the poster is ready for printing." },
    ],
    script_translation:
      "남: Green School Day 포스터를 봐. 여: 멋져. 위쪽에 큰 제목이 있어. 남: 제목 아래 나무 로고도 있어. 여: 왼쪽에는 재활용 쓰레기통 세 개가 보여. 남: 오른쪽에는 꽃을 심는 학생들이 있어. 여: 좋아. 아래쪽 날짜는 5월 10일 금요일이야. 남: 그리고 모임 장소는 정문이야. 여: 그럼 인쇄할 준비가 됐어.",
    explanation:
      "대화에서는 모임 장소가 정문(main gate)이라고 했지만, 그림에는 체육관(gym)으로 표시되어 있어 불일치한다.",
    answer_clue: "the meeting place is the main gate",
    mismatchDraw: "③ meeting place text shows GYM (dialogue says main gate)",
  },
];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function scriptFrom(segs: Seg[]) {
  return segs.map((s) => `${s.speaker_type}: ${s.text}`).join("\n");
}

async function applyScriptFix(fix: Fix) {
  const { data: set } = await admin
    .from("listening_sets")
    .select("id")
    .eq("academy_id", ACADEMY)
    .eq("title", fix.title)
    .maybeSingle();
  if (!set) throw new Error(`set 없음 ${fix.title}`);

  const { data: q } = await admin
    .from("listening_questions")
    .select("id")
    .eq("set_id", set.id)
    .eq("order_index", 4)
    .maybeSingle();
  if (!q) throw new Error(`Q4 없음 ${fix.title}`);

  const script_text = scriptFrom(fix.segments);
  await admin
    .from("listening_questions")
    .update({
      script_text,
      script_translation: fix.script_translation,
      explanation: fix.explanation,
      answer_clue: fix.answer_clue,
    })
    .eq("id", q.id);

  await admin.from("listening_question_segments").delete().eq("question_id", q.id);
  await admin.from("listening_question_segments").insert(
    fix.segments.map((s) => ({
      question_id: q.id,
      order_index: s.order_index,
      speaker_type: s.speaker_type,
      text: s.text,
    }))
  );

  let audioUrl: string | null = null;
  if (!process.argv.includes("--no-audio")) {
    try {
      console.log(`  음원…`);
      const audio = await generateQuestionAudio({
        setId: set.id,
        questionId: q.id,
        skipRepair: true,
      });
      audioUrl = audio.audioUrl;
      console.log(`  audio ok`);
    } catch (e) {
      console.warn(`  음원 실패:`, e instanceof Error ? e.message : e);
    }
  }

  const { data: allSets } = await admin
    .from("listening_sets")
    .select("id")
    .eq("title", fix.title);
  for (const s of allSets ?? []) {
    const patch: Record<string, unknown> = {
      script_text,
      script_translation: fix.script_translation,
      explanation: fix.explanation,
      answer_clue: fix.answer_clue,
    };
    if (audioUrl) patch.audio_url = audioUrl;
    await admin
      .from("listening_questions")
      .update(patch)
      .eq("set_id", s.id)
      .eq("order_index", 4);

    const { data: tq } = await admin
      .from("listening_questions")
      .select("id")
      .eq("set_id", s.id)
      .eq("order_index", 4)
      .maybeSingle();
    if (!tq) continue;
    await admin.from("listening_question_segments").delete().eq("question_id", tq.id);
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

async function regenImages5to20() {
  const fixByTitle = new Map(FIXES.map((f) => [f.title, f]));
  const { data: sets } = await admin
    .from("listening_sets")
    .select("id, title")
    .eq("academy_id", ACADEMY)
    .ilike("title", "고1 듣기 %회");

  const target = (sets ?? [])
    .map((s) => ({
      id: s.id as string,
      title: s.title as string,
      n: Number(String(s.title).match(/(\d+)회/)?.[1] ?? 0),
    }))
    .filter((s) => s.n >= 5 && s.n <= 20)
    .sort((a, b) => a.n - b.n);

  let ok = 0;
  let failed = 0;

  for (const set of target) {
    const { data: qs } = await admin
      .from("listening_questions")
      .select(
        "id, choices, correct_answer, script_text, explanation, answer_clue"
      )
      .eq("set_id", set.id)
      .eq("order_index", 4)
      .maybeSingle();
    if (!qs) {
      console.error(`✗ ${set.title}: Q4 없음`);
      failed += 1;
      continue;
    }

    const mismatch =
      resolveMismatchLabel(qs.choices as string[], qs.correct_answer as number) ??
      "⑤";
    const answerIndex =
      CIRCLED.indexOf(mismatch as (typeof CIRCLED)[number]) + 1 || 5;
    const fix = fixByTitle.get(set.title);
    const clue = String(qs.answer_clue ?? qs.explanation ?? "");
    const script = String(qs.script_text ?? "");

    const prompts = [
      `Educational listening-exam poster illustration with ALL five circled labels ①–⑤.
Dialogue (CORRECT facts only — draw matching details for all labels EXCEPT the mismatch):
${script}

Mismatch label ${mismatch}: draw the WRONG detail here.
${fix?.mismatchDraw ?? clue}

Rules: other labels must match the dialogue; ONLY ${mismatch} mismatches.
Flat vector textbook style, white background, colors OK when mentioned.
VERIFY: ①②③④⑤ all present and readable.`,
    ];

    await admin
      .from("listening_questions")
      .update({
        choices: [...CIRCLED],
        correct_answer: answerIndex,
        choice_image_prompts: prompts,
      })
      .eq("id", qs.id);

    try {
      console.log(`→ ${set.title} 그림 생성 (불일치 ${mismatch})…`);
      const result = await generateAndSaveChoiceImages({
        setId: set.id,
        questionId: qs.id as string,
        prompts,
        compositeLabeledFigure: true,
        figureContext: {
          scriptText: script,
          mismatchLabel: mismatch,
          explanation: String(qs.explanation ?? ""),
          answerClue: clue,
        },
        force: true,
      });
      console.log(`  ok ${result.urls[0]?.slice(0, 80)}`);
      const copied = await propagateChoiceImageUrls({
        sourceQuestionId: qs.id as string,
        setTitle: set.title,
        orderIndex: 4,
      });
      if (copied > 0) console.log(`  복사 ${copied}`);
      ok += 1;
    } catch (e) {
      failed += 1;
      console.error(`✗ ${set.title}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`그림 완료: 성공 ${ok} · 실패 ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

async function main() {
  const imagesOnly = process.argv.includes("--images-only");
  const scriptsOnly = process.argv.includes("--scripts-only");

  if (!imagesOnly) {
    for (const fix of FIXES) {
      console.log(`→ ${fix.title} 대본 수정`);
      await applyScriptFix(fix);
    }
  }
  if (!scriptsOnly) {
    await regenImages5to20();
  }
  console.log("전체 완료");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
