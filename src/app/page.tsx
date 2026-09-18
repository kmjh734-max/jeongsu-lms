import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import { LandingPage } from "@/components/site/LandingPage";
import { loadPublicPricing } from "@/lib/site/load-public-pricing";
import { ACADEMY_COOKIE, academySlugFromHost } from "@/lib/tenant/resolve-login-academy";

/**
 * 첫 화면.
 * - 로그인한 사람은 자기 화면으로
 * - 학원 전용 주소로 왔거나 전에 학원 로그인을 한 기기는 로그인 화면으로 (학생이 소개 화면을 보지 않게)
 * - 그 밖의 방문자(학원 원장님·결제 심사)는 서비스 소개와 요금 안내를 본다
 */
export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(getDashboardPathForRole(profile.role));

  const headerList = await headers();
  const cookieStore = await cookies();
  if (academySlugFromHost(headerList.get("host")) || cookieStore.get(ACADEMY_COOKIE)?.value) {
    redirect("/login");
  }

  const { packages, features } = await loadPublicPricing();
  return <LandingPage packages={packages} features={features} />;
}
