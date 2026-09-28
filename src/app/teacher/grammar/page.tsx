import { notFound } from "next/navigation";
import { GrammarBankClient } from "@/components/grammar-bank/GrammarBankClient";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isGrammarBankOpen, loadGrammarChapters } from "@/lib/grammar-bank/queries";
import { loadAcademyName } from "@/lib/grammar-bank/academy-name";

export default async function TeacherGrammarPage() {
  const profile = await getCurrentProfile();
  if (!(await isGrammarBankOpen(profile?.academy_id))) notFound();

  const [groups, academyName] = await Promise.all([
    loadGrammarChapters(),
    loadAcademyName(profile?.academy_id),
  ]);

  return (
    <div className="space-y-4 p-6">
      <header className="no-print">
        <h1 className="text-xl font-bold text-slate-900">문법 문제 은행</h1>
        <p className="mt-1 text-sm text-slate-500">
          레벨과 단원을 골라 문항을 담고, 서식을 골라 시험지로 뽑습니다.
        </p>
      </header>
      <GrammarBankClient groups={groups} academyName={academyName} />
    </div>
  );
}
