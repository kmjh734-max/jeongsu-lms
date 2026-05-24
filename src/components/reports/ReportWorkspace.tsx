"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentReportView } from "@/components/reports/StudentReportView";
import { DEFAULT_REPORT_RANGE } from "@/lib/reports/date-range";
import type {
  ReportClassOption,
  ReportRange,
  ReportStudentOption,
  StudentReport,
} from "@/lib/reports/types";

const RANGE_OPTIONS: { value: ReportRange; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "month", label: "이번 달" },
];

interface ReportWorkspaceProps {
  role: "admin" | "teacher";
}

export function ReportWorkspace({ role }: ReportWorkspaceProps) {
  const [classes, setClasses] = useState<ReportClassOption[]>([]);
  const [students, setStudents] = useState<ReportStudentOption[]>([]);
  const [classId, setClassId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [loginQuery, setLoginQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [range, setRange] = useState<ReportRange>(DEFAULT_REPORT_RANGE);
  const [report, setReport] = useState<StudentReport | null>(null);
  const [aiReportDraft, setAiReportDraft] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (classId) params.set("classId", classId);
      if (nameQuery.trim()) params.set("name", nameQuery.trim());
      if (loginQuery.trim()) params.set("loginId", loginQuery.trim());

      const res = await fetch(`/api/reports/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "학생 목록을 불러오지 못했습니다.");
      }
      setClasses(data.classes ?? []);
      setStudents(data.students ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setListLoading(false);
    }
  }, [classId, nameQuery, loginQuery]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  async function generateReport() {
    if (!selectedStudentId) {
      setError("학생을 선택해 주세요.");
      return;
    }

    setReportLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        studentId: selectedStudentId,
        range,
      });
      const res = await fetch(`/api/reports/student?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "리포트를 생성하지 못했습니다.");
      }
      setReport(data.report as StudentReport);
      setAiReportDraft("");
    } catch (e) {
      setReport(null);
      setAiReportDraft("");
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setReportLoading(false);
    }
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="학습 리포트"
          description={
            role === "admin"
              ? "학생별 영상·단어학습 현황을 확인하고 AI 리포트 초안·학부모 안내 문구를 작성할 수 있습니다."
              : "담당 학생의 학습 현황을 확인하고 AI 리포트 초안·학부모 안내 문구를 작성할 수 있습니다."
          }
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <h2 className="text-sm font-semibold text-slate-900">학생 선택</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">반</span>
            <select
              className="ui-input w-full"
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSelectedStudentId("");
              }}
            >
              <option value="">전체</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">이름 검색</span>
            <input
              className="ui-input w-full"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="이름"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">아이디 검색</span>
            <input
              className="ui-input w-full"
              value={loginQuery}
              onChange={(e) => setLoginQuery(e.target.value)}
              placeholder="로그인 아이디"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">리포트 기간</span>
            <select
              className="ui-input w-full"
              value={range}
              onChange={(e) => setRange(e.target.value as ReportRange)}
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={listLoading}
            onClick={() => void loadStudents()}
          >
            {listLoading ? "검색 중..." : "학생 목록 새로고침"}
          </Button>
        </div>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-slate-600">학생</span>
          <select
            className="ui-input w-full"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={listLoading || students.length === 0}
          >
            <option value="">
              {students.length === 0
                ? "검색 결과가 없습니다"
                : "학생을 선택하세요"}
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.loginId ? ` (${s.loginId})` : ""}
                {s.classNames.length > 0 ? ` · ${s.classNames.join(", ")}` : ""}
              </option>
            ))}
          </select>
        </label>

        {selectedStudent && (
          <p className="mt-2 text-xs text-slate-500">
            선택: {selectedStudent.name}
            {selectedStudent.loginId ? ` · ${selectedStudent.loginId}` : ""}
          </p>
        )}

        <div className="mt-4">
          <Button
            type="button"
            disabled={reportLoading || !selectedStudentId}
            onClick={() => void generateReport()}
          >
            {reportLoading ? "리포트 생성 중..." : "리포트 생성"}
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        )}
      </section>

      {!report && !reportLoading && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600 print:hidden">
          학생과 기간을 선택한 뒤 「리포트 생성」을 눌러 주세요.
        </p>
      )}

      {report && (
        <StudentReportView
          report={report}
          aiReportDraft={aiReportDraft}
          onAiReportDraftChange={setAiReportDraft}
        />
      )}
    </div>
  );
}
