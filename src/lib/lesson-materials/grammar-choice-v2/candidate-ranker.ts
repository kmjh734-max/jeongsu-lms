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

/**
 * 지문 하나의 문항 상한.
 *
 * 한 문장에 문법 지점이 여럿 들어 있는 것이 정상이므로, 문장 수 x 2 / 24개라는
 * 예전 상한은 문장당 하나꼴로 눌러 놓는 값이었다. 문장 수 x 3 / 36개로 올린다.
 * 자리가 겹치는 후보는 아래 overlap 검사가 그대로 막으므로, 같은 네모가 두 번
 * 나오지는 않는다.
 */
const MAX_ITEMS = 36;
const ITEMS_PER_SENTENCE = 3;
const MAX_ADJ_ADV = 3;

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
  const cap = Math.min(sentenceCount * ITEMS_PER_SENTENCE, MAX_ITEMS);
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
  const capped = limited.length <= cap ? limited : limited.slice(0, cap);
  if (limited.length > cap) {
    for (const item of limited.slice(cap)) {
      dropped.push({ item, reason: "DUPLICATE_SUBTYPE" });
    }
  }

  return { kept: rescueEmptySentences(capped, dropped, cap), dropped };
}

/**
 * 다양성 상한 때문에 문장 하나가 통째로 비는 것을 막는다.
 *
 * subtype 상한·ADJ_ADV 상한·BASIC 비율은 한 지문이 같은 유형으로만 채워지는 것을
 * 막으려고 있다. 그런데 어떤 문장의 유일한 후보가 그 상한에 걸리면 그 문장에는
 * 네모가 하나도 안 남는다. 선생님이 지적한 "문법 사항이 들어간 문장인데 문항이
 * 없다"의 한 갈래가 이것이다.
 *
 * 상한에 걸려 떨어진 후보 중, 그 문장에 남은 문항이 하나도 없고 이미 채택된
 * 문항과 자리가 겹치지 않는 것 하나만 되살린다. 전체 상한(cap)은 그대로 지킨다 —
 * 문항 수를 늘리는 것이 아니라 같은 수를 더 고르게 퍼뜨리는 것이다.
 */
function rescueEmptySentences(
  kept: ResolvedCandidate[],
  dropped: Array<{ item: ResolvedCandidate; reason: string }>,
  cap: number
): ResolvedCandidate[] {
  if (kept.length >= cap) return kept;
  const covered = new Set(kept.map((item) => item.sentenceId));
  const out = [...kept];
  const rescuedFrom = new Set<number>();

  for (let i = 0; i < dropped.length && out.length < cap; i++) {
    const row = dropped[i]!;
    if (row.reason !== "DUPLICATE_SUBTYPE") continue;
    if (covered.has(row.item.sentenceId)) continue;
    const overlaps = out.some(
      (k) =>
        k.sentenceId === row.item.sentenceId &&
        row.item.passageStart < k.passageEnd &&
        row.item.passageEnd > k.passageStart
    );
    if (overlaps) continue;
    out.push(row.item);
    covered.add(row.item.sentenceId);
    rescuedFrom.add(i);
  }
  if (!rescuedFrom.size) return kept;
  // 되살린 것은 탈락 목록에서 뺀다. 진단이 살아 있는 문항을 탈락으로 세면 안 된다.
  for (const i of [...rescuedFrom].sort((a, b) => b - a)) dropped.splice(i, 1);
  return out;
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
