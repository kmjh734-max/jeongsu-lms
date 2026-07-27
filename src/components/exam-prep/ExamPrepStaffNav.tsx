import Link from "next/link";

const STAFF_LINKS = [
  { href: "dashboard", label: "클래스 대시보드" },
  { href: "passages", label: "지문 관리" },
  { href: "workbooks", label: "워크북 관리" },
  { href: "assignments", label: "학습 배정" },
  { href: "progress", label: "학습 현황" },
  { href: "wrong-answers", label: "오답 관리" },
] as const;

export function ExamPrepStaffNav({
  basePath,
  current,
}: {
  basePath: string;
  current?: string;
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-slate-200 pb-3">
      <Link
        href={basePath}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
          !current
            ? "bg-brand-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        홈
      </Link>
      {STAFF_LINKS.map((l) => {
        const active = current === l.href;
        return (
          <Link
            key={l.href}
            href={`${basePath}/${l.href}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
