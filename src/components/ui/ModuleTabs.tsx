"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type ModuleTab = {
  href: string;
  label: string;
  /** 탭 옆 작은 숫자 */
  count?: number;
  /** 이 주소들로 시작해도 이 탭이 켜진다 (예: 세트 탭 ← 폴더·세트 상세) */
  match?: string[];
};

function isActive(pathname: string, tab: ModuleTab): boolean {
  const prefixes = [tab.href, ...(tab.match ?? [])];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * 기능 화면 위 제목 + 탭 줄 (예: 단어학습 [세트] [배정] [현황]).
 * 제목 오른쪽에는 그 기능의 주요 버튼을 둔다.
 */
export function ModuleHeader({
  title,
  description,
  tabs,
  action,
}: {
  title: string;
  description?: string;
  tabs: ModuleTab[];
  action?: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
      </div>
      <nav
        aria-label={`${title} 메뉴`}
        className="mt-4 flex gap-6 overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((tab) => {
          const on = isActive(pathname, tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex h-10 shrink-0 items-center gap-1.5 border-b-2 text-sm transition ${
                on
                  ? "border-brand-600 font-bold text-slate-900"
                  : "border-transparent font-medium text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    on ? "text-brand-700" : "text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
