import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  ExactSentence,
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

export function sortStudentPresentationOrder<T extends {
  passageStart: number;
  passageEnd: number;
  candidateId: string;
}>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.passageStart !== b.passageStart) return a.passageStart - b.passageStart;
    if (a.passageEnd !== b.passageEnd) return a.passageEnd - b.passageEnd;
    return a.candidateId.localeCompare(b.candidateId);
  });
}

export function rankCandidates(
  items: ResolvedCandidate[],
  sentenceCount = 24,
  sentences: ExactSentence[] = []
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
  const conditionalSentence = new Set<string>();
  let adjAdv = 0;
  let indirectQuestions = 0;

  for (const item of sorted) {
    const def = ontologyPoint(item.pointCode);
    const priority = item.priority ?? def?.priority ?? "CORE";
    const subtypeLimit = priority === "BASIC" ? 1 : priority === "CORE" ? 2 : 3;
    const used = subtypeCount.get(item.subtypeKey) ?? 0;
    if (item.pointCode === "INDIRECT_QUESTION_ORDER" && indirectQuestions >= 1) {
      dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
      continue;
    }
    if (item.pointCode.startsWith("CONDITIONAL_") && conditionalSentence.has(`${item.sentenceId}|${item.pointCode}`)) {
      dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
      continue;
    }
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
    if (item.pointCode === "INDIRECT_QUESTION_ORDER") indirectQuestions += 1;
    if (item.pointCode.startsWith("CONDITIONAL_")) {
      conditionalSentence.add(`${item.sentenceId}|${item.pointCode}`);
    }
    if (item.transformCode === "ADJ_ADV") adjAdv += 1;
  }

  const clauseFiltered = applyClauseQuality(kept, dropped, sentences);
  const cap = Math.min(sentenceCount * 2, MAX_ITEMS);
  const nonBasic = clauseFiltered.filter((item) => item.priority !== "BASIC");
  const basicCap = Math.floor(nonBasic.length / 3);
  let basicUsed = 0;
  const limited: ResolvedCandidate[] = [];
  for (const item of clauseFiltered) {
    if (item.priority === "BASIC") {
      if (basicUsed >= basicCap) {
        dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
        continue;
      }
      basicUsed += 1;
    }
    limited.push(item);
  }
  if (limited.length <= cap) return { kept: limited, dropped };

  const overflow = limited.slice(cap);
  for (const item of overflow) {
    dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
  }
  return { kept: limited.slice(0, cap), dropped };
}

export function priorityRank(priority: GrammarPriority): number {
  return RANK[priority];
}

function applyClauseQuality(
  items: ResolvedCandidate[],
  dropped: Array<{ item: ResolvedCandidate; reason: string }>,
  sentences: ExactSentence[]
): ResolvedCandidate[] {
  const bySentence = new Map(sentences.map((sentence) => [sentence.sentenceId, sentence]));
  const survivors = dropInterdependent(items, dropped, bySentence);
  return dropOverdenseClauses(survivors, dropped, bySentence);
}

function dropInterdependent(
  items: ResolvedCandidate[],
  dropped: Array<{ item: ResolvedCandidate; reason: string }>,
  sentences: Map<string, ExactSentence>
): ResolvedCandidate[] {
  const kept: ResolvedCandidate[] = [];
  for (const item of items) {
    const coupled = kept.find((other) =>
      judgmentsAffectEachOther(other, item, sentences.get(item.sentenceId))
    );
    if (coupled) {
      dropped.push({ item, reason: "INTERDEPENDENT_CHOICES" });
      continue;
    }
    kept.push(item);
  }
  return kept;
}

function dropOverdenseClauses(
  items: ResolvedCandidate[],
  dropped: Array<{ item: ResolvedCandidate; reason: string }>,
  sentences: Map<string, ExactSentence>
): ResolvedCandidate[] {
  const groups = new Map<string, ResolvedCandidate[]>();
  for (const item of items) {
    const sentence = sentences.get(item.sentenceId);
    const key = sentence
      ? `${item.sentenceId}:${clauseIndex(sentence, item.passageStart)}`
      : item.sentenceId;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const blocked = new Set<string>();
  for (const group of groups.values()) {
    if (group.length < 3) continue;
    if (!isShortOrClustered(group, sentences)) continue;
    const ranked = [...group].sort((a, b) => {
      const pr = RANK[a.priority] - RANK[b.priority];
      if (pr !== 0) return pr;
      return a.passageStart - b.passageStart;
    });
    for (const extra of ranked.slice(2)) blocked.add(itemId(extra));
  }

  const kept: ResolvedCandidate[] = [];
  for (const item of items) {
    if (blocked.has(itemId(item))) {
      dropped.push({ item, reason: "OVERDENSE_CLAUSE" });
      continue;
    }
    kept.push(item);
  }
  return kept;
}

function judgmentsAffectEachOther(
  earlier: ResolvedCandidate,
  later: ResolvedCandidate,
  sentence: ExactSentence | undefined
): boolean {
  if (earlier.sentenceId !== later.sentenceId) return false;
  if (later.passageStart < earlier.passageEnd && later.passageEnd > earlier.passageStart) {
    return true;
  }
  const a = earlier.sourceSpan.trim();
  const b = later.sourceSpan.trim();
  if (a && b && a !== b && (containsToken(a, b) || containsToken(b, a))) return true;
  if (!sentence) return false;
  const left = earlier.passageStart <= later.passageStart ? earlier : later;
  const right = left === earlier ? later : earlier;
  if (!isRelativePronoun(left.sourceSpan) || !isAgreementVerb(right.sourceSpan)) {
    return false;
  }
  const between = sentence.text.slice(
    Math.max(0, left.passageEnd - sentence.passageStart),
    Math.max(0, right.passageStart - sentence.passageStart)
  );
  return right.passageStart >= left.passageEnd && between.trim().split(/\s+/).filter(Boolean).length <= 1;
}

function clauseIndex(sentence: ExactSentence, passageStart: number): number {
  const local = Math.max(0, passageStart - sentence.passageStart);
  const head = sentence.text.slice(0, local);
  const breaks = head.match(/[,;:—–]/g);
  return breaks?.length ?? 0;
}

function containsToken(text: string, token: string): boolean {
  if (!token || token.length < 3) return false;
  return new RegExp(`(?:^|\\W)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|\\W)`, "i").test(text);
}

function isShortOrClustered(
  group: ResolvedCandidate[],
  sentences: Map<string, ExactSentence>
): boolean {
  const sentence = sentences.get(group[0]!.sentenceId);
  if (!sentence) return false;
  const starts = group.map((item) => item.passageStart).sort((a, b) => a - b);
  const span = starts[starts.length - 1]! - starts[0]!;
  if (span <= 36) return true;
  const local = Math.max(0, starts[0]! - sentence.passageStart);
  const headBreaks = sentence.text.slice(0, local).match(/[,;:—–]/g)?.length ?? 0;
  const parts = sentence.text.split(/[,;:—–]/);
  const clause = parts[headBreaks] ?? sentence.text;
  return clause.trim().split(/\s+/).filter(Boolean).length <= 14;
}

function isRelativePronoun(span: string): boolean {
  return /^(who|whom|which|that)$/i.test(span.trim());
}

function isAgreementVerb(span: string): boolean {
  return /^(is|are|was|were|has|have)$/i.test(span.trim());
}

function itemId(item: ResolvedCandidate): string {
  return item.candidateId;
}
