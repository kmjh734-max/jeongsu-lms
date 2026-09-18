import Link from "next/link";
import { SITE_NAME } from "@/lib/branding";

/** 로그인 전 공개 화면 머리 — 서비스 소개·요금·로그인·가입 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-slate-900">{SITE_NAME}</span>
          <span className="hidden text-xs text-slate-500 sm:inline">영어교육의 중심</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/#features" className="hidden rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 sm:inline">
            기능
          </Link>
          <Link href="/pricing" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100">
            요금
          </Link>
          <Link href="/login" className="rounded-md px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100">
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-brand-600 px-3.5 py-1.5 font-semibold text-white hover:bg-brand-700"
          >
            시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
