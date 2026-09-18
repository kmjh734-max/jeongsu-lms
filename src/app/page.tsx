import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import { LandingPage } from "@/components/site/LandingPage";
import { loadPublicPricing } from "@/lib/site/load-public-pricing";
import { ACADEMY_COOKIE, academySlugFromHost } from "@/lib/tenant/resolve-login-academy";

export const metadata: Metadata = {
  title: { absolute: "EngCore · 영어학원 단어 시험지·듣기평가·지문 분석서 자동 제작" },
  description:
    "영어학원·공부방을 위한 EngCore. 초등~수능 영어 단어 시험지 출력, 중학 영어듣기평가, 지문 분석서·워크북·변형문제, 온라인 단어학습과 학부모 학습 리포트까지 한곳에서. 가입하면 2,000크레딧 무료.",
  keywords: [
    "영어학원 프로그램",
    "영어 단어 시험지",
    "영어듣기평가",
    "지문 분석서",
    "영어 변형문제",
    "학원 학습 리포트",
    "온라인 단어학습",
  ],
  alternates: { canonical: "/" },
};

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
