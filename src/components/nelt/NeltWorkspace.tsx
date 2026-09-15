"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NeltImportPanel } from "@/components/nelt/NeltImportPanel";
import {
  formatMonthDay,
  ReportMenu,
  ReportMenuItem,
  Segmented,
} from "@/components/reports/report-ui";
import type { NeltStudentGroup } from "@/types/nelt";

interface NeltWorkspaceProps {
  role: "admin" | "teacher";
  initialGroups: NeltStudentGroup[];
  /** /nelt/import 에서 넘어오면 결과 넣기 창을 연 채로 시작 */
  initialImportOpen?: boolean;
  initialImportName?: string;
}

type Filter = "all" | "ready" | "single";

/** 중학교 2학년 → 중2 */
function shortGrade(raw: string | null): string {
  if (!raw) return "—";
  const m = raw.match(/(초등|중|고등)(?:학교)?\s*(\d)(?:\s*[-~]\s*(\d))?\s*학년/);
  if (!m) return raw;
  const school = m[1] === "초등" ? "초" : m[1] === "고등" ? "고" : "중";
  return `${school}${m[2]}${m[3] ? `~${m[3]}` : ""}`;
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 shadow-card">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
        {value}
        {unit ? <span className="ml-1.5 text-xs font-medium text-slate-500">{unit}</span> : null}
      </p>
    </div>
  );
}

/** 회차별 NELT 결과 목록 + 오른쪽 「결과 넣기」 */
export function NeltWorkspace({
  role,
  initialGroups,
  initialImportOpen = false,
  initialImportName = "",
}: NeltWorkspaceProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [groups, setGroups] = useState(initialGroups);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<{ open: boolean; name: string; key: number }>({
    open: initialImportOpen,
    name: initialImportName,
    key: 0,
  });

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  const readyCount = groups.filter((g) => g.reportCount >= 2).length;
  const singleCount = groups.length - readyCount;
  const sentCount = groups.filter((g) => g.reportCount >= 2 && g.lastSharedAt).length;

  const latest = useMemo(() => {
    let date: string | null = null;
    for (const g of groups) {
      for (const a of g.attempts) {
        if (a.testDate && (!date || a.testDate > date)) date = a.testDate;
      }
    }
    const count = date
      ? groups.filter((g) => g.attempts.some((a) => a.testDate === date)).length
      : 0;
    return { date, count };
  }, [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (filter === "ready" && g.reportCount < 2) return false;
      if (filter === "single" && g.reportCount >= 2) return false;
      return !q || g.studentName.toLowerCase().includes(q);
    });
  }, [groups, query, filter]);

  function openPanel(name = "") {
    setPanel((p) => ({ open: true, name, key: p.key + 1 }));
  }

  function closePanel() {
    setPanel((p) => ({ ...p, open: false }));
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", base);
    }
  }

  async function deleteStudent(studentName: string) {
    const ok = window.confirm(
      `"${studentName}" 학생의 NELT 회차와 성장 리포트를 모두 삭제할까요?\n삭제하면 되돌릴 수 없어요.`
    );
    if (!ok) return;

    setDeletingName(studentName);
    setError(null);
    try {
      const res = await fetch("/api/nelt/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "삭제하지 못했어요.");
      }
      setGroups((prev) => prev.filter((g) => g.studentName !== studentName));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했어요.");
    } finally {
      setDeletingName(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="NELT 성장 리포트"
        description="회차별 NELT 결과 링크를 넣으면 성장 리포트를 만들어요. 2회차부터 비교할 수 있어요."
        action={
          <Button onClick={() => openPanel()}>
            <Icon name="plus" size={16} />
            결과 넣기
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="등록 학생" value={groups.length} unit="명" />
        <StatCard label="성장 리포트 가능" value={readyCount} unit="명 · 2회차 이상" />
        <StatCard
          label={latest.date ? `최근 회차 (${formatMonthDay(latest.date)})` : "최근 회차"}
          value={latest.count}
          unit="명 결과 입력"
        />
        <StatCard label="안내문 보낸 학생" value={sentCount} unit={`/ ${readyCount}명`} />
      </div>

      <div
        className={`mt-4 grid items-start gap-4 ${
          panel.open ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""
        }`}
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Segmented
              label="보기"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: <>전체 <span className="tabular-nums">{groups.length}</span></> },
                { value: "ready", label: <>리포트 가능 <span className="tabular-nums">{readyCount}</span></> },
                { value: "single", label: <>1회차만 <span className="tabular-nums">{singleCount}</span></> },
              ]}
            />
            <label className="relative block w-full sm:w-56">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                <Icon name="search" size={16} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="학생 이름"
                aria-label="학생 이름 찾기"
                className="ui-input h-9 py-1.5 pl-8"
              />
            </label>
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                {groups.length === 0
                  ? "아직 넣은 결과가 없어요. 「결과 넣기」로 NELT 결과 링크를 넣어 주세요."
                  : "찾는 학생이 없어요."}
              </p>
              {groups.length === 0 ? (
                <Button variant="secondary" className="mt-4" onClick={() => openPanel()}>
                  <Icon name="plus" size={16} />
                  결과 넣기
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>학생</th>
                    <th>학년</th>
                    <th>회차</th>
                    <th>레벨</th>
                    <th>동학년 순위</th>
                    <th className="text-right">
                      <span className="sr-only">할 일</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => {
                    const first = g.attempts[0];
                    const last = g.attempts[g.attempts.length - 1];
                    const dates = g.attempts
                      .map((a) => formatMonthDay(a.testDate))
                      .filter(Boolean);
                    const shownDates =
                      dates.length > 4
                        ? [...dates.slice(0, 2), "…", dates[dates.length - 1]]
                        : dates;
                    const multi = g.reportCount >= 2 && Boolean(first && last);
                    const pFrom = first?.overallPercentile ?? null;
                    const pTo = last?.overallPercentile ?? null;
                    const improved = multi && pFrom != null && pTo != null && pTo < pFrom;
                    const reportHref = `${base}/student/${encodeURIComponent(g.studentName)}`;
                    return (
                      <tr key={g.studentName}>
                        <td className="font-semibold text-slate-900">{g.studentName}</td>
                        <td className="whitespace-nowrap text-slate-500">{shortGrade(g.gradeRaw)}</td>
                        <td className="whitespace-nowrap">
                          <span className="mr-2 inline-flex rounded bg-brand-50 px-1.5 py-0.5 text-xs font-bold tabular-nums text-brand-700">
                            {g.reportCount}회
                          </span>
                          <span className="text-xs tabular-nums text-slate-500">
                            {shownDates.join(" · ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap font-semibold text-slate-800">
                          {multi && first?.overallLevel !== last?.overallLevel
                            ? `${first?.overallLevel ?? "—"} → ${last?.overallLevel ?? "—"}`
                            : (last?.overallLevel ?? g.latestOverallLevel ?? "—")}
                        </td>
                        <td
                          className={`whitespace-nowrap tabular-nums ${
                            improved ? "text-green-700" : "text-slate-500"
                          }`}
                        >
                          {multi && pFrom != null && pTo != null
                            ? `상위 ${pFrom}% → ${pTo}%`
                            : pTo != null
                              ? `상위 ${pTo}%`
                              : "—"}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {g.reportCount >= 2 ? (
                              <ButtonLink href={reportHref} size="sm">
                                성장 리포트
                              </ButtonLink>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openPanel(g.studentName)}
                                className="whitespace-nowrap px-2 text-xs font-semibold text-amber-700 hover:underline"
                              >
                                2차 결과 필요
                              </button>
                            )}
                            <ReportMenu
                              label={`${g.studentName} 메뉴`}
                              disabled={deletingName === g.studentName}
                            >
                              {g.reportCount < 2 ? (
                                <ReportMenuItem
                                  icon="file"
                                  onClick={() => router.push(reportHref)}
                                >
                                  1회차 결과 보기
                                </ReportMenuItem>
                              ) : null}
                              <ReportMenuItem icon="plus" onClick={() => openPanel(g.studentName)}>
                                회차 추가
                              </ReportMenuItem>
                              <ReportMenuItem
                                icon="trash"
                                danger
                                onClick={() => void deleteStudent(g.studentName)}
                              >
                                삭제
                              </ReportMenuItem>
                            </ReportMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {panel.open ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center lg:static lg:z-auto lg:block lg:bg-transparent lg:p-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) closePanel();
            }}
          >
            <aside
              aria-label="결과 넣기"
              className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-xl lg:sticky lg:top-4 lg:max-h-[calc(100vh-120px)] lg:min-h-[520px] lg:max-w-none lg:shadow-card"
            >
              <NeltImportPanel
                key={panel.key}
                role={role}
                initialStudentName={panel.name}
                onClose={closePanel}
              />
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
