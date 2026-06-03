import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDictationClientPayload } from "@/lib/listening/dictation/build-passage-display";
import { isStudentAssignedListeningSet } from "@/lib/listening/student-set-access";
import type {
  DictationBlankItem,
  DictationSetSettings,
  DictationStartPayloadClient,
} from "@/lib/listening/dictation/types";
import { DEFAULT_DICTATION_SETTINGS } from "@/lib/listening/dictation/types";

export async function assertStudentListeningQuestionAccess(
  setId: string,
  questionId: string
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return { ok: false as const, message: "학생 권한이 필요합니다.", status: 403 };
  }

  const admin = createAdminClient();
  const { data: question, error: qErr } = await admin
    .from("listening_questions")
    .select("id, set_id, script_text, question_type, answer_clue")
    .eq("id", questionId)
    .eq("set_id", setId)
    .maybeSingle();

  if (qErr || !question) {
    return { ok: false as const, message: "문항을 찾을 수 없습니다.", status: 404 };
  }

  const { data: setRow } = await admin
    .from("listening_sets")
    .select(
      "id, is_published, dictation_enabled, dictation_pass_score, dictation_blank_level, dictation_randomize_on_retry, dictation_lock_next_until_pass"
    )
    .eq("id", setId)
    .maybeSingle();

  if (!setRow?.is_published) {
    return { ok: false as const, message: "공개된 세트가 아닙니다.", status: 403 };
  }

  const assigned = await isStudentAssignedListeningSet(admin, profile.id, setId);
  if (!assigned) {
    return { ok: false as const, message: "배정된 듣기 세트가 아닙니다.", status: 403 };
  }

  const settings: DictationSetSettings = {
    dictation_enabled: setRow.dictation_enabled ?? DEFAULT_DICTATION_SETTINGS.dictation_enabled,
    dictation_pass_score:
      setRow.dictation_pass_score ?? DEFAULT_DICTATION_SETTINGS.dictation_pass_score,
    dictation_blank_level:
      (setRow.dictation_blank_level as DictationSetSettings["dictation_blank_level"]) ??
      DEFAULT_DICTATION_SETTINGS.dictation_blank_level,
    dictation_randomize_on_retry:
      setRow.dictation_randomize_on_retry ??
      DEFAULT_DICTATION_SETTINGS.dictation_randomize_on_retry,
    dictation_lock_next_until_pass:
      setRow.dictation_lock_next_until_pass ??
      DEFAULT_DICTATION_SETTINGS.dictation_lock_next_until_pass,
  };

  const { data: segments } = await admin
    .from("listening_question_segments")
    .select("speaker_type, text, order_index")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });

  return {
    ok: true as const,
    profile,
    admin,
    question,
    settings,
    segments: (segments ?? []).map((s) => ({
      speaker: s.speaker_type as string,
      text: s.text as string,
    })),
  };
}

export function buildDictationStartPayload(
  items: DictationBlankItem[],
  opts: {
    scriptText: string;
    segments?: Array<{ speaker: string; text: string }>;
  }
): Omit<DictationStartPayloadClient, "attemptId"> {
  return buildDictationClientPayload(items, opts);
}

export function formatDictationStartResponse(
  attemptId: string,
  items: DictationBlankItem[],
  access: {
    question: { script_text?: string | null };
    segments: Array<{ speaker: string; text: string }>;
  }
) {
  const display = buildDictationStartPayload(items, {
    scriptText: access.question.script_text ?? "",
    segments: access.segments,
  });
  return {
    attemptId,
    ...display,
    blankItems: stripBlankAnswersForClient(items),
  };
}

/** @deprecated buildDictationStartPayload 사용 */
export function stripBlankAnswersForClient(
  items: DictationBlankItem[]
): Array<{ id: string; speaker: string; display_sentence: string }> {
  return items.map((item) => ({
    id: item.id,
    speaker: item.speaker,
    display_sentence: item.display_sentence,
  }));
}
