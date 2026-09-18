"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  formatKoreanDate,
  NameAvatar,
  ReportMenu,
  ReportMenuItem,
} from "@/components/reports/report-ui";
import { StudentRecordReportView } from "@/components/student-records/StudentRecordReportView";
import type {
  ReportClassOption,
  ReportStudentOption,
} from "@/lib/reports/types";
import {
  formatBytes,
  STUDENT_RECORD_MAX_PDF_PAGES,
  validateStudentRecordFiles,
} from "@/lib/student-records/client-upload";
import { STUDENT_RECORD_MAX_IMAGE_BYTES } from "@/lib/student-records/limits";
import { DEFAULT_ANALYSIS_INSTRUCTIONS } from "@/lib/student-records/simple-analysis-prompt";
import { isHtmlUpload, isPdfUpload } from "@/lib/student-records/file-types";
import {
  clearRecordJob,
  getRecordJobState,
  startRecordJob,
  useRecordJob,
  type RecordJobInput,
} from "@/lib/student-records/record-job-runner";
import type { StudentRecordAnalysisResult } from "@/lib/student-records/types";

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,text/html,.html,.htm";
const ACCEPT_TYPES = ACCEPT.split(",");

/** 0 파일 읽기 · 1 내용 정리 · 2 보고서 쓰기 */
const STAGE_LABELS = ["파일 읽기", "내용 정리", "보고서 쓰기"] as const;

/** 다른 메뉴에 다녀오는 동안 도는(또는 실패한) 작업이 있으면 그때 고른 값으로 양식을 채운다 */
function jobInputToRestore(): RecordJobInput | null {
  const job = getRecordJobState();
  return job.status === "running" || job.status === "error" ? job.input : null;
}

type HistoryRecord = {
  id: string;
  studentName: string;
  school: string | null;
  generatedAt: string;
  createdAt: string;
};

interface StudentRecordWorkspaceProps {
  initialClasses?: ReportClassOption[];
  initialStudents?: ReportStudentOption[];
  academyName?: string;
  logoSrc?: string;
}

function StepCard({
  index,
  title,
  sub,
  done,
  active,
}: {
  index: number;
  title: string;
  sub: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg border bg-white px-3.5 py-3 shadow-card ${
        active ? "border-brand-600 ring-1 ring-brand-600" : "border-slate-200"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done && !active
            ? "bg-green-700 text-white"
            : active
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        {done && !active ? <Icon name="check" size={15} strokeWidth={2.5} /> : index}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block truncate text-xs text-slate-500">{sub}</span>
      </span>
    </li>
  );
}

function StepSection({
  index,
  title,
  hint,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 px-5 py-5 first:border-t-0">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
          {index}
        </span>
        {title}
      </h2>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function StudentRecordWorkspace({
  initialClasses = [],
  initialStudents = [],
  academyName,
  logoSrc,
}: StudentRecordWorkspaceProps) {
  const [restoredInput] = useState(jobInputToRestore);
  const [classes, setClasses] = useState<ReportClassOption[]>(initialClasses);
  const [students, setStudents] = useState<ReportStudentOption[]>(initialStudents);
  const [classId, setClassId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    restoredInput?.studentId ?? ""
  );
  const [manualStudentName, setManualStudentName] = useState(
    restoredInput?.manualStudentName ?? ""
  );
  const [analysisInstructions, setAnalysisInstructions] = useState(
    restoredInput?.analysisInstructions ?? DEFAULT_ANALYSIS_INSTRUCTIONS
  );
  const [files, setFiles] = useState<File[]>(restoredInput?.files ?? []);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<StudentRecordAnalysisResult | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyBusyId, setHistoryBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const firstClassLoad = useRef(true);

  // 분석은 화면 밖 진행기에서 돈다 — 다른 메뉴에 다녀와도 이어서 보여 준다
  const job = useRecordJob();
  const analyzing = job.status === "running";
  const progressStage = job.stage;
  const progressLabel = analyzing ? job.label : null;
  const progressPercent = analyzing ? job.percent : 0;

  // 반을 바꾸면 그 반 학생만 다시 불러온다 (이름은 화면에서 바로 거른다)
  useEffect(() => {
    if (firstClassLoad.current) {
      firstClassLoad.current = false;
      if (initialStudents.length > 0 || initialClasses.length > 0) return;
    }
    let cancelled = false;
    setListLoading(true);
    const params = new URLSearchParams();
    if (classId) params.set("classId", classId);
    fetch(`/api/reports/students?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message ?? "학생 목록을 불러오지 못했어요.");
        }
        if (cancelled) return;
        setClasses(data.classes ?? []);
        setStudents(data.students ?? []);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "학생 목록을 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId, initialClasses.length, initialStudents.length]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/student-records/history");
      const data = await res.json();
      if (res.ok && data.ok) {
        setHistory(data.records ?? []);
      }
    } catch {
      // 기록 로딩 실패는 분석 기능에 영향 없음
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // 작업이 끝나면(이 화면에 있든, 다른 메뉴에 있다 돌아왔든) 결과를 받아 와 연다
  useEffect(() => {
    if (job.status === "done" && job.result) {
      setResult(job.result);
      setError(null);
      // 다 만들었으면 다음 「새 분석」은 빈 양식으로 시작
      setFiles([]);
      setSelectedStudentId("");
      setManualStudentName("");
      void loadHistory();
      clearRecordJob(job.id);
    } else if (job.status === "error") {
      // 실패하면 그때 고른 파일·학생을 그대로 두어 바로 다시 해 볼 수 있게
      if (job.input) {
        setFiles(job.input.files);
        setSelectedStudentId(job.input.studentId ?? "");
        setManualStudentName(job.input.manualStudentName);
        setAnalysisInstructions(job.input.analysisInstructions);
      }
      setResult(null);
      setError(job.error ?? "문제가 생겼어요. 다시 해 주세요.");
      clearRecordJob(job.id);
    }
  }, [job, loadHistory]);

  const visibleStudents = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.loginId ?? "").toLowerCase().includes(q)
    );
  }, [students, nameQuery]);

  const visibleHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.school ?? "").toLowerCase().includes(q)
    );
  }, [history, historyQuery]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? null;

  async function openHistoryRecord(id: string) {
    if (analyzing) return;
    setHistoryBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/student-records/history/${id}`);
      const data = await res.json();
      if (!res.ok || !data.ok || !data.record?.html) {
        throw new Error(data.message ?? "기록을 불러오지 못했어요.");
      }
      setResult({
        studentId: data.record.studentId ?? null,
        studentName: data.record.studentName ?? "학생",
        html: data.record.html,
        generatedAt: data.record.generatedAt,
        recordId: data.record.id ?? id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 불러오지 못했어요.");
    } finally {
      setHistoryBusyId(null);
    }
  }

  function startEditingRecord(record: HistoryRecord) {
    setEditingId(record.id);
    setEditingTitle(
      record.school ? `${record.school} · ${record.studentName}` : record.studentName
    );
  }

  async function renameHistoryRecord(id: string) {
    const title = editingTitle.trim();
    if (!title) {
      setError("제목을 적어 주세요.");
      return;
    }
    setHistoryBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/student-records/history/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "제목을 고치지 못했어요.");
      }
      setHistory((prev) =>
        prev.map((r) => (r.id === id ? { ...r, studentName: title, school: null } : r))
      );
      setEditingId(null);
      setEditingTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "제목을 고치지 못했어요.");
    } finally {
      setHistoryBusyId(null);
    }
  }

  async function deleteHistoryRecord(id: string) {
    if (!window.confirm("이 분석 기록을 삭제할까요?")) return;
    setHistoryBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/student-records/history/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "기록을 삭제하지 못했어요.");
      }
      setHistory((prev) => prev.filter((r) => r.id !== id));
      setResult((prev) => (prev?.recordId === id ? null : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 삭제하지 못했어요.");
    } finally {
      setHistoryBusyId(null);
    }
  }

  function startNew() {
    if (analyzing) return;
    setResult(null);
    setError(null);
  }

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list).filter(
      (f) => ACCEPT_TYPES.includes(f.type) || isPdfUpload(f) || isHtmlUpload(f)
    );
    if (incoming.length === 0) {
      setError("PDF, HTML, 이미지(JPG·PNG·WEBP) 파일만 올릴 수 있어요.");
      return;
    }
    setError(null);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [...prev, ...incoming.filter((f) => !seen.has(`${f.name}-${f.size}`))];
    });
  }

  function runAnalysis() {
    if (files.length === 0) {
      setError("분석할 PDF·HTML·이미지를 올려 주세요.");
      return;
    }

    const fileError = validateStudentRecordFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }

    const started = startRecordJob({
      files,
      studentId: selectedStudentId || null,
      manualStudentName,
      analysisInstructions,
      displayName: selectedStudent?.name || manualStudentName.trim() || "",
      returnPath: window.location.pathname,
    });
    if (!started) {
      setError("이미 만들고 있는 학생부 분석이 있어요. 끝난 뒤에 다시 해 주세요.");
      return;
    }
    setError(null);
    setResult(null);
  }

  const pdfCount = files.filter(isPdfUpload).length;
  const htmlCount = files.filter(isHtmlUpload).length;
  const imageCount = files.length - pdfCount - htmlCount;
  const fileSummary =
    files.length === 0
      ? "파일을 올려 주세요"
      : [pdfCount ? `PDF ${pdfCount}개` : "", htmlCount ? `HTML ${htmlCount}개` : "", imageCount ? `이미지 ${imageCount}장` : ""]
          .filter(Boolean)
          .join(" · ");
  const instructionsChanged =
    analysisInstructions.trim() !== DEFAULT_ANALYSIS_INSTRUCTIONS.trim();
  const studentSub = selectedStudent
    ? `${selectedStudent.name}${
        selectedStudent.classNames.length > 0 ? ` · ${selectedStudent.classNames[0]}` : ""
      }`
    : manualStudentName.trim() || "학생부에서 이름 읽기";
  const runningName =
    job.input?.displayName || selectedStudent?.name || manualStudentName.trim() || "";

  const openRecordId = result?.recordId ?? null;
  const openRecord = openRecordId ? history.find((r) => r.id === openRecordId) : undefined;

  const steps = (
    <ol className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StepCard
        index={1}
        title="학생"
        sub={studentSub}
        done={Boolean(selectedStudentId || manualStudentName.trim())}
      />
      <StepCard index={2} title="학생부 파일" sub={fileSummary} done={files.length > 0} />
      <StepCard
        index={3}
        title="요청 사항"
        sub={instructionsChanged ? "직접 고침" : "기본 요청"}
        done={analysisInstructions.trim().length > 0}
      />
      <StepCard
        index={4}
        title="만들기"
        sub={analyzing ? `${STAGE_LABELS[progressStage]} 중` : files.length > 0 ? "준비됐어요" : "파일이 필요해요"}
        done={false}
        active={analyzing}
      />
    </ol>
  );

  return (
    <div>
      <PageHeader
        title="학생부 분석"
        description="학교생활기록부를 올리면 입시 관점의 분석 보고서를 만들어 드려요."
        action={
          <Button onClick={startNew} disabled={analyzing}>
            <Icon name="plus" size={16} />
            새 분석
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* 분석 기록 */}
        <aside className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-card lg:max-h-[calc(100vh-190px)] lg:min-h-[480px]">
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-sm font-bold text-slate-900">분석 기록</h2>
              <span className="text-xs tabular-nums text-slate-400">{history.length}</span>
            </div>
            <label className="relative block">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                <Icon name="search" size={16} />
              </span>
              <input
                type="search"
                className="ui-input h-9 py-1.5 pl-8"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="이름 찾기"
                aria-label="분석 기록 찾기"
              />
            </label>
          </div>
          <ul className="max-h-72 min-h-0 flex-1 overflow-y-auto px-2 pb-2 lg:max-h-none">
            {visibleHistory.length === 0 ? (
              <li className="px-2 py-6 text-center text-xs text-slate-400">
                {history.length === 0
                  ? "아직 기록이 없어요. 보고서를 만들면 여기에 쌓여요."
                  : "찾는 기록이 없어요."}
              </li>
            ) : null}
            {visibleHistory.map((record) => {
              const on = record.id === openRecordId;
              const busy = historyBusyId === record.id;
              if (editingId === record.id) {
                return (
                  <li key={record.id} className="space-y-1.5 rounded-md bg-slate-50 p-2">
                    <input
                      type="text"
                      className="ui-input h-8 py-1 text-sm"
                      value={editingTitle}
                      maxLength={100}
                      autoFocus
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void renameHistoryRecord(record.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      aria-label="기록 제목"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                        취소
                      </Button>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void renameHistoryRecord(record.id)}
                      >
                        {busy ? "저장 중…" : "저장"}
                      </Button>
                    </div>
                  </li>
                );
              }
              return (
                <li key={record.id} className="group relative">
                  <button
                    type="button"
                    disabled={busy || analyzing}
                    onClick={() => void openHistoryRecord(record.id)}
                    aria-current={on ? "true" : undefined}
                    className={`flex w-full items-start gap-2.5 rounded-md px-2 py-2.5 pr-9 text-left transition disabled:opacity-60 ${
                      on ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      name="file"
                      size={17}
                      className={`mt-0.5 ${on ? "text-brand-600" : "text-slate-400"}`}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          on ? "text-brand-700" : "text-slate-900"
                        }`}
                      >
                        {record.studentName}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {busy
                          ? "불러오는 중…"
                          : [record.school, formatKoreanDate(record.generatedAt)]
                              .filter(Boolean)
                              .join(" · ")}
                      </span>
                    </span>
                  </button>
                  <div className="absolute right-1 top-2">
                    <ReportMenu label={`${record.studentName} 기록 메뉴`} disabled={busy}>
                      <ReportMenuItem icon="edit" onClick={() => startEditingRecord(record)}>
                        제목 수정
                      </ReportMenuItem>
                      <ReportMenuItem
                        icon="trash"
                        danger
                        onClick={() => void deleteHistoryRecord(record.id)}
                      >
                        삭제
                      </ReportMenuItem>
                    </ReportMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="min-w-0 space-y-4">
          {error && (result || analyzing) ? <Alert variant="error">{error}</Alert> : null}

          {result ? (
            <StudentRecordReportView
              key={`${result.recordId ?? "new"}-${result.generatedAt}`}
              result={result}
              school={openRecord?.school ?? null}
              academyName={academyName}
              logoSrc={logoSrc}
              onDelete={
                result.recordId
                  ? () => void deleteHistoryRecord(result.recordId!)
                  : undefined
              }
              onHtmlSaved={(html) =>
                setResult((prev) => (prev ? { ...prev, html } : prev))
              }
            />
          ) : analyzing ? (
            <>
              {steps}
              <section className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-card">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon name="clipboard" size={24} />
                </span>
                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  {runningName ? `${runningName} 학생부를` : "학생부를"} 분석하고 있어요
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  보통 1~3분 걸려요. 다른 메뉴로 가도 계속 만들어져요. (이 탭을 닫으면 멈춰요)
                </p>
                <div className="mx-auto mt-6 max-w-md text-left">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-800">
                      {progressLabel ?? "준비 중"}
                    </span>
                    <span className="tabular-nums text-slate-500">{progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all duration-300"
                      style={{ width: `${Math.max(3, progressPercent)}%` }}
                    />
                  </div>
                </div>
                <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                  {STAGE_LABELS.map((label, i) => {
                    const state =
                      i < progressStage ? "done" : i === progressStage ? "now" : "todo";
                    return (
                      <li
                        key={label}
                        className={`flex items-center gap-1.5 ${
                          state === "done"
                            ? "text-slate-700"
                            : state === "now"
                              ? "font-semibold text-brand-700"
                              : "text-slate-400"
                        }`}
                      >
                        {state === "done" ? (
                          <Icon name="check" size={15} className="text-green-700" />
                        ) : (
                          <span
                            className={`h-2 w-2 rounded-full ${
                              state === "now" ? "bg-brand-600" : "bg-slate-200"
                            }`}
                          />
                        )}
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          ) : (
            <>
              {steps}
              <div className="rounded-lg border border-slate-200 bg-white shadow-card">
                <StepSection
                  index={1}
                  title="학생"
                  hint="고르지 않아도 돼요. 그러면 학생부에 적힌 이름을 읽어요."
                >
                  <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <select
                      className="ui-select h-9 py-1.5"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      aria-label="반"
                    >
                      <option value="">반: 전체</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <label className="relative block">
                      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                        <Icon name="search" size={16} />
                      </span>
                      <input
                        type="search"
                        className="ui-input h-9 py-1.5 pl-8"
                        value={nameQuery}
                        onChange={(e) => setNameQuery(e.target.value)}
                        placeholder="이름 찾기"
                        aria-label="학생 이름 찾기"
                      />
                    </label>
                  </div>
                  <ul
                    role="listbox"
                    aria-label="학생"
                    className="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200"
                  >
                    <li>
                      <button
                        type="button"
                        role="option"
                        aria-selected={!selectedStudentId}
                        onClick={() => setSelectedStudentId("")}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                          !selectedStudentId ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Icon name="file" size={14} />
                        </span>
                        선택 안 함 (학생부에서 이름 읽기)
                      </button>
                    </li>
                    {listLoading ? (
                      <li className="px-3 py-3 text-xs text-slate-400">불러오는 중…</li>
                    ) : null}
                    {visibleStudents.map((s) => {
                      const on = s.id === selectedStudentId;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={on}
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                              on ? "bg-brand-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <NameAvatar name={s.name} active={on} />
                            <span className={`font-semibold ${on ? "text-brand-700" : "text-slate-900"}`}>
                              {s.name}
                            </span>
                            <span className="truncate text-xs text-slate-400">
                              {s.classNames.join(", ")}
                            </span>
                            {on ? (
                              <Icon name="check" size={16} className="ml-auto text-brand-600" />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {!selectedStudentId ? (
                    <input
                      className="ui-input mt-2"
                      value={manualStudentName}
                      onChange={(e) => setManualStudentName(e.target.value)}
                      placeholder="이름을 알면 적어 주세요 (비워 두면 학생부에서 읽어요)"
                      aria-label="학생 이름"
                    />
                  ) : null}
                </StepSection>

                <StepSection index={2} title="학생부 파일" hint="성적표·세특·창체·행특이 담긴 파일을 올려 주세요.">
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      addFiles(e.dataTransfer.files);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
                      dragOver
                        ? "border-brand-600 bg-brand-50"
                        : "border-slate-300 bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/40"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-card">
                      <Icon name="upload" size={18} />
                    </span>
                    <span className="mt-3 text-sm font-semibold text-slate-800">
                      PDF·이미지 파일을 끌어 놓거나 눌러서 고르세요
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      PDF는 최대 {STUDENT_RECORD_MAX_PDF_PAGES}쪽, 이미지는 한 장에{" "}
                      {formatBytes(STUDENT_RECORD_MAX_IMAGE_BYTES)}까지 올릴 수 있어요.
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept={ACCEPT}
                      multiple
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {files.length > 0 ? (
                    <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
                      {files.map((f) => (
                        <li
                          key={`${f.name}-${f.size}`}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm"
                        >
                          <Icon name="file" size={16} className="text-slate-400" />
                          <span className="min-w-0 flex-1 truncate text-slate-800">{f.name}</span>
                          <span className="shrink-0 text-xs tabular-nums text-slate-400">
                            {formatBytes(f.size)}
                          </span>
                          <button
                            type="button"
                            aria-label={`${f.name} 빼기`}
                            onClick={() =>
                              setFiles((prev) => prev.filter((x) => x !== f))
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Icon name="x" size={15} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </StepSection>

                <StepSection
                  index={3}
                  title="요청 사항"
                  hint="기본은 성적·등급, 대학 추천, 세특·행특·창체까지 모두 봐요. 일부만 원하면 고쳐 주세요."
                >
                  <textarea
                    className="ui-input min-h-[120px] text-sm leading-relaxed"
                    value={analysisInstructions}
                    onChange={(e) => setAnalysisInstructions(e.target.value)}
                    placeholder="예: 성적 분석 없이 세특·행특·창체만 요약해 주세요."
                    aria-label="요청 사항"
                  />
                  {instructionsChanged ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 -ml-2"
                      onClick={() => setAnalysisInstructions(DEFAULT_ANALYSIS_INSTRUCTIONS)}
                    >
                      <Icon name="rotate" size={14} />
                      기본 요청으로 되돌리기
                    </Button>
                  ) : null}
                </StepSection>

                <StepSection index={4} title="만들기">
                  {error ? <Alert variant="error" className="mb-3">{error}</Alert> : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button disabled={files.length === 0} onClick={runAnalysis}>
                      <Icon name="sparkle" size={16} />
                      분석 보고서 만들기
                    </Button>
                    <span className="text-xs text-slate-500">
                      보통 1~3분 걸려요. 다 만들면 왼쪽 기록에 저장돼요.
                    </span>
                  </div>
                </StepSection>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
