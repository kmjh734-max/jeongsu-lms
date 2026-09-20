import { redirect } from "next/navigation";
import { filterNavItems } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense } from "react";
import { LowCreditBanner } from "@/components/credits/LowCreditBanner";
import { GuideBanner } from "@/components/home/GuideBanner";
import { createAdminClient } from "@/lib/supabase/admin";

/** 개인회원(개인 선생님)에게는 강사·관리자 계정 관리가 필요 없다 */
const TEAM_ONLY = new Set(["/admin/teachers", "/admin/admins"]);

async function isPersonalMember(academyId: string | null | undefined): Promise<boolean> {
  if (!academyId) return false;
  const { data } = await createAdminClient().from("academies").select("settings").eq("id", academyId).maybeSingle();
  return (data?.settings as { signup?: { member_type?: string } } | null)?.signup?.member_type === "personal";
}

const NAV_ITEMS = [
  { href: "/admin", label: "관리 홈" },
  { href: "/admin/courses", label: "동영상강좌 관리", group: "학습" },
  { href: "/admin/vocab", label: "단어학습", group: "학습" },
  { href: "/admin/listening", label: "듣기학습", group: "학습" },
  { href: "/admin/question-generator", label: "변형문제", group: "학습" },
  { href: "/admin/lesson-materials", label: "수업자료", group: "학습" },
  { href: "/admin/classes", label: "반 관리", group: "수업 운영" },
  { href: "/admin/students", label: "학생·수강", group: "수업 운영" },
  { href: "/admin/progress", label: "수강 현황", group: "수업 운영" },
  { href: "/admin/study-plans", label: "학습일정표", group: "수업 운영" },
  { href: "/admin/textbooks", label: "교재 목차", group: "수업 운영" },
  { href: "/admin/reports", label: "학습 리포트", group: "리포트" },
  { href: "/admin/exam-analysis", label: "내신 시험 분석", group: "리포트" },
  { href: "/admin/student-records", label: "학생부 분석", group: "리포트" },
  { href: "/admin/nelt", label: "NELT 성장 리포트", group: "리포트" },
  { href: "/admin/teachers", label: "강사 관리", group: "관리" },
  { href: "/admin/admins", label: "관리자 계정", group: "관리" },
  { href: "/admin/credits", label: "크레딧", group: "관리" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return (
    <DashboardLayout
      profile={profile}
      navItems={filterNavItems(
        (await isPersonalMember(profile.academy_id)) ? NAV_ITEMS.filter((i) => !TEAM_ONLY.has(i.href)) : NAV_ITEMS
      )}
    >
      <LowCreditBanner academyId={profile.academy_id} canCharge />
      <Suspense fallback={null}>
        <GuideBanner />
      </Suspense>
      {children}
    </DashboardLayout>
  );
}
