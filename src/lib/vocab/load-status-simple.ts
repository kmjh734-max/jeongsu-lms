import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { listReportStudents } from "@/lib/reports/list-students";
import { fetchByIdChunks } from "@/lib/vocab/fetch-all";
import { loadVocabTodayStatusTable } from "@/lib/vocab/load-today-status-table";
import { buildStageCell, type StageDot } from "@/lib/vocab/stage-cell";
import { studentStageSteps } from "@/lib/vocab/stage-progress-fields";
import {
  stage3Completed,
  stage4AttemptCount,
  stage4BestScore,
  stage4Passed,
} from "@/lib/vocab/stage-progress-fields";
import type { UserRole, VocabStageProgress } from "@/types/database";

/**
 * 단어학습 현황 — 학생 한 줄 요약.
 *
 * 선생님 지적(2026-10-23): 현황이 거꾸로 보인다. 「최근 배정한 단어장 8개」가 가장 나중에 만든
 * Day53~60 을 보여 줘서, 학생이 실제로 하는 Day3·Day12 는 안 보이고 전부 「시작 전」이었다.
 * 이제 학생마다 「지금 하는 단어장 · 어디까지 · 최근 한 것 · 합격 수 · 오늘 했는지」를 한 줄로 보여 주고,
 * Day별 점은 그 학생이 지금 하는 Day 앞뒤로만 펼쳐 보인다(시안 승인 2026-10-23).
 */

/** Day별 보기 한 칸 */
export interface VocabSimpleCell {
  setId: string;
  short: string;
  dots: StageDot[];
  label: string;
  score: number | null;
  passed: boolean;
  failed: boolean;
  /** 지금 하는 단어장 */
  current: boolean;
}

/** 최근에 한 단어장 하나 */
export interface VocabSimpleRecent {
  setId: string;
  short: string;
  /** 마지막으로 손댄 날(한국 날짜) */
  dateIso: string;
  passed: boolean;
  failed: boolean;
  score: number | null;
  /** "3단계까지" / "합격" / "불합격 85점" */
  text: string;
}

export interface VocabSimpleRow {
  studentId: string;
  name: string;
  classLabel: string;
  hasAssignments: boolean;
  studiedToday: boolean;
  /** 그날 한 것 — "Day3 1단계 카드학습, 2단계 철자" */
  todayText: string;
  /** 지금 하는 단어장. 다 합격했으면 null */
  current: {
    setId: string;
    title: string;
    short: string;
    dots: StageDot[];
    /** "2단계 스펠링까지 끝냄" / "시작 전" */
    doneText: string;
    /** "다음 3단계 예문 빈칸" */
    nextText: string;
    /** 다음에 할 단계 번호(1부터) */
    nextStage: number;
    started: boolean;
  } | null;
  /** 종합테스트 불합격 뒤 그날 다시 안 본 단어장 */
  retry: { setId: string; title: string; short: string; score: number } | null;
  recent: VocabSimpleRecent[];
  passedCount: number;
  totalCount: number;
  lastStudiedIso: string | null;
  /** 지금 하는 Day 앞뒤 8칸 */
  strip: VocabSimpleCell[];
}

export interface VocabSimpleStatus {
  dateIso: string;
  rows: VocabSimpleRow[];
  summary: {
    studiedToday: number;
    withAssignments: number;
    notStudiedToday: number;
    failedNotRetried: number;
  };
}

type SetMeta = {
  id: string;
  title: string;
  created_at: string;
  order_index: number | null;
  exam_compact?: boolean | null;
};

type ProgressRow = Pick<
  VocabStageProgress,
  | "student_id"
  | "set_id"
  | "stage1_completed"
  | "stage2_completed"
  | "stage3_completed"
  | "stage3_passed"
  | "stage3_best_score"
  | "stage3_attempt_count"
  | "stage4_passed"
  | "stage4_best_score"
  | "stage4_attempt_count"
  | "stage_syn_passed"
  | "stage_syn_skipped"
> & { updated_at: string | null };

const STRIP_SIZE = 8;
const RECENT_LIMIT = 3;

/** "EngCore 중학필수 Day12 핵심 빈출 단어" → 12 */
function dayNumberOf(title: string): number | null {
  const m = /day\s*0*(\d+)/i.exec(title);
  return m ? Number(m[1]) : null;
}

/** 짧은 이름 — Day 가 있으면 "Day12", 없으면 앞 14자 */
function shortOf(title: string): string {
  const d = dayNumberOf(title);
  if (d !== null) return `Day${d}`;
  const t = title.trim();
  return t.length > 14 ? `${t.slice(0, 14)}…` : t;
}

function koreaDate(ts: string | null | undefined): string | null {
  if (!ts) return null;
  return getTodayIsoKorea(new Date(ts));
}

export async function loadVocabStatusSimple(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  options: { dateIso?: string; classId?: string; nameQuery?: string },
): Promise<VocabSimpleStatus> {
  const students = await listReportStudents(supabase, role, viewerId, {
    classId: options.classId,
    nameQuery: options.nameQuery,
  });
  const table = await loadVocabTodayStatusTable(supabase, role, viewerId, {
    dateIso: options.dateIso,
    students,
  });

  /** 학생 → 배정된 단어장(제목·그날 활동) */
  const pairsByStudent = new Map<string, Map<string, { title: string; studiedToday: boolean; activity: string }>>();
  for (const r of table.rows) {
    const m = pairsByStudent.get(r.studentId) ?? new Map();
    m.set(r.setId, { title: r.setTitle, studiedToday: r.studiedToday, activity: r.activityLabel });
    pairsByStudent.set(r.studentId, m);
  }
  const assignedSetIds = [...new Set(table.rows.map((r) => r.setId))];
  const setMeta = new Map<string, SetMeta>();
  if (assignedSetIds.length > 0) {
    const sets = await fetchByIdChunks<SetMeta>(assignedSetIds, (chunk, from, to) =>
      supabase
        .from("vocab_sets")
        .select("id, title, created_at, order_index, exam_compact")
        .in("id", chunk)
        .range(from, to),
    );
    for (const s of sets) setMeta.set(s.id, s);
  }

  const studentIds = students.map((s) => s.id);
  const progress =
    studentIds.length === 0
      ? []
      : await fetchByIdChunks<ProgressRow>(studentIds, (chunk, from, to) =>
          supabase
            .from("vocab_stage_progress")
            .select(
              "student_id, set_id, stage1_completed, stage2_completed, stage3_completed, stage3_passed, stage3_best_score, stage3_attempt_count, stage4_passed, stage4_best_score, stage4_attempt_count, stage_syn_passed, stage_syn_skipped, updated_at",
            )
            .in("student_id", chunk)
            .order("id")
            .range(from, to),
        );
  const progressByKey = new Map<string, ProgressRow>();
  for (const p of progress) progressByKey.set(`${p.student_id}:${p.set_id}`, p);

  let failedNotRetried = 0;
  const rows: VocabSimpleRow[] = students.map((s) => {
    const pairs = pairsByStudent.get(s.id) ?? new Map();
    const sets = [...pairs.entries()]
      .map(([setId, pair]) => {
        const meta = setMeta.get(setId);
        return {
          setId,
          title: pair.title,
          short: shortOf(pair.title),
          day: dayNumberOf(pair.title),
          order: meta?.order_index ?? 0,
          created: meta?.created_at ?? "",
          examCompact: Boolean(meta?.exam_compact),
          studiedToday: pair.studiedToday,
          activity: pair.activity,
        };
      })
      .sort(
        (a, b) =>
          (a.day ?? Number.MAX_SAFE_INTEGER) - (b.day ?? Number.MAX_SAFE_INTEGER) ||
          a.order - b.order ||
          a.created.localeCompare(b.created) ||
          a.title.localeCompare(b.title, "ko"),
      );

    const cells = sets.map((set) => {
      const p = progressByKey.get(`${s.id}:${set.setId}`);
      const full = p as VocabStageProgress | undefined;
      const cell = buildStageCell({
        started: Boolean(p),
        stage1: Boolean(p?.stage1_completed),
        stage2: Boolean(p?.stage2_completed),
        stage3: full ? stage3Completed(full) : false,
        syn: Boolean(p?.stage_syn_passed || p?.stage_syn_skipped),
        passed: full ? stage4Passed(full) : false,
        attempts: full ? stage4AttemptCount(full) : 0,
        bestScore: full ? stage4BestScore(full) : 0,
        examCompact: set.examCompact,
      });
      const steps = studentStageSteps({
        examCompact: set.examCompact,
        stage1Completed: Boolean(p?.stage1_completed),
        stage2Completed: Boolean(p?.stage2_completed),
        stage3Completed: full ? stage3Completed(full) : false,
        synDone: Boolean(p?.stage_syn_passed || p?.stage_syn_skipped),
        stage4Passed: full ? stage4Passed(full) : false,
      });
      return { set, p, cell, steps, updated: p?.updated_at ?? "" };
    });

    const passedCount = cells.filter((c) => c.cell.passed).length;
    const started = cells.filter((c) => c.p && !c.cell.passed);
    const byRecent = [...started].sort((a, b) => b.updated.localeCompare(a.updated));
    // 지금 하는 것 = 하다 만 단어장 중 가장 최근 것. 불합격한 것은 「다시 보기」로 따로 적으므로 뒤로 보낸다.
    const currentEntry =
      byRecent.find((c) => !c.cell.failed) ?? byRecent[0] ?? cells.find((c) => !c.cell.passed) ?? null;

    const retryEntry =
      byRecent.find((c) => c.cell.failed && !c.set.studiedToday) ?? null;
    if (retryEntry) failedNotRetried += 1;

    let current: VocabSimpleRow["current"] = null;
    if (currentEntry) {
      const doneSteps = currentEntry.steps.filter((st) => st.done);
      const nextIdx = currentEntry.steps.findIndex((st) => !st.done);
      const nextStage = (nextIdx === -1 ? currentEntry.steps.length - 1 : nextIdx) + 1;
      const nextName = currentEntry.steps[nextStage - 1]?.name ?? "종합테스트";
      const lastDone = doneSteps.length ? currentEntry.steps[doneSteps.length - 1] : null;
      current = {
        setId: currentEntry.set.setId,
        title: currentEntry.set.title,
        short: currentEntry.set.short,
        dots: currentEntry.cell.dots,
        doneText: lastDone
          ? `${doneSteps.length}단계 ${lastDone.name}까지 끝냄`
          : "시작 전",
        nextText: currentEntry.cell.failed
          ? `종합테스트 ${currentEntry.cell.score ?? 0}점 · 다시 보기`
          : `다음 ${nextStage}단계 ${nextName}`,
        nextStage,
        started: Boolean(currentEntry.p),
      };
    }

    const recent: VocabSimpleRecent[] = cells
      .filter((c) => c.p && c.updated && c.set.setId !== currentEntry?.set.setId)
      .sort((a, b) => b.updated.localeCompare(a.updated))
      .slice(0, RECENT_LIMIT)
      .map((c) => ({
        setId: c.set.setId,
        short: c.set.short,
        dateIso: koreaDate(c.updated) ?? "",
        passed: c.cell.passed,
        failed: c.cell.failed,
        score: c.cell.score,
        text: c.cell.passed
          ? `합격 ${c.cell.score ?? ""}`.trim()
          : c.cell.failed
            ? `불합격 ${c.cell.score ?? ""}`.trim()
            : `${c.steps.filter((st) => st.done).length}단계까지`,
      }));

    const lastStudied = cells.map((c) => c.updated).filter(Boolean).sort().at(-1) ?? null;

    // 지금 하는 Day 앞뒤 8칸
    const curIdx = currentEntry ? cells.indexOf(currentEntry) : 0;
    const start = Math.max(0, Math.min(curIdx - 3, cells.length - STRIP_SIZE));
    const strip: VocabSimpleCell[] = cells.slice(start, start + STRIP_SIZE).map((c) => ({
      setId: c.set.setId,
      short: c.set.short,
      dots: c.cell.dots,
      label: c.cell.label,
      score: c.cell.score,
      passed: c.cell.passed,
      failed: c.cell.failed,
      current: c === currentEntry,
    }));

    const todayText = sets
      .filter((set) => set.studiedToday)
      .map((set) => `${set.short} ${set.activity}`.trim())
      .join(" · ");

    return {
      studentId: s.id,
      name: s.name,
      classLabel: s.classNames.join(", ") || "—",
      hasAssignments: sets.length > 0,
      studiedToday: sets.some((set) => set.studiedToday),
      todayText,
      current,
      retry: retryEntry
        ? { setId: retryEntry.set.setId, title: retryEntry.set.title, short: retryEntry.set.short, score: retryEntry.cell.score ?? 0 }
        : null,
      recent,
      passedCount,
      totalCount: sets.length,
      lastStudiedIso: koreaDate(lastStudied),
      strip,
    };
  });

  // 반을 고르지 않았으면 학원 전체라서, 배정받은 학생만 보여 준다. 안 한 학생이 먼저.
  const shown = (options.classId ? rows : rows.filter((r) => r.hasAssignments)).sort((a, b) => {
    const rank = (r: VocabSimpleRow) => (!r.hasAssignments ? 2 : r.studiedToday ? 1 : 0);
    return rank(a) - rank(b) || a.name.localeCompare(b.name, "ko");
  });
  const withAssignments = rows.filter((r) => r.hasAssignments).length;
  const studiedToday = rows.filter((r) => r.hasAssignments && r.studiedToday).length;

  return {
    dateIso: table.dateIso,
    rows: shown,
    summary: {
      studiedToday,
      withAssignments,
      notStudiedToday: Math.max(0, withAssignments - studiedToday),
      failedNotRetried,
    },
  };
}
