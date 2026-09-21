"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTableOfContents, saveTextbook } from "@/lib/textbooks";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";

type Result = { ok: boolean; message: string };

/** 교재 목차 저장 — 붙여 넣은 목차를 층으로 나눠 트리로 만든다 */
export async function saveTextbookAction(input: {
  textbookId?: string | null;
  title: string;
  subject?: string;
  toc: string;
}): Promise<Result> {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "teacher"].includes(profile.role) || !profile.academy_id) {
    return { ok: false, message: "권한이 없어요." };
  }
  if (!(await isStudyPlanEnabled(profile.academy_id))) {
    return { ok: false, message: "권한이 없어요." };
  }
  const title = input.title.trim();
  if (!title) return { ok: false, message: "교재 이름을 적어 주세요." };

  const units = parseTableOfContents(input.toc);
  if (units.length === 0) return { ok: false, message: "목차를 한 줄 이상 붙여 넣어 주세요." };

  try {
    await saveTextbook(createAdminClient(), {
      academyId: profile.academy_id,
      title,
      subject: input.subject?.trim() || null,
      createdBy: profile.id,
      units,
      textbookId: input.textbookId ?? null,
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했어요." };
  }
  revalidatePath("/admin/textbooks");
  revalidatePath("/admin/study-plans");
  return { ok: true, message: `목차 ${units.length}줄을 저장했어요.` };
}

/** 교재 지우기 */
export async function deleteTextbookAction(textbookId: string): Promise<Result> {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "teacher"].includes(profile.role) || !profile.academy_id) {
    return { ok: false, message: "권한이 없어요." };
  }
  if (!(await isStudyPlanEnabled(profile.academy_id))) {
    return { ok: false, message: "권한이 없어요." };
  }
  const admin = createAdminClient();
  await admin.from("textbooks").delete().eq("id", textbookId).eq("academy_id", profile.academy_id);
  revalidatePath("/admin/textbooks");
  return { ok: true, message: "지웠어요." };
}
