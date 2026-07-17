import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentListeningPractice } from "@/components/listening/StudentListeningPractice";

export default async function StudentListeningSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("listening_sets")
    .select(
      "id, title, dictation_enabled, dictation_pass_score, dictation_blank_level, dictation_randomize_on_retry, dictation_lock_next_until_pass"
    )
    .eq("id", setId)
    .maybeSingle();

  if (!set) notFound();

  const { data: questions } = await supabase
    .from("listening_questions")
    .select(
      "id, order_index, question_type, instruction, question_text, choices, correct_answer, audio_url, script_text, script_translation, answer_clue, explanation, table_data"
    )
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  return (
    <div>
      <Link
        href="/student/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 목록
      </Link>
      <div className="mt-4">
        <StudentListeningPractice
          setId={setId}
          setTitle={set.title}
          dictationSettings={{
            dictation_enabled: set.dictation_enabled ?? true,
            dictation_pass_score: set.dictation_pass_score ?? 80,
            dictation_blank_level:
              (set.dictation_blank_level as "auto" | "few" | "normal" | "many") ??
              "auto",
            dictation_randomize_on_retry: set.dictation_randomize_on_retry ?? true,
            dictation_lock_next_until_pass:
              set.dictation_lock_next_until_pass ?? true,
          }}
          questions={(questions ?? []).map((q) => ({
            id: q.id,
            order_index: q.order_index,
            question_type: q.question_type ?? "",
            instruction: q.instruction ?? "",
            question_text: q.question_text ?? "",
            choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
            correct_answer: q.correct_answer ?? 1,
            audio_url: q.audio_url,
            script_text: q.script_text ?? "",
            script_translation: q.script_translation ?? "",
            answer_clue: q.answer_clue ?? "",
            explanation: q.explanation ?? "",
            table_data:
              q.table_data && typeof q.table_data === "object"
                ? q.table_data
                : null,
          }))}
        />
      </div>
    </div>
  );
}
