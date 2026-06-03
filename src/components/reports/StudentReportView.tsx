"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatLastStudiedDate } from "@/lib/progress/enrollment-progress";
import { buildParentReportMessage } from "@/lib/reports/build-parent-message";
import { replaceLearningReportSection } from "@/lib/reports/parent-message-utils";
import type { StudentReport } from "@/lib/reports/types";
import { AiReportDraftSection } from "@/components/reports/AiReportDraftSection";
import { ParentMessageSection } from "@/components/reports/ParentMessageSection";
import { ReportPrintPreview } from "@/components/reports/ReportPrintPreview";
import { PcKakaoSendModal } from "@/components/reports/PcKakaoSendModal";
import { ReportShareActions } from "@/components/reports/ReportShareActions";
import { extractLearningReportSection } from "@/lib/reports/parent-message-utils";

interface StudentReportViewProps {
  report: StudentReport;
  aiReportDraft: string;
  onAiReportDraftChange: (value: string) => void;
}

function boolBadge(done: boolean, doneLabel = "완료", todoLabel = "미완료") {
  return (
    <Badge variant={done ? "success" : "neutral"}>
      {done ? doneLabel : todoLabel}
    </Badge>
  );
}

export function StudentReportView({
  report,
  aiReportDraft,
  onAiReportDraftChange,
}: StudentReportViewProps) {
  const generatedLabel = formatLastStudiedDate(report.generatedAt);
  const [parentMessage, setParentMessage] = useState("");
  const [isParentMessageEditing, setIsParentMessageEditing] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [pcKakaoModalOpen, setPcKakaoModalOpen] = useState(false);
  const [pcKakaoCopyOk, setPcKakaoCopyOk] = useState(false);
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  useEffect(() => {
    setParentMessage(buildParentReportMessage({ report }));
    setIsParentMessageEditing(false);
    setPrintPreviewOpen(false);
    setPcKakaoModalOpen(false);
    setPcKakaoCopyOk(false);
  }, [report]);

  async function handlePcKakaoPrepare() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(parentMessage);
      copied = true;
    } catch {
      copied = false;
    }
    setPcKakaoCopyOk(copied);
    setPrintPreviewOpen(true);
    setPcKakaoModalOpen(true);
  }

  async function generateDraft() {
    setDraftGenerating(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/reports/generate-report-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        text?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.text) {
        setDraftError(data.message ?? "AI 리포트 생성에 실패했습니다.");
        return;
      }
      onAiReportDraftChange(data.text);
    } catch {
      setDraftError("AI 리포트 생성에 실패했습니다.");
    } finally {
      setDraftGenerating(false);
    }
  }

  function handleReflectFromDraft(): string {
    const draft = aiReportDraft.trim();
    if (!draft) {
      return "먼저 AI 리포트 초안을 생성하거나 내용을 입력해주세요.";
    }
    setParentMessage(replaceLearningReportSection(parentMessage, draft, report));
    return "AI 학습리포트 내용이 학부모 발송용 문구에 반영되었습니다.";
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">학생 정보</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">이름</dt>
              <dd className="font-medium text-slate-900">{report.student.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">아이디</dt>
              <dd className="font-medium text-slate-900">
                {report.student.loginId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">소속 반</dt>
              <dd className="font-medium text-slate-900">
                {report.student.classNames.length > 0
                  ? report.student.classNames.join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">리포트 기간</dt>
              <dd className="font-medium text-slate-900">{report.rangeLabel}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">리포트 생성일</dt>
              <dd className="font-medium text-slate-900">{generatedLabel}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">영상 강좌 학습 현황</h2>
          {report.courses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              배정된 영상 강좌가 없습니다.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {report.courses.map((course) => (
                <article
                  key={course.courseId}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {course.courseTitle}
                    </h3>
                    <Badge variant="brand">
                      {course.completedLessons}/{course.totalLessons}강
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      percent={course.progressPercent}
                      label={`진도율 ${course.progressPercent}% (전체 기준)`}
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    최근 학습일 ({report.rangeLabel}):{" "}
                    {formatLastStudiedDate(course.lastStudiedAt)}
                  </p>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-emerald-700">
                      완료한 영상 ({course.completedLessonsList.length})
                    </p>
                    {course.completedLessonsList.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {report.rangeLabel} 기준 완료한 영상이 없습니다.
                      </p>
                    ) : (
                      <ul className="mt-1 max-h-48 overflow-y-auto text-sm text-slate-700">
                        {course.completedLessonsList.map((title) => (
                          <li key={title}>· {title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">듣기 Dictation</h2>
          <p className="mt-2 text-sm text-slate-600">{report.summary.listeningDictationLine}</p>
          {report.listeningDictation.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">배정된 듣기 Dictation 기록이 없습니다.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {report.listeningDictation.map((d) => (
                <article
                  key={d.setId}
                  className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 text-sm"
                >
                  <h3 className="font-semibold text-slate-900">{d.setTitle}</h3>
                  <p className="mt-1 text-slate-700">{d.summaryLine}</p>
                  <p className="mt-2 text-slate-600">
                    통과 {d.passedQuestionCount}/{d.questionCount}문항 · 시도{" "}
                    {d.totalAttempts}회
                    {d.averageBestScore != null
                      ? ` · 평균 최고 ${d.averageBestScore}점`
                      : ""}
                  </p>
                  {d.frequentWrongWords.length > 0 && (
                    <p className="mt-1 text-amber-800">
                      자주 틀린 단어: {d.frequentWrongWords.join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">단어학습 현황</h2>
          {report.vocabSets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">배정된 단어장이 없습니다.</p>
          ) : (
            <div className="ui-table-wrap mt-4">
              <table className="ui-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>단어장</th>
                    <th>단어 수</th>
                    <th>1단계</th>
                    <th>2단계</th>
                    <th>3단계</th>
                    <th>4단계</th>
                    <th>최근 점수</th>
                    <th>최고 점수</th>
                    <th>응시</th>
                    <th>최근 학습일</th>
                  </tr>
                </thead>
                <tbody>
                  {report.vocabSets.map((set) => (
                    <tr key={set.setId}>
                      <td className="font-medium">{set.setTitle}</td>
                      <td>{set.itemCount}</td>
                      <td>{boolBadge(set.stage1Completed)}</td>
                      <td>{boolBadge(set.stage2Completed)}</td>
                      <td>{boolBadge(set.stage3Completed)}</td>
                      <td>
                        {set.stage4Passed ? (
                          <Badge variant="success">합격</Badge>
                        ) : set.stage4AttemptCount > 0 ? (
                          <Badge variant="danger">불합격</Badge>
                        ) : (
                          <Badge variant="warning">미응시</Badge>
                        )}
                      </td>
                      <td>
                        {set.stage4AttemptCount > 0
                          ? `${set.stage4LastScore}점`
                          : "—"}
                      </td>
                      <td>
                        {set.stage4BestScore > 0 ? `${set.stage4BestScore}점` : "—"}
                      </td>
                      <td>{set.stage4AttemptCount}</td>
                      <td>{formatLastStudiedDate(set.lastStudiedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">복습 필요 단어</h2>
          {report.reviewWords.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              {report.rangeLabel} 기준 복습이 필요한 단어가 없습니다.
            </p>
          ) : (
            <div className="ui-table-wrap mt-4">
              <table className="ui-table min-w-[520px]">
                <thead>
                  <tr>
                    <th>단어</th>
                    <th>뜻</th>
                    <th>오답 단계</th>
                    <th>오답 횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {report.reviewWords.map((row) => (
                    <tr key={row.itemId}>
                      <td className="font-medium">{row.word}</td>
                      <td>{row.meaning}</td>
                      <td className="text-sm">{row.stages.join(", ")}</td>
                      <td>{row.wrongCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <AiReportDraftSection
          report={report}
          value={aiReportDraft}
          onChange={onAiReportDraftChange}
          generating={draftGenerating}
          generateError={draftError}
          onGenerate={generateDraft}
        />

        <ParentMessageSection
          parentMessage={parentMessage}
          isEditing={isParentMessageEditing}
          onParentMessageChange={setParentMessage}
          onEditingChange={setIsParentMessageEditing}
          onReflectFromDraft={handleReflectFromDraft}
          onOpenPrint={() => setPrintPreviewOpen(true)}
          onPcKakaoPrepare={handlePcKakaoPrepare}
        />

        <ReportShareActions
          key={`${report.student.id}-${report.generatedAt}`}
          report={report}
          parentMessage={parentMessage}
          aiReportDraft={aiReportDraft}
          onOpenPrint={() => setPrintPreviewOpen(true)}
        />
      </div>

      <ReportPrintPreview
        open={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
        report={report}
        parentMessage={parentMessage}
        learningReportText={extractLearningReportSection(parentMessage)}
      />

      <PcKakaoSendModal
        open={pcKakaoModalOpen}
        onClose={() => setPcKakaoModalOpen(false)}
        studentName={report.student.name}
        rangeLabel={report.rangeLabel}
        parentMessage={parentMessage}
        copySucceeded={pcKakaoCopyOk}
        onOpenPrint={() => setPrintPreviewOpen(true)}
      />
    </>
  );
}
