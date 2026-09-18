import { seatLockScreen } from "@/components/credits/SeatLockedNotice";
import { notFound } from "next/navigation";
import { ListeningExamPrintView } from "@/components/listening/ListeningExamPrintView";
import { createClient } from "@/lib/supabase/server";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";
import { gradeLevelLabel, parseListeningGradeLevel } from "@/lib/listening/grade-level";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";

export default async function TeacherListeningPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ script?: string }>;
}) {
  const { setId } = await params;
  const { script } = await searchParams;
  // 이용 확인은 자료를 불러오는 동안 함께 한다
  const lockPromise = seatLockScreen("listening", "/teacher", `/teacher/listening/${setId}`);

  // 권한 확인과 자료 읽기를 함께 (결과는 권한이 있을 때만 쓴다)
  const [access, loaded] = await Promise.all([
    assertListeningSetAccess(setId),
    createClient().then((supabase) => loadListeningSetForEditor(supabase, setId)),
  ]);
  if (!access.ok || !loaded) notFound();

  const locked = await lockPromise;
  if (locked) return locked;

  return (
    <ListeningExamPrintView
      title={loaded.set.title}
      gradeLabel={gradeLevelLabel(
        parseListeningGradeLevel(loaded.set.grade_level)
      )}
      questions={loaded.questions}
      backHref={`/teacher/listening/${setId}`}
      showScript={script === "1"}
      setId={setId}
    />
  );
}
