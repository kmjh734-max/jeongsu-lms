import type { SupabaseClient } from "@supabase/supabase-js";

export interface LessonProgressUpsertInput {
  studentId: string;
  lessonId: string;
  watchedSeconds: number;
  progressPercent: number;
  markCompleted: boolean;
}

export interface LessonProgressUpsertResult {
  ok: boolean;
  message?: string;
  isCompleted?: boolean;
  progressPercent?: number;
  watchedSeconds?: number;
}

export async function upsertLessonProgress(
  supabase: SupabaseClient,
  input: LessonProgressUpsertInput
): Promise<LessonProgressUpsertResult> {
  const { data: existing, error: readError } = await supabase
    .from("lesson_progress")
    .select("is_completed, completed_at, progress_percent, watched_seconds")
    .eq("student_id", input.studentId)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  const now = new Date().toISOString();
  const alreadyCompleted = existing?.is_completed === true;
  const willComplete = input.markCompleted || alreadyCompleted;

  const mergedPercent = Math.max(
    input.progressPercent,
    existing?.progress_percent ?? 0
  );

  /** 최초 완료(90%+) 시에만 최소 90% 보장, 이후에는 100%까지 올라갈 수 있음 */
  const progress_percent =
    willComplete && !alreadyCompleted
      ? Math.max(mergedPercent, 90)
      : Math.min(100, mergedPercent);

  const finalWatchedSeconds = Math.max(
    input.watchedSeconds,
    existing?.watched_seconds ?? 0
  );

  const payload = {
    student_id: input.studentId,
    lesson_id: input.lessonId,
    watched_seconds: finalWatchedSeconds,
    progress_percent,
    last_watched_at: now,
    is_completed: willComplete,
    completed_at: willComplete
      ? (existing?.completed_at ?? now)
      : (existing?.completed_at ?? null),
  };

  const { error: upsertError } = await supabase
    .from("lesson_progress")
    .upsert(payload, { onConflict: "student_id,lesson_id" });

  if (upsertError) {
    const hint =
      upsertError.message.includes("watched_seconds") ||
      upsertError.message.includes("progress_percent")
        ? " DB 마이그레이션 007_lesson_progress_watch_stats.sql 을 적용해 주세요."
        : "";
    return { ok: false, message: upsertError.message + hint };
  }

  return {
    ok: true,
    isCompleted: willComplete,
    progressPercent: payload.progress_percent,
    watchedSeconds: payload.watched_seconds,
  };
}
