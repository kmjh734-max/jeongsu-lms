import { AppHeader, type AppNavItem } from "@/components/layout/AppHeader";
import { getAcademyBranding } from "@/lib/tenant/academy-branding";
import type { Profile } from "@/types/database";

interface DashboardLayoutProps {
  profile: Profile;
  navItems: AppNavItem[];
  children: React.ReactNode;
}

export async function DashboardLayout({
  profile,
  navItems,
  children,
}: DashboardLayoutProps) {
  const branding =
    profile.role === "super_admin" || !profile.academy_id
      ? null
      : await getAcademyBranding(profile.academy_id);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        profile={profile}
        items={navItems}
        branding={
          branding
            ? { name: branding.name, logoUrl: branding.logoUrl }
            : null
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
