"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateWorkbookBlankFill } from "@/lib/lesson-materials/generate-workbook-blank";
import { generateWorkbookTf } from "@/lib/lesson-materials/generate-workbook-tf";
import {
  DEFAULT_WORKBOOK_BLANK_OPTIONS,
  DEFAULT_WORKBOOK_TF_OPTIONS,
  READY_WORKBOOK_TYPE_IDS,
  clampTfCount,
  defaultWorkbookTitle,
  parseBlankHintType,
  parseBlankTranslationLayout,
  parseBlankDensity,
  sortWorkbookTypesByPrintOrder,
  type WorkbookBlankFillOptions,
  type WorkbookData,
  type WorkbookTfOptions,
  type WorkbookTypeId,
} from "@/lib/lesson-materials/workbook-types";

type Role = "admin" | "teacher";

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) {
    return { profile: null as null, error: "권한이 없습니다." };
  }
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null as null, error: "비활성화된 계정입니다." };
  }
  if (!profile.academy_id) {
    return { profile: null as null, error: "소속 학원 정보가 없습니다." };
  }
  return { profile, error: null as null };
}

function normalizeSelectedTypes(raw: WorkbookTypeId[]): WorkbookTypeId[] {
  const ready = new Set(READY_WORKBOOK_TYPE_IDS);
  const filtered = [...new Set(raw)].filter((id) => ready.has(id));
  return sortWorkbookTypesByPrintOrder(filtered);
}

export async function generateWorkbookAction(
  role: Role,
  input: {
    projectIds: string[];
    selectedTypes: WorkbookTypeId[];
    tfOptions?: Partial<WorkbookTfOptions>;
    blankOptions?: Partial<WorkbookBlankFillOptions>;
    title?: string;
  }
): Promise<
  { ok: true; workbook: WorkbookData } | { ok: false; message: string }
> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const ids = (input.projectIds ?? []).map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return { ok: false, message: "선택된 자료가 없습니다." };

  const types = normalizeSelectedTypes(input.selectedTypes ?? []);
  if (types.length === 0) {
    return {
      ok: false,
      message: "생성 가능한 문제 유형을 선택해 주세요. (T/F, 빈칸 채우기)",
    };
  }
  const unknown = (input.selectedTypes ?? []).filter(
    (t) => !READY_WORKBOOK_TYPE_IDS.includes(t) && t
  );
  if (unknown.length) {
    return {
      ok: false,
      message: "준비 중인 유형이 포함되어 있습니다. T/F와 빈칸 채우기만 선택해 주세요.",
    };
  }

  const wantTf = types.includes("tf");
  const wantBlank = types.includes("blank_fill");

  const tfOptions: WorkbookTfOptions = {
    count: clampTfCount(
      input.tfOptions?.count ?? DEFAULT_WORKBOOK_TF_OPTIONS.count
    ),
    language:
      input.tfOptions?.language === "ko"
        ? "ko"
        : DEFAULT_WORKBOOK_TF_OPTIONS.language,
    difficulty:
      input.tfOptions?.difficulty === "hard"
        ? "hard"
        : DEFAULT_WORKBOOK_TF_OPTIONS.difficulty,
  };

  const blankOptions: WorkbookBlankFillOptions = {
    hintType: parseBlankHintType(input.blankOptions?.hintType),
    showTranslation:
      input.blankOptions?.showTranslation === false ? false : true,
    translationLayout: parseBlankTranslationLayout(
      input.blankOptions?.translationLayout
    ),
    density: parseBlankDensity(input.blankOptions?.density),
  };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,source,deleted_at")
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: projects, error: pErr } = await pq;
  if (pErr) return { ok: false, message: pErr.message };

  const byId = new Map((projects ?? []).map((p) => [p.id, p] as const));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  if (ordered.length === 0) {
    return { ok: false, message: "프로젝트를 찾을 수 없습니다." };
  }

  const passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{
      id: string;
      english: string;
      korean: string | null;
    }>;
    englishLines: string[];
  }> = [];

  for (const p of ordered) {
    const { data: items, error: iErr } = await supabase
      .from("lesson_material_items")
      .select("id,english_text,korean_text,order_index")
      .eq("project_id", p!.id)
      .order("order_index", { ascending: true });
    if (iErr) return { ok: false, message: iErr.message };
    const sentences = (items ?? []).map((it, idx) => ({
      id: String(it.id ?? `s${idx}`),
      english: String(it.english_text ?? ""),
      korean: (it.korean_text as string | null) ?? null,
    }));
    passages.push({
      projectId: p!.id,
      title: p!.title,
      source: (p!.source as string | null) ?? null,
      sentences,
      englishLines: sentences.map((s) => s.english),
    });
  }

  const now = new Date();
  const workbook: WorkbookData = {
    metadata: {
      title: input.title?.trim() || defaultWorkbookTitle(now),
      createdAt: now.toISOString(),
    },
    selectedTypes: types,
    tfOptions,
    blankOptions,
    sections: [],
    blankSections: [],
  };

  try {
    if (wantBlank) {
      workbook.blankSections = await generateWorkbookBlankFill({
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          sentences: p.sentences,
        })),
        options: blankOptions,
      });
    }

    if (wantTf) {
      const tf = await generateWorkbookTf({
        title: workbook.metadata.title,
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          englishLines: p.englishLines,
        })),
        options: tfOptions,
      });
      workbook.sections = tf.sections;
    }

    if (wantBlank && workbook.blankSections.length === 0) {
      return { ok: false, message: "빈칸 채우기 결과를 만들지 못했습니다." };
    }
    if (wantTf && workbook.sections.length === 0) {
      return { ok: false, message: "T/F 결과를 만들지 못했습니다." };
    }

    return { ok: true, workbook };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "워크북 생성 실패",
    };
  }
}
