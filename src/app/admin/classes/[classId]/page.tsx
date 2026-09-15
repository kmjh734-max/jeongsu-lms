import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClassDetailView } from "@/components/classes/ClassDetailView";
import { ClassVocabPanel } from "@/components/vocab/ClassVocabPanel";
import { isVocabEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadClassPageData, parseClassTab } from "@/lib/classes/load-class-page";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { loadClassVocabPanelData } from "@/lib/vocab/load-class-vocab";
import * as classActions from "@/app/admin/classes/actions";

interface PageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminClassDetailPage({ params, searchParams }: PageProps) {
  const [{ classId }, sp] = await Promise.all([params, searchParams]);
  const tab = parseClassTab(sp.tab);
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [data, vocabPanel] = await Promise.all([
    loadClassPageData(supabase, createAdminClient(), {
      variant: "admin",
      viewerId: profile!.id,
      classId,
      tab,
      todayIso: getTodayIsoKorea(),
    }),
    tab === "courses" && isVocabEnabled()
      ? loadClassVocabPanelData(supabase, "admin", profile!.id, classId)
      : null,
  ]);

  if (!data) notFound();

  return (
    <ClassDetailView
      variant="admin"
      data={data}
      tab={tab}
      vocabPanel={
        vocabPanel ? (
          <ClassVocabPanel
            classId={classId}
            students={vocabPanel.students}
            setOptions={vocabPanel.setOptions}
            onAssign={classActions.adminAssignVocabSetToStudent}
            onRemove={classActions.adminRemoveVocabSetFromStudent}
          />
        ) : null
      }
    />
  );
}
