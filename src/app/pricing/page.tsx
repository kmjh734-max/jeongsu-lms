import type { Metadata } from "next";
import { PricingSection } from "@/components/site/PricingSection";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { loadPublicPricing } from "@/lib/site/load-public-pricing";

export const metadata: Metadata = {
  title: "요금 안내",
  description: "EngCore 크레딧 충전 상품과 기능별 크레딧. 1크레딧=1원, 쓴 만큼만 결제하고 가입하면 2,000크레딧 무료.",
  alternates: { canonical: "/pricing" },
};

export const revalidate = 300;

export default async function PricingPage() {
  const { packages, features } = await loadPublicPricing();
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <PricingSection packages={packages} features={features} />
      <SiteFooter />
    </div>
  );
}
