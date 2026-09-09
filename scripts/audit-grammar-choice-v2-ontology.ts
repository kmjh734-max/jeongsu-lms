/**
 * Grammar Choice V2 ontology audit. Read-only. No OpenAI.
 * Run: npx tsx scripts/audit-grammar-choice-v2-ontology.ts
 */
import fs from "node:fs";
import path from "node:path";
import { GRAMMAR_ONTOLOGY, ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { generationPolicyFor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { SENTENCE_CH01_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { TENSE_CH02_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { VOICE_CH03_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { MODAL_CH04_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { CONDITIONAL_CH05_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { INFINITIVE_CH06_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { GERUND_CH07_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { PARTICIPLE_CH08_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { NONFINITE_CH09_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { CONJUNCTION_CH10_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { RELATIVE_CH11_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import { COMPARISON_CH12_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { PARTS_CH13_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { SPECIAL_CH14_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { isResolvedSecondaryOwnership } from "../src/lib/lesson-materials/grammar-choice-v2/ownership";

type Rule = {
  code: string;
  subtype: string;
  priority: string;
  referenceChapter?: string;
  allowedMinimalPairs?: Array<[string, string]>;
  rejectConditions?: string[];
  analysisOnly?: boolean;
  ownerChapter?: string;
  assessmentAxis?: string;
  emitsStudentQuestion?: boolean;
  secondaryAnalyzer?: boolean;
  sharedForm?: string;
};

type Issue = {
  type: string;
  chapter: string;
  detail: string;
};

export type AuditRule = {
  code: string;
  subtype: string;
  analysisOnly?: boolean;
  assessmentAxis?: string;
  emitsStudentQuestion?: boolean;
  secondaryAnalyzer?: boolean;
  allowedMinimalPairs?: Array<[string, string]>;
  sourceSpan?: string;
  occurrenceIndex?: number;
};

export function canEmitQuestion(rule: {
  analysisOnly?: boolean;
  secondaryAnalyzer?: boolean;
  emitsStudentQuestion?: boolean;
}): boolean {
  return rule.analysisOnly !== true && rule.secondaryAnalyzer !== true && rule.emitsStudentQuestion !== false;
}

export function choicePairsOverlap(
  left: Array<[string, string]> = [],
  right: Array<[string, string]> = []
): boolean {
  const key = (pair: [string, string]) =>
    [pair[0], pair[1]].map((item) => item.trim().toLowerCase()).sort().join("|");
  const owned = new Set(left.map(key));
  return right.some((pair) => owned.has(key(pair)));
}

export function sourceSpansOverlap(
  left: { sourceSpan?: string; occurrenceIndex?: number },
  right: { sourceSpan?: string; occurrenceIndex?: number }
): boolean {
  if (!left.sourceSpan || !right.sourceSpan || left.occurrenceIndex == null || right.occurrenceIndex == null) {
    return false;
  }
  const leftStart = left.occurrenceIndex;
  const leftEnd = leftStart + left.sourceSpan.length;
  const rightStart = right.occurrenceIndex;
  const rightEnd = rightStart + right.sourceSpan.length;
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function isActualQuestionDuplicate(left: AuditRule, right: AuditRule): boolean {
  if (!canEmitQuestion(left) || !canEmitQuestion(right)) return false;
  if (!left.assessmentAxis || !right.assessmentAxis || left.assessmentAxis !== right.assessmentAxis) return false;
  if (!choicePairsOverlap(left.allowedMinimalPairs, right.allowedMinimalPairs)) return false;
  return sourceSpansOverlap(left, right);
}

const CHAPTERS = [
  "CH01",
  "CH02",
  "CH03",
  "CH04",
  "CH05",
  "CH06",
  "CH07",
  "CH08",
  "CH09",
  "CH10",
  "CH11",
  "CH12",
  "CH13",
  "CH14",
] as const;

const FILES: Record<string, string | null> = {
  CH01: "src/lib/lesson-materials/grammar-choice-v2/sentence-ch01.ts",
  CH02: "src/lib/lesson-materials/grammar-choice-v2/tense-ch02.ts",
  CH03: "src/lib/lesson-materials/grammar-choice-v2/voice-ch03.ts",
  CH04: "src/lib/lesson-materials/grammar-choice-v2/modal-ch04.ts",
  CH05: "src/lib/lesson-materials/grammar-choice-v2/conditional-ch05.ts",
  CH06: "src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06.ts",
  CH07: "src/lib/lesson-materials/grammar-choice-v2/gerund-ch07.ts",
  CH08: "src/lib/lesson-materials/grammar-choice-v2/participle-ch08.ts",
  CH09: "src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09.ts",
  CH10: "src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10.ts",
  CH11: "src/lib/lesson-materials/grammar-choice-v2/relative-ch11.ts",
  CH12: "src/lib/lesson-materials/grammar-choice-v2/comparison-ch12.ts",
  CH13: "src/lib/lesson-materials/grammar-choice-v2/parts-ch13.ts",
  CH14: "src/lib/lesson-materials/grammar-choice-v2/special-ch14.ts",
};

const RULES: Record<string, Rule[]> = {
  CH01: SENTENCE_CH01_RULES,
  CH02: TENSE_CH02_RULES,
  CH03: VOICE_CH03_RULES,
  CH04: MODAL_CH04_RULES,
  CH05: CONDITIONAL_CH05_RULES,
  CH06: INFINITIVE_CH06_RULES,
  CH07: GERUND_CH07_RULES,
  CH08: PARTICIPLE_CH08_RULES,
  CH09: NONFINITE_CH09_RULES,
  CH10: CONJUNCTION_CH10_RULES,
  CH11: RELATIVE_CH11_RULES,
  CH12: COMPARISON_CH12_RULES,
  CH13: PARTS_CH13_RULES,
  CH14: SPECIAL_CH14_RULES,
};

const root = process.cwd();
const routerText = fs.readFileSync(path.join(root, "src/lib/lesson-materials/grammar-choice-v2/trigger-router.ts"), "utf8");
const pipelineText = fs.readFileSync(path.join(root, "src/lib/lesson-materials/grammar-choice-v2/pipeline.ts"), "utf8");
const generateText = fs.readFileSync(path.join(root, "src/lib/lesson-materials/grammar-choice-v2/generate.ts"), "utf8");
const scanText = fs.readFileSync(path.join(root, "src/lib/lesson-materials/grammar-choice-v2/mandatory-scan.ts"), "utf8");
const policyText = fs.readFileSync(path.join(root, "src/lib/lesson-materials/grammar-choice-v2/generation-policy.ts"), "utf8");

function listed(text: string, code: string): boolean {
  return text.includes(`"${code}"`) || text.includes(`'${code}'`);
}

function fileExists(rel: string | null): boolean {
  return Boolean(rel && fs.existsSync(path.join(root, rel)));
}

function detectorWired(chapter: string): boolean {
  const file = FILES[chapter];
  if (!file) return false;
  const base = path.basename(file).replace(/\.ts$/, "");
  return [pipelineText, generateText, scanText].some((text) => text.includes(base));
}

function policyWired(chapter: string): boolean {
  const file = FILES[chapter];
  if (!file) return false;
  return policyText.includes(path.basename(file).replace(/\.ts$/, ""));
}

function missingFields(rule: Rule): string[] {
  const missing: string[] = [];
  if (!rule.code) missing.push("code");
  if (!rule.subtype) missing.push("subtype");
  if (!rule.priority) missing.push("priority");
  if (!rule.referenceChapter) missing.push("referenceChapter");
  if (!Array.isArray(rule.allowedMinimalPairs)) missing.push("allowedMinimalPairs");
  if (!Array.isArray(rule.rejectConditions)) missing.push("rejectConditions");
  return missing;
}

function pairKey(a: string, b: string): string {
  return [a.trim().toLowerCase(), b.trim().toLowerCase()].sort().join("|");
}

function tokenCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function classifyPair(left: string, right: string): Array<{ kind: string; review: boolean }> {
  const joined = pairKey(left, right);
  const flags: Array<{ kind: string; review: boolean }> = [];
  if (/^to [a-z]+\|to [a-z]+ing$/.test(joined)) flags.push({ kind: "TO_V_TO_VING", review: false });
  if (/^(are\|is|has\|have|was\|were)$/.test(joined)) flags.push({ kind: "SHORT_AGREEMENT", review: false });
  if (/^(advice\|advices|information\|informations)$/.test(joined)) {
    flags.push({ kind: "PEDAGOGICAL_COUNTABILITY_PAIR", review: false });
  } else if (joined === "evidence|evidences") {
    flags.push({ kind: "ANALYSIS_ONLY", review: true });
  } else if (/(furnitures|thinkinging)/.test(joined)) {
    flags.push({ kind: "NONSTANDARD_FORM", review: false });
  }
  if (tokenCount(left) > 4 || tokenCount(right) > 4) flags.push({ kind: "LONG_SPAN", review: false });
  const leftTokens = left.trim().toLowerCase().split(/\s+/);
  const rightTokens = right.trim().toLowerCase().split(/\s+/);
  if (leftTokens.length === rightTokens.length && leftTokens.filter((token, i) => token !== rightTokens[i]).length > 1) {
    flags.push({ kind: "MULTI_AXIS", review: false });
  }
  if (["hard|hardly", "late|lately", "near|nearly", "high|highly", "close|closely", "most|mostly"].includes(joined)) {
    flags.push({ kind: "MEANING_ONLY", review: false });
  }
  if (["another|the other", "others|the others", "for|of", "i|me", "ourselves|us", "him|his", "know|knew", "know|knows"].includes(joined)) {
    flags.push({ kind: "BOTH_OR_MODAL_OR_IMPERATIVE", review: true });
  }
  if (/^(?:can|could|may|might|must|shall|should|will|would) /.test(left) || /^(?:can|could|may|might|must|shall|should|will|would) /.test(right)) {
    flags.push({ kind: "MODAL_FORM", review: true });
  }
  return flags;
}

const issues: Issue[] = [];
const owners: Array<{
  codeA: string;
  chapterA: string;
  codeB: string;
  chapterB: string;
  overlappingConcept: string;
  currentOwner: string;
  conflictType: string;
}> = [];

const byCode = new Map<string, Array<{ chapter: string; rule: Rule }>>();
for (const chapter of CHAPTERS) {
  if (!FILES[chapter]) {
    issues.push({ type: "MISSING_REGISTRY", chapter, detail: "규칙 파일 없음" });
  } else if (!fileExists(FILES[chapter])) {
    issues.push({ type: "MISSING_REGISTRY", chapter, detail: `파일 없음: ${FILES[chapter]}` });
  }
  for (const rule of RULES[chapter] ?? []) {
    const list = byCode.get(rule.code) ?? [];
    list.push({ chapter, rule });
    byCode.set(rule.code, list);
    const missing = missingFields(rule);
    if (missing.length) {
      issues.push({
        type: "MISSING_REQUIRED_FIELD",
        chapter,
        detail: `${rule.code}/${rule.subtype}: ${missing.join(", ")}`,
      });
    }
    const questionOwner = rule.ownerChapter ?? rule.referenceChapter;
    if (rule.referenceChapter && questionOwner && rule.referenceChapter !== questionOwner) {
      issues.push({
        type: "REFERENCE_CHAPTER_MISMATCH",
        chapter,
        detail: `${rule.code}/${rule.subtype} owner=${questionOwner} referenceChapter=${rule.referenceChapter}`,
      });
    }
    if (questionOwner && questionOwner !== chapter && !(rule.analysisOnly && rule.referenceChapter === chapter)) {
      issues.push({
        type: "REFERENCE_CHAPTER_MISMATCH",
        chapter,
        detail: `${rule.code}/${rule.subtype} 파일=${chapter} owner=${questionOwner}`,
      });
    }
    const point = ontologyPoint(rule.code);
    if (!point) {
      issues.push({ type: "MISSING_REGISTRY", chapter, detail: `${rule.code} ontology 미등록` });
    } else if (questionOwner && point.referenceChapter !== questionOwner) {
      issues.push({
        type: "REFERENCE_CHAPTER_MISMATCH",
        chapter,
        detail: `${rule.code} owner=${questionOwner} ontology=${point.referenceChapter ?? "없음"}`,
      });
    }
  }
}

for (const [code, rows] of byCode) {
  const subtypes = new Map<string, string[]>();
  const pairOwners = new Map<string, string[]>();
  for (const row of rows) {
    const sub = subtypes.get(row.rule.subtype) ?? [];
    sub.push(row.chapter);
    subtypes.set(row.rule.subtype, sub);
    for (const pair of row.rule.allowedMinimalPairs ?? []) {
      const key = pairKey(pair[0], pair[1]);
      const list = pairOwners.get(key) ?? [];
      list.push(`${row.chapter}:${row.rule.subtype}`);
      pairOwners.set(key, list);
    }
  }
  if (rows.length > 1) {
    const chapters = [...new Set(rows.map((row) => row.chapter))];
    const canEmit = (rule: Rule) =>
      rule.analysisOnly !== true && rule.secondaryAnalyzer !== true && rule.emitsStudentQuestion !== false;
    const emitting = rows.filter((row) => canEmit(row.rule));
    const emittingChapters = [...new Set(emitting.map((row) => row.chapter))];
    const axes = [...new Set(rows.map((row) => row.rule.assessmentAxis).filter((axis): axis is string => Boolean(axis)))];
    const sameAxis = axes.length === 1;
    const differentAxis = axes.length > 1;
    const secondary = rows.some((row) => row.rule.secondaryAnalyzer);
    const info = (type: string, detail: string) => {
      issues.push({ type, chapter: chapters.join(","), detail });
    };
    if (chapters.length > 1 && emittingChapters.length < 2 && rows.some((row) => row.rule.analysisOnly) && emitting.length === 0) {
      info("ANALYSIS_ONLY_OVERLAP", `${code} analysisOnly, 학생 문항 emit 없음`);
    } else if (chapters.length > 1 && secondary && emitting.length > 0 && (sameAxis || axes.length === 0)) {
      info("SECONDARY_OWNER_SUPPRESSED", `${code} secondaryAnalyzer, question owner=${emittingChapters.join("/") || "없음"}`);
    } else if (chapters.length > 1 && differentAxis) {
      info("SHARED_FORM_DIFFERENT_AXIS", `${code} axes=${axes.join("/")}`);
    } else if (chapters.length > 1 && emittingChapters.length < 2 && rows.some((row) => row.rule.analysisOnly)) {
      info("ANALYSIS_ONLY_OVERLAP", `${code} analysisOnly, emitting=${emittingChapters.join("/") || "없음"}`);
    }
    const suppressed =
      secondary ||
      differentAxis ||
      (emittingChapters.length < 2 && rows.some((row) => row.rule.analysisOnly));
    if (emittingChapters.length > 1 && sameAxis && !suppressed && !isResolvedSecondaryOwnership(code, emittingChapters)) {
      const label = ontologyPoint(code)?.labelKo ?? code;
      const owner = ontologyPoint(code)?.referenceChapter ?? "없음";
      owners.push({
        codeA: code,
        chapterA: emittingChapters[0] ?? "",
        codeB: code,
        chapterB: emittingChapters[1] ?? "",
        overlappingConcept: label,
        currentOwner: owner,
        conflictType: "OVERLAPPING_OWNER",
      });
      issues.push({
        type: "OVERLAPPING_OWNER",
        chapter: emittingChapters.join(","),
        detail: `${code} owners=${emittingChapters.join("/")} ontology=${owner}`,
      });
      const mandatory = emitting.filter((row) => row.rule.priority === "MANDATORY").map((row) => row.chapter);
      if (new Set(mandatory).size > 1) {
        issues.push({
          type: "MULTIPLE_MANDATORY_OWNER",
          chapter: [...new Set(mandatory)].join(","),
          detail: code,
        });
      }
    } else if (
      emittingChapters.length > 1 &&
      !sameAxis &&
      !differentAxis &&
      !secondary &&
      !isResolvedSecondaryOwnership(code, emittingChapters)
    ) {
      const label = ontologyPoint(code)?.labelKo ?? code;
      const owner = ontologyPoint(code)?.referenceChapter ?? "없음";
      owners.push({
        codeA: code,
        chapterA: emittingChapters[0] ?? "",
        codeB: code,
        chapterB: emittingChapters[1] ?? "",
        overlappingConcept: label,
        currentOwner: owner,
        conflictType: "OVERLAPPING_OWNER",
      });
      issues.push({
        type: "OVERLAPPING_OWNER",
        chapter: emittingChapters.join(","),
        detail: `${code} owners=${emittingChapters.join("/")} ontology=${owner}`,
      });
      const mandatory = emitting.filter((row) => row.rule.priority === "MANDATORY").map((row) => row.chapter);
      if (new Set(mandatory).size > 1) {
        issues.push({
          type: "MULTIPLE_MANDATORY_OWNER",
          chapter: [...new Set(mandatory)].join(","),
          detail: code,
        });
      }
    }
  }
  for (const [subtype, chapters] of subtypes) {
    if (chapters.length > 1) {
      issues.push({
        type: "DUPLICATE_SUBTYPE",
        chapter: [...new Set(chapters)].join(","),
        detail: `${code}/${subtype}`,
      });
    }
  }
  for (const [pair, where] of pairOwners) {
    const emitters = where.filter((item) => {
      const chapter = item.split(":")[0] ?? "";
      const subtype = item.slice(chapter.length + 1);
      const rule = (RULES[chapter] ?? []).find((row) => row.code === code && row.subtype === subtype);
      return rule ? canEmitQuestion(rule) : false;
    });
    if (emitters.length > 1) {
      issues.push({ type: "DUPLICATE_EXACT_PAIR", chapter: emitters.join(","), detail: `${code} ${pair}` });
      const chapters = [...new Set(emitters.map((item) => item.split(":")[0]))];
      if (chapters.length > 1) {
        issues.push({
          type: "ACTUAL_DUAL_EMITTER",
          chapter: chapters.join(","),
          detail: `${code} ${pair}`,
        });
      }
    }
  }
}

const byForm = new Map<string, Array<{ chapter: string; rule: Rule }>>();
for (const chapter of CHAPTERS) {
  for (const rule of RULES[chapter] ?? []) {
    if (!rule.sharedForm) continue;
    const list = byForm.get(rule.sharedForm) ?? [];
    list.push({ chapter, rule });
    byForm.set(rule.sharedForm, list);
  }
}
for (const [form, rows] of byForm) {
  const chapters = [...new Set(rows.map((row) => row.chapter))];
  const codes = [...new Set(rows.map((row) => row.rule.code))];
  if (chapters.length < 2 || codes.length < 2) continue;
  const axes = [...new Set(rows.map((row) => row.rule.assessmentAxis).filter((axis): axis is string => Boolean(axis)))];
  const emitting = rows.filter((row) => canEmitQuestion(row.rule));
  const analysis = rows.filter((row) => row.rule.analysisOnly === true || !canEmitQuestion(row.rule));
  if (analysis.length > 0 && emitting.length > 0) {
    issues.push({
      type: "ANALYSIS_ONLY_OVERLAP",
      chapter: chapters.join(","),
      detail: `${form} analysisOnly, axes=${axes.join("/") || "없음"}`,
    });
    continue;
  }
  const actual = rows.some((left, index) =>
    rows.slice(index + 1).some((right) => isActualQuestionDuplicate(left.rule, right.rule))
  );
  if (actual) {
    issues.push({
      type: "DUPLICATE_SUBTYPE",
      chapter: chapters.join(","),
      detail: `${form} both emit, same axis and pair`,
    });
  } else if (axes.length > 1 && emitting.length > 1) {
    issues.push({
      type: "SHARED_FORM_DIFFERENT_AXIS",
      chapter: chapters.join(","),
      detail: `${form} axes=${axes.join("/")}`,
    });
  }
}

const seenRuleKey = new Set<string>();
for (const chapter of CHAPTERS) {
  for (const rule of RULES[chapter] ?? []) {
    const key = `${chapter}|${rule.code}|${rule.subtype}`;
    if (seenRuleKey.has(key)) {
      issues.push({ type: "DUPLICATE_REGISTRY_ROW", chapter, detail: key });
    }
    seenRuleKey.add(key);
  }
}

const ontologyCodes = new Set(GRAMMAR_ONTOLOGY.map((point) => point.code));
const duplicateOntology = GRAMMAR_ONTOLOGY.map((point) => point.code).filter((code, index, all) => all.indexOf(code) !== index);
for (const code of duplicateOntology) {
  issues.push({ type: "DUPLICATE_CODE", chapter: ontologyPoint(code)?.referenceChapter ?? "ontology", detail: code });
}

const forbidden: string[] = [];
const review: string[] = [];
for (const chapter of CHAPTERS) {
  for (const rule of RULES[chapter] ?? []) {
    for (const pair of rule.allowedMinimalPairs ?? []) {
      for (const flag of classifyPair(pair[0], pair[1])) {
        const line = `${chapter} ${rule.code}/${rule.subtype} [${pair[0]} / ${pair[1]}] ${flag.kind}`;
        if (flag.kind === "PEDAGOGICAL_COUNTABILITY_PAIR") {
          review.push(line);
        } else if (flag.review) review.push(line);
        else forbidden.push(line);
      }
    }
    const fileText = FILES[chapter] ? fs.readFileSync(path.join(root, FILES[chapter] as string), "utf8") : "";
    const detectorMentions = fileText.split(rule.code).length > 2;
    const studentEmit = canEmitQuestion(rule);
    const reachable =
      listed(routerText, rule.code) ||
      listed(scanText, rule.code) ||
      generationPolicyFor(rule.code) === "LOCAL_TEMPLATE" ||
      detectorMentions;
    if (studentEmit && !reachable) {
      issues.push({
        type: "UNREACHABLE_RULE",
        chapter,
        detail: `${rule.code}/${rule.subtype} detector=${detectorMentions}`,
      });
    }
  }
}

function count(chapter: string, type: string): number {
  return issues.filter((issue) => issue.type === type && issue.chapter.split(",").includes(chapter)).length;
}

function registryLabel(chapter: string): string {
  const rules = RULES[chapter] ?? [];
  if (!rules.length) return "아니오";
  const registered = rules.filter((rule) => ontologyCodes.has(rule.code as never)).length;
  if (registered === rules.length) return "예";
  if (registered === 0) return "아니오";
  return `부분 ${registered}/${rules.length}`;
}

function pipelineLabel(chapter: string): string {
  if (detectorWired(chapter)) return "예";
  if (policyWired(chapter)) return "정책";
  return "아니오";
}

const rows = CHAPTERS.map((chapter) => {
  const rules = RULES[chapter] ?? [];
  const fieldMissing = issues.filter((issue) => issue.type === "MISSING_REQUIRED_FIELD" && issue.chapter === chapter).length;
  const dup =
    count(chapter, "DUPLICATE_REGISTRY_ROW") +
    count(chapter, "DUPLICATE_EXACT_PAIR") +
    count(chapter, "ACTUAL_DUAL_EMITTER");
  const conflict =
    count(chapter, "ACTUAL_DUAL_EMITTER") +
    count(chapter, "MULTIPLE_MANDATORY_OWNER") +
    count(chapter, "REFERENCE_CHAPTER_MISMATCH");
  return {
    chapter,
    rules: rules.length,
    unique: new Set(rules.map((rule) => rule.code)).size,
    registry: registryLabel(chapter),
    pipeline: pipelineLabel(chapter),
    fieldMissing,
    dup,
    conflict,
  };
});

const allRules = CHAPTERS.flatMap((chapter) => RULES[chapter] ?? []);
const reachable = allRules.filter((rule) => {
  const chapter = CHAPTERS.find((item) => (RULES[item] ?? []).includes(rule)) ?? "";
  const suppressed = generationPolicyFor(rule.code) === "NOT_QUESTIONABLE";
  return (
    !suppressed &&
    (listed(routerText, rule.code) || listed(scanText, rule.code) || generationPolicyFor(rule.code) === "LOCAL_TEMPLATE" || detectorWired(chapter))
  );
});

export const auditIssues = issues;
export const auditRows = rows;

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").includes("audit-grammar-choice-v2-ontology");
if (invokedDirectly) {
console.log("| Chapter | 규칙 수 | Registry 등록 | Pipeline 도달 | 필드 누락 | 중복 | 충돌 |");
console.log("| ------- | ---: | ----------- | ----------- | ----: | -: | -: |");
for (const row of rows) {
  console.log(`| ${row.chapter} | ${row.rules} | ${row.registry} | ${row.pipeline} | ${row.fieldMissing} | ${row.dup} | ${row.conflict} |`);
}

console.log("\n1. 전체 규칙 수");
console.log(allRules.length);
console.log("고유 code", new Set(allRules.map((rule) => rule.code)).size);
console.log("ontology point", GRAMMAR_ONTOLOGY.length);

console.log("\n2. 실제 도달 가능한 규칙 수");
console.log(reachable.length);
console.log("router 직접 언급 code", [...new Set(allRules.map((rule) => rule.code))].filter((code) => listed(routerText, ruleCode(code))).length);

function ruleCode(code: string): string {
  return code;
}

console.log("\n3. 누락된 Chapter 또는 규칙");
if (!FILES.CH12) console.log("- CH12 규칙 파일 없음. 비교급·최상급 code는 ontology에만 있고 referenceChapter 없음.");
for (const issue of issues.filter((item) => item.type === "MISSING_REGISTRY")) {
  console.log(`- ${issue.chapter}: ${issue.detail}`);
}
const mapped = new Set(GRAMMAR_ONTOLOGY.filter((point) => point.referenceChapter).map((point) => point.referenceChapter));
for (const chapter of CHAPTERS) {
  if (chapter === "CH12") continue;
  if (!mapped.has(chapter as never) && !(RULES[chapter] ?? []).length) console.log(`- ${chapter} registry referenceChapter 없음`);
}

console.log("\n4. 중복 code 목록");
const dupCodes = issues.filter((issue) => issue.type === "DUPLICATE_REGISTRY_ROW" || issue.type === "DUPLICATE_EXACT_PAIR" || issue.type === "ACTUAL_DUAL_EMITTER");
if (!dupCodes.length) console.log("- 없음");
for (const issue of dupCodes) console.log(`- ${issue.type} ${issue.detail}`);

console.log("\n5. Chapter 간 ownership 충돌 목록");
if (!owners.length) console.log("- 없음");
for (const owner of owners) {
  console.log(JSON.stringify(owner));
}
for (const issue of issues.filter((item) => item.type === "REFERENCE_CHAPTER_MISMATCH" || item.type === "MULTIPLE_MANDATORY_OWNER")) {
  console.log(`- ${issue.type} ${issue.chapter} ${issue.detail}`);
}
for (const issue of issues.filter((item) => item.type === "ANALYSIS_ONLY_OVERLAP" || item.type === "SHARED_FORM_DIFFERENT_AXIS" || item.type === "SECONDARY_OWNER_SUPPRESSED" || item.type === "ANALYSIS_OVERLAP")) {
  console.log(`- ${issue.type} ${issue.chapter} ${issue.detail}`);
}

console.log("\n6. 금지 pair 유입 가능성");
if (!forbidden.length) console.log("- 없음");
for (const line of forbidden) console.log(`- ${line}`);

console.log("\n7. REVIEW_REQUIRED 목록");
if (!review.length) console.log("- 없음");
for (const line of review) console.log(`- ${line}`);
console.log("- CH12는 registry와 local distractor에 연결됨. detector는 pipeline scan에 직접 연결되지 않음.");
console.log("- trigger-router는 일부 code만 prompt에 넣음. 대부분의 Chapter detector는 pipeline scan에 연결되지 않음.");

const blockingTypes = new Set([
  "ACTUAL_DUAL_EMITTER",
  "DUPLICATE_REGISTRY_ROW",
  "DUPLICATE_EXACT_PAIR",
  "REFERENCE_CHAPTER_MISMATCH",
  "MULTIPLE_MANDATORY_OWNER",
  "MISSING_REQUIRED_FIELD",
  "UNREACHABLE_RULE",
]);
const blocking = issues.filter((issue) => blockingTypes.has(issue.type));
console.log("\n8. audit test 통과 여부");
console.log(blocking.length ? "FAIL" : "PASS");
console.log(`blocking=${blocking.length} issues=${issues.length} forbiddenPairs=${forbidden.length} review=${review.length + 2}`);
if (blocking.length) process.exitCode = 1;
}
