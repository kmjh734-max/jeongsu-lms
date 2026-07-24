"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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

/** PDF·링크·직접입력. 여러 링크 = 1·2·3차 → 성장 리포트 */
export function NeltImportPanel({ role }: NeltImportPanelProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name")?.trim() ?? "";
  const [studentName, setStudentName] = useState(initialName);
  const [urls, setUrls] = useState("");
  const [mode, setMode] = useState<"pdf" | "url" | "manual">("url");
  const [analyzing, setAnalyzing] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);
  const [urlResults, setUrlResults] = useState<Array<UrlOkResult | UrlFailResult>>(
    []
  );

  const okResults = useMemo(
    () =>
      urlResults
        .filter((r): r is UrlOkResult => r.ok)
        .slice()
        .sort((a, b) =>
          (a.draft.testDate ?? "").localeCompare(b.draft.testDate ?? "")
        ),
    [urlResults]
  );

  async function analyzeUrls() {
    setAnalyzing(true);
    setError(null);
    setBatchMsg(null);
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

  async function saveAllAsGrowthReport() {
    if (okResults.length === 0) return;
    const name =
      studentName.trim() ||
      okResults.map((r) => r.draft.studentName?.trim()).find(Boolean) ||
      "";
    if (!name) {
      setError("학생 이름을 입력해 주세요.");
      return;
    }

    setBatchSaving(true);
    setError(null);
    setBatchMsg(null);
    try {
      const res = await fetch("/api/nelt/reports/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          items: okResults.map((r) => ({
            draft: { ...r.draft, studentName: name },
            sourceUrl: r.url,
            overwriteId: r.duplicates[0]?.id ?? null,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "일괄 저장에 실패했습니다.");
      }
      setBatchMsg(
        json.growthId
          ? `${json.attemptCount}회차 저장 후 성장 리포트를 만들었습니다.`
          : `${okResults.length}회차를 저장했습니다. (성장 리포트는 2회차 이상일 때 생성)`
      );
      router.push(`${base}/student/${encodeURIComponent(name)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "일괄 저장 오류");
    } finally {
      setBatchSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="NELT 결과 등록"
        description="링크를 여러 줄로 넣으면 시험일 순으로 1차·2차·3차로 저장되고, 성장 리포트가 만들어집니다."
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
            placeholder="비우면 링크에서 추출한 이름 사용"
            className="ui-input mt-1"
          />
        </label>
        <p className="text-xs text-slate-500">
          예: 링크 3개 = 1차·2차·3차. 시험일 기준으로 회차가 매겨집니다.
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
            NELT 결과 공유 링크 (여러 줄 = 여러 회차)
          </h2>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={6}
            placeholder={
              "한 줄에 링크 하나씩 (위→아래 또는 시험일 순으로 1·2·3차)\nhttps://www.netutor.co.kr/s_url/?...\nhttps://www.netutor.co.kr/s_url/?...\nhttps://www.netutor.co.kr/s_url/?..."
            }
            className="ui-input font-mono text-xs"
          />
          <Alert variant="info">
            netutor 공유 링크를 여러 개 넣으면 분석 후 「성장 리포트로 저장」
            한 번에 1·2·3차로 등록됩니다.
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
            PDF 업로드는 이어지는 단계에서 연결됩니다. 지금은 공유 링크를
            사용해 주세요.
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
      {batchMsg && <Alert variant="success">{batchMsg}</Alert>}

      {urlResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              분석 결과 ({okResults.length}회차 성공
              {urlResults.length - okResults.length > 0
                ? ` · ${urlResults.length - okResults.length}건 실패`
                : ""}
              )
            </h2>
            {okResults.length > 0 && (
              <Button
                type="button"
                variant="primary"
                disabled={batchSaving}
                onClick={() => void saveAllAsGrowthReport()}
              >
                {batchSaving
                  ? "저장 중…"
                  : okResults.length >= 2
                    ? `${okResults.length}회차 저장 + 성장 리포트 만들기`
                    : "1회차 저장"}
              </Button>
            )}
          </div>

          {okResults.map((r, idx) => (
            <div key={r.url} className="space-y-2">
              <p className="text-sm font-semibold text-emerald-800">
                {idx + 1}차 · {r.draft.testDate ?? "시험일 확인 필요"} ·{" "}
                {r.draft.studentName ?? "이름 확인"}
              </p>
              <NeltUrlReviewCard
                role={role}
                url={r.url}
                adapter={r.adapter}
                draft={r.draft}
                duplicates={r.duplicates}
                preferredName={studentName}
              />
            </div>
          ))}

          {urlResults
            .filter((r): r is UrlFailResult => !r.ok)
            .map((r) => (
              <Card key={r.url} className="space-y-2 border-amber-200 p-5">
                <p className="break-all font-mono text-xs text-slate-500">
                  {r.url}
                </p>
                <Alert variant="error">
                  {r.message ||
                    "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다."}
                </Alert>
              </Card>
            ))}
        </div>
      )}

      <Link href={base} className="text-sm text-brand-600 hover:underline">
        ← NELT 목록
      </Link>
    </div>
  );
}
