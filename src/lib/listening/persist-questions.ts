import { createAdminClient } from "@/lib/supabase/admin";
import { buildScriptText } from "@/lib/listening/script-text";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";

export async function persistGeneratedQuestions(
  setId: string,
  questions: GeneratedListeningQuestion[]
): Promise<Array<GeneratedListeningQuestion & { id: string; segments: Array<{ id: string; speaker: string; text: string }> }>> {
  const admin = createAdminClient();
  const saved: Array<
    GeneratedListeningQuestion & {
      id: string;
      segments: Array<{ id: string; speaker: string; text: string }>;
    }
  > = [];

  for (const q of questions) {
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
      })
      .select("id")
      .single();

    if (qErr || !questionRow) {
      throw new Error(qErr?.message ?? "문항 저장 실패");
    }

    const segmentRows = q.segments.map((seg, idx) => ({
      question_id: questionRow.id,
      order_index: idx,
      speaker_type: seg.speaker,
      text: seg.text,
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

    saved.push({
      ...q,
      script_text,
      id: questionRow.id,
      segments: ordered.map((s) => ({
        id: s.id,
        speaker: s.speaker_type,
        text: s.text,
      })),
    });
  }

  return saved;
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
    text: seg.text,
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
    .update({ script_text })
    .eq("id", questionId);
}
