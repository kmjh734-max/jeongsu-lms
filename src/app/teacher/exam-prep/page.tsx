import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";

const BASE = "/teacher/exam-prep";

const LINKS = [
  { href: "passages", label: "지문 관리", desc: "본문 등록 · 문장 분리 · 해석" },
  { href: "workbooks", label: "워크북 관리", desc: "프리셋 생성 · 문항 검수 · 승인" },
  { href: "assignments", label: "학습 배정", desc: "학생·반에 워크북 배정" },
  { href: "progress", label: "학습 현황", desc: "진행률 · 점수 · 응시 기록" },
  { href: "wrong-answers", label: "오답 관리", desc: "학생 오답 모아보기" },
] as const;

export default async function TeacherExamPrepHubPage() {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") redirect("/login");

  return (
    <div>
      <PageHeader
        title="내신대비학습"
        description="지문·워크북·배정·현황을 관리합니다."
      />
      <ExamPrepStaffNav basePath={BASE} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={`${BASE}/${l.href}`}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">{l.label}</h2>
            <p className="mt-1 text-sm text-slate-600">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
