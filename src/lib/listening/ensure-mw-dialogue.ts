import type { SupabaseClient } from "@supabase/supabase-js";
import { isDialogueExamType } from "@/lib/listening/dialogue-type-ids";
import { DICTATION_RESET_FIELDS } from "@/lib/listening/dictation/reset-fields";
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

function segmentsEqual(
  a: ListeningScriptSegment[],
  b: ListeningScriptSegment[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => s.speaker === b[i]!.speaker && s.text === b[i]!.text);
}

function joinTurnText(a: string, b: string): string {
  const left = a.trim();
  const right = b.trim();
  if (!left) return right;
  if (!right) return left;
  return /[.!?]["')]?$/.test(left) ? `${left} ${right}` : `${left}. ${right}`;
}

/**
 * 같은 화자가 연달아 말한 줄은 한 턴으로 합친다.
 * 예전에는 M↔W를 억지로 번갈아 붙여 누가 무슨 말을 했는지가 뒤바뀌었다
 * (부탁·격려·직업 문항에서 지시문과 반대 화자가 말하게 됨).
 */
export function mergeConsecutiveSameSpeaker(
  segments: ListeningScriptSegment[]
): ListeningScriptSegment[] {
  const out: ListeningScriptSegment[] = [];
  for (const seg of segments) {
    const prev = out[out.length - 1];
    if (
      prev &&
      (seg.speaker === "M" || seg.speaker === "W") &&
      prev.speaker === seg.speaker
    ) {
      out[out.length - 1] = { ...prev, text: joinTurnText(prev.text, seg.text) };
      continue;
    }
    out.push({ ...seg });
  }
  return out;
}

/** 한 화자만 나오는 대화: 번갈아 붙이는 것 말고는 방법이 없다 (이후 유형 보정이 지시문을 맞춤) */
function relabelMonoSpeakerDialogue(
  segments: ListeningScriptSegment[]
): ListeningScriptSegment[] {
  const indices = spokenIndices(segments);
  if (indices.length < 2 || hasBothSpeakers(segments)) return segments;
  const out = segments.map((s) => ({ ...s }));
  indices.forEach((idx, turn) => {
    out[idx] = { ...out[idx]!, speaker: turn % 2 === 0 ? "M" : "W" };
  });
  return out;
}

/** 마지막 화자가 정해진 유형(19·20)은 남녀 라벨 전체를 맞바꿔 맞춘다 (역할은 그대로) */
function swapAllMw(segments: ListeningScriptSegment[]): ListeningScriptSegment[] {
  return segments.map((s) =>
    s.speaker === "M"
      ? { ...s, speaker: "W" as const }
      : s.speaker === "W"
        ? { ...s, speaker: "M" as const }
        : { ...s }
  );
}

function lastSpoken(segments: ListeningScriptSegment[]): "M" | "W" | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    const sp = segments[i]!.speaker;
    if (sp === "M" || sp === "W") return sp;
  }
  return null;
}

export function normalizeDialogueSegments(
  segments: ListeningScriptSegment[],
  opts: { endSpeaker?: "M" | "W"; mergeOnly?: boolean } = {}
): ListeningScriptSegment[] {
  let out = mergeConsecutiveSameSpeaker(segments);
  if (opts.mergeOnly) return out;
  out = relabelMonoSpeakerDialogue(out);
  // 한 화자 대화를 번갈아 붙이면 다시 연속 화자가 생기지 않지만, 안전하게 한 번 더 합친다
  out = mergeConsecutiveSameSpeaker(out);
  if (opts.endSpeaker) {
    const last = lastSpoken(out);
    if (last && last !== opts.endSpeaker) out = swapAllMw(out);
  }
  return out;
}

/**
 * 대화 유형: 같은 화자 연속 줄은 합치고, 한 화자만 있으면 M↔W로 나눈다.
 * mergeOnly=true면 합치기만 한다 (유형 보정 뒤 한 번 더 돌릴 때 — 화자는 바꾸지 않음).
 */
export function ensureMwDialogueSegments(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel?: ListeningGradeLevel,
  opts?: { mergeOnly?: boolean }
): GeneratedListeningQuestion {
  if (!isDialogueExamType(typeId, gradeLevel, q.instruction)) return q;

  const endSpeaker: "M" | "W" | undefined =
    gradeLevel && gradeLevel.startsWith("high")
      ? undefined
      : typeId === 19
        ? "W"
        : typeId === 20
          ? "M"
          : undefined;

  const segments = normalizeDialogueSegments(q.segments, {
    endSpeaker,
    mergeOnly: opts?.mergeOnly,
  });
  if (segmentsEqual(segments, q.segments)) return q;

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

  // 저장된 문항은 지시문이 이미 화자를 가리키므로 화자는 바꾸지 않고 연속 줄만 합친다
  const fixed = ensureMwDialogueSegments(stub, typeId, gradeLevel, {
    mergeOnly: true,
  });
  if (segmentsEqual(fixed.segments, segments)) return false;

  const script_text = buildScriptText(fixed.segments);

  await admin.from("listening_question_segments").delete().eq("question_id", questionId);
  const { error } = await admin.from("listening_question_segments").insert(
    fixed.segments.map((seg, idx) => ({
      question_id: questionId,
      order_index: idx,
      speaker_type: seg.speaker,
      text: seg.text,
      voice_name: voiceForSpeaker(seg.speaker),
    }))
  );
  if (error) throw new Error(error.message);

  await admin
    .from("listening_questions")
    .update({
      script_text,
      audio_url: null,
      // 대본 줄이 바뀌었으니 받아쓰기 빈칸도 다시 만든다
      ...DICTATION_RESET_FIELDS,
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
