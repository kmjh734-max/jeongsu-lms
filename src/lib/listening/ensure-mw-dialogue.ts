import type { SupabaseClient } from "@supabase/supabase-js";
import { isDialogueExamType } from "@/lib/listening/dialogue-type-ids";
import { buildScriptText } from "@/lib/listening/script-text";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type {
  GeneratedListeningQuestion,
  ListeningScriptSegment,
} from "@/lib/listening/types";

function spokenIndices(segments: ListeningScriptSegment[]): number[] {
  const out: number[] = [];
  segments.forEach((s, i) => {
    if (s.speaker === "M" || s.speaker === "W") out.push(i);
  });
  return out;
}

function hasBothSpeakers(segments: ListeningScriptSegment[]): boolean {
  const hasM = segments.some((s) => s.speaker === "M");
  const hasW = segments.some((s) => s.speaker === "W");
  return hasM && hasW;
}

function isStrictMwAlternating(segments: ListeningScriptSegment[]): boolean {
  const indices = spokenIndices(segments);
  if (indices.length < 2) return true;
  if (!hasBothSpeakers(segments)) return false;
  for (let t = 1; t < indices.length; t++) {
    const prev = segments[indices[t - 1]!]!.speaker;
    const cur = segments[indices[t]!]!.speaker;
    if (prev === cur) return false;
  }
  return true;
}

function segmentsSpeakersEqual(
  a: ListeningScriptSegment[],
  b: ListeningScriptSegment[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => s.speaker === b[i]!.speaker);
}

function startSpeakerForEnd(end: "M" | "W", turnCount: number): "M" | "W" {
  if (turnCount <= 0) return "M";
  const lastIfStartM = turnCount % 2 === 1 ? "M" : "W";
  return end === lastIfStartM ? "M" : "W";
}

function relabelStrictAlternatingMw(
  segments: ListeningScriptSegment[],
  opts: { endSpeaker?: "M" | "W" }
): ListeningScriptSegment[] {
  const indices = spokenIndices(segments);
  if (indices.length < 2) return segments;

  const start = opts.endSpeaker
    ? startSpeakerForEnd(opts.endSpeaker, indices.length)
    : "M";

  const out = segments.map((s) => ({ ...s }));
  indices.forEach((idx, turn) => {
    const speaker: "M" | "W" =
      turn % 2 === 0 ? start : start === "M" ? "W" : "M";
    out[idx] = { ...out[idx]!, speaker };
  });
  return out;
}

function needsMwRelabel(segments: ListeningScriptSegment[]): boolean {
  const indices = spokenIndices(segments);
  if (indices.length < 2) return false;
  return !isStrictMwAlternating(segments);
}

/**
 * 대화 유형: M만/W만 이거나 연속 동일 화자면 M↔W 교대 라벨로 맞춘다.
 */
export function ensureMwDialogueSegments(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  if (!isDialogueExamType(typeId, gradeLevel, q.instruction)) return q;
  if (!needsMwRelabel(q.segments)) return q;

  const endSpeaker: "M" | "W" | undefined =
    typeId === 19 ? "W" : typeId === 20 ? "M" : undefined;

  const segments = relabelStrictAlternatingMw(q.segments, { endSpeaker });
  if (segmentsSpeakersEqual(segments, q.segments)) return q;

  return {
    ...q,
    segments,
    script_text: buildScriptText(segments),
  };
}

export async function repairMwDialogueSegmentsInDb(
  admin: SupabaseClient,
  questionId: string,
  orderIndex: number
): Promise<boolean> {
  const [{ data: meta }, { data: rows }] = await Promise.all([
    admin
      .from("listening_questions")
      .select("instruction, question_type, set_id")
      .eq("id", questionId)
      .maybeSingle(),
    admin
      .from("listening_question_segments")
      .select("id, order_index, speaker_type, text, audio_url")
      .eq("question_id", questionId)
      .order("order_index", { ascending: true }),
  ]);

  if (!rows?.length || !meta?.set_id) return false;

  const gradeLevel = await fetchListeningSetGradeLevel(meta.set_id as string);
  const typeId = inferExamTypeIdForFixes(
    {
      order_index: orderIndex,
      instruction: (meta.instruction as string) ?? "",
      question_type: (meta.question_type as string) ?? "",
    },
    gradeLevel
  );

  const segments: ListeningScriptSegment[] = rows.map((r) => ({
    speaker: r.speaker_type as ListeningScriptSegment["speaker"],
    text: String(r.text ?? ""),
  }));

  const stub = {
    order_index: orderIndex,
    question_type: (meta.question_type as string) ?? "",
    instruction: (meta.instruction as string) ?? "",
    segments,
    script_text: "",
    script_translation: "",
    question_text: "",
    choices: [],
    correct_answer: 1,
    explanation: "",
    answer_clue: "",
  } satisfies GeneratedListeningQuestion;

  const fixed = ensureMwDialogueSegments(stub, typeId, gradeLevel);
  if (segmentsSpeakersEqual(fixed.segments, segments)) return false;

  const script_text = fixed.script_text || buildScriptText(fixed.segments);
  let anySpeakerChanged = false;

  for (let i = 0; i < rows.length; i++) {
    const next = fixed.segments[i];
    const prev = rows[i]!;
    if (!next || next.speaker === prev.speaker_type) continue;
    anySpeakerChanged = true;
    await admin
      .from("listening_question_segments")
      .update({
        speaker_type: next.speaker,
        voice_name: voiceForSpeaker(next.speaker),
        audio_url: null,
      })
      .eq("id", prev.id);
  }

  await admin
    .from("listening_questions")
    .update({
      script_text,
      ...(anySpeakerChanged ? { audio_url: null } : {}),
    })
    .eq("id", questionId);

  return true;
}

export async function repairSetMwDialogueInDb(
  admin: SupabaseClient,
  setId: string
): Promise<number> {
  const { data: questions } = await admin
    .from("listening_questions")
    .select("id, order_index")
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  let repaired = 0;
  for (const q of questions ?? []) {
    const changed = await repairMwDialogueSegmentsInDb(
      admin,
      q.id as string,
      q.order_index as number
    );
    if (changed) repaired += 1;
  }
  return repaired;
}
