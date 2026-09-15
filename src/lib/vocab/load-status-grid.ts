import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabTodayStatusTable } from "@/lib/learning-status/types";
import { listReportStudents } from "@/lib/reports/list-students";
import { fetchByIdChunks } from "@/lib/vocab/fetch-all";
import { loadVocabTodayStatusTable } from "@/lib/vocab/load-today-status-table";
import { buildStageCell, type StageCell } from "@/lib/vocab/stage-cell";
import {
  stage3Completed,
  stage4AttemptCount,
  stage4BestScore,
  stage4Passed,
} from "@/lib/vocab/stage-progress-fields";
import type { UserRole, VocabStageProgress } from "@/types/database";

/** "recent"(최근 배정 단어장 8개) · "unfiled" · 폴더 id */
export type VocabStatusScope = string;

export interface VocabStatusGridSet {
  id: string;
  title: string;
  shortTitle: string;
}

export interface VocabStatusGridRow {
  studentId: string;
  name: string;
  classLabel: string;
  /** 칸마다 진행 — 그 학생에게 배정되지 않은 단어장이면 null */
  cells: (StageCell | null)[];
  hasAssignments: boolean;
  studiedToday: boolean;
  /** 불합격 후 그날 다시 안 한 첫 단어장의 칸 번호 (없으면 null) */
  failedIdleColumn: number | null;
}

export interface VocabStatusGrid {
  dateIso: string;
  sets: VocabStatusGridSet[];
  rows: VocabStatusGridRow[];
  summary: {
    studiedToday: number;
    withAssignments: number;
    /** 보이는 단어장 중 학생 한 명이 합격한 평균 개수 */
    avgPassed: number | null;
    setCount: number;
    failedNotRetried: number;
    notStudiedToday: number;
  };
}

const RECENT_LIMIT = 8;
const MAX_COLUMNS = 30;

/** 제목들의 앞뒤 공통 낱말을 떼어 짧게 (예: "능률 김기택 1과 단어" → "1과") */
export function shortenTitles(titles: string[]): string[] {
  if (titles.length < 2) return titles;
  const toks = titles.map((t) => t.trim().split(/\s+/));
  const first = toks[0]!;
  let pre = 0;
  while (toks.every((t) => t.length > pre + 1 && t[pre] === first[pre])) pre += 1;
  let suf = 0;
  while (
    toks.every(
      (t) => t.length > pre + suf + 1 && t[t.length - 1 - suf] === first[first.length - 1 - suf]
    )
  ) {
    suf += 1;
  }
  return toks.map((t, i) => t.slice(pre, t.length - suf).join(" ") || titles[i]!);
}

type SetRow = {
  id: string;
  title: string;
  created_at: string;
  order_index: number | null;
  /** 변형문제 연계 단어장 — 3단계 */
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
>;

export async function loadVocabStatusGrid(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  options: { dateIso?: string; classId?: string; nameQuery?: string; scope: VocabStatusScope }
): Promise<{ grid: VocabStatusGrid; table: VocabTodayStatusTable }> {
  const students = await listReportStudents(supabase, role, viewerId, {
    classId: options.classId,
    nameQuery: options.nameQuery,
  });
  const table = await loadVocabTodayStatusTable(supabase, role, viewerId, {
    dateIso: options.dateIso,
    students,
  });

  const assignedByStudent = new Map<string, Set<string>>();
  const studiedPairs = new Set<string>();
  const studiedStudents = new Set<string>();
  for (const r of table.rows) {
    const set = assignedByStudent.get(r.studentId) ?? new Set<string>();
    set.add(r.setId);
    assignedByStudent.set(r.studentId, set);
    if (r.studiedToday) {
      studiedPairs.add(`${r.studentId}:${r.setId}`);
      studiedStudents.add(r.studentId);
    }
  }
  const assignedSetIds = [...new Set(table.rows.map((r) => r.setId))];

  // 보여 줄 단어장(열) — 이 학생들에게 배정된 것만
  let columns: SetRow[] = [];
  if (assignedSetIds.length > 0) {
    const assignedSets = await fetchByIdChunks<SetRow & { folder_id: string | null }>(
      assignedSetIds,
      (chunk, from, to) =>
        supabase
          .from("vocab_sets")
          .select("id, title, created_at, order_index, folder_id, exam_compact")
          .in("id", chunk)
          .range(from, to)
    );
    if (options.scope === "recent") {
      columns = [...assignedSets]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, RECENT_LIMIT)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else {
      const inScope = (s: { folder_id: string | null }) =>
        options.scope === "unfiled" ? !s.folder_id : s.folder_id === options.scope;
      columns = assignedSets
        .filter(inScope)
        .sort(
          (a, b) =>
            (a.order_index ?? 0) - (b.order_index ?? 0) ||
            a.created_at.localeCompare(b.created_at)
        )
        .slice(0, MAX_COLUMNS);
    }
  }

  const columnIds = columns.map((c) => c.id);
  const studentIdSet = new Set(students.map((s) => s.id));
  // 학생이 많지 않으면 그 학생들 것만 받고, 많으면 단어장 기준으로 받은 뒤 아래에서 거른다
  const filterStudents = students.length > 0 && students.length <= 150;
  const progress =
    students.length === 0
      ? []
      : await fetchByIdChunks<ProgressRow>(columnIds, (chunk, from, to) => {
          let q = supabase
            .from("vocab_stage_progress")
            .select(
              "student_id, set_id, stage1_completed, stage2_completed, stage3_completed, stage3_passed, stage3_best_score, stage3_attempt_count, stage4_passed, stage4_best_score, stage4_attempt_count"
            )
            .in("set_id", chunk);
          if (filterStudents) {
            q = q.in(
              "student_id",
              students.map((st) => st.id)
            );
          }
          return q.range(from, to);
        });

  const progressByKey = new Map<string, VocabStageProgress>();
  // 필요한 칸만 받았으므로 단계 계산 함수에 넘길 때만 전체 모양으로 본다
  for (const p of progress) {
    if (!studentIdSet.has(p.student_id)) continue;
    progressByKey.set(`${p.student_id}:${p.set_id}`, p as VocabStageProgress);
  }

  let passedSum = 0;
  let passedStudents = 0;
  let failedNotRetried = 0;

  const rows: VocabStatusGridRow[] = students.map((s) => {
    const assigned = assignedByStudent.get(s.id);
    let passed = 0;
    let anyColumn = false;
    let failedIdleColumn: number | null = null;
    const cells = columns.map((c, ci) => {
      if (!assigned?.has(c.id)) return null;
      anyColumn = true;
      const p = progressByKey.get(`${s.id}:${c.id}`);
      const cell = buildStageCell({
        started: Boolean(p),
        stage1: Boolean(p?.stage1_completed),
        stage2: Boolean(p?.stage2_completed),
        stage3: p ? stage3Completed(p) : false,
        passed: p ? stage4Passed(p) : false,
        attempts: p ? stage4AttemptCount(p) : 0,
        bestScore: p ? stage4BestScore(p) : 0,
        examCompact: Boolean(c.exam_compact),
      });
      if (cell.passed) passed += 1;
      if (cell.failed && !studiedPairs.has(`${s.id}:${c.id}`) && failedIdleColumn === null) {
        failedIdleColumn = ci;
      }
      return cell;
    });
    if (anyColumn) {
      passedSum += passed;
      passedStudents += 1;
    }
    if (failedIdleColumn !== null) failedNotRetried += 1;
    return {
      studentId: s.id,
      name: s.name,
      classLabel: s.classNames.join(", ") || "—",
      cells,
      hasAssignments: Boolean(assigned?.size),
      studiedToday: studiedStudents.has(s.id),
      failedIdleColumn,
    };
  });

  // 반을 고르지 않았으면 학원 전체라서, 배정받은 학생만 보여 준다
  const shownRows = options.classId ? rows : rows.filter((r) => r.hasAssignments);
  const withAssignments = rows.filter((r) => r.hasAssignments).length;
  const shorts = shortenTitles(columns.map((c) => c.title));

  return {
    table,
    grid: {
      dateIso: table.dateIso,
      sets: columns.map((c, i) => ({ id: c.id, title: c.title, shortTitle: shorts[i]! })),
      rows: shownRows,
      summary: {
        studiedToday: studiedStudents.size,
        withAssignments,
        avgPassed: passedStudents > 0 ? Math.round((passedSum / passedStudents) * 10) / 10 : null,
        setCount: columns.length,
        failedNotRetried,
        notStudiedToday: Math.max(0, withAssignments - studiedStudents.size),
      },
    },
  };
}
