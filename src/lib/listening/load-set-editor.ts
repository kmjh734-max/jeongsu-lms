import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";

export async function loadListeningSetForEditor(
  supabase: SupabaseClient,
  setId: string
) {
  const { data: set, error: setErr } = await supabase
    .from("listening_sets")
    .select("id, title, is_published, teacher_id, created_by, speech_speed")
    .eq("id", setId)
    .maybeSingle();

  if (setErr || !set) return null;

  const { data: questions } = await supabase
    .from("listening_questions")
    .select(
      "id, order_index, question_type, instruction, question_text, choices, correct_answer, explanation, script_translation, audio_url"
    )
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  const questionIds = (questions ?? []).map((q) => q.id);
  const { data: segments } =
    questionIds.length > 0
      ? await supabase
          .from("listening_question_segments")
          .select("id, question_id, order_index, speaker_type, text, audio_url")
          .in("question_id", questionIds)
          .order("order_index", { ascending: true })
      : { data: [] };

  const segmentsByQuestion = new Map<string, ListeningQuestionData["segments"]>();
  for (const seg of segments ?? []) {
    const list = segmentsByQuestion.get(seg.question_id) ?? [];
    list.push(seg);
    segmentsByQuestion.set(seg.question_id, list);
  }

  const questionRows: ListeningQuestionData[] = (questions ?? []).map((q) => ({
    ...q,
    choices: Array.isArray(q.choices)
      ? (q.choices as string[])
      : [],
    segments: segmentsByQuestion.get(q.id) ?? [],
  }));

  return { set, questions: questionRows };
}
