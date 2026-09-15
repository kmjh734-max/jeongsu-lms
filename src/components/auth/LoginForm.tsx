"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resolveLoginEmail } from "@/lib/auth/username";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import {
  clearRoleCookieClient,
  setRoleCookieClient,
} from "@/lib/auth/role-cookie";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/types/database";

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "아이디나 비밀번호가 맞지 않아요. 다시 확인해 주세요.";
  }
  if (lower.includes("email not confirmed")) {
    return "이메일 인증이 아직 끝나지 않았어요.";
  }
  if (lower.includes("too many requests")) {
    return "잠시 후 다시 시도해 주세요.";
  }
  return message;
}

interface LoginFormProps {
  initialError?: string;
  /** 학원 전용 랜딩일 때 — 다른 학원 계정 로그인 차단 */
  expectedAcademyId?: string | null;
  expectedAcademyName?: string | null;
}

function safeRedirectPath(raw: string | null): string | null {
  if (!raw?.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function LoginForm({
  initialError,
  expectedAcademyId = null,
  expectedAcademyName = null,
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectAfterLogin = safeRedirectPath(
    searchParams.get("redirect") ?? searchParams.get("redirectTo")
  );
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = resolveLoginEmail(identifier);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active, academy_id")
        .eq("id", data.user.id)
        .single();

      if (profile && profile.is_active === false) {
        clearRoleCookieClient();
        await supabase.auth.signOut();
        setError(
          profile.role === "teacher"
            ? "쉬는 중인 계정이에요. 관리자에게 문의해 주세요."
            : "쉬는 중인 계정이에요. 학원에 문의해 주세요."
        );
        setLoading(false);
        return;
      }

      if (
        expectedAcademyId &&
        profile &&
        profile.role !== "super_admin" &&
        profile.academy_id !== expectedAcademyId
      ) {
        clearRoleCookieClient();
        await supabase.auth.signOut();
        setError(
          expectedAcademyName
            ? `이 계정은 ${expectedAcademyName} 계정이 아니에요. 다니는 학원의 로그인 주소로 들어와 주세요.`
            : "이 학원 계정이 아니에요. 다니는 학원의 로그인 주소로 들어와 주세요."
        );
        setLoading(false);
        return;
      }

      const role = profile?.role as UserRole | undefined;
      if (role) {
        setRoleCookieClient(role);
        // Soft navigation + refresh는 RSC 재요청이 겹쳐 체감이 느림 → 한 번만 이동
        window.location.assign(
          redirectAfterLogin ?? getDashboardPathForRole(role)
        );
        return;
      }
    }

    setError("계정 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    setLoading(false);
  }

  const isEmailStyle = identifier.includes("@");
  const fieldClass =
    "h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:border-brand-600 focus:outline-none focus:ring-[3px] focus:ring-brand-50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="identifier"
          className="text-[13px] font-semibold text-slate-700"
        >
          {isEmailStyle ? "이메일" : "아이디"}
        </label>
        <input
          id="identifier"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={fieldClass}
          placeholder={isEmailStyle ? "admin@example.com" : "아이디"}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[13px] font-semibold text-slate-700"
        >
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:text-brand-700"
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>
      </div>

      <div className="-mt-1 flex justify-end">
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          aria-expanded={showHint}
          aria-controls="login-hint"
          className="text-[13px] font-semibold text-brand-700 hover:underline"
        >
          비밀번호를 잊었어요
        </button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="h-12 w-full rounded-lg text-base font-bold"
      >
        {loading ? "로그인 중…" : "로그인"}
      </Button>

      {showHint ? (
        <p
          id="login-hint"
          className="rounded-lg bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500"
        >
          아이디는 학원에서 받은 영문·숫자예요. 비밀번호를 잊었다면 선생님께
          말하면 바로 새로 만들어 드려요.
        </p>
      ) : null}
    </form>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}
