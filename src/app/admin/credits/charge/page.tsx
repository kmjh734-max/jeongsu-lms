import { CreditChargeClient } from "@/components/credits/CreditChargeClient";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCheckoutOpenForAcademySlug } from "@/lib/payments/toss/env";

export default async function AdminCreditChargePage() {
  const profile = await getCurrentProfile();
  let slug: string | undefined;
  if (profile?.academy_id) {
    const { data } = await createAdminClient().from("academies").select("slug").eq("id", profile.academy_id).maybeSingle();
    slug = (data?.slug as string | undefined) ?? undefined;
  }
  return <CreditChargeClient checkoutOpen={isCheckoutOpenForAcademySlug(slug)} />;
}
