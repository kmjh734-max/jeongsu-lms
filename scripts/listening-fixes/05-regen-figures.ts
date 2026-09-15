/**
 * 고1 그림 불일치(4번) 그림 다시 그리기 — 정답 라벨과 그림이 맞지 않던 7문항 (1·6·7·9·11·14·18회).
 *   - 1·18회: 같은 라벨이 두 번 (④④, ⑤⑤)
 *   - 6·7·9·11·14회: 정답이 아닌 라벨도 대화와 다르거나(시계·날짜), 라벨이 빠짐
 * 라벨마다 무엇을 그릴지 정해 두고, 검수(라벨마다 한 번씩·정답 라벨만 대화와 다름)를 통과한 그림만 저장한다.
 * 한쪽에 몰린 정답 라벨(⑤ 10/20)을 고르게 하려고 정답 라벨도 새로 정했다 (대본·음원은 그대로).
 *
 * 단계
 *   1) 미리보기:            npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/05-regen-figures.ts
 *   2) 정수학원만 새로 그림: ... 05-regen-figures.ts --apply [--only=1,6]   (유료: 문항당 최대 2번 그림)
 *      → 시도한 그림은 --out 폴더(기본: scripts/listening-fixes/backups/figures)에 저장되니 눈으로 확인
 *   3) 사본 6개 학원에 복사:  ... 05-regen-figures.ts --propagate --apply [--only=...]
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  APPLY,
  findTemplate,
  keyOf,
  loadAll,
  slugOf,
  updateQuestion,
  writeBackup,
  type Loaded,
  type Row,
} from "./lib";
import { generateAndSaveChoiceImages } from "../../src/lib/listening/generate-choice-images";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

type LabelPlan = { label: (typeof CIRCLED)[number]; draw: string; wrong?: boolean };

type FigureFix = {
  round: number;
  /** 새 정답(대화와 다르게 그릴) 라벨 */
  mismatch: (typeof CIRCLED)[number];
  plan: LabelPlan[];
  /** 라벨 없이 그릴 요소 */
  unlabeled: string[];
  explanation: string;
  answer_clue: string;
};

const FIXES: FigureFix[] = [
  {
    round: 1,
    mismatch: "②",
    unlabeled: [],
    plan: [
      { label: "①", draw: 'the big poster title "GREEN DAY" at the top' },
      { label: "②", draw: 'the date printed under the title, written exactly "June 25"', wrong: true },
      { label: "③", draw: "a bicycle icon on the left side of the poster" },
      { label: "④", draw: "three recycling bins at the bottom, each a different flat color (blue, green, yellow)" },
      { label: "⑤", draw: 'a text box at the bottom right written exactly "Ends at 3:00 p.m."' },
    ],
    explanation: "대화에서는 날짜가 6월 15일이라고 했지만, 그림에는 6월 25일로 표시되어 있어 불일치한다.",
    answer_clue: "the date is printed under it as June fifteenth",
  },
  {
    round: 6,
    mismatch: "①",
    unlabeled: ["a window on the right wall"],
    plan: [
      { label: "①", draw: 'the banner across the top of the booth, written exactly "ART FAIR"', wrong: true },
      { label: "②", draw: "a round analog wall clock showing exactly ten o'clock (hour hand on 10, minute hand straight up on 12)" },
      { label: "③", draw: "a small robot standing on the table on the left" },
      { label: "④", draw: "exactly three chairs in a row in front of the booth for visitors" },
      { label: "⑤", draw: "a green potted plant beside the window" },
    ],
    explanation: "대화에서는 위쪽 배너에 Science Fair라고 적혀 있다고 했지만, 그림에는 Art Fair로 적혀 있어 불일치한다.",
    answer_clue: "the banner at the top says Science Fair clearly",
  },
  {
    round: 7,
    mismatch: "③",
    // 나무 두 그루에 라벨 하나를 붙이면 라벨이 두 번 그려져(2회 모두 검수 실패) 제목에 라벨을 붙인다
    unlabeled: ["one tree on each side of the title"],
    plan: [
      { label: "①", draw: 'the large title "Green Day Festival" at the top' },
      { label: "②", draw: 'the date under the title, written exactly "June 12"' },
      { label: "③", draw: 'a sign board in the center written exactly "Plant Swap Booth / Opens at 2:00 / Gym"', wrong: true },
      { label: "④", draw: "a bicycle drawing in the lower left corner" },
      { label: "⑤", draw: "a single recycling bin in the lower right corner" },
    ],
    explanation: "대화에서는 식물 교환 부스가 3시에 열린다고 했지만, 그림에는 2시로 표시되어 있어 불일치한다.",
    answer_clue: "the plant swap booth opens at three in the gym",
  },
  {
    round: 9,
    mismatch: "①",
    unlabeled: ['the large title "School Music Night" at the top', "one guitar in the center"],
    plan: [
      { label: "①", draw: 'the date printed under the guitar, written exactly "June 28"', wrong: true },
      { label: "②", draw: "two microphones on stands, one on each side of the guitar" },
      { label: "③", draw: 'a small ticket booth with a "TICKETS" sign in the lower left corner' },
      { label: "④", draw: 'a text box in the lower right written exactly "Starts at 7:00 p.m."' },
      { label: "⑤", draw: "exactly three music notes near the upper right corner" },
    ],
    explanation: "대화에서는 날짜가 6월 18일이라고 했지만, 그림에는 6월 28일로 표시되어 있어 불일치한다.",
    answer_clue: "The date, June 18, is printed under the guitar.",
  },
  {
    round: 11,
    mismatch: "②",
    unlabeled: [],
    plan: [
      { label: "①", draw: 'the title "Lunchtime Music Show" written across the top' },
      { label: "②", draw: 'a small digital clock near the bottom displaying exactly "1:30"', wrong: true },
      { label: "③", draw: "one guitar in the center of the poster" },
      { label: "④", draw: "two students singing beside the guitar" },
      { label: "⑤", draw: "exactly three music notes in the upper right corner" },
    ],
    explanation: "대화에서는 시계가 12시 30분을 가리킨다고 했지만, 그림에는 1시 30분으로 표시되어 있어 불일치한다.",
    answer_clue: "There is also a small clock showing twelve thirty near the bottom.",
  },
  {
    round: 14,
    mismatch: "①",
    unlabeled: ['the title "Green Day Festival" at the top'],
    plan: [
      { label: "①", draw: 'the date written under the title, exactly "May 28"', wrong: true },
      { label: "②", draw: "a large tree in the center with exactly three birds sitting on its branches" },
      { label: "③", draw: "a lemonade booth on the left" },
      { label: "④", draw: "a table on the right with flowerpots on it" },
      { label: "⑤", draw: "two students watering plants near the bottom" },
    ],
    explanation: "대화에서는 날짜가 May 18이라고 했지만, 그림에는 May 28로 표시되어 있어 불일치한다.",
    answer_clue: "the date is May 18",
  },
  {
    round: 18,
    mismatch: "③",
    unlabeled: ['the title "Green School Day" at the top in large letters'],
    plan: [
      { label: "①", draw: "a tree logo right under the title" },
      { label: "②", draw: "exactly three recycling bins on the left side" },
      { label: "③", draw: 'a text line written exactly "Meeting Place: Gym"', wrong: true },
      { label: "④", draw: "students planting flowers together on the right side" },
      { label: "⑤", draw: 'a text line near the bottom written exactly "Friday, May 10"' },
    ],
    explanation: "대화에서는 모임 장소가 정문(main gate)이라고 했지만, 그림에는 체육관(gym)으로 표시되어 있어 불일치한다.",
    answer_clue: "the meeting place is the main gate",
  },
];

function argValue(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
}

const ONLY = (argValue("only") ?? "")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);
const OUT_DIR = resolve(argValue("out") ?? resolve(process.cwd(), "scripts", "listening-fixes", "backups", "figures"));
const PROPAGATE = process.argv.includes("--propagate");

function scenePrompt(fix: FigureFix, script: string): string {
  return `Korean high-school listening exam figure (그림 불일치). ONE flat, textbook-style poster illustration on a plain pure-white background — no glow, no vignette, no gradient, no dark edges. Spell every word correctly.
Exactly five large circled labels, each used ONCE: ①②③④⑤. Put each label right next to its element:
${fix.plan.map((p) => `${p.label} ${p.draw}${p.wrong ? "   <- the ONLY detail that differs from the dialogue" : ""}`).join("\n")}
${fix.unlabeled.length ? `Also draw (no label): ${fix.unlabeled.join("; ")}.` : ""}
Every labeled element except ${fix.mismatch} must match the dialogue exactly. Write all text exactly as quoted. No other numbers or text, no answer list.

Dialogue:
${script}`;
}

function titleOf(round: number): string {
  return `고1 듣기 ${round}회`;
}

async function regenerateTemplate(d: Loaded, fix: FigureFix): Promise<void> {
  const q = findTemplate(d, titleOf(fix.round), 4);
  if (!q) throw new Error(`${titleOf(fix.round)} 4번 없음`);
  const prompt = scenePrompt(fix, q.script_text);
  const newAnswer = CIRCLED.indexOf(fix.mismatch) + 1;
  console.log(`\n■ ${keyOf(d, q)}  정답 ${CIRCLED[q.correct_answer - 1]} → ${fix.mismatch}`);
  console.log(`    explanation: ${q.explanation}\n              → ${fix.explanation}`);
  console.log(`    answer_clue: ${String(q.answer_clue ?? "")} → ${fix.answer_clue}`);
  if (!APPLY) {
    console.log(`    그림 계획:\n${fix.plan.map((p) => `      ${p.label} ${p.draw}${p.wrong ? "  (정답: 대화와 다름)" : ""}`).join("\n")}`);
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const backup = writeBackup(`05-regen-figure-${fix.round}-jeongsu`, d, [q]);
  console.log(`    백업: ${backup}`);
  try {
    const result = await generateAndSaveChoiceImages({
      setId: q.set_id,
      questionId: q.id,
      prompts: [prompt],
      compositeLabeledFigure: true,
      force: true,
      // 소유자가 승인한 한도: 문항당 최대 2번 그림 (--max-tries=1 이면 이번 실행은 1번만)
      maxLabelRetries: Math.min(2, Math.max(1, Number(argValue("max-tries") ?? 2))) - 1,
      figureContext: {
        scriptText: q.script_text,
        mismatchLabel: fix.mismatch,
        explanation: fix.explanation,
        answerClue: fix.answer_clue,
      },
      onAttempt: ({ attempt, check, bytes }) => {
        const file = resolve(OUT_DIR, `fig${fix.round}-try${attempt}-${check.ok ? "ok" : "fail"}.png`);
        writeFileSync(file, bytes);
        console.log(`    시도 ${attempt}: ${check.ok ? "검수 통과" : `검수 실패 — ${check.problems.join(", ")}`}  (${file})`);
        for (const l of check.labels) {
          console.log(`      ${l.label} x${l.count} ${l.matchesDialogue ? "일치" : "불일치"}: ${l.drawn}`);
        }
      },
    });
    await updateQuestion(q.id, {
      correct_answer: newAnswer,
      explanation: fix.explanation,
      answer_clue: fix.answer_clue,
      choice_image_prompts: [prompt],
    });
    console.log(`    저장: ${result.urls[0]}`);
  } catch (e) {
    console.log(`    ✗ 저장 안 함: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** 원본의 새 그림·정답·해설을 사본 6개 학원에 복사 (대본이 원본과 같은 사본만) */
async function propagate(d: Loaded, fix: FigureFix): Promise<void> {
  const q = findTemplate(d, titleOf(fix.round), 4);
  if (!q) throw new Error(`${titleOf(fix.round)} 4번 없음`);
  const url = (q.choice_image_urls as string[] | undefined)?.[0] ?? "";
  if (!/choice-1-\d+\.png/.test(url) || q.correct_answer !== CIRCLED.indexOf(fix.mismatch) + 1) {
    console.log(`\n■ ${keyOf(d, q)}: 원본에 새 그림이 아직 없음 — 건너뜀`);
    return;
  }
  const segSig = (row: Row) =>
    JSON.stringify((d.segmentsByQuestion.get(row.id) ?? []).map((s) => `${s.speaker_type}:${s.text}`));
  const copies = d.questions.filter(
    (r) =>
      r.id !== q.id &&
      r.order_index === 4 &&
      d.setById.get(r.set_id)?.title === titleOf(fix.round) &&
      slugOf(d, r) !== "jeongsu"
  );
  const same = copies.filter(
    (r) =>
      r.script_text === q.script_text &&
      r.instruction === q.instruction &&
      JSON.stringify(r.choices) === JSON.stringify(q.choices) &&
      segSig(r) === segSig(q)
  );
  const patch = {
    choice_image_urls: q.choice_image_urls,
    choice_image_prompts: q.choice_image_prompts,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    answer_clue: q.answer_clue,
  };
  const todo = same.filter((r) => JSON.stringify(r.choice_image_urls) !== JSON.stringify(q.choice_image_urls));
  console.log(`\n■ ${keyOf(d, q)} → 사본 ${todo.length}개 (${todo.map((r) => slugOf(d, r)).join(", ")})`);
  const skipped = copies.filter((r) => !same.includes(r));
  if (skipped.length) console.log(`    ⚠ 대본이 달라 건너뜀: ${skipped.map((r) => slugOf(d, r)).join(", ")}`);
  if (!APPLY || todo.length === 0) return;
  const backup = writeBackup(`05-regen-figure-${fix.round}-copies`, d, todo);
  console.log(`    백업: ${backup}`);
  for (const r of todo) await updateQuestion(r.id, patch);
  console.log(`    저장 완료 ${todo.length}행`);
}

async function main() {
  const d = await loadAll({ gradeLevels: ["high1"] });
  const fixes = FIXES.filter((f) => ONLY.length === 0 || ONLY.includes(f.round));
  for (const fix of fixes) {
    if (PROPAGATE) await propagate(d, fix);
    else await regenerateTemplate(d, fix);
  }
  if (!APPLY) console.log("\n(미리보기만 했습니다. 실행하려면 --apply 를 붙이세요. 그림 생성은 유료입니다.)");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
