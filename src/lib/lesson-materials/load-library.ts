import type { SupabaseClient } from "@supabase/supabase-js";
import type { LessonMaterialDocumentRow } from "@/lib/lesson-materials/documents";

export interface LessonMaterialFolderRow {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface LessonMaterialProjectRow {
  id: string;
  title: string;
  title_en: string | null;
  source: string | null;
  folder_id: string | null;
  updated_at: string;
  deleted_at: string | null;
  order_index: number;
  analysis_json?: unknown;
  /** True when logical-flow analysis exists */
  has_analysis: boolean;
  /** True when 수업용 자료(lesson pack) was saved */
  has_lesson_pack: boolean;
  /** True when 분석서 was saved */
  has_analysis_report: boolean;
}

export interface LessonMaterialLibraryData {
  folders: LessonMaterialFolderRow[];
  /** Active (not trashed) projects with a folder */
  projects: LessonMaterialProjectRow[];
  /** Active projects with no folder */
  unfiledProjects: LessonMaterialProjectRow[];
  /** Soft-deleted projects */
  trashedProjects: LessonMaterialProjectRow[];
  itemCountByProjectId: Record<string, number>;
  /** 만든 파일(수업용 자료 · 분석서 · 워크북), 최신순 */
  documents: LessonMaterialDocumentRow[];
}

function analysisSnippet(analysis_json: unknown): string {
  if (!Array.isArray(analysis_json) || analysis_json.length === 0) return "";
  const first = analysis_json[0] as { desc?: string; title?: string };
  return String(first?.desc ?? first?.title ?? "").trim();
}

function hasLessonPack(lesson_pack_json: unknown): boolean {
  if (!lesson_pack_json || typeof lesson_pack_json !== "object") return false;
  const pack = lesson_pack_json as { vocab?: unknown; headerLabel?: unknown };
  return (
    Array.isArray(pack.vocab) ||
    (typeof pack.headerLabel === "string" && pack.headerLabel.trim().length > 0)
  );
}

export async function loadLessonMaterialsLibraryData(
  supabase: SupabaseClient
): Promise<LessonMaterialLibraryData> {
  /**
   * 뱃지(분석·수업자료·분석서 있음)에 필요한 조각만 JSON 경로로 가져온다.
   *
   * 예전에는 지문마다 lesson_pack_json(어법 선택 캐시까지 통째로)과 analysis_report_json
   * 전체를 내려받아 있음/없음만 계산했다. 지문이 늘수록 자료함 첫 화면과, 순서를 바꾼 뒤
   * 새로 고침이 그만큼 느려졌다.
   */
  const [foldersRes, projectsRes, itemsRes, documentsRes] = await Promise.all([
    supabase
      .from("lesson_material_folders")
      .select("id,name,parent_id,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("lesson_material_projects")
      .select(
        "id,title,title_en,source,folder_id,updated_at,deleted_at,order_index,analysis_first:analysis_json->0,pack_vocab:lesson_pack_json->vocab,pack_header:lesson_pack_json->>headerLabel,report_first:analysis_report_json->sentences->0"
      )
      .order("order_index", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase
      .from("lesson_material_items")
      .select("project_id,id")
      .order("created_at", { ascending: true }),
    supabase
      .from("lesson_material_documents")
      .select("id,kind,name,project_ids,created_at,updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const folders = (foldersRes.data ?? []) as LessonMaterialFolderRow[];
  const rawProjects = (projectsRes.data ?? []) as unknown as Array<
    Omit<
      LessonMaterialProjectRow,
      "has_analysis" | "has_lesson_pack" | "has_analysis_report" | "analysis_json"
    > & {
      analysis_first?: unknown;
      pack_vocab?: unknown;
      pack_header?: string | null;
      report_first?: unknown;
      order_index?: number | null;
    }
  >;

  const projects: LessonMaterialProjectRow[] = rawProjects.map((p) => {
    const { analysis_first, pack_vocab, pack_header, report_first, ...rest } = p;
    return {
      ...rest,
      order_index: typeof p.order_index === "number" ? p.order_index : 0,
      has_analysis: analysis_first != null,
      has_lesson_pack: hasLessonPack({ vocab: pack_vocab ?? undefined, headerLabel: pack_header ?? undefined }),
      has_analysis_report: report_first != null,
    };
  });
  // 파일 테이블이 없는 환경(마이그레이션 128 전)에서도 자료함은 열린다.
  const documents = (documentsRes.error ? [] : documentsRes.data ?? []) as LessonMaterialDocumentRow[];

  const itemCountByProjectId: Record<string, number> = {};
  for (const row of (itemsRes.data ?? []) as Array<{
    project_id: string;
  }>) {
    itemCountByProjectId[row.project_id] =
      (itemCountByProjectId[row.project_id] ?? 0) + 1;
  }

  const active = projects.filter((p) => !p.deleted_at);
  const trashed = projects.filter((p) => !!p.deleted_at);

  return {
    folders,
    projects: active.filter((p) => p.folder_id !== null),
    unfiledProjects: active.filter((p) => p.folder_id === null),
    trashedProjects: trashed,
    itemCountByProjectId,
    documents,
  };
}

export { analysisSnippet };
