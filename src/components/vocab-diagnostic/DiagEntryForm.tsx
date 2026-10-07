"use client";

import { useState } from "react";

type TestOption = { target: "pre_high1" | "pre_middle1"; label: string; who: string; title: string; questionCount: number; minutes: number; intro: string };

/**
 * 공용 링크 첫 화면. 학생이 예비고1·예비중1을 고르고 이름·학교를 적으면 서버가 무작위 문항으로
 * 개인 응시를 만들고 그 주소로 보낸다.
 */
export function DiagEntryForm({ token, academyName, tests }: { token: string; academyName: string; tests: TestOption[] }) {
  const [target, setTarget] = useState<TestOption["target"] | null>(tests.length === 1 ? tests[0]!.target : null);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const chosen = tests.find((t) => t.target === target) ?? null;

  const start = async () => {
    if (busy) return;
    setError("");
    if (!target) return setError("예비고1인지 예비중1인지 골라 주세요.");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (!agree) return setError("개인정보 이용에 동의해 주세요.");
    setBusy(true);
    try {
      const res = await fetch(`/api/diag/open/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, name, school, agree }),
      });
      const data = await res.json();
      if (!data.ok || !data.url) throw new Error(data.message);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "인터넷 연결을 확인한 뒤 다시 눌러 주세요.");
      setBusy(false);
    }
  };

  const input = "h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white px-4 pb-10 pt-5 text-slate-900">
      <header className="mb-5">
        <p className="text-xs font-semibold text-brand-700">{academyName}</p>
        <h1 className="mt-0.5 text-lg font-bold">어휘 진단</h1>
        <p className="mt-1 text-sm text-slate-600">영어 단어를 보고 알맞은 우리말 뜻을 고르는 진단입니다.</p>
      </header>

      <fieldset className="space-y-2.5">
        <legend className="mb-2 text-sm font-bold">나는</legend>
        {tests.map((t) => {
          const on = target === t.target;
          return (
            <label
              key={t.target}
              className={`flex min-h-[4rem] cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition focus-within:ring-2 focus-within:ring-brand-300 ${on ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <input type="radio" name="target" className="h-5 w-5 accent-brand-600" checked={on} onChange={() => setTarget(t.target)} />
              <span className="flex-1">
                <span className={`block text-base font-bold ${on ? "text-brand-800" : ""}`}>{t.label}</span>
                <span className="block text-xs text-slate-500">{t.who} · {t.questionCount}문항 · 권장 {t.minutes}분</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">이름</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">학교 <span className="font-normal text-slate-500">(선택)</span></span>
          <input className={input} value={school} onChange={(e) => setSchool(e.target.value)} maxLength={30} placeholder="예: 한빛중학교" />
        </label>
      </div>

      {chosen?.intro && <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{chosen.intro}</p>}
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>모르는 단어는 「모르겠어요」를 누르세요.</li>
        <li>답은 바로 저장되어, 창을 닫았다 열어도 이어서 풀 수 있어요.</li>
        <li>제출한 뒤에는 답을 바꿀 수 없습니다.</li>
      </ul>

      <label className="mt-5 flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          적은 이름·학교는 {academyName || "학원"}이 진단 결과 안내와 상담에만 쓰는 데 동의합니다.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      <button type="button" disabled={busy} onClick={start} className="mt-4 h-14 w-full rounded-xl bg-brand-600 text-base font-bold text-white active:bg-brand-700 disabled:opacity-60">
        {busy ? "시험을 만드는 중…" : "시험 시작"}
      </button>
    </main>
  );
}
