"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ListeningSidebarProps {
  role: "admin" | "teacher";
}

const NAV_ITEMS = [
  { suffix: "sets", label: "듣기세트 만들기", icon: "🎧" },
  { suffix: "assign", label: "듣기세트 배정하기", icon: "📅" },
  { suffix: "status", label: "듣기학습 현황", icon: "📊" },
] as const;

const RESERVED = new Set(["sets", "assign", "status", "schedules"]);

function isSetsSectionActive(pathname: string, base: string): boolean {
  if (pathname === `${base}/sets`) return true;
  if (!pathname.startsWith(`${base}/`)) return false;
  const rest = pathname.slice(base.length + 1);
  const segment = rest.split("/")[0] ?? "";
  if (!segment || RESERVED.has(segment)) return false;
  return true;
}

export function ListeningSidebar({ role }: ListeningSidebarProps) {
  const pathname = usePathname();
  const base = role === "admin" ? "/admin/listening" : "/teacher/listening";
  const activeClass =
    "bg-indigo-50 font-semibold text-indigo-900 ring-1 ring-indigo-200/80";

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:w-64">
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          듣기학습
        </p>
        <p className="mt-1 text-sm text-slate-600">세트 · 배정 · 현황</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item, index) => {
          const href = `${base}/${item.suffix}`;
          const active =
            item.suffix === "sets"
              ? isSetsSectionActive(pathname, base)
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.suffix}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                active
                  ? activeClass
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span>
                <span className="text-xs text-slate-500">{index + 1}.</span>{" "}
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
