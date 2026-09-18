"use client";

import Link from "next/link";
import { useState } from "react";

type Field = "academyName" | "ownerName" | "username" | "password" | "password2" | "phone" | "email";

const INPUT =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function SignupForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    academyName: "",
    ownerName: "",
    username: "",
    password: "",
    password2: "",
    phone: "",
    email: "",
  });
  // 학원회원(학원·공부방·교습소) / 개인회원(개인 선생님)
  const [memberType, setMemberType] = useState<"academy" | "personal">("academy");
  const [agree, setAgree] = useState({ terms: false, privacy: false, age: false });
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ slug: string; username: string; bonus: boolean } | null>(null);

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));
  const allAgreed = agree.terms && agree.privacy && agree.age;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (values.password !== values.password2) {
      setError("비밀번호 확인이 맞지 않아요.");
      return;
    }
    if (!allAgreed) {
      setError("필수 약관에 모두 동의해 주세요.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberType,
          academyName: memberType === "personal" ? "" : values.academyName,
          ownerName: values.ownerName,
          username: values.username,
          password: values.password,
          phone: values.phone,
          email: values.email,
          agreeTerms: agree.terms,
          agreePrivacy: agree.privacy,
          agreeAge: agree.age,
          website,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        academySlug?: string;
        username?: string;
        bonusGranted?: boolean;
      };
      if (!data.ok) {
        setError(data.message ?? "가입하지 못했어요. 다시 해 주세요.");
        return;
      }
      setDone({
        slug: data.academySlug ?? "",
        username: data.username ?? values.username,
        bonus: Boolean(data.bonusGranted),
      });
    } catch {
      setError("연결이 끊겼어요. 다시 해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-xl font-extrabold text-slate-900">가입을 마쳤어요</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          아이디 <b className="text-slate-900">{done.username}</b>로 로그인해 주세요.
          <br />
          {done.bonus ? (
            <>
              가입 축하 <b className="text-slate-900">2,000크레딧</b>을 넣어 드렸어요.
              <br />
            </>
          ) : null}
          단어·듣기 교재는 몇 분 안에 자동으로 들어갑니다.
        </p>
        <Link
          href={`/login?academy=${encodeURIComponent(done.slug)}`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-6 text-[15px] font-semibold text-white hover:bg-brand-700"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="회원 종류">
        {(
          [
            ["academy", "학원회원", "학원·공부방·교습소"],
            ["personal", "개인회원", "개인 선생님·과외"],
          ] as const
        ).map(([key, label, sub]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={memberType === key}
            onClick={() => setMemberType(key)}
            className={`rounded-md px-3 py-2 text-center transition ${
              memberType === key ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="block text-[15px] font-bold text-slate-900">{label}</span>
            <span className="block text-xs text-slate-500">{sub}</span>
          </button>
        ))}
      </div>
      {memberType === "academy" ? (
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">학원·공부방·교습소 이름</span>
          <input className={INPUT} value={values.academyName} onChange={set("academyName")} placeholder="예: 정수영어학원, 해솔공부방" required maxLength={40} />
        </label>
      ) : null}
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">{memberType === "academy" ? "대표자 이름" : "이름"}</span>
        <input className={INPUT} value={values.ownerName} onChange={set("ownerName")} required maxLength={20} autoComplete="name" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">아이디</span>
        <input
          className={INPUT}
          value={values.username}
          onChange={set("username")}
          placeholder="영문 소문자·숫자 3~32자"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">비밀번호</span>
          <input className={INPUT} type="password" value={values.password} onChange={set("password")} placeholder="8자 이상" required minLength={8} autoComplete="new-password" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">비밀번호 확인</span>
          <input className={INPUT} type="password" value={values.password2} onChange={set("password2")} required minLength={8} autoComplete="new-password" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">휴대폰 번호</span>
          <input className={INPUT} type="tel" value={values.phone} onChange={set("phone")} placeholder="010-0000-0000" required autoComplete="tel" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">이메일</span>
          <input className={INPUT} type="email" value={values.email} onChange={set("email")} placeholder="결제·환불 안내를 받을 주소" required autoComplete="email" />
        </label>
      </div>

      {/* 사람에게는 보이지 않는 칸 — 자동 가입 프로그램만 채운다 */}
      <input
        tabIndex={-1}
        aria-hidden
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
        <label className="flex items-center gap-2 font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(e) => setAgree({ terms: e.target.checked, privacy: e.target.checked, age: e.target.checked })}
            className="h-4 w-4 accent-brand-600"
          />
          전체 동의
        </label>
        <div className="space-y-1.5 border-t border-slate-200 pt-2 text-slate-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={agree.terms} onChange={(e) => setAgree((a) => ({ ...a, terms: e.target.checked }))} className="h-4 w-4 accent-brand-600" />
            <span>
              [필수] <Link href="/terms" target="_blank" className="underline">이용약관</Link> 동의
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={agree.privacy} onChange={(e) => setAgree((a) => ({ ...a, privacy: e.target.checked }))} className="h-4 w-4 accent-brand-600" />
            <span>
              [필수] <Link href="/privacy" target="_blank" className="underline">개인정보 수집·이용</Link> 동의
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={agree.age} onChange={(e) => setAgree((a) => ({ ...a, age: e.target.checked }))} className="h-4 w-4 accent-brand-600" />
            <span>[필수] 만 14세 이상입니다</span>
          </label>
        </div>
      </fieldset>

      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-600 text-[15px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "가입하는 중…" : "가입하기"}
      </button>
      <p className="text-center text-sm text-slate-500">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-brand-700 underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
