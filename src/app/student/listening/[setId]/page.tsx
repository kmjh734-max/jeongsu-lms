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
    .select("id, title")
    .eq("id", setId)
    .eq("is_published", true)
    .maybeSingle();

  if (!set) notFound();

  const { data: questions } = await supabase
    .from("listening_questions")
    .select(
      "id, order_index, question_type, instruction, question_text, choices, correct_answer, audio_url"
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
          setTitle={set.title}
          questions={(questions ?? []).map((q) => ({
            id: q.id,
            order_index: q.order_index,
            question_type: q.question_type ?? "",
            instruction: q.instruction ?? "",
            question_text: q.question_text ?? "",
            choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
            correct_answer: q.correct_answer ?? 1,
            audio_url: q.audio_url,
          }))}
        />
      </div>
    </div>
  );
}
