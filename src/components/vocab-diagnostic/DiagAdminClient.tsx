"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  resultLinkAction,
  rotateLinkAction,
  sampleAction,
  setLinkActiveAction,
  setupAction,
  updateTestAction,
} from "@/app/admin/marketing/vocab-diagnostic/actions";
import type { ResultListRow } from "@/lib/vocab-diagnostic/admin-queries";
import { DIAG_TARGETS, JEONGSU_CONTACT, type DiagTarget } from "@/lib/vocab-diagnostic/types";

type TestItem = { target: DiagTarget; title: string; isActive: boolean; questionCount: number; minutes: number; intro: string };

const BASE = "/admin/marketing/vocab-diagnostic";
const TARGETS: DiagTarget[] = ["pre_high1", "pre_middle1"];

function when(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
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

export function DiagAdminClient({ link, tests, results }: { link: { path: string; isActive: boolean } | null; tests: TestItem[]; results: ResultListRow[] }) {
  const [tab, setTab] = useState<"setup" | "results">(results.length ? "results" : "setup");
  const [toast, setToast] = useState("");
  const say = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(""), 2500);
  };
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm" role="tablist">
        {([
          ["setup", "응시 링크·설정"],
          ["results", `응시 결과 ${results.length}`],
        ] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 font-semibold ${tab === k ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === "setup" ? <SetupTab link={link} tests={tests} say={say} /> : <ResultsTab results={results} say={say} />}
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function linkText(url: string) {
  return `[정수학원] 예비고1·예비중1 어휘 진단\n아래 링크를 열고 예비고1·예비중1을 고른 뒤 이름을 적으면 바로 볼 수 있습니다(휴대폰 가능, 10~15분).\n${url}`;
}

function SetupTab({ link, tests, say }: { link: { path: string; isActive: boolean } | null; tests: TestItem[]; say: (t: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [qr, setQr] = useState<string | null>(null);
  const url = link ? abs(link.path) : "";

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 480, margin: 2, errorCorrectionLevel: "M" }).then(setQr).catch(() => setQr(null));
  }, [url]);

  if (!link || tests.length < TARGETS.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-700">아직 진단 링크가 없습니다. 만들면 예비고1(고교기본 40문항)·예비중1(중학기본 30문항) 기본 설정으로 시작합니다.</p>
        <Button className="mt-3" disabled={pending} onClick={() => start(async () => { const r = await setupAction(); if (!r.ok) return say(r.error); router.refresh(); })}>
          진단 링크 만들기
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">공용 응시 링크</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${link.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{link.isActive ? "받는 중" : "멈춤"}</span>
            </div>
            <p className="text-sm text-slate-600">이 링크 하나를 문자·카톡·전단지로 알리면 됩니다. 학생이 예비고1·예비중1을 고르고 이름(학교는 선택)을 적으면 그 자리에서 단어가 뽑혀 시험이 시작됩니다.</p>
            <p className="break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">{url}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={async () => say((await copy(url)) ? "링크를 복사했습니다." : "복사 창을 열었습니다.")}>링크 복사</Button>
              <Button size="sm" variant="secondary" onClick={async () => say((await copy(linkText(url))) ? "안내문을 복사했습니다." : "복사 창을 열었습니다.")}>안내문 복사</Button>
              <a href={link.path} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50">열어 보기</a>
              <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const r = await setLinkActiveAction(!link.isActive); if (!r.ok) return say(r.error); router.refresh(); })}>
                {link.isActive ? "멈추기" : "다시 받기"}
              </Button>
              <Button size="sm" variant="danger" disabled={pending} onClick={() => start(async () => { if (!window.confirm("링크 주소를 바꿀까요? 지금까지 알린 주소는 더는 열리지 않습니다(이미 시작한 응시는 이어서 풀 수 있습니다).")) return; const r = await rotateLinkAction(); if (!r.ok) return say(r.error); say("새 주소로 바꿨습니다."); router.refresh(); })}>
                주소 바꾸기
              </Button>
            </div>
          </div>
          {qr && (
            <div className="flex flex-col items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="응시 링크 QR 코드" width={128} height={128} className="rounded-md ring-1 ring-slate-200" />
              <a href={qr} download="어휘진단-QR.png" className="text-xs font-semibold text-brand-700 hover:underline">QR 내려받기</a>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {TARGETS.map((target) => {
          const t = tests.find((x) => x.target === target);
          return t ? <TestCard key={target} test={t} say={say} /> : null;
        })}
      </div>
    </div>
  );
}

function TestCard({ test, say }: { test: TestItem; say: (t: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const cfg = DIAG_TARGETS[test.target];
  const [title, setTitle] = useState(test.title);
  const [count, setCount] = useState(test.questionCount);
  const [minutes, setMinutes] = useState(test.minutes);
  const [intro, setIntro] = useState(test.intro);
  const [sample, setSample] = useState<{ day: number; word: string; choices: string[]; answerIndex: number }[] | null>(null);
  const dirty = title !== test.title || count !== test.questionCount || minutes !== test.minutes || intro !== test.intro;
  const save = (active: boolean) =>
    start(async () => {
      const r = await updateTestAction(test.target, { title, questionCount: count, minutes, intro, active });
      if (!r.ok) return say(r.error);
      say("저장했습니다.");
      router.refresh();
    });
  const input = "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm";
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">{cfg.label} <span className="text-sm font-normal text-slate-500">({cfg.who})</span></h2>
          <p className="mt-0.5 text-xs text-slate-500">{cfg.folderName}에서 Day를 고르게 무작위로 뽑습니다</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${test.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{test.isActive ? "받는 중" : "멈춤"}</span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_6rem_6rem] gap-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-slate-600">시험 제목</span>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-slate-600">문항 수</span>
          <input className={input} type="number" min={5} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-slate-600">권장 시간(분)</span>
          <input className={input} type="number" min={1} max={120} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        </label>
        <label className="col-span-3 text-sm">
          <span className="mb-1 block text-xs font-semibold text-slate-600">안내 문구(첫 화면)</span>
          <textarea className="min-h-[4rem] w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm" value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={600} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {dirty && <Button size="sm" disabled={pending} onClick={() => save(test.isActive)}>저장</Button>}
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => save(!test.isActive)}>{test.isActive ? "이 대상 멈추기" : "이 대상 다시 받기"}</Button>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const r = await sampleAction(test.target); if (!r.ok) return say(r.error); setSample(r.questions); })}>
          {sample ? "문항 예시 다시 뽑기" : "문항 예시 보기"}
        </Button>
      </div>
      {sample && (
        <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-slate-100">
          <p className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">학생 한 명이 받을 수 있는 문항 예시입니다(저장되지 않음). 정답은 초록색.</p>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {sample.map((q, i) => (
                <tr key={i}>
                  <td className="w-12 px-2 py-1.5 text-slate-400">Day {q.day}</td>
                  <td className="w-28 px-2 py-1.5 font-semibold" lang="en">{q.word}</td>
                  <td className="px-2 py-1.5">
                    {q.choices.map((c, k) => (
                      <span key={k} className={`mr-3 inline-block ${k === q.answerIndex ? "font-semibold text-emerald-700" : "text-slate-600"}`}>{k + 1}. {c}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function resultText(r: ResultListRow, url: string) {
  return `[정수학원] ${r.candidateName} 학생 어휘 진단 결과\n${url}\n결과를 보시고 궁금한 점은 상담 전화로 문의해 주세요: ${JEONGSU_CONTACT}`;
}

function ResultsTab({ results, say }: { results: ResultListRow[]; say: (t: string) => void }) {
  const [filter, setFilter] = useState<DiagTarget | "all">("all");
  const list = results.filter((r) => filter === "all" || r.target === filter);
  return (
    <div className="space-y-3">
      <select value={filter} onChange={(e) => setFilter(e.target.value as DiagTarget | "all")} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm" aria-label="진단 대상">
        <option value="all">전체 대상</option>
        {TARGETS.map((t) => (
          <option key={t} value={t}>{DIAG_TARGETS[t].label}</option>
        ))}
      </select>
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2">응시자</th>
              <th className="px-3 py-2">대상</th>
              <th className="px-3 py-2">학교</th>
              <th className="px-3 py-2">시작 / 제출</th>
              <th className="px-3 py-2 text-right">정답</th>
              <th className="px-3 py-2 text-right">정답률</th>
              <th className="px-3 py-2 text-right">걸린 시간</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">아직 응시한 학생이 없습니다.</td></tr>
            )}
            {list.map((r) => (
              <tr key={r.attemptId}>
                <td className="px-3 py-2 font-semibold text-slate-900">{r.candidateName}</td>
                <td className="px-3 py-2 text-slate-600">{DIAG_TARGETS[r.target].label}</td>
                <td className="px-3 py-2 text-slate-600">{r.school || "-"}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{when(r.startedAt)}<br />{r.submittedAt ? when(r.submittedAt) : <span className="text-amber-700">응시 중 ({r.answered}/{r.total})</span>}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.status === "submitted" ? `${r.correct} / ${r.total}` : "-"}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.status === "submitted" ? `${r.rateText}%` : "-"}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-600">{r.minutes === null ? "-" : `${r.minutes}분`}</td>
                <td className="px-3 py-2">
                  {r.status === "submitted" && (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Link href={`${BASE}/results/${r.attemptId}`} className="inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50">상세</Link>
                      {r.resultLink ? (
                        <>
                          <Button size="sm" variant="secondary" onClick={async () => say((await copy(abs(r.resultLink!))) ? "결과 링크를 복사했습니다." : "복사 창을 열었습니다.")}>결과 링크</Button>
                          <Button size="sm" variant="secondary" onClick={async () => say((await copy(resultText(r, abs(r.resultLink!)))) ? "안내문을 복사했습니다." : "복사 창을 열었습니다.")}>안내문</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={async () => { const x = await resultLinkAction(r.attemptId, "reissue"); if (!x.ok) return say(x.error); say((await copy(abs(x.link!))) ? "새 결과 링크를 복사했습니다." : "새 결과 링크를 만들었습니다."); }}>결과 링크 다시 만들기</Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
