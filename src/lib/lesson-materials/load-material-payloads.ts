import type { SupabaseClient } from "@supabase/supabase-js";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";
import type { LessonPackData, LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import type { LessonPackProjectInput } from "@/components/lesson-materials/LessonPackWorkbench";
import type { AnalysisReportProjectInput } from "@/components/lesson-materials/AnalysisReportWorkbench";
import {
  isOnePageContentFresh,
  onePageSentences,
  onePageSourceHash,
  type OnePageProjectInput,
} from "@/lib/lesson-materials/one-page";

/**
 * 수업용 자료·분석서 화면에 넘길 지문 데이터(최종통합자료가 여러 파일을 한꺼번에 불러올 때 쓴다).
 * 수업용 자료·분석서 페이지와 같은 모양으로 만든다. 조회는 사용자 세션이라 RLS가 권한을 가린다.
 */
export async function loadLessonPackProjects(
  supabase: SupabaseClient,
  ids: string[]
): Promise<LessonPackProjectInput[]> {
  if (ids.length === 0) return [];
  const [{ data: projects }, { data: items }] = await Promise.all([
    supabase
      .from("lesson_material_projects")
      .select("id,title,title_en,source,folder_id,analysis_json,illustration_url,lesson_pack_json,deleted_at")
      .in("id", ids)
      .is("deleted_at", null),
    supabase
      .from("lesson_material_items")
      .select("id,project_id,english_text,korean_text,order_index")
      .in("project_id", ids)
      .order("order_index", { ascending: true }),
  ]);
  const folderIds = [
    ...new Set((projects ?? []).map((p) => p.folder_id as string | null).filter((id): id is string => !!id)),
  ];
  const { data: folders } = folderIds.length
    ? await supabase.from("lesson_material_folders").select("id,name").in("id", folderIds)
    : { data: [] as Array<{ id: string; name: string }> };
  const folderNameById = new Map((folders ?? []).map((f) => [f.id as string, f.name as string] as const));
  const itemsByProject = new Map<string, NonNullable<typeof items>>();
  for (const it of items ?? []) {
    const list = itemsByProject.get(it.project_id as string) ?? [];
    list.push(it);
    itemsByProject.set(it.project_id as string, list);
  }
  const byId = new Map((projects ?? []).map((p) => [p.id as string, p] as const));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => {
      const pack = (p.lesson_pack_json ?? {}) as Partial<LessonPackData>;
      return {
        id: p.id as string,
        title: p.title as string,
        titleEn: (p.title_en as string | null) ?? null,
        source: (p.source as string | null) ?? null,
        folderName: p.folder_id ? (folderNameById.get(p.folder_id as string) ?? "폴더") : "미분류",
        analysisCards: Array.isArray(p.analysis_json) ? (p.analysis_json as LessonMaterialAnalysisCard[]) : [],
        headerLabel: pack.headerLabel || "26년도 1학기 중간고사 대비",
        vocab: Array.isArray(pack.vocab) ? (pack.vocab as LessonPackVocabItem[]) : [],
        antonymChecked: pack.vocabAntonymChecked === true,
        illustrationUrl: (p.illustration_url as string | null) ?? null,
        items: (itemsByProject.get(p.id as string) ?? []).map((it) => ({
          id: it.id as string,
          english_text: it.english_text as string,
          korean_text: (it.korean_text as string | null) ?? null,
          order_index: it.order_index as number,
        })),
      };
    });
}

export async function loadAnalysisReportProjects(
  supabase: SupabaseClient,
  ids: string[]
): Promise<AnalysisReportProjectInput[]> {
  if (ids.length === 0) return [];
  const { data: projects } = await supabase
    .from("lesson_material_projects")
    .select("id,title,title_en,source,analysis_report_json,deleted_at")
    .in("id", ids)
    .is("deleted_at", null);
  const byId = new Map((projects ?? []).map((p) => [p.id as string, p] as const));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => {
      const report = (p.analysis_report_json ?? null) as AnalysisReportData | null;
      const hasSentences = !!report && Array.isArray(report.sentences) && report.sentences.length > 0;
      return {
        id: p.id as string,
        title: p.title as string,
        titleEn: (p.title_en as string | null) ?? null,
        source: (p.source as string | null) ?? null,
        headerLabel: report?.headerLabel || "26년도 1학기 중간고사 대비",
        report: hasSentences ? report : null,
      };
    });
}

/**
 * 1장 정리자료·1장 테스트 화면에 넘길 지문 데이터. 재료는 지금 원문으로 만든 것만 넘기고,
 * 없거나 옛 원문이면 null로 둬서 화면이 준비하게 한다.
 */
export async function loadOnePageProjects(
  supabase: SupabaseClient,
  ids: string[]
): Promise<OnePageProjectInput[]> {
  if (ids.length === 0) return [];
  const [{ data: projects }, { data: items }] = await Promise.all([
    supabase
      .from("lesson_material_projects")
      .select("id,title,title_en,source,lesson_pack_json,deleted_at")
      .in("id", ids)
      .is("deleted_at", null),
    supabase
      .from("lesson_material_items")
      .select("project_id,english_text,korean_text,order_index")
      .in("project_id", ids)
      .order("order_index", { ascending: true }),
  ]);
  const itemsByProject = new Map<string, NonNullable<typeof items>>();
  for (const it of items ?? []) {
    const list = itemsByProject.get(it.project_id as string) ?? [];
    list.push(it);
    itemsByProject.set(it.project_id as string, list);
  }
  const byId = new Map((projects ?? []).map((p) => [p.id as string, p] as const));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => {
      const pack = (p.lesson_pack_json ?? {}) as Partial<LessonPackData>;
      const sentences = onePageSentences(
        (itemsByProject.get(p.id as string) ?? []) as Array<{ english_text?: string | null; korean_text?: string | null }>
      );
      const english = sentences.map((s) => s.english);
      return {
        id: p.id as string,
        title: p.title as string,
        titleEn: (p.title_en as string | null) ?? null,
        source: (p.source as string | null) ?? null,
        sentences,
        sourceHash: onePageSourceHash(english),
        content: isOnePageContentFresh(pack.onePageContent, english) ? pack.onePageContent : null,
      };
    });
}
