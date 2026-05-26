import { createAdminClient } from "@/lib/supabase/admin";
import { fixContinuationQuestion } from "@/lib/listening/fix-continuation-question";
import { buildScriptText } from "@/lib/listening/script-text";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";

function qualityFields(q: GeneratedListeningQuestion) {
  return {
    answer_clue: q.answer_clue ?? "",
    needs_review: q.needs_review ?? false,
    quality_score:
      typeof q.quality_score === "number" ? Math.round(q.quality_score) : null,
    answer_clarity_score:
      typeof q.answer_clarity_score === "number"
        ? Math.round(q.answer_clarity_score)
        : null,
    quality_issues: q.quality_issues ?? [],
    answer_validation: q.answer_validation ?? {},
  };
}

export async function persistGeneratedQuestions(
  setId: string,
  questions: GeneratedListeningQuestion[]
): Promise<
  Array<
    GeneratedListeningQuestion & {
      id: string;
      segments: Array<{ id: string; speaker: string; text: string }>;
    }
  >
> {
  const admin = createAdminClient();
  const saved: Array<
    GeneratedListeningQuestion & {
      id: string;
      segments: Array<{ id: string; speaker: string; text: string }>;
    }
  > = [];

  for (const raw of questions) {
    saved.push(await insertOneQuestion(admin, setId, raw));
  }

  return saved;
}

async function insertOneQuestion(
  admin: ReturnType<typeof createAdminClient>,
  setId: string,
  raw: GeneratedListeningQuestion
) {
  const q = fixContinuationQuestion(raw, raw.order_index);
  const script_text = q.script_text || buildScriptText(q.segments);

  const { data: questionRow, error: qErr } = await admin
    .from("listening_questions")
    .insert({
      set_id: setId,
      order_index: q.order_index,
      question_type: q.question_type,
      instruction: q.instruction ?? "",
      script_text,
      script_translation: q.script_translation,
      question_text: q.question_text,
      choices: q.choices.filter(Boolean),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      ...qualityFields(q),
    })
    .select("id")
    .single();

  if (qErr || !questionRow) {
    throw new Error(qErr?.message ?? "문항 저장 실패");
  }

  const segments = await insertSegments(admin, setId, questionRow.id, q.segments);

  return {
    ...q,
    script_text,
    id: questionRow.id,
    segments,
  };
}

async function insertSegments(
  admin: ReturnType<typeof createAdminClient>,
  setId: string,
  questionId: string,
  segments: GeneratedListeningQuestion["segments"]
) {
  const segmentRows = segments.map((seg, idx) => ({
    question_id: questionId,
    order_index: idx,
    speaker_type: seg.speaker,
    text: sanitizeSegmentTextForTts(seg.text),
    voice_name: voiceForSpeaker(seg.speaker),
  }));

  const { data: segData, error: sErr } = await admin
    .from("listening_question_segments")
    .insert(segmentRows)
    .select("id, speaker_type, text, order_index");

  if (sErr) {
    throw new Error(sErr.message);
  }

  const ordered = (segData ?? []).sort((a, b) => a.order_index - b.order_index);
  return ordered.map((s) => ({
    id: s.id,
    speaker: s.speaker_type,
    text: s.text,
  }));
}

/** 재생성 시 기존 questionId 유지, 음원 초기화 */
export async function replaceGeneratedQuestion(
  setId: string,
  questionId: string,
  raw: GeneratedListeningQuestion
): Promise<
  GeneratedListeningQuestion & {
    id: string;
    segments: Array<{ id: string; speaker: string; text: string }>;
  }
> {
  const admin = createAdminClient();
  const q = fixContinuationQuestion(raw, raw.order_index);
  const script_text = q.script_text || buildScriptText(q.segments);

  await admin.from("listening_question_segments").delete().eq("question_id", questionId);

  const { error: upErr } = await admin
    .from("listening_questions")
    .update({
      order_index: q.order_index,
      question_type: q.question_type,
      instruction: q.instruction ?? "",
      script_text,
      script_translation: q.script_translation,
      question_text: q.question_text,
      choices: q.choices.filter(Boolean),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      audio_url: null,
      ...qualityFields(q),
    })
    .eq("id", questionId)
    .eq("set_id", setId);

  if (upErr) throw new Error(upErr.message);

  const segments = await insertSegments(admin, setId, questionId, q.segments);

  return {
    ...q,
    script_text,
    id: questionId,
    segments,
  };
}

export async function replaceQuestionSegments(
  questionId: string,
  segments: Array<{ speaker: string; text: string }>
): Promise<void> {
  const admin = createAdminClient();

  await admin.from("listening_question_segments").delete().eq("question_id", questionId);

  const rows = segments.map((seg, idx) => ({
    question_id: questionId,
    order_index: idx,
    speaker_type: seg.speaker,
    text: sanitizeSegmentTextForTts(seg.text),
    voice_name:
      seg.speaker === "ANN" || seg.speaker === "M" || seg.speaker === "W"
        ? voiceForSpeaker(seg.speaker)
        : null,
  }));

  const { error } = await admin.from("listening_question_segments").insert(rows);
  if (error) throw new Error(error.message);

  const script_text = buildScriptText(
    segments.map((s) => ({
      speaker: s.speaker as "ANN" | "M" | "W",
      text: s.text,
    }))
  );

  await admin
    .from("listening_questions")
    .update({ script_text, audio_url: null })
    .eq("id", questionId);
}
