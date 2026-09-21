import { ACADEMY_NAME } from "@/lib/branding";
import type { StudentReport } from "@/lib/reports/types";

export interface ParentMessageInput {
  report: StudentReport;
  /** 반영 버튼으로 확정된 학습 리포트 본문 (비어 있으면 시스템 요약 placeholder) */
  learningReportText?: string;
  /** 학원명 (학원별 브랜딩) */
  academyName?: string;
}

/** 목록이 길어지면 앞의 몇 개만 적고 나머지는 수로 적는다 */
function few(items: string[], keep: number): string[] {
  if (items.length <= keep) return items;
  return [...items.slice(0, keep), `외 ${items.length - keep}개`];
}

/**
 * 학부모께 보낼 안내문구.
 *
 * 전에는 번호 붙은 다섯 칸에 강의 제목과 낱말을 모두 늘어놓아 카톡 화면을 넘겼다.
 * 학부모가 한 번에 읽을 수 있도록 갈래마다 한 줄로 줄이고, 자세한 것은 링크에 맡긴다.
 */
export function buildParentReportMessage({
  report,
  learningReportText,
  academyName = ACADEMY_NAME,
}: ParentMessageInput): string {
  const studentName = report.student.name;
  const o = report.overview;

  const lines: string[] = [
    `[${studentName} 학생 학습 리포트]`,
    "",
    `안녕하세요. ${academyName}입니다.`,
    `${report.rangeLabel} ${studentName} 학생의 학습 현황을 알려 드립니다.`,
    "",
  ];

  // 출결 — 일정표에 찍어 둔 것이 있을 때만
  const att = report.studyPlan?.attendance;
  if (att) {
    const came = att.present + att.late + att.makeup;
    const planned = came + att.absent;
    if (planned > 0) {
      const extra = [
        att.late > 0 ? `지각 ${att.late}회` : "",
        att.absent > 0 ? `결석 ${att.absent}회` : "",
        att.makeup > 0 ? `보강 ${att.makeup}회` : "",
      ].filter(Boolean);
      lines.push(
        `· 출결 — 수업 ${planned}회 중 ${came}회 참여` +
          (extra.length ? ` (${extra.join(", ")})` : ""),
      );
    }
  }

  // 단어
  if (report.vocabSets.length > 0) {
    const passed = report.vocabSets.filter((s) => s.stage4Passed);
    const head =
      `· 단어 — ${report.vocabSets.length}세트 중 ${passed.length}세트 합격` +
      (o?.vocab.avgScore != null ? ` (종합테스트 ${o.vocab.avgScore}점)` : "");
    lines.push(head);
    for (const t of few(
      report.vocabSets.map(
        (s) => `   ${s.setTitle} — ${s.stage4Passed ? `합격 ${s.stage4BestScore}점` : s.statusLabel}`,
      ),
      3,
    )) {
      lines.push(t);
    }
  }

  // 듣기 — 받아쓰기·시험을 한 줄씩
  const listen: string[] = [];
  for (const d of report.listeningDictation) {
    listen.push(
      `   ${d.setTitle} 받아쓰기 — ${d.questionCount}문항 중 ${d.passedQuestionCount}문항 통과` +
        (d.averageBestScore != null ? `, 평균 ${d.averageBestScore}점` : ""),
    );
  }
  for (const e of report.listeningExam) {
    listen.push(
      `   ${e.setTitle} 시험 — ${e.questionCount}문항` +
        (e.bestScore != null ? `, 최고 ${e.bestScore}점` : ""),
    );
  }
  if (listen.length > 0) {
    lines.push("· 듣기");
    for (const t of few(listen, 3)) lines.push(t);
  }

  // 영상
  if (report.courses.length > 0) {
    for (const t of few(
      report.courses.map(
        (c) =>
          `· 영상 — ${c.courseTitle} ${c.totalLessons}강 중 ${c.completedLessons}강 (${c.progressPercent}%)`,
      ),
      2,
    )) {
      lines.push(t);
    }
  }

  // 복습할 낱말 — 집에서 할 일이라 낱말을 그대로 적는다
  if (report.reviewWords.length > 0) {
    const words = report.reviewWords.slice(0, 10).map((w) => w.word);
    lines.push(
      `· 복습할 낱말 ${report.reviewWords.length}개 — ${words.join(", ")}` +
        (report.reviewWords.length > words.length ? " 외" : ""),
    );
  }

  // 학습일정표에 적어 둔 진도 — 문법·독해처럼 시스템 밖에서 한 것이 여기로 들어온다.
  // 단어·듣기는 위에서 이미 적었으므로 겹치지 않게 뺀다.
  const already = /^(영단어|단어|어휘|듣기)/;
  for (const line of report.studyPlan?.areaLines ?? []) {
    if (already.test(line.trim())) continue;
    lines.push(`· ${line.trim()}`);
  }

  // 선생님이 손본 글이 있으면 그대로 덧붙인다
  const reflected = learningReportText?.trim();
  if (reflected) lines.push("", reflected);

  lines.push("", "자세한 내용은 아래 링크에서 보실 수 있습니다.");
  lines.push("앞으로도 꾸준히 지도하겠습니다. 감사합니다.");

  return lines.join("\n");
}
