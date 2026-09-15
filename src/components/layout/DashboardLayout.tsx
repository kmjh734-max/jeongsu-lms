import { Suspense } from "react";
import { AppHeader, type AppNavItem } from "@/components/layout/AppHeader";
import { AppSidebar, AppTopbar, ShellProvider } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
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

  // 학생 화면은 메뉴가 적고 휴대폰으로 많이 보므로 위쪽 메뉴를 그대로 쓴다.
  if (profile.role === "student") {
    return (
      <div className="min-h-screen bg-canvas">
        <Suspense
          fallback={
            <AppHeader
              profile={profile}
              items={navItems}
              branding={null}
              showCredits={showCredits}
            />
          }
        >
          <DashboardHeader
            profile={profile}
            navItems={navItems}
            showCredits={showCredits}
          />
        </Suspense>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
      </div>
    );
  }

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
      </div>
    </ShellProvider>
  );
}
