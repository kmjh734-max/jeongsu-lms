/**
 * 중등(middle1~3) 듣기 지문·문항 전수 품질 검수 (규칙 기반, AI 없음)
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/audit-middle-listening.ts
 *   npx --yes tsx --tsconfig tsconfig.json scripts/audit-middle-listening.ts --grade=middle2
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { getExamTypeById } from "../src/lib/listening/exam-types";
import {
  gradeLevelShort,
  type ListeningGradeLevel,
} from "../src/lib/listening/grade-level";
import { QUALITY_PASS_THRESHOLD } from "../src/lib/listening/prompts/qualityCheckPrompt";
import { checkListeningQuestionQuality } from "../src/lib/listening/quality-check";
import type {
  GeneratedListeningQuestion,
  ListeningScriptSegment,
} from "../src/lib/listening/types";

function loadEnvLocal() {
  for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1]!.trim()] = m[2]!.trim().replace(/^['"]|['"]$/g, "");
  }
}
loadEnvLocal();

const ACADEMY = "79ea0a71-d148-46ac-8c8f-a3a3e4961838";
const gradesArg = process.argv.find((a) => a.startsWith("--grade="));
const grades: ListeningGradeLevel[] = gradesArg
  ? [gradesArg.slice("--grade=".length) as ListeningGradeLevel]
  : ["middle1", "middle2", "middle3"];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function roundOf(title: string): number {
  const m = String(title).match(/(\d+)\s*회/);
  return m ? Number(m[1]) : 999;
}

function normalize(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLabel(s: string): string {
  return normalize(s).replace(/[^a-z0-9\s가-힣]/g, " ").replace(/\s+/g, " ").trim();
}

/** 10번·14번: 대본이 정답 라벨/행을 직접 밝히는지 */
function checkSpoilerInScript(
  orderIndex: number,
  script: string,
  choices: string[],
  correctAnswer: number,
  tableData: unknown
): string | null {
  const scriptNorm = normalizeLabel(script);
  if (!scriptNorm) return null;

  if (orderIndex === 10) {
    const main = choices[correctAnswer - 1]?.trim() ?? "";
    const mainNorm = normalizeLabel(main);
    if (mainNorm.length >= 4 && scriptNorm.includes(mainNorm)) {
      return `10번: 대본에 정답 핵심내용("${main.slice(0, 40)}…")이 그대로 노출됨`;
    }
  }

  if (orderIndex === 14 && tableData && typeof tableData === "object") {
    const table = tableData as {
      rows?: { no: number; label: string }[];
      mismatch_no?: number;
    };
    const rows = table.rows ?? [];
    const correctNo = Number(table.mismatch_no ?? correctAnswer);
    const correctRow = rows.find((r) => Number(r.no) === correctNo);
    const label = correctRow?.label?.trim() ?? "";
    const labelNorm = normalizeLabel(label);
    if (labelNorm.length >= 3 && scriptNorm.includes(labelNorm)) {
      return `14번: 대본에 불일치 행 라벨("${label}")이 직접 언급됨`;
    }
  }

  if (orderIndex === 13) {
    const place = choices[correctAnswer - 1]?.trim() ?? "";
    const placeNorm = normalizeLabel(place);
    if (placeNorm.length >= 3 && scriptNorm.includes(placeNorm)) {
      return `13번: 대본에 정답 장소("${place}")가 직접 언급됨`;
    }
  }

  if (orderIndex === 18) {
    const job = choices[correctAnswer - 1]?.trim() ?? "";
    const jobNorm = normalizeLabel(job);
    if (jobNorm.length >= 2 && scriptNorm.includes(jobNorm)) {
      return `18번: 대본에 정답 직업("${job}")이 직접 언급됨`;
    }
  }

  return null;
}

type DbQuestion = Record<string, unknown> & {
  id: string;
  order_index: number;
  choices: unknown;
  segments?: ListeningScriptSegment[];
};

function toGeneratedQuestion(
  q: DbQuestion,
  segments: ListeningScriptSegment[]
): GeneratedListeningQuestion {
  const choices = Array.isArray(q.choices) ? (q.choices as string[]) : [];
  return {
    order_index: q.order_index,
    question_type: String(q.question_type ?? ""),
    instruction: String(q.instruction ?? ""),
    segments,
    script_text: String(q.script_text ?? ""),
    script_translation: String(q.script_translation ?? ""),
    question_text: String(q.question_text ?? ""),
    choices,
    correct_answer: Number(q.correct_answer ?? 0),
    answer_clue: String(q.answer_clue ?? ""),
    explanation: String(q.explanation ?? ""),
    table_data:
      q.table_data && typeof q.table_data === "object"
        ? (q.table_data as GeneratedListeningQuestion["table_data"])
        : undefined,
    previous_turn: String(q.previous_turn ?? ""),
    correct_response_function: String(q.correct_response_function ?? ""),
    distractor_reason: Array.isArray(q.distractor_reason)
      ? (q.distractor_reason as string[])
      : [],
    blank_speaker: String(q.blank_speaker ?? ""),
    situation_type: String(q.situation_type ?? ""),
    needs_image_choices: Boolean(q.needs_image_choices),
    choice_image_prompts: Array.isArray(q.choice_image_prompts)
      ? (q.choice_image_prompts as string[])
      : [],
    visual_choice_type: String(q.visual_choice_type ?? ""),
    selected_conditions:
      q.selected_conditions && typeof q.selected_conditions === "object"
        ? (q.selected_conditions as GeneratedListeningQuestion["selected_conditions"])
        : undefined,
    weather_target_location: String(q.weather_target_location ?? ""),
    weather_target_time: String(q.weather_target_time ?? ""),
    weather_answer: String(q.weather_answer ?? ""),
    mentioned_weather_by_time: Array.isArray(q.mentioned_weather_by_time)
      ? (q.mentioned_weather_by_time as GeneratedListeningQuestion["mentioned_weather_by_time"])
      : [],
    last_speaker: String(q.last_speaker ?? ""),
    final_utterance: String(q.final_utterance ?? ""),
    target_intention: String(q.target_intention ?? ""),
    mention_plan:
      q.mention_plan && typeof q.mention_plan === "object"
        ? (q.mention_plan as GeneratedListeningQuestion["mention_plan"])
        : undefined,
    time_question_target: String(q.time_question_target ?? ""),
    final_time: String(q.final_time ?? ""),
    mentioned_times: Array.isArray(q.mentioned_times)
      ? (q.mentioned_times as GeneratedListeningQuestion["mentioned_times"])
      : [],
    target_person: String(q.target_person ?? ""),
    dream_job: String(q.dream_job ?? ""),
    target_emotion: String(q.target_emotion ?? ""),
    immediate_action: String(q.immediate_action ?? ""),
    main_content: String(q.main_content ?? ""),
    destination: String(q.destination ?? ""),
    final_transport: String(q.final_transport ?? ""),
    target_place: String(q.target_place ?? ""),
    reason_for_going: String(q.reason_for_going ?? ""),
    place_clues: Array.isArray(q.place_clues) ? (q.place_clues as string[]) : [],
    requester: String(q.requester ?? ""),
    requested_person: String(q.requested_person ?? ""),
    requested_action: String(q.requested_action ?? ""),
    suggester: String(q.suggester ?? ""),
    suggested_to: String(q.suggested_to ?? ""),
    suggested_action: String(q.suggested_action ?? ""),
    target_time: String(q.target_time ?? ""),
    planned_action: String(q.planned_action ?? ""),
    target_job: String(q.target_job ?? ""),
    job_clues: Array.isArray(q.job_clues) ? (q.job_clues as string[]) : [],
  };
}

async function auditGrade(grade: ListeningGradeLevel) {
  const label = gradeLevelShort(grade);
  const { data: sets, error } = await admin
    .from("listening_sets")
    .select("id, title, grade_level")
    .eq("academy_id", ACADEMY)
    .eq("grade_level", grade)
    .ilike("title", `${label} %회`)
    .order("title");

  if (error) throw error;
  const sorted = (sets ?? []).sort((a, b) => roundOf(a.title) - roundOf(b.title));

  const badQuestions: Array<{
    grade: string;
    setTitle: string;
    setId: string;
    questionId: string;
    orderIndex: number;
    qualityScore: number;
    issues: { code: string; message: string }[];
    spoiler?: string;
    scriptPreview: string;
  }> = [];

  const issueCounts = new Map<string, number>();
  let totalQuestions = 0;
  let passCount = 0;

  const scriptsByOrder = new Map<number, Map<string, number[]>>();

  for (const set of sorted) {
    const round = roundOf(set.title);
    const { data: questions } = await admin
      .from("listening_questions")
      .select("*")
      .eq("set_id", set.id)
      .order("order_index");

    const qIds = (questions ?? []).map((q) => q.id as string);
    const { data: segs } =
      qIds.length > 0
        ? await admin
            .from("listening_question_segments")
            .select("question_id, order_index, speaker_type, text")
            .in("question_id", qIds)
            .order("order_index")
        : { data: [] };

    const segsByQ = new Map<string, ListeningScriptSegment[]>();
    for (const s of segs ?? []) {
      const list = segsByQ.get(s.question_id as string) ?? [];
      list.push({
        speaker: s.speaker_type as ListeningScriptSegment["speaker"],
        text: String(s.text ?? ""),
      });
      segsByQ.set(s.question_id as string, list);
    }

    for (const raw of questions ?? []) {
      totalQuestions++;
      const q = raw as DbQuestion;
      const segments = segsByQ.get(q.id) ?? [];
      const gen = toGeneratedQuestion(q, segments);
      const typeHint = getExamTypeById(q.order_index, grade);
      const result = checkListeningQuestionQuality(gen, typeHint, grade);

      const choices = gen.choices;
      const spoiler = checkSpoilerInScript(
        q.order_index,
        gen.script_text,
        choices,
        gen.correct_answer,
        q.table_data
      );

      const scriptKey = normalize(gen.script_text).slice(0, 200);
      const orderMap = scriptsByOrder.get(q.order_index) ?? new Map();
      const rounds = orderMap.get(scriptKey) ?? [];
      rounds.push(round);
      orderMap.set(scriptKey, rounds);
      scriptsByOrder.set(q.order_index, orderMap);

      const allIssues = [...result.issues];
      if (spoiler) {
        allIssues.push({ code: "spoiler_in_script", message: spoiler, weight: 25 });
      }

      const effectiveScore =
        spoiler && result.quality_score >= QUALITY_PASS_THRESHOLD
          ? result.quality_score - 25
          : result.quality_score;

      const ok = effectiveScore >= QUALITY_PASS_THRESHOLD && allIssues.length === 0;
      if (ok) passCount++;

      for (const iss of allIssues) {
        issueCounts.set(iss.code, (issueCounts.get(iss.code) ?? 0) + 1);
      }

      if (!ok || allIssues.length > 0) {
        badQuestions.push({
          grade,
          setTitle: set.title,
          setId: set.id as string,
          questionId: q.id,
          orderIndex: q.order_index,
          qualityScore: effectiveScore,
          issues: allIssues.map(({ code, message }) => ({ code, message })),
          spoiler: spoiler ?? undefined,
          scriptPreview: gen.script_text.slice(0, 120).replace(/\s+/g, " "),
        });
      }
    }
  }

  const duplicateScripts: Array<{
    orderIndex: number;
    rounds: number[];
    scriptPreview: string;
  }> = [];
  for (const [orderIndex, scriptMap] of scriptsByOrder) {
    for (const [script, rounds] of scriptMap) {
      if (rounds.length >= 2 && script.length > 40) {
        duplicateScripts.push({
          orderIndex,
          rounds: [...rounds].sort((a, b) => a - b),
          scriptPreview: script.slice(0, 100),
        });
      }
    }
  }

  return {
    grade,
    sets: sorted.length,
    totalQuestions,
    passCount,
    failCount: totalQuestions - passCount,
    badQuestions,
    issueCounts: Object.fromEntries(
      [...issueCounts.entries()].sort((a, b) => b[1] - a[1])
    ),
    duplicateScripts: duplicateScripts.sort(
      (a, b) => b.rounds.length - a.rounds.length
    ),
  };
}

async function main() {
  const reports = [];
  for (const grade of grades) {
    console.error(`Auditing ${grade}…`);
    reports.push(await auditGrade(grade));
  }

  const summary = {
    auditedAt: new Date().toISOString(),
    grades: reports.map((r) => ({
      grade: r.grade,
      sets: r.sets,
      totalQuestions: r.totalQuestions,
      passCount: r.passCount,
      failCount: r.failCount,
      topIssues: Object.entries(r.issueCounts).slice(0, 15),
      duplicateScriptCount: r.duplicateScripts.length,
    })),
    reports,
  };

  const outPath = resolve("tmp/audit-middle-listening.json");
  writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(JSON.stringify(summary.grades, null, 2));
  console.error(`\nWrote ${outPath}`);
  for (const r of reports) {
    console.error(
      `${r.grade}: ${r.failCount}/${r.totalQuestions} issues, ${r.duplicateScripts.length} duplicate-script groups`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
