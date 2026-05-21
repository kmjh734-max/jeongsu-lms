"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import {
  createVocabFolder as createFolderLib,
  deleteVocabFolder as deleteFolderLib,
  updateVocabFolder as updateFolderLib,
} from "@/lib/vocab/folder-actions";
import { revalidateVocabPaths } from "@/lib/vocab/revalidate";
import {
  persistVocabItems,
  type VocabItemSaveInput,
} from "@/lib/vocab/save-items";

const ROLE = "teacher" as const;

async function requireTeacher() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return { profile: null, error: actionError("강사 권한이 필요합니다.") };
  }
  if (profile.is_active === false) {
    return { profile: null, error: actionError("비활성화된 계정입니다.") };
  }
  return { profile, error: null };
}

export async function createVocabFolder(name: string) {
  return createFolderLib(ROLE, { name });
}

export async function updateVocabFolder(folderId: string, name: string) {
  return updateFolderLib(ROLE, folderId, { name });
}

export async function deleteVocabFolder(folderId: string) {
  return deleteFolderLib(ROLE, folderId);
}

export async function createVocabSet(input: {
  title: string;
  description?: string;
  folderId: string;
}): Promise<ActionResult & { setId?: string }> {
  const { profile, error } = await requireTeacher();
  if (error) return error;

  const title = input.title.trim();
  if (!title) return actionError("단어장 제목을 입력해 주세요.");
  if (!input.folderId) return actionError("폴더를 선택해 주세요.");

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("vocab_sets")
    .insert({
      title,
      description: input.description?.trim() || null,
      folder_id: input.folderId,
      teacher_id: profile!.id,
      created_by: profile!.id,
      is_published: true,
    })
    .select("id")
    .single();

  if (insertError) return actionError(insertError.message);

  revalidateVocabPaths(ROLE, { folderId: input.folderId, setId: data.id });
  return { ...actionSuccess("단어장이 생성되었습니다."), setId: data.id };
}

export async function updateVocabSet(
  setId: string,
  input: { title?: string; description?: string }
): Promise<ActionResult> {
  const { error } = await requireTeacher();
  if (error) return error;

  const payload: Record<string, unknown> = { is_published: true };
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return actionError("단어장 제목을 입력해 주세요.");
    payload.title = title;
  }
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("vocab_sets")
    .update(payload)
    .eq("id", setId);

  if (updateError) return actionError(updateError.message);

  revalidateVocabPaths(ROLE, { setId });
  return actionSuccess("단어장이 수정되었습니다.");
}

export async function deleteVocabSet(
  setId: string,
  folderId?: string | null
): Promise<ActionResult> {
  const { error } = await requireTeacher();
  if (error) return error;

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("vocab_sets")
    .delete()
    .eq("id", setId);

  if (deleteError) return actionError(deleteError.message);

  revalidateVocabPaths(ROLE, { setId, folderId: folderId ?? undefined });
  return actionSuccess("단어장이 삭제되었습니다.");
}

export async function saveVocabItems(
  setId: string,
  items: VocabItemSaveInput[]
): Promise<ActionResult> {
  const { error } = await requireTeacher();
  if (error) return error;

  const supabase = await createClient();
  const result = await persistVocabItems(supabase, setId, items);

  if (!result.ok) return actionError(result.message);

  revalidateVocabPaths(ROLE, { setId });
  const count = items.filter((i) => i.word.trim() && i.meaning.trim()).length;
  return actionSuccess(`${count}개 단어가 저장되었습니다.`);
}
