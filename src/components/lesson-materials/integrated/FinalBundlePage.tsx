import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { normalizeIntegratedPayload } from "@/lib/lesson-materials/integrated";
import {
  loadAnalysisReportProjects,
  loadLessonPackProjects,
} from "@/lib/lesson-materials/load-material-payloads";
import {
  FinalBundleClient,
  type FinalBundleMaterials,
} from "@/components/lesson-materials/integrated/FinalBundleClient";

/**
 * 최종통합자료 화면(서버). 통합자료 파일의 구성대로 고른 파일들의 데이터를 모아 넘긴다.
 * 조회는 사용자 세션이라 남의 파일은 RLS가 막는다.
 */
export async function FinalBundlePage({ role, docId }: { role: "admin" | "teacher"; docId?: string }) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const notFound = (
    <div className="px-4 py-10">
      <p className="text-sm text-slate-600">통합자료 파일을 찾을 수 없습니다.</p>
      <Link href={base} className="mt-3 inline-block text-sm text-violet-700">
        ← 자료함
      </Link>
    </div>
  );
  if (!docId) return notFound;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("lesson_material_documents")
    .select("id,name,payload,kind")
    .eq("id", docId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!row || row.kind !== "integrated") return notFound;
  const payload = normalizeIntegratedPayload(row.payload);

  const docIds = [
    ...payload.selections.lesson_pack,
    ...payload.selections.analysis_report,
    ...payload.selections.workbook,
  ];
  const { data: docs } = docIds.length
    ? await supabase
        .from("lesson_material_documents")
        .select("id,name,kind,project_ids")
        .in("id", docIds)
        .is("deleted_at", null)
    : { data: [] as Array<{ id: string; name: string; kind: string; project_ids: string[] }> };
  const docById = new Map((docs ?? []).map((d) => [d.id as string, d] as const));
  const pick = (id: string, kind: string) => {
    const d = docById.get(id);
    return d && d.kind === kind ? d : null;
  };

  const [lessonPacks, analyses] = await Promise.all([
    Promise.all(
      payload.selections.lesson_pack.map(async (id) => {
        const d = pick(id, "lesson_pack");
        if (!d) return null;
        return {
          docId: id,
          name: d.name as string,
          projects: await loadLessonPackProjects(supabase, (d.project_ids as string[]) ?? []),
        };
      })
    ),
    Promise.all(
      payload.selections.analysis_report.map(async (id) => {
        const d = pick(id, "analysis_report");
        if (!d) return null;
        return {
          docId: id,
          name: d.name as string,
          projects: await loadAnalysisReportProjects(supabase, (d.project_ids as string[]) ?? []),
        };
      })
    ),
  ]);

  const profile = await getCurrentProfile();
  let jobsQuery = supabase
    .from("question_generation_jobs")
    .select("id,title:request_config->>title")
    .in("id", payload.selections.questions.length ? payload.selections.questions : ["00000000-0000-0000-0000-000000000000"]);
  if (profile?.academy_id) jobsQuery = jobsQuery.eq("academy_id", profile.academy_id);
  if (profile?.role === "teacher") jobsQuery = jobsQuery.eq("created_by", profile.id);
  const { data: jobs } = await jobsQuery;
  const jobTitle = new Map((jobs ?? []).map((j) => [String((j as { id: string }).id), String((j as { title?: string }).title ?? "")] as const));

  const materials: FinalBundleMaterials = {
    lessonPacks: lessonPacks.filter((m): m is NonNullable<typeof m> => !!m && m.projects.length > 0),
    analyses: analyses.filter((m): m is NonNullable<typeof m> => !!m && m.projects.length > 0),
    workbooks: payload.selections.workbook
      .map((id) => pick(id, "workbook"))
      .filter((d): d is NonNullable<typeof d> => !!d)
      .map((d) => ({ docId: d.id as string, name: d.name as string })),
    questions: payload.selections.questions
      .filter((id) => jobTitle.has(id))
      .map((id) => ({ jobId: id, title: jobTitle.get(id) || "변형문제" })),
  };

  const branding = await getAcademyBrandingForCurrentUser();
  return (
    <FinalBundleClient
      role={role}
      docId={row.id as string}
      name={row.name as string}
      initialPayload={payload}
      materials={materials}
      logoSrc={branding.logoUrl}
      academyName={branding.name || ""}
    />
  );
}
