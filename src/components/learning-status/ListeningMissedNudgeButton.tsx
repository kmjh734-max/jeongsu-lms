"use client";

import { useMemo } from "react";
import {
  SequentialKakaoNudgeDialog,
  SingleKakaoNudgeDialog,
  type KakaoNudgeItem,
} from "@/components/learning-status/SequentialKakaoNudgeDialog";
import { buildListeningMissedNudgeMessage } from "@/lib/listening/build-missed-nudge-message";
import { getPublicSiteUrl, toPublicShareUrl } from "@/lib/kakao/share-url";
import type { ListeningStatusRow } from "@/lib/learning-status/types";

/**
 * 학부모 알림은 카카오톡 공유 창에서 선생님이 받는 분을 직접 고른다.
 * 여러 학생 이름을 한 메시지에 넣지 않도록 학생마다 따로 보낸다.
 */

interface NudgeContext {
  year: number;
  month: number;
  /** 안내 문구의 학원 이름(접속한 학원). 없으면 문구 쪽 기본값. */
  academyName?: string;
}

function buildListeningNudgeItem(
  row: ListeningStatusRow,
  { year, month, academyName }: NudgeContext
): KakaoNudgeItem {
  const monthLabel = `${year}년 ${month}월`;
  return {
    id: row.studentId,
    name: row.studentName,
    sub: `${row.classLabel} · 안 한 날 ${row.missedDates.length}일`,
    message: buildListeningMissedNudgeMessage({
      studentName: row.studentName,
      monthLabel,
      missedDates: row.missedDates,
      completedCount: row.completedCount,
      totalCount: row.totalCount,
      correctCount: row.correctCount,
      answeredCount: row.answeredCount,
      siteUrl: getPublicSiteUrl(),
      ...(academyName ? { academyName } : {}),
    }),
    share: {
      studentName: row.studentName,
      periodLabel: monthLabel,
      shareUrl: toPublicShareUrl("/student/listening"),
      feedTitle: `${row.studentName} 학생 듣기학습 안내`,
      feedDescription: `안 한 날 ${row.missedDates.length}일 · 수행 ${row.completedCount}/${row.totalCount}`,
      buttonTitle: "학습 바로가기",
    },
  };
}

/** 학생 한 명에게 알림 (현황표에서 이름을 눌렀을 때) */
export function ListeningNudgeDialog({
  row,
  onClose,
  year,
  month,
  academyName,
}: NudgeContext & { row: ListeningStatusRow; onClose: () => void }) {
  const hasMissed = row.missedDates.length > 0;
  const nudge = useMemo(
    () => (hasMissed ? buildListeningNudgeItem(row, { year, month, academyName }) : null),
    [hasMissed, row, year, month, academyName]
  );

  return (
    <SingleKakaoNudgeDialog
      title={`${row.studentName} 학부모께 알림`}
      description={`${row.classLabel} · 수행 ${row.completedCount}/${row.totalCount}일${
        row.answeredCount > 0 ? ` · 정답 ${row.correctCount}/${row.answeredCount}` : ""
      }`}
      nudge={nudge}
      emptyText="이번 달에 안 한 날이 없어요. 보낼 알림이 없어요."
      onClose={onClose}
    />
  );
}

/** 오늘 안 한 학생들에게 한 명씩 차례로 알림 */
export function ListeningNudgeQueueDialog({
  rows,
  onClose,
  year,
  month,
  academyName,
}: NudgeContext & { rows: ListeningStatusRow[]; onClose: () => void }) {
  const items = useMemo(
    () => rows.map((row) => buildListeningNudgeItem(row, { year, month, academyName })),
    [rows, year, month, academyName]
  );

  return <SequentialKakaoNudgeDialog groups={[{ items }]} onClose={onClose} />;
}
