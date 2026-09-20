import { redirect } from "next/navigation";
import { filterNavItems } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnglishKeypad } from "@/components/ui/EnglishKeypad";

const NAV_ITEMS = [
  { href: "/student", label: "내 강의실" },
  { href: "/student/courses", label: "수강 강좌" },
  { href: "/student/vocab", label: "단어학습" },
  { href: "/student/listening", label: "듣기학습" },
  { href: "/student/plan", label: "학습일정표" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  if (profile.is_active === false) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?inactive=1");
  }

  // 스스로 가입한 학생은 학원이 확인할 때까지 기다리는 화면만 본다
  if ((profile as { approved_at?: string | null }).approved_at === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-900">학원에서 확인하는 중이에요</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profile.name} 학생, 가입 신청이 들어갔어요. 학원 선생님이 확인하면 바로 공부를 시작할 수 있어요.
            급하면 다니는 학원에 말씀해 주세요.
          </p>
          <a href="/login" className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline">
            로그인 화면으로
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile} navItems={filterNavItems(NAV_ITEMS)}>
      {children}
      {/* 휴대폰에서 영어 답 칸에 뜨는 자체 자판(키보드 추천 단어 막기) */}
      <EnglishKeypad />
    </DashboardLayout>
  );
}
