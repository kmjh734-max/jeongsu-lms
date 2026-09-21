"use server";

import {
  debitLessonCredits,
  LESSON_CREDIT_FEATURES,
  lessonCreditShortfall,
} from "@/lib/credits/lesson-credits";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateOnePageContent } from "@/lib/lesson-materials/generate-one-page";
import type { LessonPackData } from "@/lib/lesson-materials/generate-lesson-pack";
import {
  isOnePageContentFresh,
  normalizeOnePageTestPayload,
  onePageSentences,
  type OnePageContent,
} from "@/lib/lesson-materials/one-page";
import { patchLessonPack } from "@/lib/lesson-materials/patch-lesson-pack";

type Role = "admin" | "teacher";

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) return { profile: null, error: "권한이 없습니다." };
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null, error: "비활성화된 계정입니다." };
  }
  if (!profile.academy_id) return { profile: null, error: "소속 학원 정보가 없습니다." };
  return { profile, error: null as null };
}

/**
 * 지문 하나의 1장 자료 재료를 준비한다. 원문이 그대로면 저장해 둔 재료를 쓰고(차감 없음),
 * 없거나 원문이 바뀌었거나 다시 만들기를 누르면 새로 만들어 저장한 뒤 차감한다.
 */
export async function prepareOnePageContentAction(
  role: Role,
  input: { projectId: string; forceRegenerate?: boolean; kind?: "summary" | "test" }
): Promise<{ ok: true; content: OnePageContent; generated: boolean } | { ok: false; message: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };
  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "선택된 자료가 없습니다." };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,lesson_pack_json,deleted_at")
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: projects, error: pErr } = await pq;
  if (pErr) return { ok: false, message: pErr.message };
  const project = (projects ?? [])[0];
  if (!project) return { ok: false, message: "지문을 찾을 수 없습니다." };

  const { data: items, error: iErr } = await supabase
    .from("lesson_material_items")
    .select("english_text,order_index")
    .eq("project_id", project.id)
    .order("order_index", { ascending: true });
  if (iErr) return { ok: false, message: iErr.message };
  const english = onePageSentences(items ?? []).map((s) => s.english);

  const pack = (project.lesson_pack_json ?? {}) as Partial<LessonPackData>;
  const feature =
    input.kind === "test" ? LESSON_CREDIT_FEATURES.onePageTest : LESSON_CREDIT_FEATURES.onePageSummary;
  const label = input.kind === "test" ? "1장 테스트" : "1장 요약직보자료";
  // 같은 지문·같은 갈래는 한 번만 받는다(다시 열거나 다시 만들어도 더 받지 않는다)
  const once = `${feature}:${project.id}`;

  const shortfall = await lessonCreditShortfall(profile!.academy_id!, feature);
  if (shortfall) return { ok: false, message: shortfall };

  // 재료가 이미 있어도 이 갈래로는 처음이면 값을 매긴다 — 자료 하나가 값 하나다
  const charge = () =>
    debitLessonCredits({
      academyId: profile!.academy_id!,
      actorId: profile!.id,
      featureKey: feature,
      projectId: project.id as string,
      idempotencyKey: once,
      note: `${label} · ${project.title}`,
    });

  if (!input.forceRegenerate && isOnePageContentFresh(pack.onePageContent, english)) {
    await charge();
    return { ok: true, content: pack.onePageContent, generated: false };
  }

  try {
    const { content } = await generateOnePageContent({ title: project.title as string, sentences: english });
    await patchLessonPack(supabase, project.id as string, pack, { onePageContent: content });
    await charge();
    return { ok: true, content, generated: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : `${label}를 만들지 못했습니다.` };
  }
}

/**
 * 조립한 1장 테스트를 테스트 파일(lesson_material_documents.payload)에 저장한다. 다음에 열면
 * 다시 조립하지 않고 그대로 보여 준다(정답도 그대로). 행 소유는 RLS가 가린다.
 */
export async function saveOnePageTestAction(
  role: Role,
  input: { id: string; payload: unknown }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };
  const payload = normalizeOnePageTestPayload(input.payload);
  const id = String(input.id ?? "").trim();
  if (!id || !payload || payload.passages.length === 0) {
    return { ok: false, message: "저장할 테스트가 없습니다." };
  }
  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("lesson_material_documents")
    .update({ payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "one_page_test")
    .eq("academy_id", profile!.academy_id!)
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "테스트 파일을 찾을 수 없습니다." };
  return { ok: true };
}
