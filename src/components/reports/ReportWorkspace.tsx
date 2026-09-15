"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { PcKakaoSendModal } from "@/components/reports/PcKakaoSendModal";
import { ReportPrintPreview } from "@/components/reports/ReportPrintPreview";
import { ReportShareActions } from "@/components/reports/ReportShareActions";
import { StudentReportView } from "@/components/reports/StudentReportView";
import {
  formatMonthDay,
  NameAvatar,
  Segmented,
} from "@/components/reports/report-ui";
import { buildParentReportMessage } from "@/lib/reports/build-parent-message";
import { extractLearningReportSection } from "@/lib/reports/parent-message-utils";
import type {
  ReportClassOption,
  ReportRange,
  ReportStudentOption,
  StudentReport,
} from "@/lib/reports/types";

const RANGE_OPTIONS: { value: ReportRange; label: string }[] = [
  { value: "month", label: "이번 달" },
  { value: "30d", label: "최근 30일" },
  { value: "7d", label: "최근 7일" },
  { value: "all", label: "전체" },
];

interface ReportWorkspaceProps {
  initialClasses?: ReportClassOption[];
  initialStudents?: ReportStudentOption[];
  /** 학생 id → 마지막으로 학부모 링크를 만든 시각 */
  initialLastShared?: Record<string, string>;
  academyName?: string;
  logoSrc?: string;
}

function isThisMonth(iso: string | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

export function ReportWorkspace({
  initialClasses = [],
  initialStudents = [],
  initialLastShared = {},
  academyName,
  logoSrc,
}: ReportWorkspaceProps) {
  const [classes, setClasses] = useState<ReportClassOption[]>(initialClasses);
  const [students, setStudents] = useState<ReportStudentOption[]>(initialStudents);
  const [lastShared, setLastShared] =
    useState<Record<string, string>>(initialLastShared);
  const [classId, setClassId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [range, setRange] = useState<ReportRange>("month");
  const [report, setReport] = useState<StudentReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [parentMessage, setParentMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pcKakaoOpen, setPcKakaoOpen] = useState(false);
  const [pcKakaoCopyOk, setPcKakaoCopyOk] = useState(false);
  const reportRequest = useRef(0);
  const firstClassLoad = useRef(true);

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

  const visibleStudents = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.loginId ?? "").toLowerCase().includes(q)
    );
  }, [students, nameQuery]);

  const notSentCount = useMemo(
    () => visibleStudents.filter((s) => !isThisMonth(lastShared[s.id])).length,
    [visibleStudents, lastShared]
  );

  // 학생이나 기간을 고르면 바로 리포트를 불러온다 (학습 기록만 모으므로 비용 없음)
  useEffect(() => {
    if (!selectedStudentId) return;
    const requestId = ++reportRequest.current;
    setReportLoading(true);
    setError(null);
    const params = new URLSearchParams({ studentId: selectedStudentId, range });
    fetch(`/api/reports/student?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message ?? "리포트를 불러오지 못했어요.");
        }
        if (requestId !== reportRequest.current) return;
        const next = data.report as StudentReport;
        setReport(next);
        setParentMessage(buildParentReportMessage({ report: next, academyName }));
      })
      .catch((e) => {
        if (requestId !== reportRequest.current) return;
        setReport(null);
        setError(e instanceof Error ? e.message : "리포트를 불러오지 못했어요.");
      })
      .finally(() => {
        if (requestId === reportRequest.current) setReportLoading(false);
      });
  }, [selectedStudentId, range, academyName]);

  async function handlePcKakaoPrepare() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(parentMessage);
      copied = true;
    } catch {
      copied = false;
    }
    setPcKakaoCopyOk(copied);
    setPreviewOpen(true);
    setPcKakaoOpen(true);
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const shownReport =
    report && report.student.id === selectedStudentId ? report : null;

  return (
    <div className="no-print">
      <PageHeader
        title="학습 리포트"
        description="학생별 학습을 모아 학부모께 보낼 리포트를 만듭니다."
        action={
          <Segmented
            label="리포트 기간"
            value={range}
            options={RANGE_OPTIONS}
            onChange={setRange}
          />
        }
      />

      <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_330px]">
        {/* 학생 목록 */}
        <section className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-card xl:h-[calc(100vh-190px)] xl:min-h-[560px]">
          <div className="space-y-2 p-3">
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
                aria-label="이름 찾기"
              />
            </label>
            <p className="flex items-center justify-between px-0.5 text-xs text-slate-500">
              <span className="tabular-nums">
                {listLoading ? "불러오는 중…" : `${visibleStudents.length}명`}
              </span>
              {!listLoading && visibleStudents.length > 0 && notSentCount > 0 ? (
                <span className="font-semibold tabular-nums text-amber-700">
                  이번 달 안 보냄 {notSentCount}
                </span>
              ) : null}
            </p>
            {/* 좁은 화면: 목록 대신 고르기 */}
            <select
              className="ui-select xl:hidden"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              aria-label="학생"
            >
              <option value="">
                {visibleStudents.length === 0 ? "학생이 없어요" : "학생을 고르세요"}
              </option>
              {visibleStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.classNames.length > 0 ? ` · ${s.classNames.join(", ")}` : ""}
                </option>
              ))}
            </select>
          </div>

          <ul className="hidden min-h-0 flex-1 overflow-y-auto px-2 pb-2 xl:block">
            {visibleStudents.length === 0 && !listLoading ? (
              <li className="px-2 py-8 text-center text-sm text-slate-400">
                학생이 없어요.
              </li>
            ) : null}
            {visibleStudents.map((s) => {
              const on = s.id === selectedStudentId;
              const sentAt = lastShared[s.id];
              const sentThisMonth = isThisMonth(sentAt);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    aria-current={on ? "true" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition ${
                      on ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <NameAvatar name={s.name} active={on} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          on ? "text-brand-700" : "text-slate-900"
                        }`}
                      >
                        {s.name}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {s.classNames.length > 0
                          ? s.classNames.join(", ")
                          : s.loginId ?? "반 없음"}
                      </span>
                    </span>
                    {sentAt ? (
                      <span
                        className={`shrink-0 text-xs tabular-nums ${
                          sentThisMonth ? "text-slate-400" : "font-semibold text-amber-700"
                        }`}
                      >
                        {formatMonthDay(sentAt)} 보냄
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-amber-700">
                        안 보냄
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 리포트 요약 */}
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-card xl:h-[calc(100vh-190px)] xl:min-h-[560px] xl:overflow-y-auto">
          {error ? (
            <div className="p-5 pb-0">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}
          {shownReport ? (
            <StudentReportView
              report={shownReport}
              loading={reportLoading}
              onPreview={() => setPreviewOpen(true)}
            />
          ) : reportLoading ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 text-sm text-slate-500">
              <Icon name="rotate" size={20} className="animate-spin text-slate-400" />
              {selectedStudent ? `${selectedStudent.name} 리포트를 모으고 있어요…` : "불러오는 중…"}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name="file" size={22} />
              </span>
              <p className="text-sm text-slate-500">
                학생을 고르면 리포트가 바로 만들어져요.
              </p>
            </div>
          )}
        </section>

        {/* 학부모께 보내기 */}
        <ReportShareActions
          key={shownReport ? `${shownReport.student.id}-${shownReport.generatedAt}` : "empty"}
          report={shownReport}
          parentMessage={parentMessage}
          onParentMessageChange={setParentMessage}
          onOpenPrint={() => setPreviewOpen(true)}
          onPcKakaoPrepare={handlePcKakaoPrepare}
          onShared={(studentId, at) =>
            setLastShared((prev) => ({ ...prev, [studentId]: at }))
          }
          academyName={academyName}
          logoSrc={logoSrc}
        />
      </div>

      {shownReport ? (
        <>
          <ReportPrintPreview
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            report={shownReport}
            parentMessage={parentMessage}
            learningReportText={extractLearningReportSection(parentMessage)}
            academyName={academyName}
            logoSrc={logoSrc}
          />
          <PcKakaoSendModal
            open={pcKakaoOpen}
            onClose={() => setPcKakaoOpen(false)}
            studentName={shownReport.student.name}
            rangeLabel={shownReport.rangeLabel}
            parentMessage={parentMessage}
            copySucceeded={pcKakaoCopyOk}
            onOpenPrint={() => setPreviewOpen(true)}
          />
        </>
      ) : null}
    </div>
  );
}
