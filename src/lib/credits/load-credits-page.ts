import type { SupabaseClient } from "@supabase/supabase-js";
import { getKoreaYearMonth, parseKoreaMonthParam } from "@/lib/date/korea-today";
import { fetchPagesParallel } from "@/lib/fetch-pages";
import {
  cleanCreditText,
  featureGroup,
  featureLabel,
  featurePriceUnit,
  featureUsageText,
} from "@/lib/credits/feature-labels";

export type CreditKind = "use" | "charge" | "grant" | "adjust" | "refund";

export interface CreditTxnView {
  id: string;
  createdAt: string;
  kind: CreditKind;
  /** 부호 포함 (+ 들어옴, − 나감) */
  delta: number;
  balanceAfter: number;
  text: string;
}

export interface CreditReceiptView {
  id: string;
  at: string;
  name: string;
  paymentAmount: number;
  totalCredit: number;
  bonusCredit: number;
  status: string;
  receiptUrl: string | null;
}

export interface CreditPriceView {
  key: string;
  label: string;
  unit: string;
  cost: number;
}

export interface CreditsPageData {
  balance: number;
  thisMonth: { year: number; month: number; used: number; charged: number };
  /** 이번 달 쓰는 속도로 남은 크레딧을 쓸 수 있는 주 수 */
  weeksLeft: number | null;
  usageGroups: { label: string; amount: number }[];
  selectedMonth: string;
  monthOptions: { value: string; label: string }[];
  transactions: CreditTxnView[];
  receipts: CreditReceiptView[] | null;
  prices: CreditPriceView[];
}

type RawTxn = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  feature_key: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthStartUtc(year: number, month: number): string {
  return new Date(`${monthKey(year, month)}-01T00:00:00+09:00`).toISOString();
}

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function toKind(t: RawTxn): { kind: CreditKind; sign: 1 | -1 } {
  switch (t.type) {
    case "debit":
      return { kind: "use", sign: -1 };
    case "charge":
      return { kind: "charge", sign: 1 };
    case "grant":
      return { kind: "grant", sign: 1 };
    case "refund":
      return { kind: "refund", sign: -1 };
    default:
      return {
        kind: "adjust",
        sign: (t.metadata?.direction as string | undefined) === "debit" ? -1 : 1,
      };
  }
}

async function loadMonthTxns(
  supabase: SupabaseClient,
  academyId: string,
  year: number,
  month: number
): Promise<RawTxn[]> {
  const next = nextMonth(year, month);
  try {
    // 한 달 거래가 1000건을 넘으면 나머지 쪽은 차례로가 아니라 동시에 읽는다
    return await fetchPagesParallel<RawTxn>((from, to, withCount) =>
      supabase
        .from("credit_transactions")
        .select(
          "id, type, amount, balance_after, feature_key, note, metadata, created_at",
          withCount ? { count: "exact" } : undefined
        )
        .eq("academy_id", academyId)
        .gte("created_at", monthStartUtc(year, month))
        .lt("created_at", monthStartUtc(next.year, next.month))
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to)
    );
  } catch {
    return [];
  }
}

export async function loadCreditsPageData(
  supabase: SupabaseClient,
  opts: { academyId: string; monthParam?: string; canCharge: boolean }
): Promise<CreditsPageData> {
  const now = getKoreaYearMonth();
  const selected = parseKoreaMonthParam(opts.monthParam, now);
  const isCurrent = selected.year === now.year && selected.month === now.month;

  const [walletRes, currentTxns, selectedTxns, pricingRes, ordersRes] = await Promise.all([
    supabase
      .from("academy_wallets")
      .select("balance")
      .eq("academy_id", opts.academyId)
      .maybeSingle(),
    loadMonthTxns(supabase, opts.academyId, now.year, now.month),
    isCurrent
      ? Promise.resolve(null)
      : loadMonthTxns(supabase, opts.academyId, selected.year, selected.month),
    supabase
      .from("feature_pricing")
      .select("feature_key, label, credit_cost, billing_type")
      .eq("is_active", true)
      .order("feature_key"),
    opts.canCharge
      ? supabase
          .from("credit_payment_orders")
          .select(
            "id, payment_amount, bonus_credit, total_credit, status, receipt_url, approved_at, created_at, package:credit_packages(name)"
          )
          .eq("academy_id", opts.academyId)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: null }),
  ]);

  const balance = Number(walletRes.data?.balance ?? 0);
  const dbLabels = new Map<string, string>();
  for (const p of pricingRes.data ?? []) {
    dbLabels.set(p.feature_key as string, p.label as string);
  }

  type OrderRow = {
    id: string;
    payment_amount: number;
    bonus_credit: number;
    total_credit: number;
    status: string;
    receipt_url: string | null;
    approved_at: string | null;
    created_at: string;
    package: { name: string } | { name: string }[] | null;
  };
  const orders = (ordersRes.data ?? null) as OrderRow[] | null;
  const packageNameByOrder = new Map<string, string>();
  const receipts: CreditReceiptView[] | null = orders
    ? orders.map((o) => {
        const pkg = Array.isArray(o.package) ? o.package[0] : o.package;
        const name = pkg?.name ? cleanCreditText(pkg.name) : "크레딧 충전";
        packageNameByOrder.set(o.id, name);
        return {
          id: o.id,
          at: o.approved_at || o.created_at,
          name,
          paymentAmount: Number(o.payment_amount),
          totalCredit: Number(o.total_credit),
          bonusCredit: Number(o.bonus_credit),
          status: o.status,
          receiptUrl: o.receipt_url,
        };
      })
    : null;

  function view(t: RawTxn): CreditTxnView {
    const { kind, sign } = toKind(t);
    const meta = t.metadata ?? {};
    let text: string;
    if (kind === "use") {
      const qty = Number(meta.quantity ?? 0) || null;
      text = featureUsageText(t.feature_key, qty, t.feature_key ? dbLabels.get(t.feature_key) : null);
    } else if (kind === "charge") {
      const bonus = Number(meta.bonus_credit ?? 0);
      const orderId = meta.payment_order_id as string | undefined;
      const name = (orderId && packageNameByOrder.get(orderId)) || "크레딧 충전";
      text = bonus > 0 ? `${name} (보너스 +${bonus.toLocaleString("ko-KR")})` : name;
    } else if (kind === "refund") {
      text = "결제 취소";
    } else if (kind === "grant") {
      text = (t.note && cleanCreditText(t.note)) || "크레딧 지급";
    } else {
      const note = t.note && !["grant", "debit"].includes(t.note) ? cleanCreditText(t.note) : "";
      text = note || (t.feature_key ? featureLabel(t.feature_key, dbLabels.get(t.feature_key)) : "잔액 조정");
    }
    return {
      id: t.id,
      createdAt: t.created_at,
      kind,
      delta: sign * Number(t.amount),
      balanceAfter: Number(t.balance_after),
      text,
    };
  }

  // 이번 달 요약
  let used = 0;
  let charged = 0;
  const groups = new Map<string, number>();
  for (const t of currentTxns) {
    const { kind, sign } = toKind(t);
    const amount = Number(t.amount);
    if (kind === "use" || (kind === "adjust" && sign < 0)) {
      used += amount;
      const g = kind === "use" ? featureGroup(t.feature_key) : "기타";
      groups.set(g, (groups.get(g) ?? 0) + amount);
    } else if (kind === "charge" || kind === "grant") {
      charged += amount;
    }
  }
  const sortedGroups = [...groups.entries()]
    .filter(([label]) => label !== "기타")
    .sort((a, b) => b[1] - a[1]);
  const other =
    (groups.get("기타") ?? 0) + sortedGroups.slice(5).reduce((s, [, v]) => s + v, 0);
  const usageGroups = sortedGroups.slice(0, 5).map(([label, amount]) => ({ label, amount }));
  if (other > 0) usageGroups.push({ label: "기타", amount: other });

  const dayOfMonth = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", day: "2-digit" }).format(new Date())
  );
  const perWeek = (used / Math.max(dayOfMonth, 1)) * 7;
  const weeksLeft = used > 0 && perWeek > 0 ? Math.floor(balance / perWeek) : null;

  const monthOptions: { value: string; label: string }[] = [];
  let y = now.year;
  let m = now.month;
  for (let i = 0; i < 12; i++) {
    monthOptions.push({ value: monthKey(y, m), label: `${y}년 ${m}월` });
    if (m === 1) {
      y -= 1;
      m = 12;
    } else m -= 1;
  }
  const selectedKey = monthKey(selected.year, selected.month);
  if (!monthOptions.some((o) => o.value === selectedKey)) {
    monthOptions.push({ value: selectedKey, label: `${selected.year}년 ${selected.month}월` });
  }

  const prices: CreditPriceView[] = (pricingRes.data ?? [])
    .filter((p) => Number(p.credit_cost) > 0)
    .map((p) => ({
      key: p.feature_key as string,
      label: featureLabel(p.feature_key as string, p.label as string),
      unit: featurePriceUnit(p.feature_key as string, p.billing_type as string),
      cost: Number(p.credit_cost),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ko"));

  return {
    balance,
    thisMonth: { year: now.year, month: now.month, used, charged },
    weeksLeft,
    usageGroups,
    selectedMonth: selectedKey,
    monthOptions,
    transactions: (selectedTxns ?? currentTxns).map(view),
    receipts,
    prices,
  };
}
