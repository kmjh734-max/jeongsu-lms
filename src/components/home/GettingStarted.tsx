import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { GUIDE_STEPS } from "@/lib/onboarding-guide";

/**
 * 원장님 홈 맨 위 "시작하기" — 새로 가입한 학원·개인회원이 무엇부터 할지 알려 준다.
 * 네 가지를 다 하면 사라진다. 잔액으로 무엇을 몇 번 만들 수 있는지도 보여 준다.
 */
export async function GettingStarted({ academyId }: { academyId: string | null }) {
  if (!academyId) return null;
  const admin = createAdminClient();

  const [{ count: classCount }, { data: students }, { count: materialCount }, { data: wallet }, { data: pricing }] =
    await Promise.all([
      admin.from("classes").select("id", { count: "exact", head: true }).eq("academy_id", academyId).eq("is_active", true),
      admin.from("profiles").select("id").eq("academy_id", academyId).eq("role", "student").limit(500),
      admin.from("lesson_material_projects").select("id", { count: "exact", head: true }).eq("academy_id", academyId),
      admin.from("academy_wallets").select("balance").eq("academy_id", academyId).maybeSingle(),
      admin
        .from("feature_pricing")
        .select("feature_key, credit_cost")
        .in("feature_key", ["lesson_one_page", "lesson_analysis_report", "qg_generate_job"]),
    ]);

  const studentIds = (students ?? []).map((s) => s.id as string);
  let assigned = false;
  if (studentIds.length) {
    const [{ count: v }, { count: l }] = await Promise.all([
      admin.from("vocab_assignments").select("id", { count: "exact", head: true }).in("student_id", studentIds.slice(0, 200)),
      admin.from("listening_assignments").select("id", { count: "exact", head: true }).in("student_id", studentIds.slice(0, 200)),
    ]);
    assigned = (v ?? 0) + (l ?? 0) > 0;
  }

  const steps = [
    { done: (classCount ?? 0) > 0, title: "반 만들기", body: "수업 단위로 반을 만들어요. 개인 과외라면 학생마다 하나씩 만들어도 돼요.", href: GUIDE_STEPS[0].href, cta: "반 만들기" },
    { done: studentIds.length > 0, title: "학생 등록", body: "학생 아이디를 만들어 반에 넣어요. 학생은 휴대폰으로 로그인해 공부해요.", href: GUIDE_STEPS[1].href, cta: "학생 등록" },
    { done: assigned, title: "단어·듣기 배정", body: "초등~수능 단어장과 학년별 듣기 문제를 반이나 학생에게 배정해요.", href: GUIDE_STEPS[2].href, cta: "배정하기" },
    { done: (materialCount ?? 0) > 0, title: "수업자료 만들어 보기", body: "지문을 넣으면 분석서·워크북·1장 자료가 나와요.", href: GUIDE_STEPS[3].href, cta: "자료 만들기" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;
  const currentIndex = steps.findIndex((s) => !s.done);

  const balance = Number(wallet?.balance ?? 0);
  const cost = new Map((pricing ?? []).map((p) => [p.feature_key as string, Number(p.credit_cost)]));
  const canMake = [
    ["1장 자료", cost.get("lesson_one_page")],
    ["지문 분석서", cost.get("lesson_analysis_report")],
    ["변형문제", cost.get("qg_generate_job"), "문항"],
  ]
    .filter(([, c]) => typeof c === "number" && (c as number) > 0)
    .map(([name, c, unit]) => `${name} ${Math.floor(balance / (c as number))}${unit ?? "개"}`);

  return (
    <section className="mb-5 rounded-xl border border-brand-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">
          시작하기 <span className="ml-1 text-sm font-semibold text-brand-700">{doneCount}/{steps.length}</span>
        </h2>
        {balance > 0 ? (
          <p className="text-xs text-slate-500">
            지금 잔액 <b className="text-slate-800">{balance.toLocaleString("ko-KR")}크레딧</b>
            {canMake.length ? ` · ${canMake.join(" · ")} 만들 수 있어요` : ""}
          </p>
        ) : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ol className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={`flex flex-col gap-1.5 rounded-lg border p-3.5 ${
              s.done
                ? "border-emerald-200 bg-emerald-50/60"
                : i === currentIndex
                  ? "border-brand-400 bg-brand-50/60 ring-1 ring-brand-200"
                  : "border-slate-200"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  s.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.done ? "✓" : i + 1}
              </span>
              {s.title}
            </p>
            <p className="text-xs leading-5 text-slate-600">{s.body}</p>
            {s.done ? (
              <p className="mt-auto text-xs font-semibold text-emerald-700">완료</p>
            ) : i === currentIndex ? (
              <Link
                href={s.href}
                className="mt-auto self-start rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                지금 하기 · {s.cta} →
              </Link>
            ) : (
              <Link href={s.href} className="mt-auto text-xs font-semibold text-brand-700 hover:underline">
                {s.cta} →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
