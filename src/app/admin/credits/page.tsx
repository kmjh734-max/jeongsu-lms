import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadCreditsPageData } from "@/lib/credits/load-credits-page";
import { Alert } from "@/components/ui/Alert";
import { CreditsDashboard } from "@/components/credits/CreditsDashboard";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AdminCreditsPage({ searchParams }: PageProps) {
  const { month } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile?.academy_id) {
    return <Alert variant="error">학원 정보를 찾지 못했어요. 다시 로그인해 주세요.</Alert>;
  }
  const supabase = await createClient();
  const data = await loadCreditsPageData(supabase, {
    academyId: profile.academy_id,
    monthParam: month,
    canCharge: true,
  });
  return <CreditsDashboard data={data} canCharge />;
}
