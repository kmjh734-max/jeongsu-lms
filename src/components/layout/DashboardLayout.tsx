import { Suspense } from "react";
import type { AppNavItem } from "@/components/layout/AppHeader";
import {
  AppSidebar,
  AppTopbar,
  ShellProvider,
  StudentTabBar,
} from "@/components/layout/AppShell";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import type { Profile } from "@/types/database";

interface DashboardLayoutProps {
  profile: Profile;
  navItems: AppNavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({
  profile,
  navItems,
  children,
}: DashboardLayoutProps) {
  const showCredits =
    (profile.role === "admin" || profile.role === "teacher") &&
    !!profile.academy_id;

  return (
    <ShellProvider>
      <div className="min-h-screen bg-canvas lg:pl-[244px] print:bg-white print:pl-0">
        <Suspense
          fallback={
            <AppSidebar
              profile={profile}
              items={navItems}
              branding={null}
              showCredits={showCredits}
            />
          }
        >
          <DashboardSidebar
            profile={profile}
            navItems={navItems}
            showCredits={showCredits}
          />
        </Suspense>
        <AppTopbar profile={profile} items={navItems} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        {/* 학생은 휴대폰에서 아래 탭으로 메뉴를 옮긴다 */}
        {profile.role === "student" ? <StudentTabBar items={navItems} /> : null}
      </div>
    </ShellProvider>
  );
}
