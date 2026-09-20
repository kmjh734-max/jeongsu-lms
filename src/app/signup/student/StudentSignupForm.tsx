"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

/** 학생 가입 — 학원 코드 확인 → 번호·비밀번호·학교 정보 */
export function StudentSignupForm({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [academyName, setAcademyName] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    school: "",
    schoolGrade: "",
    parentPhone: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // 코드를 다 치면 학원 이름을 확인해 보여 준다
  useEffect(() => {
    const c = code.replace(/[^A-Za-z0-9]/g, "");
    if (c.length < 4) {
      setAcademyName(null);
      return;
    }
    let alive = true;
    fetch(`/api/signup/student?code=${encodeURIComponent(c)}`)
      .then((r) => r.json())
      .then((d: { ok?: boolean; academyName?: string | null }) => {
        if (alive) setAcademyName(d.ok ? d.academyName ?? null : null);
      })
      .catch(() => alive && setAcademyName(null));
    return () => {
      alive = false;
    };
  }, [code]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/signup/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...form }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (data.ok) setDone(data.message ?? "가입 신청했어요.");
      else setError(data.message ?? "가입하지 못했어요.");
    } catch {
      setError("연결이 끊겼어요. 다시 해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base font-bold text-slate-900">{done}</p>
        <p className="mt-2 text-sm text-slate-600">
          아이디는 방금 적은 휴대전화 번호예요. 학원에서 확인하면 로그인해서 바로 공부할 수 있어요.
        </p>
        <Link href="/login" className="mt-5 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="join-code" className="ui-label">
          학원 가입 코드
        </label>
        <input
          id="join-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="ui-input tracking-[0.2em]"
          placeholder="ABC123"
          autoCapitalize="characters"
        />
        {academyName ? (
          <p className="mt-1 text-sm font-semibold text-brand-700">{academyName}에 가입해요</p>
        ) : code.length >= 4 ? (
          <p className="mt-1 text-sm text-slate-500">코드를 확인하는 중이거나 맞지 않아요.</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="signup-name" className="ui-label">
          이름
        </label>
        <input id="signup-name" required value={form.name} onChange={set("name")} className="ui-input" />
      </div>

      <div>
        <label htmlFor="signup-phone" className="ui-label">
          휴대전화 번호 <span className="font-normal text-slate-400">이 번호가 아이디가 돼요</span>
        </label>
        <input
          id="signup-phone"
          required
          value={form.phone}
          onChange={set("phone")}
          className="ui-input"
          placeholder="010-0000-0000"
          inputMode="numeric"
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="ui-label">
          비밀번호 <span className="font-normal text-slate-400">6자 이상</span>
        </label>
        <input
          id="signup-password"
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={set("password")}
          className="ui-input"
          autoComplete="new-password"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="signup-school" className="ui-label">
            학교
          </label>
          <input id="signup-school" value={form.school} onChange={set("school")} className="ui-input" placeholder="동암중" />
        </div>
        <div>
          <label htmlFor="signup-grade" className="ui-label">
            학년
          </label>
          <input id="signup-grade" value={form.schoolGrade} onChange={set("schoolGrade")} className="ui-input" placeholder="중2" />
        </div>
      </div>

      <div>
        <label htmlFor="signup-parent" className="ui-label">
          학부모 전화 <span className="font-normal text-slate-400">학습 리포트를 받는 번호예요</span>
        </label>
        <input
          id="signup-parent"
          value={form.parentPhone}
          onChange={set("parentPhone")}
          className="ui-input"
          placeholder="010-0000-0000"
          inputMode="numeric"
        />
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" disabled={busy || !academyName} className="w-full">
        {busy ? "가입하는 중…" : "가입 신청"}
      </Button>
      <p className="text-center text-xs text-slate-500">
        이미 계정이 있으면{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          로그인
        </Link>
        하세요.
      </p>
    </form>
  );
}
