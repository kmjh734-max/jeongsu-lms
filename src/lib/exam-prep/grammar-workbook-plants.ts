/**
 * 6·7단계 어법 — 『어법끝(개정) START』·『처음 만나는 수능 어법』스타터
 * + 변형문제 grammar-catalog CASE/pairForms/심는 법 반영
 *
 * 원칙 (QG와 동일):
 *  - 단원·CASE 다양성 (수일치 문항당 최대 1)
 *  - 인접 단순 수일치 금지
 *  - 네모/밑줄은 교재형 형태 쌍 (is/are, which/that, to-V/V-ing …)
 */
import {
  GRAMMAR_UNIT_BANKS,
  type GrammarCase,
  type GrammarUnitBank,
} from "@/lib/question-generator/grammar-catalog";
import type { Stage6GrammarSub } from "@/lib/exam-prep/stage6-types";
import type { Stage7ErrorSub } from "@/lib/exam-prep/stage7-types";

export type WorkbookGrammarHit = {
  start: number;
  end: number;
  correct: string;
  wrong: string;
  unitKey: string;
  caseId: string;
  koLabel: string;
  koTip: string;
  stage6Sub: Stage6GrammarSub;
  stage7Sub: Stage7ErrorSub;
  /** 높을수록 우선 */
  priority: number;
  forChoice: boolean;
  forError: boolean;
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapUnit(
  unitKey: string,
  caseId: string
): { stage6Sub: Stage6GrammarSub; stage7Sub: Stage7ErrorSub } {
  switch (unitKey) {
    case "sv":
      return {
        stage6Sub: "subject_verb_agreement",
        stage7Sub: "subject_verb_agreement",
      };
    case "voice":
      return { stage6Sub: "voice", stage7Sub: "voice" };
    case "tense":
      return { stage6Sub: "tense", stage7Sub: "tense" };
    case "modal":
      return { stage6Sub: "verb_form", stage7Sub: "verb_form" };
    case "subjunctive":
      return { stage6Sub: "verb_form", stage7Sub: "verb_form" };
    case "participle":
      return { stage6Sub: "participle", stage7Sub: "participle" };
    case "verbal":
      if (/obj|to-v|ing/i.test(caseId)) {
        return { stage6Sub: "gerund", stage7Sub: "gerund" };
      }
      return { stage6Sub: "infinitive", stage7Sub: "infinitive" };
    case "parallel":
      return { stage6Sub: "other_grammar", stage7Sub: "parallelism" };
    case "compare":
      return { stage6Sub: "comparison", stage7Sub: "comparison" };
    case "adjadv":
      return { stage6Sub: "adjective_adverb", stage7Sub: "adjective_adverb" };
    case "prepconj":
      return { stage6Sub: "conjunction", stage7Sub: "conjunction" };
    case "relative":
      if (/adv|where|when|why/i.test(caseId)) {
        return { stage6Sub: "relative_adverb", stage7Sub: "relative_adverb" };
      }
      return { stage6Sub: "relative_pronoun", stage7Sub: "relative_pronoun" };
    case "noun":
      return { stage6Sub: "pronoun", stage7Sub: "pronoun" };
    default:
      return { stage6Sub: "other_grammar", stage7Sub: "other" };
  }
}

type MechPlant = {
  unitKey: string;
  caseId: string;
  correct: RegExp;
  wrong: string | ((matched: string, groups: string[]) => string);
  priority: number;
  forChoice?: boolean;
  forError?: boolean;
  /** 인접 단순 수일치 등 금지 */
  ban?: boolean;
};

/**
 * 교재 CASE ‘심는 법’을 지문에 적용할 수 있는 고빈도 패턴.
 * (변형문제 pickGrammarFocus가 고르는 유닛·형태 쌍과 정렬)
 */
const MECHANISM_PLANTS: MechPlant[] = [
  // —— relative (어법끝 Point 관계사 / 처음만나는 UNIT 08)
  {
    unitKey: "relative",
    caseId: "rel-adv",
    correct: /\bwhere\b(?=\s+it(?:['’]s| is)\b)/i,
    wrong: "which",
    priority: 95,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-adv",
    correct: /\bwhere\b/i,
    wrong: "that",
    priority: 88,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-ante",
    correct: /\bwhich has\b/i,
    wrong: "that have",
    priority: 92,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-that",
    correct: /\bwhich\b/i,
    wrong: "that",
    priority: 70,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-who",
    correct: /\bwho\b/i,
    wrong: "which",
    priority: 75,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-whom",
    correct: /\bwhom\b/i,
    wrong: "who",
    priority: 78,
    forChoice: true,
    forError: true,
  },
  // —— voice (능동·수동)
  {
    unitKey: "voice",
    caseId: "voice-prog",
    correct: /\bbeen (\w+)ing\b/gi,
    wrong: (_m, g) => {
      const stem = g[0] ?? "dump";
      if (stem.endsWith("e")) return `been ${stem}d`;
      if (stem === "leav") return "been left";
      return `been ${stem}ed`;
    },
    priority: 90,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "voice",
    caseId: "voice-prog",
    correct: /\bare (\w+)ing\b/gi,
    wrong: (_m, g) => {
      const stem = g[0] ?? "leave";
      if (stem === "leav") return "are left";
      if (stem.endsWith("e")) return `are ${stem}d`;
      return `are ${stem}ed`;
    },
    priority: 85,
    forChoice: true,
    forError: false,
  },
  {
    unitKey: "voice",
    caseId: "voice-basic",
    correct: /\battracts\b/gi,
    wrong: "is attracted",
    priority: 86,
    forChoice: true,
    forError: false,
  },
  {
    unitKey: "voice",
    caseId: "voice-basic",
    correct: /\bis desperately needed\b/gi,
    wrong: "is desperate needed",
    priority: 87,
    forChoice: true,
    forError: true,
  },
  // —— verbal (to-V vs V-ing)
  {
    unitKey: "verbal",
    caseId: "verb-obj",
    correct: /\bto strengthen\b/gi,
    wrong: "strengthening",
    priority: 93,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "verbal",
    caseId: "verb-obj",
    correct: /\bto (fix|solve|protect|leave|prevent|improve|reduce|increase)\b/gi,
    wrong: (_m, g) => `${g[0] ?? "fix"}ing`,
    priority: 72,
    forChoice: true,
    forError: true,
  },
  // —— adjadv
  {
    unitKey: "adjadv",
    caseId: "adj-slot",
    correct: /\bdesperately\b/i,
    wrong: "desperate",
    priority: 84,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "adjadv",
    caseId: "adj-slot",
    correct: /\billegal\b(?=\s+\w+ing\b)/i,
    wrong: "illegally",
    priority: 82,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "adjadv",
    caseId: "adj-slot",
    correct: /\bhardly\b/i,
    wrong: "hard",
    priority: 70,
    forChoice: true,
    forError: true,
  },
  // —— participle
  {
    unitKey: "participle",
    caseId: "part-mod",
    correct: /\bdisgusting\b/i,
    wrong: "disgusted",
    priority: 83,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "participle",
    caseId: "part-mod",
    correct: /\binterested\b/i,
    wrong: "interesting",
    priority: 74,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "participle",
    caseId: "part-mod",
    correct: /\binteresting\b/i,
    wrong: "interested",
    priority: 74,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "participle",
    caseId: "part-mod",
    correct: /\bsurprised\b/i,
    wrong: "surprising",
    priority: 74,
    forChoice: true,
    forError: true,
  },
  // —— prepconj (접속사 vs 전치사)
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\balthough\b/i,
    wrong: "despite",
    priority: 76,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\bdespite\b/i,
    wrong: "although",
    priority: 76,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\bduring\b/i,
    wrong: "while",
    priority: 73,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\bwhile\b/i,
    wrong: "during",
    priority: 73,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-because",
    correct: /\bbecause\b(?!\s+of\b)/i,
    wrong: "because of",
    priority: 71,
    forChoice: true,
    forError: true,
  },
  // —— sv: ONLY modifier-lure style (관계절 has/have 등). 인접 단순 수일치 금지
  {
    unitKey: "sv",
    caseId: "sv-rel-ante",
    correct: /\bwhich has\b/i,
    wrong: "which have",
    priority: 80,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "sv",
    caseId: "sv-rel-ante",
    correct: /\bthat has\b/i,
    wrong: "that have",
    priority: 78,
    forChoice: true,
    forError: true,
  },
  // 금지 예시 — 등록하지 않음: attracts→attract (인접 단순)
];

/** 어휘 [a/b] — PDF·워크북용 (어법과 함께) */
export const VOCAB_CHOICE_PLANTS: Array<{
  correct: RegExp;
  wrong: string;
  sub: string;
  priority: number;
}> = [
  { correct: /\bgrowing\b/i, wrong: "declining", sub: "increase_decrease", priority: 60 },
  { correct: /\bstrengthen\b/i, wrong: "weaken", sub: "strengthen_weaken", priority: 60 },
  { correct: /\bworse\b/i, wrong: "better", sub: "opposite_meaning", priority: 58 },
  { correct: /\billegal\b/i, wrong: "legal", sub: "opposite_meaning", priority: 55 },
  { correct: /\bpermitted\b/i, wrong: "prevented", sub: "similar_spelling", priority: 62 },
  { correct: /\bgarbage\b/i, wrong: "garage", sub: "similar_spelling", priority: 62 },
  { correct: /\bConsistent\b/, wrong: "Inconsistent", sub: "opposite_meaning", priority: 60 },
  { correct: /\bmore and more\b/i, wrong: "less and less", sub: "increase_decrease", priority: 61 },
];

function findCase(
  unitKey: string,
  caseId: string
): { unit: GrammarUnitBank; c: GrammarCase } | null {
  const unit = GRAMMAR_UNIT_BANKS.find((u) => u.key === unitKey);
  if (!unit) return null;
  const c =
    unit.cases.find((x) => x.id === caseId) ??
    unit.cases[0];
  if (!c) return null;
  return { unit, c };
}

function overlaps(
  used: Array<{ a: number; b: number }>,
  start: number,
  end: number
) {
  return used.some((u) => start < u.b && end > u.a);
}

/** pairForms "a/b·c/d" → 지문에 있는 쪽을 정답으로 한 hit */
function catalogPairHits(english: string): WorkbookGrammarHit[] {
  const hits: WorkbookGrammarHit[] = [];
  const used: Array<{ a: number; b: number }> = [];
  const WEAK = new Set(
    "a an the is are was were be been being have has had do does did will would can could may might should my mine your yours his her its our their i we you they he she it them this that these those and or but not".split(
      " "
    )
  );

  for (const unit of GRAMMAR_UNIT_BANKS) {
    for (const c of unit.cases) {
      for (const group of c.pairForms.split("·")) {
        const parts = group.split("/").map((p) => p.trim()).filter(Boolean);
        if (parts.length !== 2) continue;
        const [a, b] = parts;
        if (!a || !b || a.length < 2 || b.length < 2 || a.length > 36) continue;
        if (
          !a.includes(" ") &&
          !b.includes(" ") &&
          WEAK.has(a.toLowerCase()) &&
          WEAK.has(b.toLowerCase())
        ) {
          continue; // 단순 is/are 단독 — HARD BAN에 가깝게 스킵
        }
        for (const [correctText, wrongText] of [
          [a, b],
          [b, a],
        ] as const) {
          const re = new RegExp(`\\b${escapeRe(correctText)}\\b`, "i");
          const m = english.match(re);
          if (!m || m.index == null) continue;
          const start = m.index;
          const end = start + m[0].length;
          if (overlaps(used, start, end)) continue;
          // 인접 단순 수일치 스킵: people are / things change 류
          if (
            unit.key === "sv" &&
            !correctText.includes(" ") &&
            /^(is|are|was|were|has|have)$/i.test(correctText)
          ) {
            const before = english.slice(Math.max(0, start - 24), start);
            if (!/\b(of|in|that|which|who|whom|to|by|from|with)\b/i.test(before)) {
              continue;
            }
          }
          used.push({ a: start, b: end });
          const subs = mapUnit(unit.key, c.id);
          hits.push({
            start,
            end,
            correct: m[0],
            wrong: wrongText,
            unitKey: unit.key,
            caseId: c.id,
            koLabel: c.koLabel,
            koTip: c.koTip,
            ...subs,
            priority: 40 + Math.min(correctText.length, 12),
            forChoice: true,
            forError: true,
          });
        }
      }
    }
  }
  return hits;
}

export function scanWorkbookGrammarHits(english: string): WorkbookGrammarHit[] {
  const hits: WorkbookGrammarHit[] = [];
  const used: Array<{ a: number; b: number }> = [];

  for (const plant of MECHANISM_PLANTS) {
    if (plant.ban) continue;
    const re = new RegExp(plant.correct.source, plant.correct.flags.includes("g") ? plant.correct.flags : `${plant.correct.flags}g`);
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(english)) !== null) {
      if (m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (overlaps(used, start, end)) continue;
      const correct = m[0];
      const groups = m.slice(1).filter(Boolean);
      const wrong =
        typeof plant.wrong === "function"
          ? plant.wrong(correct, groups)
          : plant.wrong;
      if (!wrong || wrong.toLowerCase() === correct.toLowerCase()) continue;
      used.push({ a: start, b: end });
      const meta = findCase(plant.unitKey, plant.caseId);
      const subs = mapUnit(plant.unitKey, plant.caseId);
      hits.push({
        start,
        end,
        correct,
        wrong,
        unitKey: plant.unitKey,
        caseId: plant.caseId,
        koLabel: meta?.c.koLabel ?? plant.unitKey,
        koTip: meta?.c.koTip ?? "",
        ...subs,
        priority: plant.priority,
        forChoice: plant.forChoice !== false,
        forError: plant.forError !== false,
      });
    }
  }

  // 카탈로그 pairForms 보충 (메커니즘에 안 걸린 것)
  for (const h of catalogPairHits(english)) {
    if (overlaps(used, h.start, h.end)) continue;
    used.push({ a: h.start, b: h.end });
    hits.push(h);
  }

  return hits.sort((a, b) => b.priority - a.priority || a.start - b.start);
}

/**
 * QG pickGrammarFocus와 같이 유닛 다양성 확보.
 * - 서로 다른 unitKey 우선
 * - sv 최대 1개
 */
export function pickDiverseGrammarHits(
  hits: WorkbookGrammarHit[],
  max: number,
  opts?: { forChoice?: boolean; forError?: boolean }
): WorkbookGrammarHit[] {
  const filtered = hits.filter((h) => {
    if (opts?.forChoice && !h.forChoice) return false;
    if (opts?.forError && !h.forError) return false;
    return true;
  });
  const picked: WorkbookGrammarHit[] = [];
  const usedUnits = new Set<string>();
  const usedSpans: Array<{ a: number; b: number }> = [];
  let usedSv = false;

  const tryAdd = (h: WorkbookGrammarHit, requireNewUnit: boolean) => {
    if (picked.length >= max) return false;
    if (overlaps(usedSpans, h.start, h.end)) return false;
    if (h.unitKey === "sv") {
      if (usedSv) return false;
    }
    if (requireNewUnit && usedUnits.has(h.unitKey)) return false;
    picked.push(h);
    usedUnits.add(h.unitKey);
    usedSpans.push({ a: h.start, b: h.end });
    if (h.unitKey === "sv") usedSv = true;
    return true;
  };

  // 1차: 새 유닛만
  for (const h of filtered) {
    tryAdd(h, true);
  }
  // 2차: 간격만 맞으면 채움 (유닛 중복 허용하되 sv는 여전히 1)
  for (const h of filtered) {
    tryAdd(h, false);
  }

  return picked.sort((a, b) => a.start - b.start);
}

export function scanVocabChoiceHits(english: string): Array<{
  start: number;
  end: number;
  correct: string;
  wrong: string;
  sub: string;
  priority: number;
}> {
  const out: Array<{
    start: number;
    end: number;
    correct: string;
    wrong: string;
    sub: string;
    priority: number;
  }> = [];
  const used: Array<{ a: number; b: number }> = [];
  for (const p of VOCAB_CHOICE_PLANTS) {
    const re = new RegExp(p.correct.source, p.correct.flags.includes("g") ? p.correct.flags : `${p.correct.flags}g`);
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(english)) !== null) {
      if (m.index == null) continue;
      if (overlaps(used, m.index, m.index + m[0].length)) continue;
      used.push({ a: m.index, b: m.index + m[0].length });
      out.push({
        start: m.index,
        end: m.index + m[0].length,
        correct: m[0],
        wrong: p.wrong,
        sub: p.sub,
        priority: p.priority,
      });
    }
  }
  return out.sort((a, b) => b.priority - a.priority);
}

/** 지문 전체에서 7단계용 오류 3개 (서로 다른 단원) */
export function pickStage7Errors(
  sentences: Array<{ id: string; english_text: string; sentence_order: number }>,
  targetCount = 3
): Array<{
  sentenceId: string;
  hit: WorkbookGrammarHit;
}> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const pool: Array<{ sentenceId: string; hit: WorkbookGrammarHit }> = [];
  for (const s of ordered) {
    const hits = scanWorkbookGrammarHits(s.english_text).filter((h) => h.forError);
    for (const h of hits) {
      pool.push({ sentenceId: s.id, hit: h });
    }
  }
  pool.sort((a, b) => b.hit.priority - a.hit.priority);

  const picked: Array<{ sentenceId: string; hit: WorkbookGrammarHit }> = [];
  const usedUnits = new Set<string>();
  const usedSentences = new Set<string>();
  let usedSv = false;

  for (const row of pool) {
    if (picked.length >= targetCount) break;
    if (usedSentences.has(row.sentenceId)) continue;
    if (usedUnits.has(row.hit.unitKey)) continue;
    if (row.hit.unitKey === "sv") {
      if (usedSv) continue;
      usedSv = true;
    }
    picked.push(row);
    usedUnits.add(row.hit.unitKey);
    usedSentences.add(row.sentenceId);
  }

  // 부족하면 문장 중복 허용·유닛만 다양
  if (picked.length < targetCount) {
    for (const row of pool) {
      if (picked.length >= targetCount) break;
      if (picked.some((p) => p.sentenceId === row.sentenceId && p.hit.start === row.hit.start)) {
        continue;
      }
      if (usedUnits.has(row.hit.unitKey) && picked.length >= 2) continue;
      if (row.hit.unitKey === "sv" && usedSv) continue;
      picked.push(row);
      usedUnits.add(row.hit.unitKey);
      if (row.hit.unitKey === "sv") usedSv = true;
    }
  }

  return picked;
}

export function grammarWorkbookSourceNote(): string {
  return [
    `근거 교재: ${GRAMMAR_UNIT_BANKS.map((u) => u.title).slice(0, 3).join(" · ")} 등`,
    "어법끝(개정) START · 처음 만나는 수능 어법 스타터(입문)",
    "변형문제 grammar-catalog CASE/pairForms/심는 법과 동일 뱅크",
  ].join(" / ");
}
