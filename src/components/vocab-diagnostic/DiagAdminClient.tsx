"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  createDraftAction,
  createInviteAction,
  reissueInviteAction,
  resultLinkAction,
  revokeInviteAction,
  setActiveAction,
} from "@/app/admin/marketing/vocab-diagnostic/actions";
import type { InviteListRow, ResultListRow } from "@/lib/vocab-diagnostic/admin-queries";
import { DIAG_INVITE_DAYS, DIAG_TARGETS, JEONGSU_CONTACT, type DiagTarget } from "@/lib/vocab-diagnostic/types";

type TestItem = {
  id: string;
  target: DiagTarget;
  title: string;
  version: number;
  status: "draft" | "confirmed";
  isActive: boolean;
  questionCount: number;
  minutes: number;
  confirmedAt: string | null;
  updatedAt: string;
};

type People = {
  candidates: { id: string; name: string; grade: string; school: string; studentId: string | null }[];
  students: { id: string; name: string }[];
};

const BASE = "/admin/marketing/vocab-diagnostic";
const TARGETS: DiagTarget[] = ["pre_high1", "pre_middle1"];

function when(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

function day(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" }).format(new Date(iso));
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt("복사해 주세요", text);
    return false;
  }
}

const abs = (path: string) => (typeof window === "undefined" ? path : `${window.location.origin}${path}`);

export function DiagAdminClient({ tests, invites, results, people }: { tests: TestItem[]; invites: InviteListRow[]; results: ResultListRow[]; people: People }) {
  const [tab, setTab] = useState<"tests" | "invites" | "results">("tests");
  const [filter, setFilter] = useState<DiagTarget | "all">("all");
  const [toast, setToast] = useState("");
  const say = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm" role="tablist">
          {([
            ["tests", "시험 구성"],
            ["invites", `응시 링크 ${invites.length}`],
            ["results", `결과 ${results.length}`],
          ] as const).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 font-semibold ${tab === k ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {label}
            </button>
          ))}
        </div>
        {tab !== "tests" && (
          <select value={filter} onChange={(e) => setFilter(e.target.value as DiagTarget | "all")} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm" aria-label="진단 대상">
            <option value="all">전체 대상</option>
            {TARGETS.map((t) => (
              <option key={t} value={t}>{DIAG_TARGETS[t].label}</option>
            ))}
          </select>
        )}
      </div>

      {tab === "tests" && <TestsTab tests={tests} say={say} />}
      {tab === "invites" && <InvitesTab tests={tests} invites={invites.filter((i) => filter === "all" || i.target === filter)} people={people} say={say} />}
      {tab === "results" && <ResultsTab results={results.filter((r) => filter === "all" || r.target === filter)} say={say} />}

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function TestsTab({ tests, say }: { tests: TestItem[]; say: (t: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {TARGETS.map((target) => {
        const cfg = DIAG_TARGETS[target];
        const list = tests.filter((t) => t.target === target);
        return (
          <section key={target} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">{cfg.label} <span className="text-sm font-normal text-slate-500">({cfg.who})</span></h2>
                <p className="mt-0.5 text-xs text-slate-500">{cfg.folderName} · 기본 {cfg.defaultCount}문항 · 권장 {cfg.defaultMinutes}분</p>
              </div>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await createDraftAction(target);
                    if (!r.ok) return say(r.error);
                    router.push(`${BASE}/tests/${r.id}`);
                  })
                }
              >
                새 시험 만들기
              </Button>
            </div>
            {list.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">아직 만든 시험이 없습니다. 「새 시험 만들기」를 누르면 여러 Day에서 단어를 고르게 추천합니다.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {list.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {t.status === "confirmed" ? "출제 확정" : "초안"}
                    </span>
                    {t.status === "confirmed" && !t.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">멈춤</span>}
                    <Link href={`${BASE}/tests/${t.id}`} className="min-w-0 flex-1 truncate font-semibold text-slate-900 hover:underline">
                      {t.title} <span className="font-normal text-slate-500">· {t.version}판 · {t.questionCount}문항</span>
                    </Link>
                    {t.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await setActiveAction(t.id, !t.isActive);
                            if (!r.ok) return say(r.error);
                            router.refresh();
                          })
                        }
                      >
                        {t.isActive ? "멈추기" : "다시 켜기"}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function inviteText(name: string, test: { title: string; questionCount: number; minutes: number }, url: string, expiresAt: string) {
  return `[정수학원] ${name} 학생 ${test.title} 안내\n아래 링크에서 ${test.questionCount}문항 어휘 진단을 볼 수 있습니다(권장 ${test.minutes}분, ${day(expiresAt)}까지).\n${url}`;
}

function InvitesTab({ tests, invites, people, say }: { tests: TestItem[]; invites: InviteListRow[]; people: People; say: (t: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const ready = tests.filter((t) => t.status === "confirmed" && t.isActive);
  const [testId, setTestId] = useState(ready[0]?.id ?? "");
  const [mode, setMode] = useState<"new" | "candidate" | "student">("new");
  const [candidateId, setCandidateId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [days, setDays] = useState(DIAG_INVITE_DAYS);
  const [made, setMade] = useState<{ url: string; text: string } | null>(null);
  const testOf = useMemo(() => new Map(tests.map((t) => [t.id, t])), [tests]);

  const issue = () =>
    start(async () => {
      const r = await createInviteAction({
        testId,
        days,
        ...(mode === "candidate" ? { candidateId } : mode === "student" ? { studentId, grade, school } : { name, grade, school }),
      });
      if (!r.ok) return say(r.error);
      const t = testOf.get(testId)!;
      const shown = mode === "candidate" ? people.candidates.find((c) => c.id === candidateId)?.name ?? "" : mode === "student" ? people.students.find((s) => s.id === studentId)?.name ?? "" : name.trim();
      const url = abs(r.link);
      setMade({ url, text: inviteText(shown, t, url, new Date(Date.now() + days * 86_400_000).toISOString()) });
      setName("");
      setGrade("");
      setSchool("");
      router.refresh();
    });

  const input = "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm";
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-bold text-slate-900">응시 링크 발급</h2>
        {ready.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">출제 확정한 시험이 없습니다. 「시험 구성」에서 시험을 검토하고 확정해 주세요.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-slate-600">시험</span>
              <select className={input} value={testId} onChange={(e) => setTestId(e.target.value)}>
                {ready.map((t) => (
                  <option key={t.id} value={t.id}>{DIAG_TARGETS[t.target].label} · {t.title} · {t.version}판</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-slate-600">링크 기간(일)</span>
              <input className={input} type="number" min={1} max={60} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </label>
            <fieldset className="md:col-span-2">
              <legend className="mb-1 text-xs font-semibold text-slate-600">응시자</legend>
              <div className="flex flex-wrap gap-3 text-sm">
                {([
                  ["new", "새 외부 응시자"],
                  ["candidate", `이미 등록한 응시자 (${people.candidates.length})`],
                  ["student", `재원생 (${people.students.length})`],
                ] as const).map(([k, label]) => (
                  <label key={k} className="inline-flex items-center gap-1.5">
                    <input type="radio" name="who" checked={mode === k} onChange={() => setMode(k)} /> {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {mode === "candidate" && (
              <label className="text-sm md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-600">응시자 고르기</span>
                <select className={input} value={candidateId} onChange={(e) => setCandidateId(e.target.value)}>
                  <option value="">고르세요</option>
                  {people.candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.grade ? ` · ${c.grade}` : ""}{c.school ? ` · ${c.school}` : ""}</option>
                  ))}
                </select>
              </label>
            )}
            {mode === "student" && (
              <label className="text-sm md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-600">학생 고르기</span>
                <select className={input} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">고르세요</option>
                  {people.students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
            )}
            {mode === "new" && (
              <label className="text-sm">
                <span className="mb-1 block text-xs font-semibold text-slate-600">이름(또는 알아볼 이름)</span>
                <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
              </label>
            )}
            {mode !== "candidate" && (
              <>
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">학년</span>
                  <input className={input} value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="예: 중3" maxLength={20} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">학교(선택)</span>
                  <input className={input} value={school} onChange={(e) => setSchool(e.target.value)} maxLength={40} />
                </label>
              </>
            )}
            <div className="md:col-span-2">
              <Button disabled={pending || !testId || (mode === "new" && !name.trim()) || (mode === "candidate" && !candidateId) || (mode === "student" && !studentId)} onClick={issue}>
                링크 발급
              </Button>
            </div>
          </div>
        )}
        {made && (
          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm">
            <p className="break-all font-mono text-xs text-slate-700">{made.url}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={async () => say((await copy(made.url)) ? "링크를 복사했습니다." : "복사 창을 열었습니다.")}>링크 복사</Button>
              <Button size="sm" variant="secondary" onClick={async () => say((await copy(made.text)) ? "안내문을 복사했습니다." : "복사 창을 열었습니다.")}>안내문 복사</Button>
            </div>
          </div>
        )}
      </section>

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2">응시자</th>
              <th className="px-3 py-2">학년·학교</th>
              <th className="px-3 py-2">시험</th>
              <th className="px-3 py-2">발급 / 만료</th>
              <th className="px-3 py-2">링크</th>
              <th className="px-3 py-2">응시 상태</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invites.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-500">발급한 링크가 없습니다.</td></tr>
            )}
            {invites.map((i) => {
              const t = testOf.get(i.testId);
              return (
                <tr key={i.id}>
                  <td className="px-3 py-2 font-semibold text-slate-900">{i.candidateName}</td>
                  <td className="px-3 py-2 text-slate-600">{[i.grade, i.school].filter(Boolean).join(" · ") || "-"}</td>
                  <td className="px-3 py-2 text-slate-600">{DIAG_TARGETS[i.target].label} · {i.version}판</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{when(i.createdAt)}<br />{when(i.expiresAt)}</td>
                  <td className="px-3 py-2 text-xs">
                    {i.linkState === "active" ? <span className="text-emerald-700">사용 중</span> : i.linkState === "expired" ? <span className="text-slate-500">만료</span> : <span className="text-red-700">회수</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {i.status === "submitted" ? <span className="font-semibold text-slate-900">제출 완료</span> : i.status === "in_progress" ? <span className="text-amber-700">응시 중</span> : <span className="text-slate-500">미응시</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {i.linkState === "active" && i.status !== "submitted" && (
                        <>
                          <Button size="sm" variant="secondary" onClick={async () => say((await copy(abs(i.link))) ? "링크를 복사했습니다." : "복사 창을 열었습니다.")}>복사</Button>
                          {t && <Button size="sm" variant="secondary" onClick={async () => say((await copy(inviteText(i.candidateName, t, abs(i.link), i.expiresAt))) ? "안내문을 복사했습니다." : "복사 창을 열었습니다.")}>안내문</Button>}
                          <Button size="sm" variant="danger" disabled={pending} onClick={() => start(async () => { if (!window.confirm("이 링크를 회수할까요? 받은 사람이 더는 열 수 없습니다.")) return; const r = await revokeInviteAction(i.id); if (!r.ok) return say(r.error); router.refresh(); })}>회수</Button>
                        </>
                      )}
                      {i.status !== "submitted" && i.linkState !== "active" && (
                        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const r = await reissueInviteAction(i.id); if (!r.ok) return say(r.error); say((await copy(abs(r.link))) ? "새 링크를 복사했습니다." : "새 링크를 만들었습니다."); router.refresh(); })}>재발급</Button>
                      )}
                      {i.status === "submitted" && i.attemptId && (
                        <Link href={`${BASE}/results/${i.attemptId}`} className="text-xs font-semibold text-brand-700 hover:underline">결과 보기</Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function resultText(r: ResultListRow, url: string) {
  return `[정수학원] ${r.candidateName} 학생 어휘 진단 결과\n${url}\n결과를 보시고 궁금한 점은 상담 전화로 문의해 주세요: ${JEONGSU_CONTACT}`;
}

function ResultsTab({ results, say }: { results: ResultListRow[]; say: (t: string) => void }) {
  return (
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500">
          <tr>
            <th className="px-3 py-2">응시자</th>
            <th className="px-3 py-2">학년·학교</th>
            <th className="px-3 py-2">대상·판</th>
            <th className="px-3 py-2">시작 / 제출</th>
            <th className="px-3 py-2 text-right">정답</th>
            <th className="px-3 py-2 text-right">정답률</th>
            <th className="px-3 py-2 text-right">걸린 시간</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.length === 0 && (
            <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">아직 제출한 응시가 없습니다.</td></tr>
          )}
          {results.map((r) => (
            <tr key={r.attemptId}>
              <td className="px-3 py-2 font-semibold text-slate-900">{r.candidateName}</td>
              <td className="px-3 py-2 text-slate-600">{[r.grade, r.school].filter(Boolean).join(" · ") || "-"}</td>
              <td className="px-3 py-2 text-slate-600">{DIAG_TARGETS[r.target].label} · {r.version}판</td>
              <td className="px-3 py-2 text-xs text-slate-500">{when(r.startedAt)}<br />{when(r.submittedAt)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{r.correct} / {r.total}</td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.rateText}%</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">{r.minutes}분</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Link href={`${BASE}/results/${r.attemptId}`} className="inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50">상세</Link>
                  {r.resultLink && (
                    <>
                      <Button size="sm" variant="secondary" onClick={async () => say((await copy(abs(r.resultLink!))) ? "결과 링크를 복사했습니다." : "복사 창을 열었습니다.")}>결과 링크</Button>
                      <Button size="sm" variant="secondary" onClick={async () => say((await copy(resultText(r, abs(r.resultLink!)))) ? "안내문을 복사했습니다." : "복사 창을 열었습니다.")}>안내문</Button>
                    </>
                  )}
                  {!r.resultLink && (
                    <Button size="sm" variant="secondary" onClick={async () => { const x = await resultLinkAction(r.attemptId, "reissue"); if (!x.ok) return say(x.error); say((await copy(abs(x.link!))) ? "새 결과 링크를 복사했습니다." : "새 결과 링크를 만들었습니다."); }}>결과 링크 재발급</Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
