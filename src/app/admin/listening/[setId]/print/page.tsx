import { notFound } from "next/navigation";
import { ListeningExamPrintView } from "@/components/listening/ListeningExamPrintView";
import { createClient } from "@/lib/supabase/server";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";
import { gradeLevelLabel, parseListeningGradeLevel } from "@/lib/listening/grade-level";

export default async function AdminListeningPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ script?: string }>;
}) {
  const { setId } = await params;
  const { script } = await searchParams;
  const supabase = await createClient();
  const loaded = await loadListeningSetForEditor(supabase, setId);
  if (!loaded) notFound();

  return (
    <ListeningExamPrintView
      title={loaded.set.title}
      gradeLabel={gradeLevelLabel(
        parseListeningGradeLevel(loaded.set.grade_level)
      )}
      questions={loaded.questions}
      backHref={`/admin/listening/${setId}`}
      showScript={script === "1"}
      setId={setId}
    />
  );
}
