import { Suspense } from "react";
import { AppHeader, type AppNavItem } from "@/components/layout/AppHeader";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
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
    <div className="min-h-screen bg-slate-50">
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
