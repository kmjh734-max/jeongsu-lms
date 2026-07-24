import { redirect } from "next/navigation";
import { filterNavItems } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const NAV_ITEMS = [
  { href: "/teacher", label: "강사 홈" },
  { href: "/teacher/courses", label: "동영상강좌 관리", group: "학습" },
  { href: "/teacher/vocab", label: "단어학습", group: "학습" },
  { href: "/teacher/listening", label: "듣기학습", group: "학습" },
  { href: "/teacher/question-generator", label: "AI 변형문제", group: "학습" },
  { href: "/teacher/classes", label: "반 관리", group: "수업 운영" },
  { href: "/teacher/students", label: "학생 관리", group: "수업 운영" },
  { href: "/teacher/progress", label: "수강 현황", group: "수업 운영" },
  { href: "/teacher/reports", label: "학습 리포트", group: "리포트" },
  { href: "/teacher/student-records", label: "학생부 분석", group: "리포트" },
  { href: "/teacher/nelt", label: "NELT 성장 리포트", group: "리포트" },
  { href: "/teacher/credits", label: "크레딧", group: "관리" },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "teacher") {
    redirect("/login");
  }

  if (profile.is_active === false) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?inactive=1");
  }

  return (
    <DashboardLayout profile={profile} navItems={filterNavItems(NAV_ITEMS)}>
      {children}
    </DashboardLayout>
  );
}
