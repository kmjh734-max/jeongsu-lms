"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  persistVocabItems,
  type VocabItemSaveInput,
} from "@/lib/vocab/save-items";

function revalidateTeacherVocab(setId?: string) {
  revalidatePath("/teacher/vocab");
  if (setId) revalidatePath(`/teacher/vocab/${setId}`);
  revalidatePath("/student/vocab");
}

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

export async function createVocabSet(input: {
  title: string;
  description?: string;
}): Promise<ActionResult & { setId?: string }> {
  const { profile, error } = await requireTeacher();
  if (error) return error;

  const title = input.title.trim();
  if (!title) return actionError("단어장 제목을 입력해 주세요.");

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("vocab_sets")
    .insert({
      title,
      description: input.description?.trim() || null,
      teacher_id: profile!.id,
      created_by: profile!.id,
      is_published: true,
    })
    .select("id")
    .single();

  if (insertError) return actionError(insertError.message);

  revalidateTeacherVocab();
  return { ...actionSuccess("단어장이 생성되었습니다."), setId: data.id };
}

export async function updateVocabSet(
  setId: string,
  input: {
    title?: string;
    description?: string;
  }
): Promise<ActionResult> {
  const { error } = await requireTeacher();
  if (error) return error;

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return actionError("단어장 제목을 입력해 주세요.");
    payload.title = title;
  }
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }
  payload.is_published = true;

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("vocab_sets")
    .update(payload)
    .eq("id", setId);

  if (updateError) return actionError(updateError.message);

  revalidateTeacherVocab(setId);
  return actionSuccess("단어장이 수정되었습니다.");
}

export async function deleteVocabSet(setId: string): Promise<ActionResult> {
  const { error } = await requireTeacher();
  if (error) return error;

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("vocab_sets")
    .delete()
    .eq("id", setId);

  if (deleteError) return actionError(deleteError.message);

  revalidateTeacherVocab();
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

  revalidateTeacherVocab(setId);
  const count = items.filter((i) => i.word.trim() && i.meaning.trim()).length;
  return actionSuccess(`${count}개 단어가 저장되었습니다.`);
}

export async function assignVocabSet(input: {
  setId: string;
  studentId?: string;
  classId?: string;
}): Promise<ActionResult> {
  const { profile, error } = await requireTeacher();
  if (error) return error;

  if (!input.studentId && !input.classId) {
    return actionError("학생 또는 반을 선택해 주세요.");
  }

  const supabase = await createClient();

  if (input.studentId) {
    const { error: insertError } = await supabase.from("vocab_assignments").insert({
      set_id: input.setId,
      student_id: input.studentId,
      assigned_by: profile!.id,
    });
    if (insertError) {
      if (insertError.code === "23505") {
        return actionError("이미 해당 학생에게 배정된 단어장입니다.");
      }
      return actionError(insertError.message);
    }
  }

  if (input.classId) {
    const { error: insertError } = await supabase.from("vocab_assignments").insert({
      set_id: input.setId,
      class_id: input.classId,
      assigned_by: profile!.id,
    });
    if (insertError) {
      if (insertError.code === "23505") {
        return actionError("이미 해당 반에 배정된 단어장입니다.");
      }
      return actionError(insertError.message);
    }
  }

  revalidateTeacherVocab(input.setId);
  revalidatePath("/student/vocab");
  return actionSuccess("단어장이 배정되었습니다.");
}

export async function removeVocabAssignment(
  assignmentId: string,
  setId: string
): Promise<ActionResult> {
  const { error } = await requireTeacher();
  if (error) return error;

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("vocab_assignments")
    .delete()
    .eq("id", assignmentId);

  if (deleteError) return actionError(deleteError.message);

  revalidateTeacherVocab(setId);
  revalidatePath("/student/vocab");
  return actionSuccess("배정이 해제되었습니다.");
}
