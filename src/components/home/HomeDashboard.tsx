import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import type {
  HomeClassRow,
  HomeDashboardData,
  HomeTodoTone,
} from "@/lib/home/load-home";

const TONE: Record<HomeTodoTone, string> = {
  warn: "bg-amber-50 text-amber-700",
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-slate-100 text-slate-500",
};

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function StatCard({
  label,
  value,
  unit,
  unitTone = "text-slate-500",
  href,
}: {
  label: string;
  value: string;
  unit?: string;
  unitTone?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="text-[13px] text-slate-500">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[26px] font-bold tabular-nums tracking-tight text-slate-900">
          {value}
        </span>
        {unit ? <span className={`text-[13px] ${unitTone}`}>{unit}</span> : null}
      </div>
    </>
  );
  const cls =
    "block rounded-lg border border-slate-200 bg-white px-[18px] py-4 shadow-card";
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-slate-300`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Meter({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 sm:hidden">{label}</span>
        <span className="text-xs text-slate-300">—</span>
      </div>
    );
  }
  const low = value < 60;
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="text-xs text-slate-400 sm:hidden">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${low ? "bg-amber-700" : "bg-brand-600"}`}
            style={{ width: `${value === 0 ? 0 : Math.max(value, 3)}%` }}
          />
        </div>
        <span
          className={`w-9 text-right text-xs font-semibold tabular-nums ${
            low ? "text-amber-700" : "text-slate-900"
          }`}
        >
          {value}%
        </span>
      </div>
    </div>
  );
}

function ClassTable({ rows }: { rows: HomeClassRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-3 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        학생이 있는 반이 아직 없어요.
      </p>
    );
  }
  const grid = "sm:grid sm:grid-cols-[minmax(0,1fr)_1fr_1fr_1fr] sm:gap-3.5";
  return (
    <div className="mt-2.5 overflow-hidden rounded-lg border border-slate-200">
      <div
        className={`hidden border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 ${grid}`}
      >
        <span>반</span>
        <span>영상</span>
        <span>듣기</span>
        <span>단어</span>
      </div>
      <ul>
        {rows.map((r) => (
          <li
            key={r.id}
            className={`border-t border-slate-100 px-[18px] py-3 first:border-t-0 sm:items-center ${grid}`}
          >
            <div className="mb-2 flex min-w-0 items-baseline gap-2 sm:mb-0 sm:flex-col sm:items-start sm:gap-0">
              <span className="max-w-full truncate text-sm font-semibold text-slate-900" title={r.name}>{r.name}</span>
              <span className="text-xs text-slate-500">{r.studentCount}명</span>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:contents">
              <Meter value={r.video} label="영상" />
              <Meter value={r.listening} label="듣기" />
              <Meter value={r.vocab} label="단어" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function creditUnit(weeksLeft: number | null): { text: string; tone: string } | null {
  if (weeksLeft === null) return null;
  if (weeksLeft < 1) return { text: "· 1주 안에 다 써요", tone: "text-rose-700" };
  if (weeksLeft <= 12) return { text: `· 약 ${weeksLeft}주 사용분`, tone: "text-slate-500" };
  return { text: `· 약 ${Math.round(weeksLeft / 4.3)}개월 사용분`, tone: "text-slate-500" };
}

export function HomeDashboard({
  role,
  title,
  dateLabel,
  academyName,
  data,
}: {
  role: "admin" | "teacher";
  title: string;
  dateLabel: string;
  academyName: string;
  data: HomeDashboardData;
}) {
  const base = role === "admin" ? "/admin" : "/teacher";
  const listen = data.listeningToday;
  const credit = creditUnit(data.weeksLeft);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {dateLabel}
            {academyName ? ` · ${academyName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`${base}/students?new=1`} variant="secondary">
            <Icon name="plus" size={16} strokeWidth={2} />
            학생 등록
          </ButtonLink>
          <ButtonLink href={`${base}/lesson-materials/input`}>
            <Icon name="plus" size={16} strokeWidth={2} />
            새 지문 추가
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="학생"
          value={formatNumber(data.studentCount)}
          unit={data.newThisMonth > 0 ? `명 · 이번 달 +${data.newThisMonth}` : "명"}
          href={`${base}/students`}
        />
        <StatCard
          label="오늘 듣기 수행"
          value={listen.total > 0 ? String(Math.round((listen.done / listen.total) * 100)) : "—"}
          unit={listen.total > 0 ? `% · ${listen.done}/${listen.total}명` : "오늘 과제 없음"}
          href={`${base}/listening/status`}
        />
        <StatCard
          label="이번 주 단어 합격"
          value={formatNumber(data.vocabPassesThisWeek)}
          unit="건"
          href={`${base}/vocab/status`}
        />
        <StatCard
          label="남은 크레딧"
          value={data.balance === null ? "—" : formatNumber(data.balance)}
          unit={credit?.text}
          unitTone={credit?.tone}
          href={`${base}/credits`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white px-5 py-[18px] shadow-card sm:px-[22px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-slate-900">오늘 챙길 일</h2>
            {data.todos.length > 0 ? (
              <span className="text-xs tabular-nums text-slate-500">
                {data.todos.length}건
              </span>
            ) : null}
          </div>
          {data.todos.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-lg bg-slate-50 px-4 py-10 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
                <Icon name="check" size={18} strokeWidth={2.4} />
              </span>
              <p className="text-sm font-semibold text-slate-700">오늘은 챙길 일이 없어요</p>
            </div>
          ) : (
            <ul className="mt-1.5">
              {data.todos.map((t) => (
                <li
                  key={t.key}
                  className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0"
                >
                  <span
                    className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md ${TONE[t.tone]}`}
                  >
                    <Icon name={t.icon} size={17} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-900">{t.title}</span>
                    {t.sub ? (
                      <span className="truncate text-xs text-slate-500">{t.sub}</span>
                    ) : null}
                  </div>
                  <ButtonLink href={t.href} variant="secondary" size="sm" className="shrink-0">
                    {t.actionLabel}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white px-5 py-[18px] shadow-card sm:px-[22px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-slate-900">반별 이번 주</h2>
            <Link
              href={`${base}/classes`}
              className="text-[13px] font-semibold text-brand-700 hover:underline"
            >
              반 관리
            </Link>
          </div>
          <ClassTable rows={data.classRows} />
        </section>
      </div>
    </div>
  );
}
