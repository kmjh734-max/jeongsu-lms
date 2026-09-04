import { createClient } from "@/lib/supabase/server";
import { LessonPackWorkbench } from "@/components/lesson-materials/LessonPackWorkbench";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";
import type {
  LessonPackData,
  LessonPackVocabItem,
} from "@/lib/lesson-materials/generate-lesson-pack";
import Link from "next/link";

export default async function AdminLessonPackPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsRaw } = await searchParams;
  const ids = (idsRaw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-slate-600">선택된 자료가 없습니다.</p>
        <Link
          href="/admin/lesson-materials"
          className="mt-3 inline-block text-sm text-violet-700"
        >
          ← 자료함
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("lesson_material_projects")
    .select(
      "id,title,title_en,folder_id,analysis_json,illustration_url,lesson_pack_json,deleted_at"
    )
    .in("id", ids)
    .is("deleted_at", null);

  const folderIds = [
    ...new Set(
      (projects ?? [])
        .map((p) => p.folder_id)
        .filter((id): id is string => !!id)
    ),
  ];
  const { data: folders } = folderIds.length
    ? await supabase
        .from("lesson_material_folders")
        .select("id,name")
        .in("id", folderIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const folderNameById = new Map(
    (folders ?? []).map((f) => [f.id, f.name] as const)
  );

  const { data: items } = await supabase
    .from("lesson_material_items")
    .select("id,project_id,english_text,korean_text,order_index")
    .in("project_id", ids)
    .order("order_index", { ascending: true });

  const itemsByProject = new Map<string, typeof items>();
  for (const it of items ?? []) {
    const list = itemsByProject.get(it.project_id) ?? [];
    list.push(it);
    itemsByProject.set(it.project_id, list);
  }

  // Preserve selection order
  const byId = new Map((projects ?? []).map((p) => [p.id, p] as const));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

  const payload = ordered.map((p) => {
    const pack = (p!.lesson_pack_json ?? {}) as Partial<LessonPackData>;
    const analysis = Array.isArray(p!.analysis_json)
      ? (p!.analysis_json as LessonMaterialAnalysisCard[])
      : [];
    const vocab = Array.isArray(pack.vocab)
      ? (pack.vocab as LessonPackVocabItem[])
      : [];
    return {
      id: p!.id,
      title: p!.title,
      titleEn: (p!.title_en as string | null) ?? null,
      folderName: p!.folder_id
        ? (folderNameById.get(p!.folder_id) ?? "폴더")
        : "미분류",
      analysisCards: analysis,
      headerLabel: pack.headerLabel || "26년도 1학기 중간고사 대비",
      vocab,
      illustrationUrl: (p!.illustration_url as string | null) ?? null,
      items: (itemsByProject.get(p!.id) ?? []).map((it) => ({
        id: it.id,
        english_text: it.english_text,
        korean_text: it.korean_text,
        order_index: it.order_index,
      })),
    };
  });

  return <LessonPackWorkbench role="admin" projects={payload} />;
}
