/**
 * 고1 3·4회 그림불일치 — 대본 기반 명시적 프롬프트 저장 후 이미지 생성
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

const CIRCLED = ["①", "②", "③", "④", "⑤"];

const SPECS: Record<
  string,
  { mismatch: string; answerIndex: number; prompt: string }
> = {
  "고1 듣기 3회": {
    mismatch: "②",
    answerIndex: 2,
    prompt: `School club fair poster, educational flat-color illustration, white background.
Draw ONE poster with ALL five large circled labels ① ② ③ ④ ⑤ clearly visible.

EXPLICIT layout:
- Label ①: large top title text exactly "Spring Club Fair"
- Label ② (MISMATCH — draw the WRONG date): under the title, date text exactly "April 21" (dialogue said April 12, so poster shows April 21)
- Label ③: LEFT side — two students playing guitars
- Label ④: CENTER — an information booth / info desk
- Label ⑤: BOTTOM-LEFT corner — a small QR code
- Also draw on the RIGHT (no number label): basketball club table with a basketball beside it

Flat colors OK. Large bold circled numbers ①–⑤ next to each labeled element.
VERIFY: ①②③④⑤ all present; date at ② reads April 21.`,
  },
  "고1 듣기 4회": {
    mismatch: "⑤",
    answerIndex: 5,
    prompt: `School festival poster, educational flat-color illustration, white background.
Draw ONE poster with ALL five large circled labels ① ② ③ ④ ⑤ clearly visible.

EXPLICIT layout:
- Label ①: large top title text exactly "Spring Harmony Festival"
- Label ②: two musical note icons beside the title
- Label ③: CENTER — one guitar placed between two standing microphones
- Label ④: BOTTOM box with date exactly "May 10", and under the box location text "Outdoor Stage"
- Label ⑤ (MISMATCH — draw the WRONG time): start time displayed as "6:00 p.m." (dialogue says it should be 5:00 p.m., so poster shows 6:00)

Flat colors OK. Large bold circled numbers ①–⑤ next to each labeled element.
VERIFY: ①②③④⑤ all present; time at ⑤ reads 6:00 p.m.`,
  },
};

async function main() {
  const admin = createAdminClient();
  const { data: academy } = await admin
    .from("academies")
    .select("id")
    .eq("slug", "jeongsu")
    .maybeSingle();
  if (!academy?.id) throw new Error("jeongsu 학원 없음");

  for (const title of Object.keys(SPECS)) {
    const spec = SPECS[title]!;
    const { data: set } = await admin
      .from("listening_sets")
      .select("id, title")
      .eq("academy_id", academy.id)
      .eq("title", title)
      .maybeSingle();
    if (!set) {
      console.error("✗ set 없음", title);
      continue;
    }

    const { data: q } = await admin
      .from("listening_questions")
      .select("id, script_text, explanation, answer_clue")
      .eq("set_id", set.id)
      .eq("order_index", 4)
      .maybeSingle();
    if (!q) {
      console.error("✗ 4번 없음", title);
      continue;
    }

    await admin
      .from("listening_questions")
      .update({
        choices: CIRCLED,
        correct_answer: spec.answerIndex,
        choice_image_prompts: [spec.prompt],
      })
      .eq("id", q.id);

    console.log(`→ ${title} 생성 (불일치 ${spec.mismatch})`);
    const result = await generateAndSaveChoiceImages({
      setId: set.id as string,
      questionId: q.id as string,
      prompts: [spec.prompt],
      compositeLabeledFigure: true,
      force: true,
      figureContext: {
        scriptText: String(q.script_text ?? ""),
        mismatchLabel: spec.mismatch,
        explanation: String(q.explanation ?? ""),
        answerClue: String(q.answer_clue ?? ""),
      },
    });
    console.log(`  ok ${result.urls[0]?.slice(0, 90)}`);
    await propagateChoiceImageUrls({
      sourceQuestionId: q.id as string,
      setTitle: title,
      orderIndex: 4,
    });
  }
  console.log("완료");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
