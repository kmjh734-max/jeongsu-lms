import { createAdminClient } from "@/lib/supabase/admin";
import { featureLabel, usedForLabel } from "@/lib/credits/feature-labels";
import { usageWon } from "@/lib/ai-usage/model-price";

export type UsageRow = {
  key: string;
  label: string;
  calls: number;
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
  /** 단가를 아는 호출만 더한 원가 */
  costWon: number;
  /** 단가를 모르는 호출 수 */
  unknownCalls: number;
  /** 같은 기간에 크레딧으로 받은 값 */
  chargedCredits: number;
};

export type UsagePageData = {
  from: string;
  to: string;
  days: number;
  byFeature: UsageRow[];
  byModel: UsageRow[];
  byAcademy: UsageRow[];
  totals: { calls: number; costWon: number; chargedCredits: number; unknownCalls: number };
  /** 단가를 몰라 원가를 못 센 모델 이름 */
  unknownModels: string[];
  /** 아직 기록이 하나도 없으면 안내를 띄운다 */
  empty: boolean;
};

type Raw = {
  feature_key: string | null;
  used_for: string | null;
  model: string;
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
  academy_id: string | null;
};

function blank(key: string, label: string): UsageRow {
  return {
    key,
    label,
    calls: 0,
    inputTokens: 0,
    cachedTokens: 0,
    outputTokens: 0,
    costWon: 0,
    unknownCalls: 0,
    chargedCredits: 0,
  };
}

function add(row: UsageRow, r: Raw): void {
  row.calls += 1;
  row.inputTokens += r.input_tokens;
  row.cachedTokens += r.cached_input_tokens;
  row.outputTokens += r.output_tokens;
  const won = usageWon(r);
  if (won === null) row.unknownCalls += 1;
  else row.costWon += won;
}

/**
 * 슈퍼관리자용 모델 사용량. 기능·모델·학원으로 묶어, 같은 기간에 받은 크레딧과 나란히 둔다.
 * 원가를 아는 호출만 더하고, 모르는 모델은 개수만 따로 센다.
 */
export async function loadAiUsagePage(days = 30): Promise<UsagePageData> {
  const admin = createAdminClient();
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);

  const [{ data: logs }, { data: txns }, { data: academies }] = await Promise.all([
    admin
      .from("ai_usage_logs")
      .select("feature_key, used_for, model, input_tokens, cached_input_tokens, output_tokens, academy_id")
      .gte("created_at", from.toISOString())
      .limit(50_000),
    admin
      .from("credit_transactions")
      .select("feature_key, amount, academy_id")
      .eq("type", "debit")
      .gte("created_at", from.toISOString())
      .limit(50_000),
    admin.from("academies").select("id, name"),
  ]);

  const rows = (logs ?? []) as Raw[];
  const acName = new Map((academies ?? []).map((a) => [a.id as string, a.name as string]));

  const byFeature = new Map<string, UsageRow>();
  const byModel = new Map<string, UsageRow>();
  const byAcademy = new Map<string, UsageRow>();
  const unknownModels = new Set<string>();

  for (const r of rows) {
    const fKey = r.feature_key ?? "(값 없는 호출)";
    const where = usedForLabel(r.used_for);
    const fLabel = r.feature_key
      ? `${where ? `${where} · ` : ""}${featureLabel(r.feature_key, null)}`
      : "값을 받지 않는 호출";
    if (!byFeature.has(fKey)) byFeature.set(fKey, blank(fKey, fLabel));
    add(byFeature.get(fKey)!, r);

    if (!byModel.has(r.model)) byModel.set(r.model, blank(r.model, r.model));
    add(byModel.get(r.model)!, r);
    if (usageWon(r) === null) unknownModels.add(r.model);

    const aKey = r.academy_id ?? "-";
    if (!byAcademy.has(aKey)) byAcademy.set(aKey, blank(aKey, acName.get(aKey) ?? "학원 모름"));
    add(byAcademy.get(aKey)!, r);
  }

  for (const t of txns ?? []) {
    const amount = Number(t.amount ?? 0);
    const f = byFeature.get((t.feature_key as string) ?? "");
    if (f) f.chargedCredits += amount;
    const a = byAcademy.get((t.academy_id as string) ?? "-");
    if (a) a.chargedCredits += amount;
  }

  const sort = (m: Map<string, UsageRow>) =>
    [...m.values()].sort((x, y) => y.costWon - x.costWon || y.calls - x.calls);

  const list = sort(byFeature);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    days,
    byFeature: list,
    byModel: sort(byModel),
    byAcademy: sort(byAcademy),
    totals: {
      calls: rows.length,
      costWon: list.reduce((n, r) => n + r.costWon, 0),
      chargedCredits: list.reduce((n, r) => n + r.chargedCredits, 0),
      unknownCalls: list.reduce((n, r) => n + r.unknownCalls, 0),
    },
    unknownModels: [...unknownModels],
    empty: rows.length === 0,
  };
}
