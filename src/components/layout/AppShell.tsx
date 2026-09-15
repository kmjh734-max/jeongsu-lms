"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  groupNavItems,
  isNavActive,
  type AppNavItem,
  type HeaderBranding,
} from "@/components/layout/AppHeader";
import { useCreditBalance } from "@/components/layout/HeaderCreditsBadge";
import { Icon, navIconName } from "@/components/layout/NavIcon";
import { createClient } from "@/lib/supabase/client";
import { clearRoleCookieClient } from "@/lib/auth/role-cookie";
import { ENGCORE_PRODUCTS, SITE_NAME } from "@/lib/branding";
import type { Profile } from "@/types/database";

/* ── 모바일 메뉴 열림 상태 (위 막대의 메뉴 버튼 ↔ 왼쪽 메뉴) ── */

type ShellState = { open: boolean; setOpen: (v: boolean) => void };
const ShellContext = createContext<ShellState>({ open: false, setOpen: () => {} });

export function ShellProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

const ROLE_TEXT: Record<Profile["role"], string> = {
  super_admin: "총괄 관리자",
  admin: "관리자",
  teacher: "강사",
  student: "학생",
};

const PRODUCT_TEXT: Record<Profile["role"], string> = {
  super_admin: ENGCORE_PRODUCTS.admin,
  admin: ENGCORE_PRODUCTS.admin,
  teacher: ENGCORE_PRODUCTS.teacher,
  student: ENGCORE_PRODUCTS.learn,
};

function homeHref(role: Profile["role"]): string {
  if (role === "super_admin") return "/super-admin";
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
}

/** 지금 주소에 가장 길게 들어맞는 메뉴 */
function activeNavItem(pathname: string, items: AppNavItem[]): AppNavItem | null {
  let best: AppNavItem | null = null;
  for (const item of items) {
    if (!isNavActive(pathname, item.href)) continue;
    if (!best || item.href.length > best.href.length) best = item;
  }
  return best;
}

async function signOut() {
  clearRoleCookieClient();
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.assign("/login");
}

/* ── 왼쪽 메뉴 ── */

function SidebarBody({
  profile,
  items,
  branding,
  showCredits,
  onNavigate,
}: {
  profile: Profile;
  items: AppNavItem[];
  branding: HeaderBranding | null;
  showCredits: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = activeNavItem(pathname, items);
  const balance = useCreditBalance(showCredits ? pathname : undefined);
  const name = branding?.name?.trim() || SITE_NAME;
  const logoUrl = branding?.logoUrl?.trim() || "";
  const creditsHref =
    profile.role === "teacher" ? "/teacher/credits" : "/admin/credits";

  return (
    <div className="flex h-full flex-col px-3 pb-4 pt-5">
      <Link
        href={homeHref(profile.role)}
        onClick={onNavigate}
        className={`mb-5 flex min-w-0 items-center gap-2.5 px-2 ${onNavigate ? "pr-10" : ""}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-sm font-extrabold text-side">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="h-7 w-7 object-contain"
            />
          ) : (
            name.slice(0, 1)
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-bold text-white">{name}</span>
          <span className="truncate text-[11px] text-side-icon">
            {PRODUCT_TEXT[profile.role]}
          </span>
        </span>
      </Link>

      <nav
        aria-label={`${name} 메뉴`}
        className="side-scroll -mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1"
      >
        {groupNavItems(items).map((group) => (
          <div key={group.key} className="flex flex-col gap-0.5">
            {group.label ? (
              <div className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-side-group">
                {group.label}
              </div>
            ) : null}
            {group.items.map((item) => {
              const on = active?.href === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={onNavigate}
                  aria-current={on ? "page" : undefined}
                  className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition ${
                    on
                      ? "bg-side-active font-semibold text-white"
                      : "font-medium text-side-text hover:bg-side-hover hover:text-white"
                  }`}
                >
                  <Icon
                    name={navIconName(item.href)}
                    className={on ? "text-white" : "text-side-icon"}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {showCredits ? (
        <Link
          href={creditsHref}
          prefetch={false}
          onClick={onNavigate}
          className="mt-4 flex flex-col gap-1 rounded-lg bg-side-card p-3.5 transition hover:bg-side-active"
        >
          <span className="flex items-center gap-1.5 text-xs text-side-muted">
            <Icon name="coins" size={14} />
            남은 크레딧
          </span>
          {balance === null ? (
            <span className="my-1 inline-block h-5 w-20 animate-pulse rounded bg-white/15" />
          ) : (
            <span
              className={`text-xl font-bold tabular-nums ${
                balance <= 0 ? "text-amber-300" : "text-white"
              }`}
            >
              {balance.toLocaleString("ko-KR")}
            </span>
          )}
          <span className="text-xs text-side-muted">충전·내역 보기 ›</span>
        </Link>
      ) : null}

      {profile.role === "student" ? (
        <StudentTodayCard onNavigate={onNavigate} />
      ) : null}
    </div>
  );
}

/* ── 학생: 오늘 할 일 카드 ── */

type TodayCardData = {
  doneCount: number;
  items: { short: string; done: boolean; href: string }[];
};

let todayCache: { at: number; data: TodayCardData } | null = null;

function StudentTodayCard({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [data, setData] = useState<TodayCardData | null>(todayCache?.data ?? null);

  useEffect(() => {
    // 화면을 옮길 때마다 새로 읽되, 20초 안에는 다시 묻지 않는다
    if (todayCache && Date.now() - todayCache.at < 20_000) {
      setData(todayCache.data);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/today", { cache: "no-store" });
        const json = (await res.json()) as { ok?: boolean } & Partial<TodayCardData>;
        if (cancelled || !json.ok) return;
        const next = { doneCount: json.doneCount ?? 0, items: json.items ?? [] };
        todayCache = { at: Date.now(), data: next };
        setData(next);
      } catch {
        /* 카드만 비워 둔다 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (data && data.items.length === 0) return null;
  const total = data?.items.length ?? 0;
  const pct = total > 0 ? Math.round(((data?.doneCount ?? 0) / total) * 100) : 0;

  return (
    <div className="mt-4 flex flex-col gap-2.5 rounded-lg bg-side-card p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-side-muted">오늘 할 일</span>
        {data ? (
          <span className="text-xs font-bold tabular-nums text-white">
            {data.doneCount} / {total}
          </span>
        ) : null}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#223a58]">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {data ? (
        <div className="flex flex-col gap-1.5">
          {data.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={onNavigate}
              className={`flex items-center gap-2 text-xs transition hover:text-white ${
                item.done ? "text-side-muted" : "text-white"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                  item.done ? "border-[#1f7a4d] bg-[#1f7a4d]" : "border-side-icon"
                }`}
              >
                {item.done ? <Icon name="check" size={11} strokeWidth={3} className="text-white" /> : null}
              </span>
              <span className={`truncate ${item.done ? "line-through" : ""}`}>{item.short}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <span className="h-3 w-20 animate-pulse rounded bg-white/10" />
        </div>
      )}
    </div>
  );
}

/* ── 학생: 휴대폰 아래 탭 ── */

/** 문제를 푸는 화면 — 탭을 숨겨 화면을 넓게 쓴다 */
export function isStudyScreen(pathname: string): boolean {
  return (
    /^\/student\/vocab\/[^/]+\/(stage\d|study|test)/.test(pathname) ||
    /^\/student\/listening\/(daily\/)?[^/]+$/.test(pathname)
  );
}

export function StudentTabBar({ items }: { items: AppNavItem[] }) {
  const pathname = usePathname();
  if (isStudyScreen(pathname)) return null;
  const active = activeNavItem(pathname, items);
  return (
    <>
      <div aria-hidden className="h-20 lg:hidden print:hidden" />
      <nav
        aria-label="학생 메뉴"
        className="no-print fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
      >
        {items.map((item) => {
          const on = active?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={on ? "page" : undefined}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] ${
                on ? "font-bold text-brand-600" : "font-medium text-slate-400"
              }`}
            >
              <Icon name={navIconName(item.href)} size={22} strokeWidth={on ? 2 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function AppSidebar(props: {
  profile: Profile;
  items: AppNavItem[];
  branding: HeaderBranding | null;
  showCredits: boolean;
}) {
  const { open, setOpen } = useContext(ShellContext);
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), [setOpen]);

  // 화면을 옮기면 모바일 메뉴를 닫는다
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <>
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[244px] bg-side lg:block">
        <SidebarBody {...props} />
      </aside>

      {open ? (
        <div className="no-print fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={close}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="absolute inset-y-0 left-0 w-[264px] max-w-[85vw] bg-side shadow-2xl">
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={close}
              className="absolute right-2 top-4 flex h-9 w-9 items-center justify-center rounded-md text-side-text hover:bg-side-hover hover:text-white"
            >
              <Icon name="close" size={18} />
            </button>
            <SidebarBody {...props} onNavigate={close} />
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ── 위 막대 ── */

export function AppTopbar({
  profile,
  items,
}: {
  profile: Profile;
  items: AppNavItem[];
}) {
  const { setOpen } = useContext(ShellContext);
  const pathname = usePathname();
  const active = activeNavItem(pathname, items);
  const deeper = active ? pathname !== active.href : false;
  const displayId =
    profile.username?.trim() || profile.email?.split("@")[0] || profile.name;
  const initial = (profile.name?.trim() || displayId || "?").slice(0, 1);

  return (
    <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
          className={`-ml-1.5 h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden ${
            profile.role === "student" ? "hidden" : "flex"
          }`}
        >
          <Icon name="menu" size={20} />
        </button>
        <div className="flex min-w-0 items-center gap-2 text-sm">
          {active?.group ? (
            <>
              <span className="hidden shrink-0 font-medium text-slate-400 sm:inline">
                {active.group}
              </span>
              <span className="hidden text-slate-300 sm:inline">/</span>
            </>
          ) : null}
          {active ? (
            deeper ? (
              <Link
                href={active.href}
                prefetch={false}
                className="truncate font-semibold text-slate-900 hover:text-brand-700"
              >
                {active.label}
              </Link>
            ) : (
              <span className="truncate font-semibold text-slate-900">
                {active.label}
              </span>
            )
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden text-[13px] text-slate-500 md:inline">
          {ROLE_TEXT[profile.role]}
        </span>
        <span
          className="hidden max-w-[140px] truncate text-[13px] font-medium text-slate-700 sm:inline"
          title={profile.email}
        >
          {displayId}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] font-bold text-brand-700">
          {initial}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          title="로그아웃"
          className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Icon name="logout" size={16} />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}
