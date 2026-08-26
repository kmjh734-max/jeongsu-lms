/**
 * 고1 10번 표 선택: 정답 행 이름을 말하는 대본을 조건-배제형으로 재작성 + 음원 재생성
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-high1-type10-no-spoilers.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-high1-type10-no-spoilers.ts --dry-run
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-high1-type10-no-spoilers.ts --text-only
 *   npx --yes tsx --tsconfig tsconfig.json scripts/fix-high1-type10-no-spoilers.ts --only=3,8,15
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { generateQuestionAudio } from "../src/lib/listening/generate-audio";

function loadEnvLocal() {
  for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1]!.trim()] = m[2]!.trim().replace(/^['"]|['"]$/g, "");
  }
}
loadEnvLocal();

const ACADEMY = "79ea0a71-d148-46ac-8c8f-a3a3e4961838";
const dryRun = process.argv.includes("--dry-run");
const textOnly = process.argv.includes("--text-only");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlyRounds = onlyArg
  ? new Set(
      onlyArg
        .slice("--only=".length)
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => n > 0)
    )
  : null;

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type Row = { no: number; label: string; value: string };
type Seg = { order_index: number; speaker_type: "M" | "W"; text: string };

function normalize(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[①②③④⑤]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLabel(label: string): string {
  return String(label || "")
    .replace(/^[①②③④⑤]\s*/u, "")
    .replace(/^[A-E](?:\s*[:.)-]\s*|\s+)/i, "")
    .trim();
}

function letterForNo(no: number): string {
  return String.fromCharCode(64 + no); // 1→A
}

function detectSpoiler(opts: {
  script: string;
  correctNo: number;
  rows: Row[];
}): { spoiler: boolean; reasons: string[] } {
  const { script, correctNo, rows } = opts;
  const reasons: string[] = [];
  const scriptNorm = normalize(script);
  const correct = rows.find((r) => Number(r.no) === correctNo);
  if (!correct) return { spoiler: false, reasons: ["no correct row"] };

  const label = cleanLabel(correct.label);
  const labelNorm = normalize(label);
  if (labelNorm.length >= 3 && scriptNorm.includes(labelNorm)) {
    reasons.push(`names label "${label}"`);
  }

  const letter = letterForNo(correctNo);
  const letterRes = [
    new RegExp(`\\b(room|model|package|option|plan|tour|camp)\\s*${letter}\\b`, "i"),
    new RegExp(`\\b${letter}\\s*(room|model|package|option|plan)\\b`, "i"),
    new RegExp(`\\b(model|package|room|option)\\s+${letter}\\b`, "i"),
  ];
  for (const re of letterRes) {
    if (re.test(script)) {
      reasons.push(`names letter ${letter}`);
      break;
    }
  }

  // unique tokens from correct value (room numbers, program titles)
  const value = String(correct.value || "");
  const room = value.match(/\broom\s*(\d{2,4})\b/i);
  if (room && new RegExp(`\\broom\\s*${room[1]}\\b`, "i").test(script)) {
    reasons.push(`names room ${room[1]}`);
  }

  // first cell often is the option title (e.g. "Lake Park Tour / 13 km / ...")
  const firstCell = value.split(/\s*\/\s*/)[0]?.trim() || "";
  const firstNorm = normalize(firstCell);
  const looksLikeTitle =
    firstNorm.length >= 8 &&
    /[a-z]/.test(firstNorm) &&
    !/^(morning|afternoon|evening|\d)/.test(firstNorm) &&
    !/\$|dollar|won|km|kg|people|person|am|pm/.test(firstNorm) &&
    !/^\d{1,2}:\d{2}/.test(firstCell);
  if (looksLikeTitle && scriptNorm.includes(firstNorm)) {
    reasons.push(`names value-title "${firstCell}"`);
  }

  const chooseNearName =
    /\b(is the (best|only|right|perfect|suitable)|best choice|only suitable|let'?s (choose|pick|go with)|we (should|will) (choose|pick|book|order|reserve))\b/i.test(
      script
    ) &&
    labelNorm.length >= 3 &&
    scriptNorm.includes(labelNorm);
  if (chooseNearName && !reasons.length) {
    reasons.push("choose + correct label");
  }

  return { spoiler: reasons.length > 0, reasons };
}

async function chatJson(userPayload: unknown) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You rewrite Korean high-school English listening TYPE 10 (table selection) dialogues.

Return JSON ONLY:
{
  "segments": [{"speaker_type":"M"|"W","text":"..."}, ... 8~12 turns],
  "script_translation": "Korean paraphrase of the dialogue",
  "explanation": "Korean: which conditions eliminate which rows, why correct row remains",
  "answer_clue": "English short clue of the last distinguishing condition (NOT the option name)"
}

HARD RULES:
1) Keep the SAME correct answer row (mismatch_no). Table content is FIXED — do not invent new facts that contradict the table.
2) Speakers discuss REQUIREMENTS only (budget, capacity, features, time, etc.) in sequence.
3) NEVER say the correct row's label/name/title/letter (no "Pine Valley", "Game Coding", "Room B", "Package D", "model B").
4) You MAY briefly mention WRONG option names while eliminating them, but the FINAL decision must use deixis only: "that one", "the remaining option", "let's book it", "I'll reserve that one".
5) Do NOT restate a unique ID that only the correct row has (room number, exact program title) as the final pick phrase.
6) Natural M/W school-student dialogue, 100~150 words total.
7) After the last distinguishing condition, one speaker confirms and they agree to book/order THAT remaining option.`,
        },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as {
    segments: { speaker_type: "M" | "W"; text: string }[];
    script_translation: string;
    explanation: string;
    answer_clue: string;
  };
}

function scriptFromSegments(segs: Seg[]): string {
  return segs.map((s) => `${s.speaker_type}: ${s.text}`).join("\n");
}

function stillSpoilers(
  script: string,
  correctNo: number,
  rows: Row[]
): string[] {
  return detectSpoiler({ script, correctNo, rows }).reasons;
}

async function propagateToOtherAcademies(opts: {
  title: string;
  sourceSetId: string;
  orderIndex: number;
  script_text: string;
  script_translation: string;
  explanation: string;
  answer_clue: string;
  segments: Seg[];
  audio_url: string | null;
}) {
  const { data: allSets } = await admin
    .from("listening_sets")
    .select("id")
    .eq("title", opts.title)
    .neq("id", opts.sourceSetId);

  for (const s of allSets ?? []) {
    const { data: tq } = await admin
      .from("listening_questions")
      .select("id")
      .eq("set_id", s.id)
      .eq("order_index", opts.orderIndex)
      .maybeSingle();
    if (!tq) continue;

    const patch: Record<string, unknown> = {
      script_text: opts.script_text,
      script_translation: opts.script_translation,
      explanation: opts.explanation,
      answer_clue: opts.answer_clue,
    };
    if (opts.audio_url) patch.audio_url = opts.audio_url;

    await admin.from("listening_questions").update(patch).eq("id", tq.id);
    await admin
      .from("listening_question_segments")
      .delete()
      .eq("question_id", tq.id);
    await admin.from("listening_question_segments").insert(
      opts.segments.map((seg) => ({
        question_id: tq.id,
        order_index: seg.order_index,
        speaker_type: seg.speaker_type,
        text: seg.text,
      }))
    );
  }
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const { data: sets } = await admin
    .from("listening_sets")
    .select("id, title")
    .eq("academy_id", ACADEMY)
    .eq("grade_level", "high1")
    .ilike("title", "고1 듣기 %회");

  const sorted = (sets ?? [])
    .map((s) => ({
      id: s.id as string,
      title: s.title as string,
      n: Number(String(s.title).match(/(\d+)회/)?.[1] ?? 0),
    }))
    .filter((s) => s.n > 0)
    .filter((s) => !onlyRounds || onlyRounds.has(s.n))
    .sort((a, b) => a.n - b.n);

  const report: unknown[] = [];
  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const set of sorted) {
    const { data: q } = await admin
      .from("listening_questions")
      .select(
        "id, script_text, table_data, correct_answer, explanation, answer_clue, script_translation"
      )
      .eq("set_id", set.id)
      .eq("order_index", 10)
      .maybeSingle();

    if (!q) {
      console.log(`— ${set.title}: Q10 없음`);
      skipped += 1;
      continue;
    }

    const table = (q.table_data || {}) as {
      title?: string;
      rows?: Row[];
      mismatch_no?: number;
      mismatch_reason?: string;
    };
    const rows = Array.isArray(table.rows) ? table.rows : [];
    const correctNo = Number(table.mismatch_no || q.correct_answer);
    const det = detectSpoiler({
      script: String(q.script_text ?? ""),
      correctNo,
      rows,
    });

    if (!det.spoiler) {
      console.log(`✓ ${set.title}: OK`);
      skipped += 1;
      continue;
    }

    console.log(`✗ ${set.title}: ${det.reasons.join(", ")}`);

    try {
      const rewritten = await chatJson({
        title: set.title,
        table,
        correct_no: correctNo,
        correct_label: cleanLabel(
          rows.find((r) => Number(r.no) === correctNo)?.label ?? ""
        ),
        forbidden_names: [
          cleanLabel(
            rows.find((r) => Number(r.no) === correctNo)?.label ?? ""
          ),
          String(
            rows.find((r) => Number(r.no) === correctNo)?.value || ""
          )
            .split(/\s*\/\s*/)[0]
            ?.trim() || "",
        ].filter((t) => t.length >= 3),
        forbidden_letters: [letterForNo(correctNo)],
        forbidden_rooms: [
          String(
            rows.find((r) => Number(r.no) === correctNo)?.value || ""
          ).match(/\broom\s*(\d{2,4})\b/i)?.[1],
        ].filter(Boolean),
        note: "Wrong-row names may appear briefly while eliminating. Never utter forbidden_names / forbidden_letters / forbidden_rooms.",
        old_script: q.script_text,
        old_explanation: q.explanation,
      });

      const segs: Seg[] = (rewritten.segments || []).map((s, i) => ({
        order_index: i,
        speaker_type: s.speaker_type === "W" ? "W" : "M",
        text: String(s.text || "").trim(),
      }));
      if (segs.length < 6) throw new Error("too few segments");

      const script_text = scriptFromSegments(segs);
      const leftover = stillSpoilers(script_text, correctNo, rows);
      if (leftover.length) {
        // one retry with explicit leftover list
        const retry = await chatJson({
          title: set.title,
          table,
          correct_no: correctNo,
          retry: true,
          previous_attempt: script_text,
          still_spoilers: leftover,
          instruction:
            "Your previous draft still spoiled the answer. Rewrite again without those spoilers.",
        });
        const segs2: Seg[] = (retry.segments || []).map((s, i) => ({
          order_index: i,
          speaker_type: s.speaker_type === "W" ? "W" : "M",
          text: String(s.text || "").trim(),
        }));
        const script2 = scriptFromSegments(segs2);
        const leftover2 = stillSpoilers(script2, correctNo, rows);
        if (leftover2.length) {
          throw new Error(`still spoils after retry: ${leftover2.join(", ")}`);
        }
        Object.assign(rewritten, retry);
        segs.splice(0, segs.length, ...segs2);
      }

      const finalScript = scriptFromSegments(segs);
      report.push({
        title: set.title,
        reasons: det.reasons,
        before: String(q.script_text).slice(-180),
        after: finalScript.slice(-180),
      });

      if (dryRun) {
        console.log(`  [dry-run] would save ${segs.length} segments`);
        fixed += 1;
        continue;
      }

      await admin
        .from("listening_questions")
        .update({
          script_text: finalScript,
          script_translation: rewritten.script_translation,
          explanation: rewritten.explanation,
          answer_clue: rewritten.answer_clue,
        })
        .eq("id", q.id);

      await admin
        .from("listening_question_segments")
        .delete()
        .eq("question_id", q.id);
      await admin.from("listening_question_segments").insert(
        segs.map((seg) => ({
          question_id: q.id,
          order_index: seg.order_index,
          speaker_type: seg.speaker_type,
          text: seg.text,
        }))
      );

      let audioUrl: string | null = null;
      if (!textOnly) {
        console.log(`  음원 생성…`);
        const audio = await generateQuestionAudio({
          setId: set.id,
          questionId: q.id as string,
          skipRepair: true,
        });
        audioUrl = audio.audioUrl;
        console.log(`  audio ${audioUrl.slice(0, 72)}`);
      }

      await propagateToOtherAcademies({
        title: set.title,
        sourceSetId: set.id,
        orderIndex: 10,
        script_text: finalScript,
        script_translation: rewritten.script_translation,
        explanation: rewritten.explanation,
        answer_clue: rewritten.answer_clue,
        segments: segs,
        audio_url: audioUrl,
      });

      console.log(`  saved + synced`);
      fixed += 1;
    } catch (e) {
      failed += 1;
      console.error(`  FAIL:`, e instanceof Error ? e.message : e);
    }
  }

  writeFileSync(
    resolve("tmp/fix-high1-type10-report.json"),
    JSON.stringify({ fixed, skipped, failed, report }, null, 2)
  );
  console.log(
    `\n완료 fixed=${fixed} skipped=${skipped} failed=${failed} → tmp/fix-high1-type10-report.json`
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
