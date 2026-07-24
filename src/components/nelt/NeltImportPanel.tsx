"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { NeltUrlReviewCard } from "@/components/nelt/NeltUrlReviewCard";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

interface NeltImportPanelProps {
  role: "admin" | "teacher";
}

type UrlOkResult = {
  ok: true;
  url: string;
  adapter: string;
  draft: NeltExtractedDraft;
  duplicates: Array<{ id: string; testDate: string | null }>;
};

type UrlFailResult = {
  ok: false;
  url: string;
  message: string;
  adapter: string | null;
};

/** PDF·링크·직접입력. 링크(netutor) 분석은 동작 가능 */
export function NeltImportPanel({ role }: NeltImportPanelProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name")?.trim() ?? "";
  const [studentName, setStudentName] = useState(initialName);
  const [urls, setUrls] = useState("");
  const [mode, setMode] = useState<"pdf" | "url" | "manual">("url");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlResults, setUrlResults] = useState<Array<UrlOkResult | UrlFailResult>>(
    []
  );

  async function analyzeUrls() {
    setAnalyzing(true);
    setError(null);
    setUrlResults([]);
    try {
      const res = await fetch("/api/nelt/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          studentName: studentName.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "링크 분석에 실패했습니다.");
      }
      setUrlResults(json.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "링크 분석 오류");
    } finally {
      setAnalyzing(false);
    }
  }

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
          학생 이름 (선택)
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="비우면 링크/PDF에서 추출한 이름을 사용"
            className="ui-input mt-1"
          />
        </label>
        <p className="text-xs text-slate-500">
          동명이인은 자동 연결하지 않습니다. 저장 전 검토 화면에서 확인하세요.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["url", "결과 링크"],
            ["pdf", "PDF 업로드"],
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

      {mode === "url" && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">
            NELT 결과 공유 링크
          </h2>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={5}
            placeholder={
              "한 줄에 링크 하나씩\nhttps://www.netutor.co.kr/s_url/?..."
            }
            className="ui-input font-mono text-xs"
          />
          <Alert variant="info">
            netutor.co.kr 공유 링크는 전용 Adapter로 분석합니다. 로그인·권한
            우회는 하지 않으며, 실패 시 PDF 저장 후 업로드해 주세요.
          </Alert>
          <Button
            type="button"
            variant="primary"
            disabled={analyzing || !urls.trim()}
            onClick={() => void analyzeUrls()}
          >
            {analyzing ? "링크 분석 중…" : "결과 링크 가져오기"}
          </Button>
        </Card>
      )}

      {mode === "pdf" && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">
            PDF 파일 업로드
          </h2>
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            여러 PDF 드래그 앤 드롭·선택 UI는 다음 단계에서 연결됩니다.
            <br />
            <span className="text-xs text-slate-400">
              지금은 NE Tutor 공유 링크 등록을 먼저 사용하세요.
            </span>
          </div>
        </Card>
      )}

      {mode === "manual" && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">직접 입력</h2>
          <p className="text-sm text-slate-600">
            수동 입력 폼은 이어지는 단계에서 제공합니다.
          </p>
        </Card>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {urlResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">분석 결과</h2>
          {urlResults.map((r) =>
            r.ok ? (
              <NeltUrlReviewCard
                key={r.url}
                role={role}
                url={r.url}
                adapter={r.adapter}
                draft={r.draft}
                duplicates={r.duplicates}
                preferredName={studentName}
              />
            ) : (
              <Card key={r.url} className="space-y-2 border-amber-200 p-5">
                <p className="break-all font-mono text-xs text-slate-500">
                  {r.url}
                </p>
                <Alert variant="error">
                  {r.message ||
                    "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다. 결과 화면을 PDF로 저장하여 업로드하거나 직접 입력해 주세요."}
                </Alert>
              </Card>
            )
          )}
        </div>
      )}

      <Link href={base} className="text-sm text-brand-600 hover:underline">
        ← NELT 목록
      </Link>
    </div>
  );
}
