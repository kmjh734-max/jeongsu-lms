import { AppHeader, type AppNavItem } from "@/components/layout/AppHeader";
import { getAcademyBranding } from "@/lib/tenant/academy-branding";
import type { Profile } from "@/types/database";

export async function DashboardHeader({
  profile,
  navItems,
  showCredits,
}: {
  profile: Profile;
  navItems: AppNavItem[];
  showCredits: boolean;
}) {
  const needsBranding =
    profile.role !== "super_admin" && !!profile.academy_id;

  const branding = needsBranding
    ? await getAcademyBranding(profile.academy_id!)
    : null;

  return (
    <AppHeader
      profile={profile}
      items={navItems}
      branding={
        branding
          ? { name: branding.name, logoUrl: branding.logoUrl }
          : null
      }
      showCredits={showCredits}
    />
  );
}
