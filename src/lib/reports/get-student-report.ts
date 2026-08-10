import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildEnrollmentProgressRows,
  normalizeEnrollmentInputs,
  unwrapRelation,
} from "@/lib/progress/enrollment-progress";
import { canViewStudentReport } from "@/lib/reports/access";
import {
  getReportRangeBounds,
  getReportRangeLabel,
  isIsoInReportRange,
  maxIsoInRange,
  parseReportRange,
} from "@/lib/reports/date-range";
import { buildListeningDictationReport } from "@/lib/listening/dictation/report-summary";
import { buildListeningExamReport } from "@/lib/listening/exam/report-summary";
import { buildListeningScheduleReport } from "@/lib/listening/schedule/report-summary";
import type {
  CourseReportSection,
  ListeningDictationReportRow,
  ListeningExamReportRow,
  ListeningScheduleReportRow,
  ReviewWordRow,
  StudentReport,
  VocabReportSection,
} from "@/lib/reports/types";
import {
  stage3Completed,
  stage4AttemptCount,
  stage4BestScore,
  stage4LastScore,
  stage4Passed,
} from "@/lib/vocab/stage-progress-fields";
import type { UserRole, VocabItem, VocabStageProgress } from "@/types/database";

async function getAssignedVocabSetIds(
  supabase: SupabaseClient,
  studentId: string
): Promise<string[]> {
  const [{ data: direct }, { data: classMemberships }] = await Promise.all([
    supabase
      .from("vocab_assignments")
      .select("set_id")
      .eq("student_id", studentId),
    supabase
      .from("class_students")
      .select("class_id")
      .eq("student_id", studentId),
  ]);

  const classIds = (classMemberships ?? []).map((r) => r.class_id as string);

  const { data: classAssignments } =
    classIds.length > 0
      ? await supabase
          .from("vocab_assignments")
          .select("set_id")
          .in("class_id", classIds)
      : { data: [] as { set_id: string }[] };

  return [
    ...new Set([
      ...(direct ?? []).map((a) => a.set_id as string),
      ...(classAssignments ?? []).map((a) => a.set_id as string),
    ]),
  ];
}

function vocabStatusLabel(progress: VocabStageProgress): string {
  if (stage4Passed(progress)) return "합격";
  if (stage4AttemptCount(progress) > 0) return "불합격";
  if (stage3Completed(progress)) return "4단계 진행 중";
  if (progress.stage2_completed) return "3단계 진행 중";
  if (progress.stage1_completed) return "2단계 진행 중";
  if (progress.stage1_completed === false) return "1단계 진행 중";
  return "미시작";
}

export async function getStudentReport(
  supabase: SupabaseClient,
  viewerRole: UserRole,
  viewerId: string,
  studentId: string,
  rangeInput: string | null | undefined
): Promise<StudentReport | null> {
  const allowed = await canViewStudentReport(
    supabase,
    viewerRole,
    viewerId,
    studentId
  );
  if (!allowed) return null;

  const range = parseReportRange(rangeInput);
  const bounds = getReportRangeBounds(range);
  const rangeLabel = getReportRangeLabel(range);
  const generatedAt = new Date().toISOString();

  const { data: student } = await supabase
    .from("profiles")
    .select("id, name, username")
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle();

  if (!student) return null;

  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class:classes(name)")
    .eq("student_id", studentId);

  const classNames = (classLinks ?? [])
    .map((link) => {
      const cls = unwrapRelation(link.class as { name: string } | { name: string }[] | null);
      return cls?.name;
    })
    .filter((name): name is string => Boolean(name));

  const [
    { data: enrollments },
    setIds,
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        "student_id, course_id, student:profiles!enrollments_student_id_fkey(name, email), course:courses(title)"
      )
      .eq("student_id", studentId),
    getAssignedVocabSetIds(supabase, studentId),
  ]);

  const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id as string))];

  const [
    { data: sections },
    { data: lessons },
    { data: progressRecords },
    { data: vocabSets },
    { data: vocabItems },
    { data: stageRows },
    { data: vocabProgress },
    { data: spellingWrong },
    { data: exampleWrong },
    { data: finalAttempts },
  ] = await Promise.all([
    courseIds.length > 0
      ? supabase
          .from("sections")
          .select("id, course_id, order_index")
          .in("course_id", courseIds)
      : { data: [] },
    courseIds.length > 0
      ? supabase
          .from("lessons")
          .select("id, course_id, title, order_index, section_id, is_published")
          .in("course_id", courseIds)
      : { data: [] },
    courseIds.length > 0
      ? supabase
          .from("lesson_progress")
          .select(
            "student_id, lesson_id, is_completed, last_watched_at, completed_at, progress_percent, watched_seconds"
          )
          .eq("student_id", studentId)
      : { data: [] },
    setIds.length > 0
      ? supabase.from("vocab_sets").select("id, title").in("id", setIds)
      : { data: [] },
    setIds.length > 0
      ? supabase
          .from("vocab_items")
          .select("id, set_id, word, meaning")
          .in("set_id", setIds)
      : { data: [] },
    setIds.length > 0
      ? supabase
          .from("vocab_stage_progress")
          .select("*")
          .eq("student_id", studentId)
          .in("set_id", setIds)
      : { data: [] },
    setIds.length > 0
      ? supabase
          .from("vocab_progress")
          .select("item_id, status, last_studied_at, studied_count")
          .eq("student_id", studentId)
      : { data: [] },
    setIds.length > 0
      ? supabase
          .from("vocab_spelling_attempts")
          .select("item_id, created_at, is_correct")
          .eq("student_id", studentId)
          .eq("is_correct", false)
      : { data: [] },
    setIds.length > 0
      ? supabase
          .from("vocab_example_attempts")
          .select("item_id, created_at, is_correct")
          .eq("student_id", studentId)
          .eq("is_correct", false)
      : { data: [] },
    setIds.length > 0
      ? supabase
          .from("vocab_final_test_attempts")
          .select("id, set_id, submitted_at, score")
          .eq("student_id", studentId)
          .in("set_id", setIds)
          .order("submitted_at", { ascending: false })
      : { data: [] },
  ]);

  const itemList = (vocabItems ?? []) as VocabItem[];
  const itemIds = new Set(itemList.map((i) => i.id));
  const itemById = new Map(itemList.map((i) => [i.id, i]));
  const scopedVocabProgress = (vocabProgress ?? []).filter((p) =>
    itemIds.has(p.item_id as string)
  );

  const enrollmentRows = buildEnrollmentProgressRows(
    normalizeEnrollmentInputs(
      (enrollments ?? []) as Parameters<typeof normalizeEnrollmentInputs>[0]
    ),
    sections ?? [],
    lessons ?? [],
    progressRecords ?? []
  );

  const courses: CourseReportSection[] = enrollmentRows
    .map((row) => {
      const studiedLessons = row.lessons.filter((l) => {
        const watched =
          range === "all"
            ? Boolean(l.lastWatchedAt || l.completedAt)
            : isIsoInReportRange(l.lastWatchedAt, bounds) ||
              isIsoInReportRange(l.completedAt, bounds);
        return watched;
      });
      if (studiedLessons.length === 0) return null;

      const completedInPeriod = row.lessons.filter((l) => {
        if (!l.isCompleted) return false;
        if (range === "all") return true;
        return isIsoInReportRange(l.completedAt, bounds);
      });

      const lessonDates = studiedLessons.flatMap((l) => [
        l.lastWatchedAt,
        l.completedAt,
      ]);
      const lastInRange =
        range === "all"
          ? row.lastStudiedAt
          : maxIsoInRange(lessonDates, bounds);

      return {
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        totalLessons: row.totalLessons,
        completedLessons:
          range === "all" ? row.completedLessons : completedInPeriod.length,
        progressPercent: row.progressPercent,
        lastStudiedAt: lastInRange,
        completedLessonsList: completedInPeriod.map((l) => l.lessonTitle),
      };
    })
    .filter((c): c is CourseReportSection => c != null);

  const stageBySet = new Map(
    (stageRows ?? []).map((r) => [r.set_id as string, r as VocabStageProgress])
  );

  const finalAttemptIdsInRange = (finalAttempts ?? [])
    .filter((a) =>
      range === "all" ? true : isIsoInReportRange(a.submitted_at as string, bounds)
    )
    .map((a) => a.id as string);

  let finalWrongAnswers: { item_id: string; created_at?: string }[] = [];
  if (finalAttemptIdsInRange.length > 0) {
    const { data: wrongAnswers } = await supabase
      .from("vocab_final_test_answers")
      .select("item_id, attempt_id, is_correct")
      .in("attempt_id", finalAttemptIdsInRange)
      .eq("is_correct", false);

    const attemptSubmitted = new Map(
      (finalAttempts ?? []).map((a) => [a.id as string, a.submitted_at as string])
    );

    finalWrongAnswers = (wrongAnswers ?? []).map((a) => ({
      item_id: a.item_id as string,
      created_at: attemptSubmitted.get(a.attempt_id as string),
    }));
  }

  const vocabSetsReport: VocabReportSection[] = (vocabSets ?? []).map((set) => {
    const setId = set.id as string;
    const setItems = itemList.filter((i) => i.set_id === setId);
    const progress =
      stageBySet.get(setId) ??
      ({
        stage1_completed: false,
        stage2_completed: false,
        stage3_completed: false,
        stage4_passed: false,
        stage4_last_score: 0,
        stage4_best_score: 0,
        stage4_attempt_count: 0,
        stage3_passed: false,
        stage3_last_score: 0,
        stage3_best_score: 0,
        stage3_attempt_count: 0,
      } as VocabStageProgress);

    const setItemIds = new Set(setItems.map((i) => i.id));

    const activityDates: string[] = [];
    for (const vp of scopedVocabProgress) {
      if (!setItemIds.has(vp.item_id as string)) continue;
      if (vp.last_studied_at) activityDates.push(vp.last_studied_at as string);
    }
    for (const iso of [
      progress.stage1_completed_at,
      progress.stage2_completed_at,
      progress.stage3_completed_at,
      progress.stage3_passed_at,
      progress.stage4_passed_at,
    ]) {
      if (iso) activityDates.push(iso as string);
    }
    // 1단계 시작만 한 경우에도 학습으로 인정
    if ((progress.stage1_seen_item_ids ?? []).length > 0 && progress.updated_at) {
      activityDates.push(progress.updated_at as string);
    }
    if (
      ((progress.stage3_attempt_count ?? 0) > 0 ||
        (progress.stage4_attempt_count ?? 0) > 0) &&
      progress.updated_at
    ) {
      activityDates.push(progress.updated_at as string);
    }
    for (const row of spellingWrong ?? []) {
      if (!setItemIds.has(row.item_id as string)) continue;
      activityDates.push(row.created_at as string);
    }
    for (const row of exampleWrong ?? []) {
      if (!setItemIds.has(row.item_id as string)) continue;
      activityDates.push(row.created_at as string);
    }
    for (const attempt of finalAttempts ?? []) {
      if (attempt.set_id !== setId) continue;
      activityDates.push(attempt.submitted_at as string);
    }

    const lastStudiedAt =
      range === "all"
        ? maxIsoInRange(activityDates, { start: null, end: bounds.end })
        : maxIsoInRange(activityDates, bounds);

    const attemptsInRange = (finalAttempts ?? []).filter(
      (a) =>
        a.set_id === setId &&
        (range === "all" || isIsoInReportRange(a.submitted_at as string, bounds))
    );

    let stage4Last = stage4LastScore(progress);
    let stage4Best = stage4BestScore(progress);
    let stage4Attempts = stage4AttemptCount(progress);

    if (attemptsInRange.length > 0) {
      stage4Last = attemptsInRange[0].score as number;
      stage4Best = Math.max(...attemptsInRange.map((a) => a.score as number));
      stage4Attempts = attemptsInRange.length;
    }

    return {
      setId,
      setTitle: set.title as string,
      itemCount: setItems.length,
      stage1Completed: Boolean(progress.stage1_completed),
      stage2Completed: Boolean(progress.stage2_completed),
      stage3Completed: stage3Completed(progress),
      stage4Passed: stage4Passed(progress),
      stage4LastScore: stage4Last,
      stage4BestScore: stage4Best,
      stage4AttemptCount: stage4Attempts,
      lastStudiedAt,
      statusLabel: vocabStatusLabel(progress),
    };
  }).filter((set) => Boolean(set.lastStudiedAt));

  const reviewMap = new Map<
    string,
    { stages: Set<string>; wrongCount: number; recentWrong: boolean }
  >();

  function addReview(
    itemId: string,
    stage: string,
    at: string | null | undefined,
    count = 1
  ) {
    if (!itemIds.has(itemId)) return;
    if (range !== "all") {
      if (!at || !isIsoInReportRange(at, bounds)) return;
    }

    const entry = reviewMap.get(itemId) ?? {
      stages: new Set<string>(),
      wrongCount: 0,
      recentWrong: false,
    };
    entry.stages.add(stage);
    entry.wrongCount += count;
    entry.recentWrong = true;
    reviewMap.set(itemId, entry);
  }

  for (const vp of scopedVocabProgress) {
    if (vp.status !== "review") continue;
    const itemId = vp.item_id as string;
    if (!itemIds.has(itemId)) continue;
    addReview(
      itemId,
      "1단계 뜻 익히기",
      vp.last_studied_at as string | null
    );
  }

  for (const row of spellingWrong ?? []) {
    addReview(row.item_id as string, "2단계 스펠링", row.created_at as string);
  }

  for (const row of exampleWrong ?? []) {
    addReview(row.item_id as string, "3단계 예문 빈칸", row.created_at as string);
  }

  for (const row of finalWrongAnswers) {
    addReview(row.item_id, "4단계 종합테스트", row.created_at);
  }

  const reviewWords: ReviewWordRow[] = [...reviewMap.entries()]
    .map(([itemId, meta]) => {
      const item = itemById.get(itemId);
      return {
        itemId,
        word: item?.word ?? "—",
        meaning: item?.meaning ?? "—",
        stages: [...meta.stages],
        wrongCount: meta.wrongCount,
        recentWrong: meta.recentWrong,
      };
    })
    .sort((a, b) => a.word.localeCompare(b.word, "ko"));

  const completedLessons = courses.reduce((s, c) => s + c.completedLessons, 0);
  const vocabPassed = vocabSetsReport.filter((v) => v.stage4Passed).length;

  const videoLine =
    courses.length === 0
      ? `${rangeLabel} 기준 학습한 영상 강좌가 없습니다.`
      : `${rangeLabel} 기준 학습한 영상 강좌는 ${courses.length}개이며, 완료한 강의는 ${completedLessons}강입니다.`;

  const vocabLine =
    vocabSetsReport.length === 0
      ? `${rangeLabel} 기준 학습한 단어장이 없습니다.`
      : `단어학습은 학습한 ${vocabSetsReport.length}개 단어장 중 ${vocabPassed}개를 통과했습니다.`;

  const reviewLine =
    reviewWords.length === 0
      ? "복습이 필요한 단어가 없습니다."
      : `복습이 필요한 단어는 ${reviewWords.length}개입니다.`;

  const scheduleSections = await buildListeningScheduleReport(
    supabase,
    studentId,
    range
  );
  const listeningSchedule: ListeningScheduleReportRow[] = scheduleSections.map(
    (s) => ({
      assignmentId: s.assignmentId,
      title: s.title,
      periodLabel: s.periodLabel,
      totalTasks: s.totalTasks,
      completedTasks: s.completedTasks,
      inProgressTasks: s.inProgressTasks,
      missedOrPendingTasks: s.missedOrPendingTasks,
      recentTasks: s.recentTasks,
      lastActivityDate: s.lastActivityDate,
      summaryLine: s.summaryLine,
    })
  );
  const listeningScheduleLine =
    listeningSchedule.length === 0
      ? `${rangeLabel} 기준 듣기 스케줄 학습 기록이 없습니다.`
      : listeningSchedule
          .map((s) => `${s.title}: ${s.summaryLine}`)
          .join(" ");

  const dictationSections = await buildListeningDictationReport(
    supabase,
    studentId,
    range
  );
  const listeningDictation: ListeningDictationReportRow[] = dictationSections.map(
    (s) => ({
      setId: s.setId,
      setTitle: s.setTitle,
      questionCount: s.questionCount,
      passedQuestionCount: s.passedQuestionCount,
      averageBestScore: s.averageBestScore,
      totalAttempts: s.totalAttempts,
      frequentWrongWords: s.frequentWrongWords,
      summaryLine: s.summaryLine,
    })
  );
  const listeningDictationLine =
    listeningDictation.length === 0
      ? "듣기 Dictation 제출 기록이 없습니다."
      : listeningDictation
          .map((d) => `${d.setTitle}: ${d.summaryLine}`)
          .join(" ");

  const examSections = await buildListeningExamReport(supabase, studentId, range);
  const listeningExam: ListeningExamReportRow[] = examSections.map((s) => ({
    setId: s.setId,
    setTitle: s.setTitle,
    questionCount: s.questionCount,
    attemptCount: s.attemptCount,
    bestScore: s.bestScore,
    latestScore: s.latestScore,
    latestSubmittedAt: s.latestSubmittedAt,
    summaryLine: s.summaryLine,
  }));
  const listeningExamLine =
    listeningExam.length === 0
      ? "듣기 시험(OMR) 기록이 없습니다."
      : listeningExam.map((e) => `${e.setTitle}: ${e.summaryLine}`).join(" ");

  return {
    generatedAt,
    range,
    rangeLabel,
    student: {
      id: student.id as string,
      name: (student.name as string) || "—",
      loginId: (student.username as string | null) ?? null,
      classNames,
    },
    summary: {
      videoLine,
      vocabLine,
      reviewLine,
      listeningScheduleLine,
      listeningDictationLine,
      listeningExamLine,
    },
    courses,
    vocabSets: vocabSetsReport,
    listeningSchedule,
    listeningDictation,
    listeningExam,
    reviewWords,
  };
}
