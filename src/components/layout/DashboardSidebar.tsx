import { AppSidebar } from "@/components/layout/AppShell";
import type { AppNavItem } from "@/components/layout/AppHeader";
import { getAcademyBranding } from "@/lib/tenant/academy-branding";
import type { Profile } from "@/types/database";

export async function DashboardSidebar({
  profile,
  navItems,
  showCredits,
}: {
  profile: Profile;
  navItems: AppNavItem[];
  showCredits: boolean;
}) {
  const branding =
    profile.role !== "super_admin" && profile.academy_id
      ? await getAcademyBranding(profile.academy_id)
      : null;

  return (
    <AppSidebar
      profile={profile}
      items={navItems}
      branding={branding ? { name: branding.name, logoUrl: branding.logoUrl } : null}
      showCredits={showCredits}
    />
  );
}
