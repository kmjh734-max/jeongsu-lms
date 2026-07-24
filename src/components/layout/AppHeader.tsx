"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { HeaderCreditsBadge } from "@/components/layout/HeaderCreditsBadge";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { Badge } from "@/components/ui/Badge";
import { ENGCORE_PRODUCTS, SITE_NAME } from "@/lib/branding";
import type { Profile } from "@/types/database";

export interface AppNavItem {
  href: string;
  label: string;
  /** 메뉴 묶음 (예: "학습", "리포트", "관리"). 없으면 기본 묶음 */
  group?: string;
}

export type HeaderBranding = {
  name: string;
  logoUrl: string;
};

interface AppHeaderProps {
  profile: Profile;
  items: AppNavItem[];
  /** 로그인 학원 브랜딩 (super_admin은 null → EngCore) */
  branding?: HeaderBranding | null;
  /** true면 크레딧 배지 표시(클라이언트에서 잔액 로드) */
  showCredits?: boolean;
}

const ROLE_LABELS: Record<Profile["role"], string> = {
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

type NavGroup = { key: string; label: string | null; items: AppNavItem[] };

/** group 필드 기준으로 순서를 유지하며 묶는다. group이 하나뿐이면 라벨 숨김 */
function groupNavItems(items: AppNavItem[]): NavGroup[] {
  const groups: NavGroup[] = [];
  const index = new Map<string, NavGroup>();
  for (const item of items) {
    const key = item.group ?? "";
    let g = index.get(key);
    if (!g) {
      g = { key: key || "_default", label: item.group ?? null, items: [] };
      index.set(key, g);
      groups.push(g);
    }
    g.items.push(item);
  }
  // 실제로 나뉜 묶음이 2개 이상일 때만 라벨/구분선을 노출
  if (groups.length < 2) {
    return [{ key: "_all", label: null, items }];
  }
  return groups;
}

function isNavActive(pathname: string, href: string): boolean {
  if (
    href === "/admin" ||
    href === "/teacher" ||
    href === "/student" ||
    href === "/super-admin"
  ) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader({
  profile,
  items,
  branding = null,
  showCredits = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const displayId =
    profile.username?.trim() ||
    profile.email?.split("@")[0] ||
    profile.name;

  const useAcademy = Boolean(branding?.name) && profile.role !== "super_admin";
  const creditsHref =
    profile.role === "teacher" ? "/teacher/credits" : "/admin/credits";

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href={homeHref(profile.role)}
          prefetch
          className="flex min-w-0 items-center gap-3"
        >
          {useAcademy && branding ? (
            <BrandLogo
              variant="header"
              showSiteName
              showAcademyLogo={Boolean(branding.logoUrl)}
              logoSrc={branding.logoUrl || null}
              displayName={branding.name}
            />
          ) : (
            <BrandLogo variant="header" showSiteName showAcademyLogo={false} />
          )}
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showCredits ? (
            <HeaderCreditsBadge href={creditsHref} />
          ) : null}
          <Badge variant="brand">{ROLE_LABELS[profile.role]}</Badge>
          <span
            className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:inline"
            title={profile.email}
          >
            {displayId}
          </span>
          <SignOutButton />
        </div>
      </div>

      <nav
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-1.5 gap-y-2 border-t border-slate-100 px-4 py-2"
        aria-label={`${useAcademy && branding ? branding.name : SITE_NAME} 메뉴`}
      >
        {groupNavItems(items).map((group, gi) => (
          <div key={group.key} className="flex items-center gap-1">
            {gi > 0 && (
              <span
                aria-hidden
                className="mx-1 hidden h-4 w-px bg-slate-200 sm:inline-block"
              />
            )}
            {group.label && (
              <span className="mr-0.5 hidden select-none text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:inline">
                {group.label}
              </span>
            )}
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </header>
  );
}
