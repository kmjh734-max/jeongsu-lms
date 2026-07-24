"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

interface NeltImportPanelProps {
  role: "admin" | "teacher";
}

/** 1단계 스텁 — PDF/링크/직접입력 UI 골격 (분석은 다음 단계) */
export function NeltImportPanel({ role }: NeltImportPanelProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name")?.trim() ?? "";
  const [studentName, setStudentName] = useState(initialName);
  const [urls, setUrls] = useState("");
  const [mode, setMode] = useState<"pdf" | "url" | "manual">("pdf");

  return (
    <div className="space-y-6">
      <PageHeader
        title="NELT 결과 등록"
        description="PDF·공유 링크·직접 입력으로 회차를 등록합니다. LMS 학생 계정은 필요 없습니다."
        action={
          <ButtonLink href={base} variant="secondary" size="sm">
            목록으로
          </ButtonLink>
        }
      />

      <Card className="space-y-4 p-5 sm:p-6">
        <label className="block text-sm font-medium text-slate-700">
          학생 이름
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="PDF에서 추출하거나 직접 입력"
            className="ui-input mt-1"
          />
        </label>
        <p className="text-xs text-slate-500">
          비워 두면 분석 후 검토 화면에서 이름을 확정합니다. 동명이인은 자동
          연결하지 않습니다.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pdf", "PDF 업로드"],
            ["url", "결과 링크"],
            ["manual", "직접 입력"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === key
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "pdf" && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">
            PDF 파일 업로드
          </h2>
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            여러 PDF를 드래그 앤 드롭하거나 선택하세요.
            <br />
            <span className="text-xs text-slate-400">
              (다음 단계에서 업로드·텍스트 분석·검토가 연결됩니다)
            </span>
          </div>
          <input type="file" accept="application/pdf" multiple disabled className="text-sm" />
        </Card>
      )}

      {mode === "url" && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">
            NELT 결과 공유 링크
          </h2>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={5}
            placeholder={"한 줄에 링크 하나씩\nhttps://www.netutor.co.kr/s_url/?..."}
            className="ui-input font-mono text-xs"
          />
          <Alert variant="info">
            netutor 링크는 전용 Adapter로 처리합니다. 로그인·권한 우회는 하지
            않습니다.
          </Alert>
        </Card>
      )}

      {mode === "manual" && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">직접 입력</h2>
          <p className="text-sm text-slate-600">
            시험일·영역 점수·수준 등을 수동으로 입력하는 폼은 다음 단계에서
            제공됩니다.
          </p>
        </Card>
      )}

      <Alert variant="info">
        1단계: DB·메뉴·등록 골격만 준비되었습니다. PDF/링크 자동 분석은 이어서
        구현합니다.
        {studentName.trim() ? (
          <>
            {" "}
            준비된 학생명: <strong>{studentName.trim()}</strong>
          </>
        ) : null}
      </Alert>

      <Link href={base} className="text-sm text-brand-600 hover:underline">
        ← NELT 목록
      </Link>
    </div>
  );
}
