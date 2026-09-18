"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GUIDE_STEPS } from "@/lib/onboarding-guide";

/** 홈 "시작하기"에서 들어온 화면 위에 무엇을 누르면 되는지 알려 주고, 다음 단계로 잇는다 */
export function GuideBanner() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const n = Number(sp.get("guide"));
  if (!Number.isInteger(n) || n < 1 || n > GUIDE_STEPS.length) return null;
  const step = GUIDE_STEPS[n - 1]!;
  const next = GUIDE_STEPS[n];

  const close = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("guide");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-brand-700">
          시작하기 {n}/{GUIDE_STEPS.length} · {step.title}
        </p>
        <p className="mt-0.5 text-sm leading-6 text-slate-800">{step.how}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
        <button type="button" onClick={close} className="text-slate-500 hover:text-slate-800">
          닫기
        </button>
        {next ? (
          <Link href={next.href} className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
            다음: {next.title} →
          </Link>
        ) : (
          <Link href="/admin" className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
            다 했어요 · 홈으로
          </Link>
        )}
      </div>
    </div>
  );
}
