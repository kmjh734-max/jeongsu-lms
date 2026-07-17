import { after, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { deleteListeningSet } from "@/lib/listening/delete-set";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";
import { assertFolderAccessible } from "@/lib/listening/folder-access";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { setId } = await context.params;
    const body = (await request.json()) as {
      is_published?: boolean;
      title?: string;
      speech_speed?: number;
      grade_level?: string;
      voice_ann_id?: string | null;
      voice_m_id?: string | null;
      voice_w_id?: string | null;
      dictation_enabled?: boolean;
      dictation_pass_score?: number;
      dictation_blank_level?: string;
      dictation_randomize_on_retry?: boolean;
      dictation_lock_next_until_pass?: boolean;
      folderId?: string | null;
    };

    const supabase = await createClient();

    if (body.folderId) {
      const allowed = await assertFolderAccessible(
        supabase,
        profile.role,
        profile.id,
        body.folderId
      );
      if (!allowed) {
        return jsonError("선택한 폴더에 접근할 수 없습니다.", 403);
      }
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.is_published === "boolean") patch.is_published = body.is_published;
    if (typeof body.title === "string" && body.title.trim()) {
      patch.title = body.title.trim();
    }
    if (typeof body.speech_speed === "number") {
      patch.speech_speed = Math.min(Math.max(body.speech_speed, 0.25), 4);
    }
    if (
      body.grade_level === "middle1" ||
      body.grade_level === "middle2" ||
      body.grade_level === "middle3" ||
      body.grade_level === "high1"
    ) {
      patch.grade_level = body.grade_level;
    }
    if (body.voice_ann_id !== undefined) {
      patch.voice_ann_id = body.voice_ann_id?.trim() || null;
    }
    if (body.voice_m_id !== undefined) {
      patch.voice_m_id = body.voice_m_id?.trim() || null;
    }
    if (body.voice_w_id !== undefined) {
      patch.voice_w_id = body.voice_w_id?.trim() || null;
    }
    if (typeof body.dictation_enabled === "boolean") {
      patch.dictation_enabled = body.dictation_enabled;
    }
    if (typeof body.dictation_pass_score === "number") {
      patch.dictation_pass_score = Math.min(
        100,
        Math.max(0, Math.round(body.dictation_pass_score))
      );
    }
    if (
      body.dictation_blank_level === "auto" ||
      body.dictation_blank_level === "few" ||
      body.dictation_blank_level === "normal" ||
      body.dictation_blank_level === "many"
    ) {
      patch.dictation_blank_level = body.dictation_blank_level;
    }
    if (typeof body.dictation_randomize_on_retry === "boolean") {
      patch.dictation_randomize_on_retry = body.dictation_randomize_on_retry;
    }
    if (typeof body.dictation_lock_next_until_pass === "boolean") {
      patch.dictation_lock_next_until_pass = body.dictation_lock_next_until_pass;
    }
    if (body.folderId !== undefined) {
      patch.folder_id = body.folderId;
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("변경할 내용이 없습니다.");
    }

    const { error } = await supabase
      .from("listening_sets")
      .update(patch)
      .eq("id", setId);

    if (error) return jsonError(error.message);

    const shouldEnsureDictation =
      body.dictation_enabled === true ||
      body.dictation_blank_level !== undefined ||
      body.dictation_pass_score !== undefined;

    if (shouldEnsureDictation) {
      after(() => {
        void ensureDictationPreparedForSet(setId, { includeVariants: false }).catch(
          () => undefined
        );
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장 실패";
    return jsonError(message);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { setId } = await context.params;
    const supabase = await createClient();

    const { data: setRow, error: setErr } = await supabase
      .from("listening_sets")
      .select("id, teacher_id, created_by")
      .eq("id", setId)
      .maybeSingle();

    if (setErr || !setRow) {
      return jsonError("듣기 세트를 찾을 수 없습니다.");
    }

    if (
      profile.role === "teacher" &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("이 세트를 삭제할 권한이 없습니다.", 403);
    }

    await deleteListeningSet(setId);

    return NextResponse.json({ ok: true, message: "듣기 세트를 삭제했습니다." });
  } catch (e) {
    const message = e instanceof Error ? e.message : "삭제 실패";
    return jsonError(message);
  }
}
