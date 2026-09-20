/**
 * 그림 불일치 7문항 손보기 (2026-09-21)
 * - 그림 설명을 사람이 직접 다시 씀: 글자·숫자·상표 금지, 라벨 ①–⑤ 한 번씩
 * - 흑백 그림으로 못 푸는 색 문제 2개는 대본을 모양 차이로 고치고 음성도 다시 만든다
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAndSaveChoiceImages } from "@/lib/listening/generate-choice-images";
import { generateQuestionAudio } from "@/lib/listening/generate-audio";

const RULES = [
  "Black-and-white line-art illustration for a printed Korean listening worksheet.",
  "Clean even black outlines on a plain white background. Shade only with thin hatching or dots. No colour, no photorealism, no grey wash.",
  "ABSOLUTELY NO writing of any kind inside the picture: no letters, no words, no numbers, no brand names, no company logos, no swoosh or tick marks, no trademarks.",
  "Posters, signs, calendars, price tags and timetables must be blank: draw only the frame and empty ruled boxes.",
  "The ONLY characters allowed anywhere are the five circled label marks ① ② ③ ④ ⑤.",
  "Draw each of ① ② ③ ④ ⑤ exactly once, large and clearly readable, right next to the object it marks, never overlapping another label or object.",
  "COUNT THEM BEFORE FINISHING: there must be five label circles in the picture, numbered ① ② ③ ④ ⑤. Never repeat a number, never leave ⑤ out, and never label an object that is not on the list.",
  "Wide landscape composition. Every object and every label is fully inside the frame, nothing cropped.",
  "",
].join(" ");

interface Fix {
  id: string;
  label: string;
  prompt: string;
  /** 대본까지 고치는 경우 */
  script?: {
    lines: Array<[string, string]>;
    clue: string;
    explanation: string;
    translation: string;
  };
}

const FIXES: Fix[] = [
  {
    id: "d1eec415-44da-46b8-86cc-16eee003a6e4",
    label: "고1 8회 4번",
    prompt:
      RULES +
      "A school study corner seen from the front. ① a large blank poster high on the back wall with a single round wall clock drawn in its centre (no numbers on the dial). ② three notebooks neatly stacked on the left shelf beside a window. ③ one study guide book standing upright on the centre desk, with a plain ribbon band across its lower cover. ④ a stack of flash cards right beside the pencil cup, drawn as ROUND cards, not rectangular ones. ⑤ two blank ruled sheets clipped to the notice board on the right (empty boxes only).",
  },
  {
    id: "9e263cdc-b6c7-4489-b09b-941a8f437c3d",
    label: "고2 2회 4번",
    prompt:
      RULES +
      "A street in front of a bus shelter on a rainy morning, seen from the side. ① a blank timetable board hanging under the shelter roof on the left — empty ruled boxes only, no writing at all. ② one closed umbrella leaning against the shelter post. ③ one bicycle parked at the kerb in the middle. ④ a taxi stopped on the right with a schoolgirl sitting in the back seat (plain car, no writing on the roof sign). ⑤ a pair of soaked sneakers on the ground in front, next to a backpack with a torn strap.",
  },
  {
    id: "37b1ede8-3eef-4019-896f-311cc5e10cea",
    label: "고2 3회 4번",
    prompt:
      RULES +
      "A sneaker shop display seen from the front. ① a tall blank poster on the back wall showing ONE simple five-pointed star inside a plain circle — this must NOT look like any sports brand mark, no swoosh, no tick, no curved comma shape. ② three pairs of running shoes lined up on the lower shelf at the left, facing the aisle. ③ a trophy standing on the centre display block, with laurel leaves on its bowl. ④ one pair of shoes on the middle shelf, drawn as HIGH-TOP basketball shoes that cover the ankle. ⑤ two blank paper tags clipped to a small stand on the right (no writing).",
  },
  {
    id: "8ea10192-2f16-4a01-b7bd-80b06c7388ef",
    label: "고2 5회 4번",
    prompt:
      RULES +
      "A bicycle-safety booth seen from the front. ① a tall blank poster at the back with a single bicycle helmet drawn in its centre. ② three reflective bands draped over the left edge of the table. ③ a trophy on the centre of the table with a bicycle shape on its base. ④ the object beside the wire basket on the right, drawn as an ordinary baseball cap, NOT a helmet. ⑤ two blank ruled sign-up sheets standing in a clip at the far right (empty boxes only).",
  },
  {
    id: "48eb7a91-e575-4fb6-ae42-13882bbfb725",
    label: "고2 6회 4번",
    prompt:
      RULES +
      "One corner of a dormitory room seen from the front. ① one medium suitcase pushed under the bed. ② three small pouches lined up on the floor beside the door. ③ a tall pile of textbooks on the centre table with a single star-shaped sticker on the top book. ④ a round laundry basket by the window, drawn completely EMPTY so the inside is visible. ⑤ two potted plants on the right shelf, one of them raised on a small stand.",
  },
  {
    id: "d9f68e5b-8a73-4d4f-8cbb-19cf6f95713b",
    label: "고2 8회 4번",
    prompt:
      RULES +
      "A study desk set up for exams, seen from the front. ① a large blank wall calendar — empty grid squares only, with three plain circles drawn in the top row and no numbers anywhere. ② three highlighter pens lined up beside the desk lamp. ③ a thick textbook in the centre with a plain patterned cover (no title, no letters) and one sheet of paper lying on it. ④ the notebook right beside the pencil case, drawn as a SPIRAL-BOUND notebook with coils along its edge. ⑤ two stacks of cards tied with a clip on the right.",
    script: {
      lines: [
        ["M", "You're arranging your study desk for the midterm, Hyejin. It already looks organized."],
        ["W", "Thanks, Junho. I want to find everything fast when I study."],
        ["M", "On the wall there's a large calendar. Three exam dates are circled at the top."],
        ["W", "Right, that shows when each test is. I also marked the heavy subjects."],
        ["M", "On the left I see three highlighters. They're lined up near the lamp."],
        ["W", "Those are for marking key points. I kept them apart from my pens."],
        ["M", "In the center the textbook looks thick. The formula sheet lies on it."],
        ["W", "Good, I'll use that book for problem practice. I wrote notes on the margins."],
        ["M", "By the pencil case, is that a spiral notebook? It looks plain."],
        ["W", "No, it's a hardcover planner with a ribbon marker. The stiff cover keeps it flat."],
        ["M", "On the right, two flashcard stacks are tied. A clip keeps them together."],
        ["W", "Great, then your study corner is set. I'll check on you before dinner."],
      ],
      clue: "No, it's a hardcover planner with a ribbon marker.",
      explanation:
        "여자가 필통 옆의 것이 스프링 공책이 아니라 끈이 달린 딱딱한 표지의 수첩이라고 바로잡는다. 그림에는 스프링 공책이 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      translation: [
        "M: 혜진아, 중간고사 대비로 책상을 정리하고 있구나. 벌써 깔끔해 보여.",
        "W: 고마워, 준호야. 공부할 때 물건을 빨리 찾고 싶어서.",
        "M: 벽에 큰 달력이 있네. 위쪽에 시험 날짜 세 개가 동그라미 쳐져 있어.",
        "W: 맞아, 언제 무슨 시험인지 보여 주는 거야. 부담되는 과목도 표시해 뒀어.",
        "M: 왼쪽에는 형광펜 세 자루가 보여. 스탠드 옆에 나란히 놓여 있네.",
        "W: 중요한 부분 표시할 때 쓰는 거야. 볼펜이랑 따로 두었어.",
        "M: 가운데 교과서는 두꺼워 보인다. 그 위에 공식 정리 종이가 놓여 있네.",
        "W: 응, 그 책으로 문제 연습을 할 거야. 여백에 필기도 해 뒀어.",
        "M: 필통 옆에 있는 건 스프링 공책이야? 밋밋해 보이는데.",
        "W: 아니야, 끈이 달린 딱딱한 표지 수첩이야. 표지가 단단해서 잘 펴져.",
        "M: 오른쪽에는 카드 뭉치 두 개가 묶여 있네. 집게로 고정해 뒀구나.",
        "W: 좋아, 그럼 네 공부 자리는 다 됐다. 저녁 전에 들러 볼게.",
      ].join("\n"),
    },
  },
  {
    id: "349a3704-f81e-4963-9beb-642c3844f5d6",
    label: "고3 2회 4번",
    prompt:
      RULES +
      "A bus shelter in the morning, seen from the side. ① a blank timetable board under the shelter roof — empty ruled boxes only, no writing or numbers at all. ② a wallet and a paper cup on the bench. ③ a backpack near the kerb with a pair of running shoes beside it. ④ the umbrella hanging on the pole, drawn CLOSED and tied with its strap. ⑤ one round clock hanging beside the pole, with hands only and no numbers on the dial.",
    script: {
      lines: [
        ["M", "You look rough this morning, Hyejin. Did you miss the bus again?"],
        ["W", "Yeah, I barely caught the next one. I had to run three blocks to the stop."],
        ["M", "At the shelter, there was a timetable. The early route was delayed by ten minutes."],
        ["W", "Right, so I waited under the shelter sign with everyone else."],
        ["M", "On the bench, I saw your leather wallet and a paper coffee cup with a sleeve."],
        ["W", "No, that coffee cup was mine; I bought it after I missed the first bus."],
        ["M", "Near the curb, there was a backpack. Your running shoes were next to it."],
        ["W", "Actually, I left my backpack at home today. The bag belonged to the elderly man."],
        ["M", "By the pole, someone hung an umbrella. It looked folded up from a distance."],
        ["W", "No, that umbrella was open and drying. I stepped back to grab it after the bus passed."],
        ["M", "There was also a round clock near the pole, so you could see how late it was."],
        ["W", "Okay, so between the delay and the crowd, I ended up an hour late to the meeting."],
      ],
      clue: "No, that umbrella was open and drying.",
      explanation:
        "여자가 기둥에 걸린 우산이 접혀 있던 것이 아니라 펼쳐서 말리던 것이라고 바로잡는다. 그림에는 접혀서 묶인 우산이 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      translation: [
        "M: 혜진아, 오늘 아침 많이 힘들어 보인다. 또 버스를 놓쳤어?",
        "W: 응, 다음 버스를 겨우 탔어. 정류장까지 세 블록을 뛰어야 했어.",
        "M: 정류장에 시간표가 있었지. 이른 노선이 10분 늦어졌더라.",
        "W: 맞아, 그래서 다른 사람들이랑 같이 정류장 표지판 아래에서 기다렸어.",
        "M: 벤치 위에 네 가죽 지갑이랑 종이컵이 보이던데.",
        "W: 아니야, 그 커피는 내 거였어. 첫 버스를 놓치고 나서 샀거든.",
        "M: 연석 근처에는 배낭이 하나 있었고, 네 운동화가 그 옆에 있었어.",
        "W: 사실 오늘은 배낭을 집에 두고 왔어. 그 가방은 그 할아버지 거였어.",
        "M: 기둥에는 누가 우산을 걸어 뒀더라. 멀리서 보니 접혀 있는 것 같던데.",
        "W: 아니야, 그 우산은 펼쳐서 말리던 거야. 버스가 지나간 뒤에 다시 가지러 갔어.",
        "M: 기둥 옆에 둥근 시계도 있어서 얼마나 늦었는지 볼 수 있었지.",
        "W: 응, 늦어진 데다 사람까지 많아서 결국 회의에 한 시간 늦었어.",
      ].join("\n"),
    },
  },
];

const admin = createAdminClient();

// 이름 일부를 인자로 주면 그 문항만 손본다 (예: node … "고2 3회")
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const todo = only.length ? FIXES.filter((f) => only.some((o) => f.label.includes(o))) : FIXES;

for (const f of todo) {
  const { data: q } = await admin
    .from("listening_questions")
    .select("id, set_id, order_index, correct_answer, script_text, explanation, answer_clue")
    .eq("id", f.id)
    .single();
  if (!q) {
    console.log(`${f.label}: 문항을 못 찾음`);
    continue;
  }

  if (f.script) {
    await admin.from("listening_question_segments").delete().eq("question_id", q.id);
    const rows = f.script.lines.map(([speaker, text], i) => ({
      question_id: q.id,
      order_index: i,
      speaker_type: speaker,
      text,
    }));
    const { error: segErr } = await admin.from("listening_question_segments").insert(rows);
    if (segErr) throw new Error(`${f.label} 대본 저장 실패: ${segErr.message}`);
    await admin
      .from("listening_questions")
      .update({
        script_text: f.script.lines.map(([s, t]) => `${s}: ${t}`).join("\n"),
        script_translation: f.script.translation,
        answer_clue: f.script.clue,
        explanation: f.script.explanation,
        audio_url: null,
      })
      .eq("id", q.id);
    console.log(`${f.label}: 대본 고침`);
  }

  await admin
    .from("listening_questions")
    .update({
      choice_image_prompts: [f.prompt],
      visual_choice_type: "picture_mismatch",
      needs_image_choices: true,
    })
    .eq("id", q.id);

  try {
    const made = await generateAndSaveChoiceImages({
      setId: q.set_id as string,
      questionId: q.id as string,
      prompts: [f.prompt],
      compositeLabeledFigure: true,
      promptAsIs: true,
      imageSize: "1536x1024",
      skipVerify: true,
      force: true,
      figureContext: {
        scriptText: f.script
          ? f.script.lines.map(([s, t]) => `${s}: ${t}`).join("\n")
          : String(q.script_text ?? ""),
        explanation: f.script?.explanation ?? String(q.explanation ?? ""),
        answerClue: f.script?.clue ?? String(q.answer_clue ?? ""),
      },
    });
    console.log(`${f.label}: 그림 ${made.generated}장 만듦${made.skipped ? " (건너뜀)" : ""}`);
  } catch (e) {
    console.log(`${f.label}: 그림 실패 — ${e instanceof Error ? e.message : e}`);
  }

  if (f.script) {
    try {
      await generateQuestionAudio({ setId: q.set_id as string, questionId: q.id as string });
      console.log(`${f.label}: 음성 다시 만듦`);
    } catch (e) {
      console.log(`${f.label}: 음성 실패 — ${e instanceof Error ? e.message : e}`);
    }
  }
}
console.log("== 끝 ==");
