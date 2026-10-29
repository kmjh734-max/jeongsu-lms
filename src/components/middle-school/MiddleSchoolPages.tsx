import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isMiddleSchoolOpen, loadMsQuestions, loadMsUnit, loadMsUnits } from "@/lib/middle-school/queries";
import { loadAcademyName } from "@/lib/grammar-bank/academy-name";
import { MiddleSchoolHome } from "./MiddleSchoolHome";
import { MiddleSchoolUnitWorkspace } from "./MiddleSchoolUnitWorkspace";

/** 관리자·강사 화면이 같이 쓰는 중학교 수업자료 쪽(base = /admin/middle-school 등) */
export async function MiddleSchoolHomePage({ base }: { base: string }) {
  const profile = await getCurrentProfile();
  if (!profile?.academy_id || !(await isMiddleSchoolOpen(profile.academy_id))) notFound();
  const units = await loadMsUnits(profile.academy_id);
  return (
    <div className="space-y-4 p-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">중학교 수업자료</h1>
        <p className="mt-1 text-sm text-slate-500">학년과 교과서, 과를 고르면 그 과의 단어·문법·대화문·본문으로 자료를 만듭니다.</p>
      </header>
      <MiddleSchoolHome units={units} base={base} />
    </div>
  );
}

export async function MiddleSchoolUnitPage({ base, unitId }: { base: string; unitId: string }) {
  const profile = await getCurrentProfile();
  if (!profile?.academy_id || !(await isMiddleSchoolOpen(profile.academy_id))) notFound();
  const [unit, academyName] = await Promise.all([
    loadMsUnit(profile.academy_id, unitId),
    loadAcademyName(profile.academy_id),
  ]);
  if (!unit) notFound();
  const questions = await loadMsQuestions(unit.id);
  return (
    <div className="space-y-4 p-6">
      <header className="no-print">
        <Link href={base} className="text-sm text-violet-700">← 과 목록</Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          {unit.grade} {unit.publisher} {unit.lessonNo}과 <span className="text-slate-500">· {unit.title}</span>
        </h1>
      </header>
      <MiddleSchoolUnitWorkspace unit={unit} questions={questions} academyName={academyName ?? ""} />
    </div>
  );
}
