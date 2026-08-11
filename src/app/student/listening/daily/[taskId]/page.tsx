import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  loadDailyTaskProgressMap,
  reconcileDailyTaskDictationProgress,
} from "@/lib/listening/schedule/update-progress";
import { StudentListeningPractice } from "@/components/listening/StudentListeningPractice";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentListeningDailyTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: task } = await admin
    .from("listening_daily_tasks")
    .select(
      "id, student_id, assignment_id, set_id, question_ids, status, task_date, total_count"
    )
    .eq("id", taskId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!task) notFound();

  const todayIso = getTodayIsoKorea();
  if ((task.task_date as string) > todayIso) {
    redirect("/student/listening");
  }

  const { data: assignment } = await admin
    .from("listening_schedule_assignments")
    .select(
      "title, require_dictation_pass, dictation_pass_score, lock_next_until_today_complete"
    )
    .eq("id", task.assignment_id)
    .maybeSingle();

  const questionIds = (task.question_ids as string[]) ?? [];

  // 세트 경계를 넘는 하루 과제: question_ids 에 여러 set 이 섞일 수 있음.
  // task.set_id 로 필터하면 뒤 세트 문항이 빠져 Dictation 없이 끝나 보임.
  const { data: allQuestions } =
    questionIds.length > 0
      ? await admin
          .from("listening_questions")
          .select(
            "id, set_id, order_index, question_type, instruction, question_text, choices, correct_answer, audio_url, script_text, script_translation, answer_clue, explanation, table_data, needs_image_choices, choice_image_urls"
          )
          .in("id", questionIds)
      : { data: [] as Array<Record<string, unknown>> };

  const byId = new Map((allQuestions ?? []).map((q) => [q.id as string, q]));
  const ordered = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q);

  const setIds = [
    ...new Set([
      task.set_id as string,
      ...ordered.map((q) => q.set_id as string),
    ]),
  ];

  const { data: sets } = await admin
    .from("listening_sets")
    .select(
      "id, title, dictation_enabled, dictation_pass_score, dictation_blank_level, dictation_randomize_on_retry, dictation_lock_next_until_pass"
    )
    .in("id", setIds);

  const setById = new Map((sets ?? []).map((s) => [s.id as string, s]));
  const primarySet =
    setById.get(task.set_id as string) ??
    (ordered[0] ? setById.get(ordered[0].set_id as string) : null) ??
    null;

  if (!primarySet && ordered.length === 0) notFound();

  const anyDictationDisabled = ordered.some((q) => {
    const s = setById.get(q.set_id as string);
    return s?.dictation_enabled === false;
  });

  const requireDictation =
    assignment?.require_dictation_pass !== false &&
    !anyDictationDisabled &&
    (primarySet?.dictation_enabled ?? true) !== false;
  const passScore = assignment?.dictation_pass_score ?? 80;

  await reconcileDailyTaskDictationProgress(admin, {
    dailyTaskId: taskId,
    studentId: profile.id,
    setId: task.set_id as string,
    requireDictation,
    dictationPassScore: passScore,
  });

  const progressMap = await loadDailyTaskProgressMap(admin, taskId, profile.id);
  const missingCount = questionIds.length - ordered.length;

  const setTitle = primarySet?.title ?? "듣기 학습";

  return (
    <div>
      <Link
        href="/student/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 목록
      </Link>
      <p className="mt-2 text-xs text-slate-500">
        {assignment?.title ?? "스케줄 과제"} · {task.task_date} · 오늘{" "}
        {questionIds.length}문항
        {ordered.length !== questionIds.length
          ? ` (불러온 ${ordered.length}문항)`
          : ""}
      </p>
      {missingCount > 0 && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          일부 문항({missingCount}개)을 불러오지 못했습니다. 이어 풀기 후
          Dictation이 빠진다면 새로고침해 주세요.
        </p>
      )}
      <div className="mt-4">
        <StudentListeningPractice
          setId={(primarySet?.id as string) ?? (task.set_id as string)}
          setTitle={setTitle}
          dictationSettings={{
            dictation_enabled: requireDictation,
            dictation_pass_score: passScore,
            dictation_blank_level:
              (primarySet?.dictation_blank_level as
                | "auto"
                | "few"
                | "normal"
                | "many") ?? "auto",
            dictation_randomize_on_retry:
              primarySet?.dictation_randomize_on_retry ?? true,
            dictation_lock_next_until_pass: true,
          }}
          scheduleMode={{
            dailyTaskId: taskId,
            requireDictationPass: requireDictation,
            dictationPassScore: passScore,
            initialProgress: progressMap,
          }}
          questions={ordered.map((q) => {
            const qSet = setById.get(q.set_id as string);
            return {
              id: q.id as string,
              setId: q.set_id as string,
              setTitle: (qSet?.title as string) ?? setTitle,
              order_index: q.order_index as number,
              question_type: (q.question_type as string) ?? "",
              instruction: (q.instruction as string) ?? "",
              question_text: (q.question_text as string) ?? "",
              choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
              correct_answer: (q.correct_answer as number) ?? 1,
              audio_url: q.audio_url as string | null,
              script_text: (q.script_text as string) ?? "",
              script_translation: (q.script_translation as string) ?? "",
              answer_clue: (q.answer_clue as string) ?? "",
              explanation: (q.explanation as string) ?? "",
              table_data:
                q.table_data && typeof q.table_data === "object"
                  ? q.table_data
                  : null,
              needs_image_choices: Boolean(q.needs_image_choices),
              choice_image_urls: Array.isArray(q.choice_image_urls)
                ? (q.choice_image_urls as string[]).map(String)
                : [],
            };
          })}
        />
      </div>
    </div>
  );
}
