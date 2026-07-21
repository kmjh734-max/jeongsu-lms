"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { Badge } from "@/components/ui/Badge";
import { ENGCORE_PRODUCTS, SITE_NAME } from "@/lib/branding";
import type { Profile } from "@/types/database";

export interface AppNavItem {
  href: string;
  label: string;
}

interface AppHeaderProps {
  profile: Profile;
  items: AppNavItem[];
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

export function AppHeader({ profile, items }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    for (const item of items) {
      router.prefetch(item.href);
    }
  }, [items, router]);
  const displayId =
    profile.username?.trim() ||
    profile.email?.split("@")[0] ||
    profile.name;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href={homeHref(profile.role)}
          className="flex min-w-0 items-center gap-3"
        >
          <BrandLogo variant="header" showSiteName />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
        className="mx-auto flex max-w-6xl gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2"
        aria-label={`${SITE_NAME} 메뉴`}
      >
        {items.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
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
      </nav>
    </header>
  );
}
