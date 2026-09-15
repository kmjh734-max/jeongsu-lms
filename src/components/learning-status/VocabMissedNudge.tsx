"use client";

import { useMemo } from "react";
import {
  SequentialKakaoNudgeDialog,
  SingleKakaoNudgeDialog,
  type KakaoNudgeGroup,
  type KakaoNudgeItem,
} from "@/components/learning-status/SequentialKakaoNudgeDialog";
import { toPublicShareUrl } from "@/lib/kakao/share-url";
import {
  buildVocabNudgeMessage,
  describeVocabNudgeFocus,
  type VocabNudgeFocus,
  type VocabNudgeKind,
} from "@/lib/vocab/build-vocab-nudge-message";
import type { VocabStatusGrid, VocabStatusGridRow } from "@/lib/vocab/load-status-grid";

/**
 * 단어학습 학부모 알림 — 학생마다 따로 보낸다 (한 메시지에 한 학생).
 */

interface VocabNudgeContext {
  grid: VocabStatusGrid;
  /** 현황에서 고른 날이 오늘인지 */
  isToday: boolean;
  /** "오늘" 또는 "9월 12일" */
  dayLabel: string;
  academyName?: string;
}

const STUDY_PATH = "/student/vocab";

function dateLabel(dateIso: string): string {
  const [, m, d] = dateIso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

/** 이 학생에게 권할 단어장·단계 — 하던 단계 → 다시 볼 시험 → 새로 시작 */
function pickFocus(
  row: VocabStatusGridRow,
  grid: VocabStatusGrid,
  kind: VocabNudgeKind
): VocabNudgeFocus | null {
  const titleAt = (i: number) => grid.sets[i]?.title ?? "";
  if (kind === "retry" && row.failedIdleColumn !== null) {
    return { kind: "retest", setTitle: titleAt(row.failedIdleColumn) };
  }
  for (let i = 0; i < row.cells.length; i += 1) {
    const cell = row.cells[i];
    if (!cell) continue;
    const current = cell.dots.indexOf("current");
    if (current >= 0) return { kind: "stage", setTitle: titleAt(i), stage: current + 1 };
  }
  if (row.failedIdleColumn !== null) {
    return { kind: "retest", setTitle: titleAt(row.failedIdleColumn) };
  }
  const failed = row.cells.findIndex((c) => c?.failed);
  if (failed >= 0) return { kind: "retest", setTitle: titleAt(failed) };
  const fresh = row.cells.findIndex((c) => c && !c.passed && !c.failed);
  if (fresh >= 0) return { kind: "start", setTitle: titleAt(fresh) };
  return null;
}

/** 보낼 알림 종류 — 안 했으면 독려, 했어도 불합격 후 다시 안 봤으면 재도전 */
function nudgeKindOf(row: VocabStatusGridRow): VocabNudgeKind | null {
  if (!row.hasAssignments) return null;
  if (!row.studiedToday) return "not-studied";
  if (row.failedIdleColumn !== null) return "retry";
  return null;
}

function buildVocabNudgeItem(
  row: VocabStatusGridRow,
  kind: VocabNudgeKind,
  { grid, isToday, dayLabel, academyName }: VocabNudgeContext
): KakaoNudgeItem {
  const focus = pickFocus(row, grid, kind);
  const focusText = describeVocabNudgeFocus(focus);
  const studyUrl = toPublicShareUrl(STUDY_PATH);
  return {
    id: row.studentId,
    name: row.name,
    sub: [row.classLabel, focusText].filter(Boolean).join(" · "),
    message: buildVocabNudgeMessage({
      studentName: row.name,
      kind,
      focus,
      isToday,
      dayLabel,
      studyUrl,
      ...(academyName ? { academyName } : {}),
    }),
    share: {
      studentName: row.name,
      periodLabel: dateLabel(grid.dateIso),
      shareUrl: studyUrl,
      feedTitle: `${row.name} 학생 단어학습 안내`,
      feedDescription:
        kind === "retry"
          ? focusText || "최종 시험 다시 보기"
          : `${dayLabel} 단어학습 안 함${focusText ? ` · ${focusText}` : ""}`,
      buttonTitle: "학습 바로가기",
    },
  };
}

/** 알림 받을 학생 수 (요약 카드 버튼용) */
export function countVocabNudgeTargets(rows: VocabStatusGridRow[]): number {
  return rows.filter((r) => nudgeKindOf(r) !== null).length;
}

/** 안 한 학생(+ 불합격 후 다시 안 한 학생)에게 한 명씩 차례로 알림 */
export function VocabNudgeQueueDialog({
  onClose,
  ...ctx
}: VocabNudgeContext & { onClose: () => void }) {
  const { grid, isToday, dayLabel, academyName } = ctx;
  const groups = useMemo<KakaoNudgeGroup[]>(() => {
    const c = { grid, isToday, dayLabel, academyName };
    const notStudied = grid.rows
      .filter((r) => nudgeKindOf(r) === "not-studied")
      .map((r) => buildVocabNudgeItem(r, "not-studied", c));
    const retry = grid.rows
      .filter((r) => nudgeKindOf(r) === "retry")
      .map((r) => buildVocabNudgeItem(r, "retry", c));
    if (retry.length === 0) return [{ items: notStudied }];
    return [
      { label: `${dayLabel} 안 한 학생`, items: notStudied },
      { label: "불합격 후 다시 안 한 학생", items: retry },
    ];
  }, [grid, isToday, dayLabel, academyName]);

  return <SequentialKakaoNudgeDialog groups={groups} onClose={onClose} />;
}

/** 학생 한 명에게 알림 (현황표에서 이름을 눌렀을 때) */
export function VocabNudgeDialog({
  row,
  onClose,
  ...ctx
}: VocabNudgeContext & { row: VocabStatusGridRow; onClose: () => void }) {
  const { grid, isToday, dayLabel, academyName } = ctx;
  const kind = nudgeKindOf(row);
  const nudge = useMemo(
    () =>
      kind ? buildVocabNudgeItem(row, kind, { grid, isToday, dayLabel, academyName }) : null,
    [kind, row, grid, isToday, dayLabel, academyName]
  );

  const emptyText = !row.hasAssignments
    ? "배정받은 단어장이 없어요. 보낼 알림이 없어요."
    : `${dayLabel} 단어학습을 했어요. 보낼 알림이 없어요.`;

  return (
    <SingleKakaoNudgeDialog
      title={`${row.name} 학부모께 알림`}
      description={`${row.classLabel} · ${dayLabel} ${
        !row.hasAssignments ? "배정 없음" : row.studiedToday ? "학습했음" : "안 함"
      }`}
      nudge={nudge}
      emptyText={emptyText}
      onClose={onClose}
    />
  );
}
