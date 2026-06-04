import type { SupabaseClient } from "@supabase/supabase-js";
import { buildScriptText } from "@/lib/listening/script-text";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import type {
  GeneratedListeningQuestion,
  ListeningScriptSegment,
} from "@/lib/listening/types";

/** M/W 남녀 대화가 필요한 기출 유형 (담화·표 유형 제외) */
export const MW_DIALOGUE_TYPE_IDS = new Set([
  2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20,
]);

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

/** 마지막 M/W 발화 화자 */
function startSpeakerForEnd(end: "M" | "W", turnCount: number): "M" | "W" {
  if (turnCount <= 0) return "M";
  const lastIfStartM = turnCount % 2 === 1 ? "M" : "W";
  return end === lastIfStartM ? "M" : "W";
}

function relabelAlternatingMw(
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
      turn % 2 === 0
        ? start
        : start === "M"
          ? "W"
          : "M";
    out[idx] = { ...out[idx]!, speaker };
  });
  return out;
}

export function requiresMwDialogue(
  typeId: number,
  q: GeneratedListeningQuestion
): boolean {
  if (MW_DIALOGUE_TYPE_IDS.has(typeId)) return true;
  if (typeId === 1 || typeId === 3 || typeId === 5 || typeId === 14) return false;
  return /대화/.test(q.instruction ?? "");
}

/**
 * 대화 유형인데 M만(또는 W만) 있으면 M↔W 번갈아 화자 라벨을 붙인다.
 * (대사 내용은 그대로, 음원·화면에서 남녀가 구분되도록)
 */
export function ensureMwDialogueSegments(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (!requiresMwDialogue(typeId, q)) return q;
  if (hasBothSpeakers(q.segments)) return q;

  const endSpeaker: "M" | "W" | undefined =
    typeId === 19 ? "W" : typeId === 20 ? "M" : undefined;

  const segments = relabelAlternatingMw(q.segments, { endSpeaker });
  if (segments === q.segments) return q;

  return {
    ...q,
    segments,
    script_text: buildScriptText(segments),
  };
}

/** DB에 M만 저장된 대화 문항을 음원 생성 전에 보정 */
export async function repairMwDialogueSegmentsInDb(
  admin: SupabaseClient,
  questionId: string,
  orderIndex: number
): Promise<boolean> {
  const [{ data: meta }, { data: rows }] = await Promise.all([
    admin
      .from("listening_questions")
      .select("instruction")
      .eq("id", questionId)
      .maybeSingle(),
    admin
      .from("listening_question_segments")
      .select("id, order_index, speaker_type, text")
      .eq("question_id", questionId)
      .order("order_index", { ascending: true }),
  ]);

  if (!rows?.length) return false;

  const segments: ListeningScriptSegment[] = rows.map((r) => ({
    speaker: r.speaker_type as ListeningScriptSegment["speaker"],
    text: String(r.text ?? ""),
  }));

  const stub = {
    order_index: orderIndex,
    question_type: "",
    instruction: meta?.instruction ?? "",
    segments,
    script_text: "",
    script_translation: "",
    question_text: "",
    choices: [],
    correct_answer: 1,
    explanation: "",
    answer_clue: "",
  } satisfies GeneratedListeningQuestion;

  const fixed = ensureMwDialogueSegments(stub, orderIndex);
  if (fixed.segments === segments) return false;

  const script_text = fixed.script_text || buildScriptText(fixed.segments);
  await admin
    .from("listening_questions")
    .update({ script_text })
    .eq("id", questionId);

  for (let i = 0; i < rows.length; i++) {
    const next = fixed.segments[i];
    const prev = rows[i]!;
    if (!next || next.speaker === prev.speaker_type) continue;
    await admin
      .from("listening_question_segments")
      .update({
        speaker_type: next.speaker,
        voice_name: voiceForSpeaker(next.speaker),
      })
      .eq("id", prev.id);
  }

  return true;
}
