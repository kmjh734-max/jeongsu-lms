import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ClassDetailView } from "@/components/classes/ClassDetailView";
import { ClassVocabPanel } from "@/components/vocab/ClassVocabPanel";
import { isVocabEnabled } from "@/lib/academy-features";
import { loadClassPageData, parseClassTab } from "@/lib/classes/load-class-page";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { loadClassVocabPanelData } from "@/lib/vocab/load-class-vocab";
import * as classActions from "@/app/teacher/classes/actions";

interface PageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TeacherClassDetailPage({ params, searchParams }: PageProps) {
  const [{ classId }, sp] = await Promise.all([params, searchParams]);
  const tab = parseClassTab(sp.tab);
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const data = await loadClassPageData(supabase, createAdminClient(), {
    variant: "teacher",
    viewerId: profile!.id,
    classId,
    tab,
    todayIso: getTodayIsoKorea(),
  });

  if (!data) notFound();

  // 담당 반인 것을 확인한 뒤에만 단어장 칸을 읽는다
  const vocabPanel =
    tab === "courses" && isVocabEnabled()
      ? await loadClassVocabPanelData(supabase, "teacher", profile!.id, classId)
      : null;

  return (
    <ClassDetailView
      variant="teacher"
      data={data}
      tab={tab}
      vocabPanel={
        vocabPanel ? (
          <ClassVocabPanel
            classId={classId}
            students={vocabPanel.students}
            setOptions={vocabPanel.setOptions}
            onAssign={classActions.teacherAssignVocabSetToStudent}
            onRemove={classActions.teacherRemoveVocabSetFromStudent}
          />
        ) : null
      }
    />
  );
}
