import type { SupabaseClient } from "@supabase/supabase-js";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";

export interface ListeningDictationReportSection {
  setId: string;
  setTitle: string;
  questionCount: number;
  passedQuestionCount: number;
  averageBestScore: number | null;
  totalAttempts: number;
  frequentWrongWords: string[];
  summaryLine: string;
  questionRows: Array<{
    orderIndex: number;
    questionType: string;
    bestScore: number | null;
    attemptCount: number;
    passed: boolean;
  }>;
}

export async function buildListeningDictationReport(
  supabase: SupabaseClient,
  studentId: string
): Promise<ListeningDictationReportSection[]> {
  const { data: assignments } = await supabase
    .from("listening_assignments")
    .select("set_id")
    .eq("student_id", studentId);

  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);

  const classIds = (classLinks ?? []).map((r) => r.class_id);
  const { data: classAssign } =
    classIds.length > 0
      ? await supabase
          .from("listening_assignments")
          .select("set_id")
          .in("class_id", classIds)
      : { data: [] as { set_id: string }[] };

  const setIds = [
    ...new Set([
      ...(assignments ?? []).map((a) => a.set_id as string),
      ...(classAssign ?? []).map((a) => a.set_id as string),
    ]),
  ];

  if (setIds.length === 0) return [];

  const { data: sets } = await supabase
    .from("listening_sets")
    .select("id, title, dictation_enabled")
    .in("id", setIds)
    .eq("is_published", true);

  const { data: attempts } = await supabase
    .from("listening_dictation_attempts")
    .select(
      "set_id, question_id, score, passed, attempt_no, submitted_at, blank_items, student_answers"
    )
    .eq("student_id", studentId)
    .in("set_id", setIds)
    .not("submitted_at", "is", null);

  const { data: questions } = await supabase
    .from("listening_questions")
    .select("id, set_id, order_index, question_type")
    .in("set_id", setIds);

  const qById = new Map(
    (questions ?? []).map((q) => [q.id as string, q])
  );

  const sections: ListeningDictationReportSection[] = [];

  for (const set of sets ?? []) {
    if (set.dictation_enabled === false) continue;
    const setId = set.id as string;
    const setQuestions = (questions ?? []).filter((q) => q.set_id === setId);
    const setAttempts = (attempts ?? []).filter((a) => a.set_id === setId);

    const wrongWords: string[] = [];
    const byQuestion = new Map<
      string,
      { best: number | null; attempts: number; passed: boolean }
    >();

    for (const q of setQuestions) {
      byQuestion.set(q.id as string, { best: null, attempts: 0, passed: false });
    }

    for (const att of setAttempts) {
      const qid = att.question_id as string;
      const row = byQuestion.get(qid);
      if (!row) continue;
      row.attempts += 1;
      const sc = att.score as number | null;
      if (sc != null) {
        row.best = row.best == null ? sc : Math.max(row.best, sc);
      }
      if (att.passed) row.passed = true;

      const items = (att.blank_items ?? []) as DictationBlankItem[];
      const ans = (att.student_answers ?? {}) as Record<string, string>;
      for (const item of items) {
        const student = normalizeDictationText(ans[item.id] ?? "");
        const correct = normalizeDictationText(item.answer);
        if (student && student !== correct) {
          wrongWords.push(item.answer);
        }
      }
    }

    const questionRows = setQuestions
      .map((q) => {
        const meta = byQuestion.get(q.id as string)!;
        return {
          orderIndex: q.order_index as number,
          questionType: (q.question_type as string) ?? "",
          bestScore: meta.best,
          attemptCount: meta.attempts,
          passed: meta.passed,
        };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const passedCount = questionRows.filter((r) => r.passed).length;
    const scores = questionRows
      .map((r) => r.bestScore)
      .filter((s): s is number => s != null);
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    const freq = [...wrongWords]
      .reduce((map, w) => {
        map.set(w, (map.get(w) ?? 0) + 1);
        return map;
      }, new Map<string, number>());
    const frequentWrongWords = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => w);

    let summaryLine = "듣기 Dictation 기록이 없습니다.";
    if (setAttempts.length > 0) {
      if (avg != null && avg >= 85) {
        summaryLine =
          "듣기 후 Dictation 단계에서 핵심 단어 청취 정확도가 높았습니다.";
      } else if (frequentWrongWords.length > 0) {
        summaryLine = `${frequentWrongWords.slice(0, 4).join(", ")} 관련 핵심어에서 오답이 반복되어 복습이 필요합니다.`;
      } else if (avg != null) {
        summaryLine = `평균 Dictation 점수는 ${avg}점이며, ${passedCount}/${setQuestions.length}문항을 통과했습니다.`;
      }
    }

    sections.push({
      setId,
      setTitle: set.title as string,
      questionCount: setQuestions.length,
      passedQuestionCount: passedCount,
      averageBestScore: avg,
      totalAttempts: setAttempts.length,
      frequentWrongWords,
      summaryLine,
      questionRows,
    });
  }

  return sections;
}
