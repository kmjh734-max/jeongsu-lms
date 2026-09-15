"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { PcKakaoSendModal } from "@/components/reports/PcKakaoSendModal";
import {
  formatKoreanDate,
  ReportMenu,
  ReportMenuItem,
} from "@/components/reports/report-ui";
import { StudentRecordPrintPreview } from "@/components/student-records/StudentRecordPrintPreview";
import { StudentRecordShareActions } from "@/components/student-records/StudentRecordShareActions";
import { buildStudentRecordKakaoMessage } from "@/lib/student-records/build-kakao-message";
import { buildStudentRecordPdfFileName } from "@/lib/student-records/pdf-filename";
import type { StudentRecordAnalysisResult } from "@/lib/student-records/types";

interface StudentRecordReportViewProps {
  result: StudentRecordAnalysisResult;
  /** 분석 기록에 저장된 학교 이름 */
  school?: string | null;
  /** 본문 수정 저장 후 상위 상태 동기화 */
  onHtmlSaved?: (html: string) => void;
  /** 기록 삭제 (저장된 기록일 때만) */
  onDelete?: () => void;
  academyName?: string;
  logoSrc?: string;
}

export function StudentRecordReportView({
  result,
  school,
  onHtmlSaved,
  onDelete,
  academyName,
  logoSrc,
}: StudentRecordReportViewProps) {
  const [printOpen, setPrintOpen] = useState(false);
  const [pcKakaoOpen, setPcKakaoOpen] = useState(false);
  const [pcKakaoCopyOk, setPcKakaoCopyOk] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" } | null>(
    null
  );
  const [iframeKey, setIframeKey] = useState(0);

  const canEdit = Boolean(result.recordId);

  function showNotice(text: string, tone: "ok" | "error") {
    setNotice({ text, tone });
    window.setTimeout(() => setNotice(null), 6000);
  }

  function startEditing() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.designMode = "on";
    setNotice(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setNotice(null);
    // iframe을 다시 그려 수정 전 내용으로 복원
    setIframeKey((k) => k + 1);
  }

  async function saveEditing() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !result.recordId) return;

    const html = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
    setSaving(true);
    try {
      const res = await fetch(`/api/student-records/history/${result.recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "저장하지 못했어요.");
      }
      doc.designMode = "off";
      setEditing(false);
      onHtmlSaved?.(html);
      showNotice("고친 내용을 저장했어요.", "ok");
    } catch (e) {
      showNotice(e instanceof Error ? e.message : "저장하지 못했어요.", "error");
    } finally {
      setSaving(false);
    }
  }

  const parentMessage = buildStudentRecordKakaoMessage({
    studentName: result.studentName,
    academyName,
  });

  async function handlePcKakaoPrepare() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(parentMessage);
      copied = true;
    } catch {
      copied = false;
    }
    setPcKakaoCopyOk(copied);
    setPrintOpen(true);
    setPcKakaoOpen(true);
  }

  const meta = [school, formatKoreanDate(result.generatedAt)].filter(Boolean).join(" · ");

  return (
    <div className="space-y-3">
      <header className="no-print flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-card">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon name="clipboard" size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-slate-900">
            {result.studentName} 학생부 분석
          </h2>
          {meta ? <p className="truncate text-xs text-slate-500">{meta}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <Button variant="secondary" disabled={saving} onClick={cancelEditing}>
                취소
              </Button>
              <Button disabled={saving} onClick={() => void saveEditing()}>
                <Icon name="check" size={15} />
                {saving ? "저장 중…" : "고친 내용 저장"}
              </Button>
            </>
          ) : (
            <>
              {canEdit ? (
                <Button variant="secondary" onClick={startEditing}>
                  <Icon name="edit" size={15} />
                  내용 수정
                </Button>
              ) : null}
              <StudentRecordShareActions
                result={result}
                onOpenPrint={() => setPrintOpen(true)}
                onPcKakaoPrepare={handlePcKakaoPrepare}
                onMessage={showNotice}
                academyName={academyName}
                logoSrc={logoSrc}
              />
              {onDelete ? (
                <ReportMenu label="기록 메뉴">
                  <ReportMenuItem icon="trash" danger onClick={onDelete}>
                    삭제
                  </ReportMenuItem>
                </ReportMenu>
              ) : null}
            </>
          )}
        </div>
      </header>

      {editing ? (
        <p className="no-print rounded-md border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          고치고 싶은 글자를 아래 보고서에서 바로 눌러 고친 뒤, 「고친 내용 저장」을 눌러 주세요.
        </p>
      ) : null}
      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`no-print rounded-md border px-4 py-2.5 text-sm ${
            notice.tone === "error"
              ? "border-rose-100 bg-rose-50 text-rose-700"
              : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <div
        className={`overflow-hidden rounded-lg border bg-white shadow-card ${
          editing ? "border-brand-600 ring-2 ring-brand-100" : "border-slate-200"
        }`}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          title={`${result.studentName} 학생부 분석`}
          srcDoc={result.html}
          className="min-h-[80vh] w-full border-0"
          sandbox="allow-same-origin"
        />
      </div>

      <StudentRecordPrintPreview
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        html={result.html}
        studentName={result.studentName}
      />

      <PcKakaoSendModal
        open={pcKakaoOpen}
        onClose={() => setPcKakaoOpen(false)}
        studentName={result.studentName}
        rangeLabel="학생부 분석"
        parentMessage={parentMessage}
        copySucceeded={pcKakaoCopyOk}
        onOpenPrint={() => setPrintOpen(true)}
        pdfFileName={buildStudentRecordPdfFileName(result.studentName)}
        title="PC 카톡으로 학생부 분석 보내기"
      />
    </div>
  );
}
