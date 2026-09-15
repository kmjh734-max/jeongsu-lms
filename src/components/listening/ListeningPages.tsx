import { notFound } from "next/navigation";
import { ListeningStatusPanel } from "@/components/learning-status/ListeningStatusPanel";
import { ListeningScheduleManageClient } from "@/components/listening/ListeningScheduleManageClient";
import { ListeningSetManageClient } from "@/components/listening/ListeningSetManageClient";
import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listeningSetIsLocked } from "@/lib/listening/listening-api-auth";
import { parseListeningGradeLevel } from "@/lib/listening/grade-level";
import {
  activeScheduleTargetsBySet,
  loadListeningModuleCounts,
  loadListeningSetQuestionStats,
} from "@/lib/listening/load-listening-overview";
import { loadListeningPageData } from "@/lib/listening/load-listening-page-data";
import { loadScheduleAssignPageData } from "@/lib/listening/load-schedule-assign-page-data";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";
import { listScheduleAssignments } from "@/lib/listening/schedule/list-assignments";
import { listReportClasses } from "@/lib/reports/list-students";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

type Role = "admin" | "teacher";

function basePathOf(role: Role) {
  return role === "admin" ? ("/admin/listening" as const) : ("/teacher/listening" as const);
}

function NoAcademy() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      소속 학원 정보가 없어요. 관리자에게 학원 연결을 부탁해 주세요.
    </div>
  );
}

/** 세트 탭 */
export async function ListeningSetsTabPage({ role }: { role: Role }) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const academyId = profile!.academy_id;
  const { sets, folders } = await loadListeningPageData(supabase, role, profile!.id);
  const [questionStats, assignments] = await Promise.all([
    loadListeningSetQuestionStats(
      supabase,
      sets.map((s) => s.id)
    ),
    academyId
      ? listScheduleAssignments(createAdminClient(), role, profile!.id, academyId)
      : Promise.resolve([]),
  ]);

  return (
    <ListeningSetsListClient
      sets={sets}
      folders={folders}
      basePath={basePathOf(role)}
      questionStats={questionStats}
      targetsBySet={activeScheduleTargetsBySet(assignments)}
      assignCount={assignments.filter((a) => a.isActive).length}
    />
  );
}

/** 배정 탭 */
export async function ListeningAssignTabPage({
  role,
  presetSetId,
}: {
  role: Role;
  presetSetId?: string;
}) {
  const profile = await getCurrentProfile();
  const academyId = profile!.academy_id;
  if (!academyId) return <NoAcademy />;
  const supabase = await createClient();
  const [data, counts] = await Promise.all([
    loadScheduleAssignPageData(supabase, role, profile!.id, academyId),
    loadListeningModuleCounts(supabase, createAdminClient(), role, profile!.id, academyId),
  ]);

  return (
    <ListeningScheduleManageClient
      basePath={basePathOf(role)}
      classes={data.classes}
      sets={data.sets}
      folders={data.folders}
      assignments={data.assignments}
      students={data.students}
      classStudentCounts={data.classStudentCounts}
      studentClassNames={data.studentClassNames}
      progressByAssignment={data.progressByAssignment}
      todayIso={data.todayIso}
      setCount={counts.setCount}
      presetSetId={presetSetId}
    />
  );
}

/** 현황 탭 */
export async function ListeningStatusTabPage({ role }: { role: Role }) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, counts, branding] = await Promise.all([
    listReportClasses(supabase, role, profile!.id),
    loadListeningModuleCounts(
      supabase,
      createAdminClient(),
      role,
      profile!.id,
      profile!.academy_id ?? null
    ),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <ListeningStatusPanel
      basePath={basePathOf(role)}
      setCount={counts.setCount}
      assignCount={counts.activeAssignmentCount}
      initialClasses={classes}
      academyName={branding.name}
    />
  );
}

/** 세트 한 개 (문항 만들기 → 검토 → 음성 → 받아쓰기) */
export async function ListeningSetDetailPage({
  role,
  setId,
  step,
}: {
  role: Role;
  setId: string;
  step?: string;
}) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const loaded = await loadListeningSetForEditor(supabase, setId);
  if (!loaded) notFound();

  const isLocked = listeningSetIsLocked(loaded.set);
  if (role === "teacher") {
    const owns =
      loaded.set.teacher_id === profile!.id || loaded.set.created_by === profile!.id;
    if (!owns && !isLocked) notFound();
  }

  const folderId = (loaded.set as { folder_id?: string | null }).folder_id ?? null;
  const academyId = profile!.academy_id;
  const [folderRow, assignments] = await Promise.all([
    folderId
      ? supabase.from("listening_set_folders").select("name").eq("id", folderId).maybeSingle()
      : Promise.resolve({ data: null }),
    academyId
      ? listScheduleAssignments(createAdminClient(), role, profile!.id, academyId)
      : Promise.resolve([]),
  ]);
  const folderName = (folderRow.data as { name?: string } | null)?.name ?? null;
  const assignedTargets = activeScheduleTargetsBySet(assignments)[setId] ?? [];

  return (
    <ListeningSetManageClient
      setId={loaded.set.id}
      title={loaded.set.title}
      gradeLevel={parseListeningGradeLevel(loaded.set.grade_level)}
      speechSpeed={loaded.set.speech_speed ?? 0.75}
      voiceAnnId={loaded.set.voice_ann_id ?? null}
      voiceMId={loaded.set.voice_m_id ?? null}
      voiceWId={loaded.set.voice_w_id ?? null}
      dictationSettings={{
        dictation_enabled: loaded.set.dictation_enabled ?? true,
        dictation_pass_score: loaded.set.dictation_pass_score ?? 80,
        dictation_blank_level:
          (loaded.set.dictation_blank_level as "auto" | "few" | "normal" | "many") ?? "auto",
        dictation_randomize_on_retry: loaded.set.dictation_randomize_on_retry ?? true,
        dictation_lock_next_until_pass: loaded.set.dictation_lock_next_until_pass ?? true,
      }}
      questions={loaded.questions}
      role={role}
      isLocked={isLocked}
      folderName={folderName}
      assignedTargets={assignedTargets}
      initialStep={step}
    />
  );
}
