"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

const DOMAIN_LABEL: Record<string, string> = {
  vocabulary: "어휘",
  grammar: "문법",
  listening: "듣기",
  reading: "독해",
};

interface NeltUrlReviewCardProps {
  role: "admin" | "teacher";
  url: string;
  adapter: string;
  draft: NeltExtractedDraft;
  duplicates: Array<{ id: string; testDate: string | null }>;
  preferredName: string;
}

export function NeltUrlReviewCard({
  role,
  url,
  adapter,
  draft: initialDraft,
  duplicates,
  preferredName,
}: NeltUrlReviewCardProps) {
  const router = useRouter();
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const [draft, setDraft] = useState(initialDraft);
  const [studentName, setStudentName] = useState(
    preferredName || initialDraft.studentName || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [overwriteId, setOverwriteId] = useState<string | null>(null);

  const summary = useMemo(() => {
    return draft.domains
      .map(
        (d) =>
          `${DOMAIN_LABEL[d.domain] ?? d.domain} ${d.difficultyCode ?? "—"} ${
            d.rawScore ?? "—"
          }점 / ${d.evaluatedLevel ?? "확인 필요"}`
      )
      .join(" · ");
  }, [draft.domains]);

  async function save(forceOverwrite?: string | null) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/nelt/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          studentName,
          sourceUrl: url,
          overwriteId: forceOverwrite ?? overwriteId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "저장에 실패했습니다.");
      }
      setSavedId(json.reportId as string);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 오류");
    } finally {
      setSaving(false);
    }
  }

  if (savedId) {
    return (
      <Card className="space-y-3 border-emerald-200 bg-emerald-50/50 p-5">
        <p className="text-sm font-semibold text-emerald-900">저장 완료</p>
        <p className="text-sm text-emerald-800">
          {studentName} 회차가 등록되었습니다.
        </p>
        <ButtonLink
          href={`${base}/student/${encodeURIComponent(studentName)}`}
          variant="primary"
          size="sm"
        >
          NELT 성적 보기
        </ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">분석 결과 검토</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-500">{url}</p>
          <p className="mt-1 text-xs text-slate-400">adapter: {adapter}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
          검토 필요
        </span>
      </div>

      {draft.needsReviewFields.length > 0 && (
        <Alert variant="info">
          확인이 필요한 항목: {draft.needsReviewFields.join(", ")} (빈칸은 임의로
          채우지 않았습니다)
        </Alert>
      )}

      {duplicates.length > 0 && (
        <Alert variant="error">
          같은 학생·시험일(또는 동일 링크) 결과가 이미 있습니다.
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setOverwriteId(duplicates[0].id);
                void save(duplicates[0].id);
              }}
              disabled={saving}
            >
              기존 결과 덮어쓰기
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                setOverwriteId(null);
                void save(null);
              }}
              disabled={saving}
            >
              새 결과로 저장
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          학생 이름
          <input
            className="ui-input mt-1"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          시험일
          <input
            type="date"
            className="ui-input mt-1"
            value={draft.testDate ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, testDate: e.target.value || null }))
            }
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          학년
          <input
            className="ui-input mt-1"
            value={draft.studentGradeRaw ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                studentGradeRaw: e.target.value || null,
              }))
            }
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          종합 레벨
          <input
            className="ui-input mt-1"
            value={draft.overallLevel ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overallLevel: e.target.value || null }))
            }
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          종합 수준
          <input
            className="ui-input mt-1"
            value={draft.overallBand ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, overallBand: e.target.value || null }))
            }
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          동학년 상위 %
          <input
            className="ui-input mt-1"
            type="number"
            value={draft.overallPercentile ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                overallPercentile: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </label>
      </div>

      <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-medium text-slate-800">영역 요약</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{summary}</p>
        <p className="mt-2 text-xs text-slate-500">
          어휘 사이즈:{" "}
          {draft.vocabulary.vocabularySize != null
            ? `약 ${draft.vocabulary.vocabularySize}단어`
            : "확인 필요"}
          {" · "}
          필수 어휘:{" "}
          {draft.vocabulary.elementaryRequiredPercentage != null
            ? `${draft.vocabulary.elementaryRequiredPercentage}%`
            : "확인 필요"}
          {" · "}
          문법 O:{" "}
          {draft.grammar.items.filter((i) => i.isCorrect).length}/
          {draft.grammar.items.length || "—"}
        </p>
      </div>

      <div className="space-y-2">
        {draft.domains.map((domain, di) => (
          <details
            key={domain.domain}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <summary className="cursor-pointer text-sm font-medium text-slate-800">
              {DOMAIN_LABEL[domain.domain]} · {domain.difficultyCode ?? "난이도?"}{" "}
              · {domain.rawScore ?? "?"}점 · {domain.evaluatedLevel ?? "수준?"}
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <label className="text-xs font-medium text-slate-600">
                난이도 코드
                <input
                  className="ui-input mt-1"
                  value={domain.difficultyCode ?? ""}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    setDraft((d) => {
                      const domains = [...d.domains];
                      domains[di] = { ...domains[di], difficultyCode: v };
                      return { ...d, domains };
                    });
                  }}
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                점수
                <input
                  type="number"
                  className="ui-input mt-1"
                  value={domain.rawScore ?? ""}
                  onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    setDraft((d) => {
                      const domains = [...d.domains];
                      domains[di] = { ...domains[di], rawScore: v };
                      return { ...d, domains };
                    });
                  }}
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                학년 수준
                <input
                  className="ui-input mt-1"
                  value={domain.evaluatedLevel ?? ""}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    setDraft((d) => {
                      const domains = [...d.domains];
                      domains[di] = { ...domains[di], evaluatedLevel: v };
                      return { ...d, domains };
                    });
                  }}
                />
              </label>
            </div>
          </details>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={saving || !studentName.trim()}
          onClick={() => void save()}
        >
          {saving ? "저장 중…" : "검토 후 저장"}
        </Button>
      </div>
    </Card>
  );
}
