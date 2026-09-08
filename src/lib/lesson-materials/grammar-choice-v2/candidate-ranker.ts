import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  GrammarPriority,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

const RANK: Record<GrammarPriority, number> = {
  MANDATORY: 0,
  CORE: 1,
  BASIC: 2,
};

const MAX_ITEMS = 24;
const MAX_ADJ_ADV = 2;

export function rankCandidates(
  items: ResolvedCandidate[]
): { kept: ResolvedCandidate[]; dropped: Array<{ item: ResolvedCandidate; reason: string }> } {
  const sorted = [...items].sort((a, b) => {
    const pr = RANK[a.priority] - RANK[b.priority];
    if (pr !== 0) return pr;
    if (a.passageStart !== b.passageStart) return a.passageStart - b.passageStart;
    return a.candidateId.localeCompare(b.candidateId);
  });

  const kept: ResolvedCandidate[] = [];
  const dropped: Array<{ item: ResolvedCandidate; reason: string }> = [];
  const subtypeCount = new Map<string, number>();
  let adjAdv = 0;

  for (const item of sorted) {
    const def = ontologyPoint(item.pointCode);
    const priority = def?.priority ?? item.priority;
    const subtypeLimit = priority === "BASIC" ? 1 : priority === "CORE" ? 2 : 3;
    const used = subtypeCount.get(item.subtypeKey) ?? 0;
    if (used >= subtypeLimit) {
      dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
      continue;
    }
    if (item.transformCode === "ADJ_ADV") {
      if (adjAdv >= MAX_ADJ_ADV) {
        dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
        continue;
      }
    }
    const overlap = kept.some(
      (k) =>
        item.passageStart < k.passageEnd && item.passageEnd > k.passageStart
    );
    if (overlap) {
      dropped.push({ item, reason: "OVERLAPPING_SPAN" });
      continue;
    }
    kept.push({ ...item, priority });
    subtypeCount.set(item.subtypeKey, used + 1);
    if (item.transformCode === "ADJ_ADV") adjAdv += 1;
  }

  if (kept.length <= MAX_ITEMS) return { kept, dropped };

  const overflow = kept.slice(MAX_ITEMS);
  for (const item of overflow) {
    dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
  }
  return { kept: kept.slice(0, MAX_ITEMS), dropped };
}

export function priorityRank(priority: GrammarPriority): number {
  return RANK[priority];
}
