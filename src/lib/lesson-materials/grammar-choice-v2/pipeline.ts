import {
  rankCandidates,
  sortStudentPresentationOrder,
} from "@/lib/lesson-materials/grammar-choice-v2/candidate-ranker";
import { buildCoverage } from "@/lib/lesson-materials/grammar-choice-v2/coverage";
import { COMPARISON_CH12_RULES } from "@/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { codeSpanContractMismatch, explanationContractMismatch } from "@/lib/lesson-materials/grammar-choice-v2/assessment-contract";
import { explanationFitsPair, repairChoice, safeLocalCandidates } from "@/lib/lesson-materials/grammar-choice-v2/choice-repair";
import { localCandidatesFromDetectors } from "@/lib/lesson-materials/grammar-choice-v2/local-candidates";
import { isWhToInfinitiveSpan } from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { explainChoice } from "@/lib/lesson-materials/grammar-choice-v2/explanation-templates";
import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  normalizeOccurrenceCounts,
  occurrenceIdOf,
} from "@/lib/lesson-materials/grammar-choice-v2/occurrence-metrics";
import {
  generationPolicyFor,
  localTemplateDistractor,
} from "@/lib/lesson-materials/grammar-choice-v2/generation-policy";
import {
  trimToMinimalPair,
  validateMinimalPair,
} from "@/lib/lesson-materials/grammar-choice-v2/minimal-pair";
import {
  needsAuditor,
  rejectCandidate,
  repairForbiddenConditionalDistractor,
  subtypeKey,
} from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import { scanLocalMandatory } from "@/lib/lesson-materials/grammar-choice-v2/mandatory-scan";
import {
  extractDetNounBefore,
  hasInterveningAgreement,
  isPostmodifyingPastParticiple,
} from "@/lib/lesson-materials/grammar-choice-v2/structure-frames";
import {
  assignSeededSides,
  passageHash,
  renderChoices,
  restoreCorrectAnswers,
} from "@/lib/lesson-materials/grammar-choice-v2/renderer";
import { findOccurrences, resolveSpan } from "@/lib/lesson-materials/grammar-choice-v2/span-resolver";
import type { UniquenessVerdict } from "@/lib/lesson-materials/grammar-choice-v2/uniqueness-audit";
import type {
  AuditResult,
  DetectedGrammarPoint,
  ExactSentence,
  GrammarCandidate,
  GrammarPriority,
  LocalRejectCode,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";
import { buildPassageSegmentsFromSource } from "@/lib/lesson-materials/grammar-choice-display";
import type {
  GrammarChoiceCandidate,
  WorkbookGrammarChoiceDiagnostics,
  WorkbookGrammarChoiceItem,
  WorkbookGrammarChoiceSection,
} from "@/lib/lesson-materials/workbook-types";

export type V2Reject = {
  candidateId: string;
  sentenceId: string;
  pointCode: GrammarCandidate["pointCode"];
  reason: string;
  pair: string;
};

export type FinalizeInput = {
  projectId: string;
  title: string;
  source: string | null;
  originalPassage: string;
  sentences: ExactSentence[];
  detected: DetectedGrammarPoint[];
  candidates: GrammarCandidate[];
  audits?: AuditResult[];
  /**
   * 생성과 분리된 블라인드 문법성 판정 결과.
   * 비어 있으면 게이트를 건너뛰므로 판정을 돌리지 않는 경로도 그대로 동작한다.
   */
  uniqueness?: UniquenessVerdict[];
  seedKey: string;
  diagnosticsBase: WorkbookGrammarChoiceDiagnostics;
};

/**
 * 정답만 문법적이라고 확인된 후보만 남긴다.
 *
 * 판정이 없는 후보도 떨어뜨린다(UNIQUENESS_UNVERIFIED). 판정 호출이 실패하거나
 * 35초 상한에 걸리거나 슬롯을 못 판 경우다. 예전에는 이런 후보를 그대로 통과시켜서,
 * OpenAI가 불안정한 날(2026-09-11: 요청의 절반가량이 500)에는 "둘 다 맞는" 문항을
 * 거르는 게이트가 조용히 꺼진 채 출제됐다. 모델이 끝없이 추론하다 실패하는 묶음은
 * 애매한 문항일 때가 많아서, 실패를 통과로 치면 걸러야 할 것이 먼저 새어 나간다.
 *
 * verdicts가 아예 없으면(undefined) 판정 단계가 돌지 않은 것이다. replay·테스트와
 * 판정 도입 전에 저장된 분석 캐시가 여기에 해당하므로 그대로 둔다.
 */
export function applyUniqueness(
  items: ResolvedCandidate[],
  verdicts: UniquenessVerdict[] | undefined
): { kept: ResolvedCandidate[]; rejected: V2Reject[] } {
  if (!verdicts) return { kept: items, rejected: [] };
  const byId = new Map(verdicts.map((v) => [v.candidateId, v]));
  const kept: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  for (const item of items) {
    const verdict = byId.get(item.candidateId);
    if (verdict?.unique) {
      kept.push(item);
      continue;
    }
    // 첫 오답이 떨어져도 두 번째 오답이 유일성을 통과하면 그쪽으로 살린다.
    const alt = item.distractors[1];
    if (alt && byId.get(`${item.candidateId}#alt`)?.unique) {
      kept.push({ ...item, distractors: [alt, item.distractors[0]!] });
      continue;
    }
    rejected.push({
      candidateId: item.candidateId,
      sentenceId: item.sentenceId,
      pointCode: item.pointCode,
      reason: verdict ? (verdict.reason ?? "BOTH_GRAMMATICAL") : "UNIQUENESS_UNVERIFIED",
      pair: `${item.correctAnswer} / ${item.distractors[0] ?? ""}`,
    });
  }
  return { kept, rejected };
}

export function resolveAndFilter(input: {
  sentences: ExactSentence[];
  candidates: GrammarCandidate[];
}): { resolved: ResolvedCandidate[]; rejected: V2Reject[] } {
  const byId = new Map(input.sentences.map((s) => [s.sentenceId, s]));
  const extras = input.sentences.flatMap((s) => [
    ...safeLocalCandidates(s.sentenceId, s.text),
    ...localCandidatesFromDetectors(s.sentenceId, s.text),
  ]);
  /**
   * 같은 (문장, 코드, 스팬)을 로컬과 모델이 함께 내놓으면 로컬 쪽을 쓴다.
   *
   * 예전에는 모델 후보를 먼저 넣어서 겹치는 자리를 모델이 차지했다. 그래서
   * 검출기를 후보 공급원으로 올려도 최종 45문항 중 로컬이 만든 것은 3개(7%)뿐이었다.
   * 같은 문법 지점을 같은 스팬에서 묻는다면 어느 쪽을 써도 문항은 같고, 로컬
   * 템플릿은 실행마다 같은 오답을 만든다. 겹치는 자리를 로컬로 채우면 같은 지문을
   * 다시 생성했을 때 문항이 덜 흔들린다(예전 관측: 같은 4지문이 35 / 44 / 36).
   */
  const keyOf = (c: GrammarCandidate) =>
    `${c.sentenceId}|${c.pointCode}|${c.sourceSpan.toLowerCase()}`;
  const seenLocal = new Set(extras.map(keyOf));
  const candidates = [
    ...extras,
    ...input.candidates.filter((c) => !seenLocal.has(keyOf(c))),
  ];
  const resolved: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  const seenPair = new Set<string>();

  for (const raw of candidates) {
    let candidate = repairForbiddenConditionalDistractor(raw);
    const policy = generationPolicyFor(candidate.pointCode);
    if (policy === "NOT_QUESTIONABLE") {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "NOT_PEDAGOGICALLY_USEFUL",
        pair: `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`,
      });
      continue;
    }
    const sentence = byId.get(candidate.sentenceId);
    if (sentence) {
      const repaired = repairChoice({
        pointCode: candidate.pointCode,
        correct: candidate.sourceSpan,
        wrong: candidate.distractors[0] ?? "",
        sentence: sentence.text,
      });
      if (repaired && sentence.text.toLowerCase().includes(repaired.correct.toLowerCase())) {
        const hits = findOccurrences(sentence.text, repaired.correct);
        const occurrenceIndex = Math.max(0, hits.findIndex((hit) => hit === repaired.at));
        candidate = {
          ...candidate,
          pointCode: repaired.pointCode,
          sourceSpan: repaired.correct,
          correctAnswer: repaired.correct,
          distractors: [repaired.wrong],
          occurrenceIndex,
        };
      }
    }
    if (
      candidate.pointCode === "INDIRECT_QUESTION_ORDER" &&
      isWhToInfinitiveSpan(`${candidate.sourceSpan} ${candidate.correctAnswer}`)
    ) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "ANALYSIS_ONLY",
        pair: `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`,
      });
      continue;
    }
    const repairedPolicy = generationPolicyFor(candidate.pointCode);
    if (repairedPolicy === "LOCAL_TEMPLATE" && sentence) {
      const shrunk = shrinkLocalSpan(candidate.sourceSpan, sentence.text, candidate.pointCode);
      if (shrunk) {
        candidate = {
          ...candidate,
          sourceSpan: shrunk,
          correctAnswer: shrunk,
          occurrenceIndex: 0,
        };
      }
      const localWrong = localTemplateDistractor(
        candidate.pointCode,
        candidate.sourceSpan
      );
      if (localWrong) candidate = { ...candidate, distractors: [localWrong] };
    }
    const pair = `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`;
    if (!sentence) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "SOURCE_SPAN_NOT_FOUND",
        pair,
      });
      continue;
    }
    const span =
      resolveSpan({
        sentence,
        sourceSpan: candidate.sourceSpan,
        occurrenceIndex: candidate.occurrenceIndex,
      }) ??
      resolveSpan({
        sentence,
        sourceSpan: candidate.sourceSpan,
        occurrenceIndex:
          candidate.occurrenceIndex > 0 ? candidate.occurrenceIndex - 1 : 1,
      });
    if (!span || span.resolvedText !== candidate.sourceSpan) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "SOURCE_SPAN_NOT_FOUND",
        pair,
      });
      continue;
    }
    if (candidate.correctAnswer !== candidate.sourceSpan) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "SOURCE_ANSWER_MISMATCH",
        pair,
      });
      continue;
    }
    // 선택지가 절 단위로 길게 잡혀 오면, 실제로 다른 구간만 남겨 네모에 넣는다.
    // 원본 스팬 위치는 이미 확정됐으므로 지문에서 다시 찾지 않고 오프셋만 더한다.
    const trimTrailing = !testsWordOrder(candidate);
    const trimmed = spansWholeClause(candidate)
      ? trimToMinimalPair(
          candidate.correctAnswer,
          candidate.distractors[0] ?? "",
          { trimTrailing }
        )
      : null;
    if (trimmed) {
      const start = span.passageStart + trimmed.startOffset;
      const alt = candidate.distractors[1];
      const altTrimmed = alt
        ? trimToMinimalPair(candidate.correctAnswer, alt, { trimTrailing })
        : null;
      candidate = {
        ...candidate,
        correctAnswer: trimmed.correct,
        sourceSpan: trimmed.correct,
        // 잘라낸 폭이 다른 대체 오답은 같은 네모에 못 들어가므로 버린다.
        distractors:
          altTrimmed && altTrimmed.startOffset === trimmed.startOffset
            ? [trimmed.wrong, altTrimmed.wrong]
            : [trimmed.wrong],
      };
      span.passageStart = start;
      span.passageEnd = start + trimmed.correct.length;
    }

    /**
     * 로컬 검증은 자른 뒤에 한다.
     *
     * 예전에는 자르기 전에 검증했다. 그런데 챕터 검증기의 NON_MINIMAL_SPAN 문턱
     * (4단어)이 spansWholeClause의 문턱과 같은 값이라, 자르면 최소 대립쌍이 되는
     * 후보가 자르기에 닿기도 전에 전부 NON_MINIMAL_SPAN으로 떨어졌다. 실측에서
     * 이 사유 하나가 전체 탈락의 최다(12건)였고 문항 0개 문장 12개 중 7개가
     * 여기서 나왔다.
     *
     * 학생이 네모에서 보는 것은 자른 쌍이므로, 검증 대상도 자른 쌍이어야 맞다.
     */
    const localCheck = (row: typeof candidate) =>
      rejectCandidate({ candidate: row, sentence }) ??
      validateMinimalPair({
        pointCode: row.pointCode,
        sourceSpan: row.sourceSpan,
        distractor: row.distractors[0] ?? "",
        sentence: sentence.text,
      });

    /**
     * 낱말 하나만 다르면 그 낱말만 네모에 넣는다.
     *
     * [naturally and necessary / natural and necessary]처럼 접속사와 뒤 낱말까지
     * 물고 있으면 학생이 어디를 보라는 것인지 흐려진다. 위쪽 자르기는 5단어
     * 이상만 대상이라 3단어짜리 이런 쌍이 그대로 남았다.
     *
     * 낱말 수가 같고 정확히 한 자리만 다를 때만 줄인다. made to move / made move처럼
     * 낱말 수가 다른 쌍은 건드리지 않으므로 구문 전체를 보여 주던 문항은 그대로다.
     * 줄인 쌍이 로컬 검증에 걸리면(is made / is making의 made / making처럼 조동사가
     * 빠져 판정이 달라지는 경우) 줄이지 않고 원래 쌍으로 간다.
     */
    const narrowed = trimmed ? null : narrowToOneWord(candidate);
    let local: ReturnType<typeof localCheck>;
    if (narrowed && !localCheck(narrowed.candidate)) {
      const start = span.passageStart + narrowed.startOffset;
      span.passageStart = start;
      span.passageEnd = start + narrowed.candidate.correctAnswer.length;
      candidate = narrowed.candidate;
      local = null;
    } else {
      local = localCheck(candidate);
    }
    /**
     * NON_MINIMAL_SPAN이면 한 번 더 잘라 본다.
     *
     * 위의 자르기는 spansWholeClause(5단어 이상)만 대상으로 한다. 그런데
     * our families and friends / our families and friendly처럼 정확히 4단어인 쌍은
     * 자르기 대상이 아니면서 챕터 검증기에서는 NON_MINIMAL_SPAN으로 떨어진다.
     * 잘라서 friends / friendly가 되면 학생이 봐야 할 것이 한 낱말로 줄어든다.
     *
     * 자른 쌍은 아래 게이트를 처음부터 다시 통과해야 하고(느슨해지는 것이 없다),
     * 통과하지 못하면 원래 사유로 떨어뜨린다.
     */
    if (local === "NON_MINIMAL_SPAN" && !trimmed) {
      const retry = trimToMinimalPair(
        candidate.correctAnswer,
        candidate.distractors[0] ?? "",
        { trimTrailing: !testsWordOrder(candidate) }
      );
      if (retry) {
        const retried = {
          ...candidate,
          correctAnswer: retry.correct,
          sourceSpan: retry.correct,
          distractors: [retry.wrong],
        };
        if (!localCheck(retried)) {
          const start = span.passageStart + retry.startOffset;
          span.passageStart = start;
          span.passageEnd = start + retry.correct.length;
          candidate = retried;
          local = null;
        }
      }
    }
    const finalPair = `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`;
    if (local) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: local,
        pair: finalPair,
      });
      continue;
    }

    const exactPair = `${candidate.sentenceId}|${candidate.sourceSpan}|${normalize(candidate.distractors[0] ?? "")}`;
    if (seenPair.has(exactPair)) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "DUPLICATE_SATISFIED_BY_PRIMARY",
        pair,
      });
      continue;
    }
    seenPair.add(exactPair);
    const def = ontologyPoint(candidate.pointCode);
    const presented = studentPresentation(
      candidate.pointCode,
      candidate.correctAnswer,
      candidate.distractors[0] ?? "",
      sentence.text
    );
    const contract = codeSpanContractMismatch({
      pointCode: candidate.pointCode,
      subtype: presented.subtype,
      assessmentAxis: presented.assessmentAxis,
      correct: candidate.correctAnswer,
      wrong: candidate.distractors[0] ?? "",
      sentence: sentence.text,
    });
    if (contract) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: contract,
        pair,
      });
      continue;
    }
    resolved.push({
      ...candidate,
      ruleSummaryKo: presentationSummary(presented.subtype, candidate, sentence.text) ?? candidate.ruleSummaryKo,
      priority: presented.priority ?? def?.priority ?? candidate.priority,
      passageStart: span.passageStart,
      passageEnd: span.passageEnd,
      subtypeKey: presented.subtype,
    });
  }
  return { resolved, rejected };
}

function studentPresentation(
  pointCode: string,
  correct: string,
  wrong: string,
  sentence = ""
): { subtype: string; assessmentAxis: string; priority?: GrammarPriority } {
  const pair = [correct, wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pointCode === "ONE_OF_SUPERLATIVE" && pair === "insight|insights") {
    const rule = COMPARISON_CH12_RULES.find(
      (row) => row.code === "ONE_OF_SUPERLATIVE" && row.subtype === "ONE_OF_PLURAL"
    );
    return { subtype: "ONE_OF_PLURAL", assessmentAxis: "ONE_OF_PLURAL", priority: rule?.priority };
  }
  if (pointCode === "PREPOSITION_INSTEAD_OF") {
    return { subtype: "INSTEAD_OF_NOUN", assessmentAxis: "FIXED_PREPOSITIONAL_PHRASE" };
  }
  if (pointCode === "NOUN_CLAUSE_DECLARATIVE_ORDER") {
    return { subtype: "OMITTED_THAT_SV_ORDER", assessmentAxis: "NOUN_CLAUSE_DECLARATIVE_ORDER" };
  }
  if (pointCode === "GERUND_PREPOSITION_OBJECT") {
    return { subtype: "PREP_GERUND", assessmentAxis: "GERUND_PREPOSITION_OBJECT", priority: "CORE" };
  }
  if (pointCode === "INFINITIVE_PASSIVE" && pair === "be wiped|wipe") {
    return { subtype: "TO_BE_PP", assessmentAxis: "INFINITIVE_PASSIVE" };
  }
  if (pointCode === "AGREEMENT_DISTANCE" && hasInterveningAgreement(sentence, correct)) {
    return { subtype: "INTERVENING_MODIFIER", assessmentAxis: "AGREEMENT_DISTANCE", priority: "CORE" };
  }
  if (pointCode === "PARTICIPLE_ACTIVE_PASSIVE" && isPostmodifyingPastParticiple(sentence, correct)) {
    return { subtype: "POSTMODIFYING_PP", assessmentAxis: "PARTICIPLE_ACTIVE_PASSIVE" };
  }
  if (pointCode === "RELATIVE_PREPOSITION_WHICH" && pair === "that|which") {
    return { subtype: "PREP_WHICH", assessmentAxis: "RELATIVE_PREPOSITION_WHICH" };
  }
  if (pointCode === "COMPARATIVE" && pair === "as|than") {
    return { subtype: "THAN_FRAME", assessmentAxis: "COMPARATIVE" };
  }
  if (pointCode === "CORRELATIVE_EITHER_OR" && pair !== "nor|or") {
    return { subtype: "EITHER_OR_PARALLEL", assessmentAxis: "CORRELATIVE_EITHER_OR" };
  }
  if (pointCode === "CONJUNCTION_PREPOSITION_CONTRAST" && pair === "during|when") {
    return {
      subtype: "CLAUSE_VS_PHRASE",
      assessmentAxis: "CONJUNCTION_PREPOSITION_CONTRAST",
      priority: "BASIC",
    };
  }
  return { subtype: subtypeKey(pointCode, correct, wrong), assessmentAxis: pointCode };
}

function presentationSummary(
  subtype: string,
  item: { correctAnswer: string; ruleSummaryKo?: string },
  sentence: string
): string | null {
  if (subtype === "INTERVENING_MODIFIER") {
    return "주어와 동사 사이에 수식어가 삽입된 장거리 수 일치이므로 동사는 실제 주어의 수를 따른다.";
  }
  if (subtype === "POSTMODIFYING_PP") {
    const np = extractDetNounBefore(sentence, item.correctAnswer);
    return np
      ? `명사 뒤에서 후치수식하는 과거분사: ${np} ${item.correctAnswer}`
      : `명사 뒤에서 후치수식하는 과거분사이므로 ${item.correctAnswer}가 맞다.`;
  }
  return null;
}

function repeatedCodeSubtypePairs(
  items: Array<{
    correctText: string;
    incorrectText: string;
    grammarCategoryId: string;
    internalProvenance?: { subtype?: string; code?: string } | null;
  }>
): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const pair = [item.correctText, item.incorrectText].map((s) => s.trim().toLowerCase()).sort().join("|");
    const key = `${item.internalProvenance?.code ?? item.grammarCategoryId}|${item.internalProvenance?.subtype ?? ""}|${pair}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([key]) => key);
}

function shrinkLocalSpan(span: string, sentence: string, pointCode: string): string | null {
  if (!pointCode.startsWith("CONDITIONAL_")) return null;
  if (/\bhad\b/i.test(span) && findWord(sentence, "had")) return "had";
  if (/\bwere\b/i.test(span) && findWord(sentence, "were")) return "were";
  return null;
}

function findWord(sentence: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(sentence);
}

function refineAfterAudit(
  items: ResolvedCandidate[],
  sentences: ExactSentence[]
): { kept: ResolvedCandidate[]; rejected: V2Reject[] } {
  const byId = new Map(sentences.map((s) => [s.sentenceId, s]));
  const kept: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  for (const item of items) {
    const sentence = byId.get(item.sentenceId);
    if (!sentence) {
      kept.push(item);
      continue;
    }
    const repaired = repairChoice({
      pointCode: item.pointCode,
      correct: item.correctAnswer,
      wrong: item.distractors[0] ?? "",
      sentence: sentence.text,
    });
    let next = item;
    if (
      repaired &&
      repaired.correct !== item.correctAnswer &&
      sentence.text.toLowerCase().includes(repaired.correct.toLowerCase())
    ) {
      const hits = findOccurrences(sentence.text, repaired.correct);
      const occurrenceIndex = Math.max(0, hits.findIndex((hit) => hit === repaired.at));
      const span =
        resolveSpan({ sentence, sourceSpan: repaired.correct, occurrenceIndex }) ??
        resolveSpan({
          sentence,
          sourceSpan: repaired.correct,
          occurrenceIndex: occurrenceIndex > 0 ? occurrenceIndex - 1 : 1,
        });
      if (span && span.resolvedText === repaired.correct) {
        const presented = studentPresentation(
          repaired.pointCode,
          repaired.correct,
          repaired.wrong,
          sentence.text
        );
        next = {
          ...item,
          pointCode: repaired.pointCode,
          sourceSpan: repaired.correct,
          correctAnswer: repaired.correct,
          distractors: [repaired.wrong],
          occurrenceIndex,
          passageStart: span.passageStart,
          passageEnd: span.passageEnd,
          subtypeKey: presented.subtype,
          priority: presented.priority ?? item.priority,
          ruleSummaryKo:
            presentationSummary(
              presented.subtype,
              { ...item, correctAnswer: repaired.correct },
              sentence.text
            ) ?? item.ruleSummaryKo,
        };
      }
    }
    const presented = studentPresentation(
      next.pointCode,
      next.correctAnswer,
      next.distractors[0] ?? "",
      sentence.text
    );
    const contract = codeSpanContractMismatch({
      pointCode: next.pointCode,
      subtype: presented.subtype,
      assessmentAxis: presented.assessmentAxis,
      correct: next.correctAnswer,
      wrong: next.distractors[0] ?? "",
      sentence: sentence.text,
    });
    if (contract) {
      rejected.push({
        candidateId: next.candidateId,
        sentenceId: next.sentenceId,
        pointCode: next.pointCode,
        reason: contract,
        pair: `${next.correctAnswer} / ${next.distractors[0] ?? ""}`,
      });
      continue;
    }
    kept.push({ ...next, subtypeKey: presented.subtype, priority: presented.priority ?? next.priority });
  }
  return { kept, rejected };
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function applyAudits(
  items: ResolvedCandidate[],
  audits: AuditResult[] | undefined
): { kept: ResolvedCandidate[]; rejected: V2Reject[] } {
  if (!audits || audits.length === 0) return { kept: items, rejected: [] };
  const byId = new Map(audits.map((a) => [a.candidateId, a]));
  const kept: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  for (const item of items) {
    if (!needsAuditor(item)) {
      kept.push(item);
      continue;
    }
    const audit = byId.get(item.candidateId);
    const pass =
      audit?.decision === "PASS" &&
      audit.uniqueInContext &&
      audit.plausibleLearnerError &&
      audit.singleGrammarAxis;
    if (!pass) {
      const alt = item.distractors[1];
      const altId = `${item.candidateId}#alt`;
      const altAudit = byId.get(altId);
      const altPass =
        !!alt &&
        altAudit?.decision === "PASS" &&
        altAudit.uniqueInContext &&
        altAudit.plausibleLearnerError &&
        altAudit.singleGrammarAxis;
      if (altPass) {
        kept.push(
          withCorrectedPointCode(
            { ...item, distractors: [alt, item.distractors[0]!] },
            altAudit
          )
        );
        continue;
      }
      rejected.push({
        candidateId: item.candidateId,
        sentenceId: item.sentenceId,
        pointCode: item.pointCode,
        reason: audit?.rejectionCode || "BOTH_GRAMMATICAL",
        pair: `${item.correctAnswer} / ${item.distractors[0] ?? ""}`,
      });
      continue;
    }
    kept.push(withCorrectedPointCode(item, audit));
  }
  return { kept, rejected };
}

/**
 * 감사 모델이 point code를 바로잡아 주면 반영한다. 반영하지 않으면 문항에 엉뚱한
 * 문법 이름이 붙는다(예: 관계대명사 what 문항이 "복합관계사"로 표시).
 * 온톨로지에 있는 코드일 때만 받아들인다.
 */
function withCorrectedPointCode(
  item: ResolvedCandidate,
  audit: AuditResult | undefined
): ResolvedCandidate {
  const corrected = audit?.correctedRuleCode;
  if (!corrected || corrected === item.pointCode) return item;
  if (!ontologyPoint(corrected)) return item;
  return { ...item, pointCode: corrected };
}

export function expandAuditItems(items: ResolvedCandidate[]): ResolvedCandidate[] {
  const out: ResolvedCandidate[] = [];
  for (const item of items) {
    if (!needsAuditor(item)) continue;
    out.push(item);
    if (
      item.priority === "MANDATORY" &&
      item.distractors[1] &&
      item.distractors[1] !== item.distractors[0]
    ) {
      out.push({
        ...item,
        candidateId: `${item.candidateId}#alt`,
        distractors: [item.distractors[1], item.distractors[0]!],
      });
    }
  }
  return out;
}

export function finalizeV2Passage(input: FinalizeInput): {
  ok: boolean;
  section?: WorkbookGrammarChoiceSection;
  rejected: V2Reject[];
  missingMandatory: string[];
  reason?: string;
  stages: PipelineStages;
} {
  const filtered = resolveAndFilter({
    sentences: input.sentences,
    candidates: input.candidates,
  });
  // 유일성 게이트는 검수보다 앞이다. 여기서 떨어진 항목은 검수에 보낼 필요가 없다.
  const unique = applyUniqueness(filtered.resolved, input.uniqueness);
  const beforeReviewer = unique.kept;
  const audited = applyAudits(unique.kept, input.audits);
  const refined = refineAfterAudit(audited.kept, input.sentences);
  const beforeRank = refined.kept;
  const ranked = rankCandidates(beforeRank, input.sentences.length, input.sentences);
  const rejected: V2Reject[] = [
    ...filtered.rejected,
    ...unique.rejected,
    ...audited.rejected,
    ...refined.rejected,
    ...ranked.dropped.map((d) => ({
      candidateId: d.item.candidateId,
      sentenceId: d.item.sentenceId,
      pointCode: d.item.pointCode,
      reason: d.reason,
      pair: `${d.item.correctAnswer} / ${d.item.distractors[0] ?? ""}`,
    })),
  ];

  const explainable = ranked.kept.filter((item) => {
    const explained = explainChoice({
      pointCode: item.pointCode,
      correct: item.correctAnswer,
      wrong: item.distractors[0] ?? "",
      ruleSummaryKo: item.ruleSummaryKo,
      evidence: item.evidence,
      transformCode: item.transformCode,
    });
    const text = `${explained.explanationKo} ${explained.wrongReasonKo} ${explained.structure}`;
    if (
      explanationFitsPair(text, item.correctAnswer, item.distractors[0] ?? "") &&
      !explanationContractMismatch({
        pointCode: item.pointCode,
        correct: item.correctAnswer,
        wrong: item.distractors[0] ?? "",
        explanation: text,
      })
    ) {
      return true;
    }
    rejected.push({
      candidateId: item.candidateId,
      sentenceId: item.sentenceId,
      pointCode: item.pointCode,
      reason: explanationContractMismatch({
        pointCode: item.pointCode,
        correct: item.correctAnswer,
        wrong: item.distractors[0] ?? "",
        explanation: text,
      })
        ? "CODE_SPAN_CONTRACT_MISMATCH"
        : "EXPLANATION_MISMATCH",
      pair: `${item.correctAnswer} / ${item.distractors[0] ?? ""}`,
    });
    return false;
  });

  const localMandatory = scanLocalMandatory(input.sentences);
  const coverage = buildCoverage({
    sentenceIds: input.sentences.map((s) => s.sentenceId),
    detected: input.detected,
    localMandatory,
    approved: explainable,
    resolved: filtered.resolved,
    droppedReasons: rejected.map((r) => ({
      sentenceId: r.sentenceId,
      pointCode: r.pointCode,
      reason: r.reason,
      pair: r.pair,
    })),
  });

  const ordered = sortStudentPresentationOrder(explainable);
  const sides = assignSeededSides(ordered, input.seedKey);
  const numbered = ordered.map((item, i) => ({
    ...item,
    number: i + 1,
    leftText: sides[i]!.leftText,
    rightText: sides[i]!.rightText,
    correctSide: sides[i]!.correctSide,
  }));
  const rendered = renderChoices({
    originalPassage: input.originalPassage,
    items: numbered,
  });
  const restored = restoreCorrectAnswers(
    rendered.rendered,
    numbered.map((n) => ({ number: n.number, correctText: n.correctAnswer }))
  );
  const stages = buildStages({
    candidates: input.candidates,
    filtered,
    beforeReviewer,
    audited,
    beforeRank,
    ranked,
    explainable,
    coverage,
    rejected,
    ok: restored === input.originalPassage,
    reason: restored === input.originalPassage ? undefined : "원문 복원 실패",
  });

  if (restored !== input.originalPassage) {
    return {
      ok: false,
      rejected,
      missingMandatory: [],
      reason: "원문 복원 실패",
      stages,
    };
  }

  const items = toWorkbookItems(numbered);
  const segments = buildPassageSegmentsFromSource(
    input.originalPassage,
    items
  );
  if (!segments || items.length !== numbered.length) {
    return {
      ok: false,
      rejected,
      missingMandatory: [],
      reason: "렌더 불변식 실패",
      stages,
    };
  }

  const rejectReasonCounts: Record<string, number> = {};
  for (const r of rejected) {
    rejectReasonCounts[r.reason] = (rejectReasonCounts[r.reason] ?? 0) + 1;
  }
  const mix = { BASIC: 0, CORE: 0, ADVANCED: 0 };
  for (const item of numbered) mix[item.difficulty] += 1;

  const counts = normalizeOccurrenceCounts({
    detected: input.detected,
    occurrences: coverage.occurrences,
    renderedStudentItems: items.length,
  });

  const diagnostics: WorkbookGrammarChoiceDiagnostics = {
    ...input.diagnosticsBase,
    generatedCandidateCount: input.candidates.length,
    codeValidatedCount: filtered.resolved.length,
    originalMismatchCount: rejected.filter((r) =>
      r.reason.startsWith("SOURCE_")
    ).length,
    overlapDuplicateCount: rejected.filter((r) =>
      r.reason.includes("OVERLAP") || r.reason.includes("DUPLICATE")
    ).length,
    reviewSubmittedCount: expandAuditItems(filtered.resolved).length,
    reviewAcceptedCount: explainable.length,
    mandatoryDetected: coverage.metrics.mandatoryDetected,
    mandatoryEligible: coverage.metrics.mandatoryEligible,
    mandatoryRendered: coverage.metrics.mandatoryRendered,
    mandatoryExcludedWithValidReason: coverage.metrics.mandatoryExcludedWithValidReason,
    sectionStatus: coverage.metrics.missingEligible > 0 ? "PARTIAL" : "COMPLETE",
    analysisOnlyCount: coverage.metrics.analysisOnly,
    eligibleQuestionCount: coverage.metrics.eligible,
    excludedOccurrenceCount: coverage.metrics.excluded,
    missingEligibleCount: coverage.metrics.missingEligible,
    mandatoryCoverage: coverage.metrics.coverage,
    detectedMandatoryOccurrences: counts.detectedMandatoryOccurrences,
    analysisOnlyMandatoryOccurrences: counts.analysisOnlyMandatoryOccurrences,
    eligibleMandatoryOccurrences: counts.eligibleMandatoryOccurrences,
    validExcludedMandatoryOccurrences: counts.validExcludedMandatoryOccurrences,
    renderedMandatoryOccurrences: counts.renderedMandatoryOccurrences,
    missingEligibleMandatoryOccurrences: counts.missingEligibleMandatoryOccurrences,
    totalEligibleQuestions: counts.totalEligibleQuestions,
    totalRenderedQuestions: counts.totalRenderedQuestions,
    totalExcludedOccurrences: counts.totalExcludedOccurrences,
    countUnits: counts.units,
    finalCount: items.length,
    finalQuestionCount: items.length,
    renderedQuestionCount: items.length,
    newQuestionCount: items.length,
    grammarCategoryCount: new Set(items.map((i) => i.grammarCategoryId)).size,
    passageRestored: true,
    countMismatch: false,
    difficultyMix: mix,
    rejectReasonCounts,
    repeatedCodeSubtypePairs: repeatedCodeSubtypePairs(items),
    underTargetReason: null,
  };

  const section: WorkbookGrammarChoiceSection = {
    projectId: input.projectId,
    title: input.title,
    source: input.source,
    sourcePassage: input.originalPassage,
    items,
    segments,
    algorithmVersion: "grammar-choice-v2",
    diagnostics,
  };

  if (
    diagnostics.finalQuestionCount !== items.length ||
    section.items.length !== items.length
  ) {
    return { ok: false, rejected, missingMandatory: [], reason: "개수 불일치", stages };
  }

  stages.finalize = { ok: true, reason: undefined, sectionStatus: diagnostics.sectionStatus ?? null };
  stages.studentItems = items;
  return { ok: true, section, rejected, missingMandatory: coverage.missing, stages };
}

export type PipelineStages = {
  afterAnalyzer: GrammarCandidate[];
  afterLocalFilter: { resolved: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeReviewer: ResolvedCandidate[];
  afterReviewer: { kept: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeRank: ResolvedCandidate[];
  afterRank: { kept: ResolvedCandidate[]; dropped: Array<{ item: ResolvedCandidate; reason: string }> };
  beforeDedup: ResolvedCandidate[];
  afterDedup: ResolvedCandidate[];
  coverage: ReturnType<typeof buildCoverage>;
  finalize: { ok: boolean; reason?: string; sectionStatus: string | null };
  studentItems: WorkbookGrammarChoiceItem[];
  exclusions: V2Reject[];
  occurrences: ReturnType<typeof buildCoverage>["occurrences"];
};

function buildStages(input: {
  candidates: GrammarCandidate[];
  filtered: { resolved: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeReviewer: ResolvedCandidate[];
  audited: { kept: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeRank: ResolvedCandidate[];
  ranked: { kept: ResolvedCandidate[]; dropped: Array<{ item: ResolvedCandidate; reason: string }> };
  explainable: ResolvedCandidate[];
  coverage: ReturnType<typeof buildCoverage>;
  rejected: V2Reject[];
  ok: boolean;
  reason?: string;
}): PipelineStages {
  return {
    afterAnalyzer: input.candidates,
    afterLocalFilter: input.filtered,
    beforeReviewer: input.beforeReviewer,
    afterReviewer: input.audited,
    beforeRank: input.beforeRank,
    afterRank: input.ranked,
    beforeDedup: input.beforeRank,
    afterDedup: input.explainable,
    coverage: input.coverage,
    finalize: { ok: input.ok, reason: input.reason, sectionStatus: null },
    studentItems: [],
    exclusions: input.rejected,
    occurrences: input.coverage.occurrences,
  };
}

function toWorkbookItems(
  numbered: Array<
    ResolvedCandidate & {
      number: number;
      leftText: string;
      rightText: string;
      correctSide: "left" | "right";
    }
  >
): WorkbookGrammarChoiceItem[] {
  return numbered.map((item) => {
    const explained = explainChoice({
      pointCode: item.pointCode,
      correct: item.correctAnswer,
      wrong: item.distractors[0] ?? "",
      ruleSummaryKo: item.ruleSummaryKo,
      evidence: item.evidence,
      transformCode: item.transformCode,
    });
    const difficulty =
      item.difficulty === "ADVANCED" ? 5 : item.difficulty === "CORE" ? 3 : 2;
    return {
      number: item.number,
      choiceId: item.candidateId,
      internalProvenance: {
        code: item.pointCode,
        subtype: item.subtypeKey,
        priority: item.priority,
        assessmentAxis: studentPresentation(item.pointCode, item.correctAnswer, item.distractors[0] ?? "").assessmentAxis,
        occurrenceId: occurrenceIdOf({
          sentenceId: item.sentenceId,
          code: item.pointCode,
          sourceSpan: item.sourceSpan,
        }),
        sourceSpan: item.sourceSpan,
        candidateId: item.candidateId,
        exclusionReason: null,
      },
      sentenceId: item.sentenceId,
      startTokenIndex: 0,
      endTokenIndex: 0,
      startCharIndex: item.passageStart,
      endCharIndex: item.passageEnd,
      originalText: item.correctAnswer,
      correctText: item.correctAnswer,
      incorrectText: item.distractors[0] ?? "",
      leftText: item.leftText,
      rightText: item.rightText,
      correctSide: item.correctSide,
      grammarCategoryId: item.pointCode,
      grammarCategoryName: explained.titleKo,
      bookTerm: explained.titleKo,
      explanationKo: explained.explanationKo,
      incorrectReasonKo: explained.wrongReasonKo,
      difficulty,
      learningValue: item.priority === "MANDATORY" ? 5 : 3,
      structureSummary: explained.structure,
    };
  });
}

export function hashPassage(text: string): string {
  return passageHash(text);
}

export type { LocalRejectCode, GrammarChoiceCandidate };

/**
 * 어순 자체가 출제 대상인 문항. 뒤쪽 공통 토큰까지 잘라내면 두 어순의 대비가
 * 사라지므로(예: [you have / do you have]가 [you / do you]가 된다) 앞쪽만 자른다.
 */
function testsWordOrder(candidate: GrammarCandidate): boolean {
  if (candidate.transformCode === "WORD_ORDER") return true;
  return (
    candidate.pointCode === "INDIRECT_QUESTION_ORDER" ||
    candidate.pointCode === "NOUN_CLAUSE_DECLARATIVE_ORDER" ||
    candidate.pointCode.startsWith("INVERSION_")
  );
}

/**
 * 낱말 수가 같고 정확히 한 자리만 다른 쌍을 그 낱말 하나로 줄인다.
 *
 * 위치 계산과 꼬리 문장부호는 trimToMinimalPair에 맡긴다. 공백을 기준으로
 * 다시 이어 붙여 오프셋을 세면 원문의 공백 폭이 달라질 때 네모가 어긋난다.
 * 대체 오답은 같은 낱말에서만 다를 때 함께 줄이고, 아니면 버린다
 * (잘라낸 폭이 다른 오답은 같은 네모에 못 들어간다).
 */
function narrowToOneWord(
  candidate: GrammarCandidate
): { candidate: GrammarCandidate; startOffset: number } | null {
  if (testsWordOrder(candidate)) return null;
  const wrong = candidate.distractors[0] ?? "";
  const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);
  const c = words(candidate.correctAnswer);
  const w = words(wrong);
  if (c.length < 2 || c.length !== w.length) return null;
  const diffs = c.filter((token, i) => token.toLowerCase() !== w[i]!.toLowerCase());
  if (diffs.length !== 1) return null;

  const narrowed = trimToMinimalPair(candidate.correctAnswer, wrong);
  if (!narrowed) return null;
  const alt = candidate.distractors[1];
  const altNarrowed = alt ? trimToMinimalPair(candidate.correctAnswer, alt) : null;
  const keepAlt =
    altNarrowed !== null &&
    altNarrowed.startOffset === narrowed.startOffset &&
    altNarrowed.correct === narrowed.correct;
  return {
    startOffset: narrowed.startOffset,
    candidate: {
      ...candidate,
      correctAnswer: narrowed.correct,
      sourceSpan: narrowed.correct,
      distractors: keepAlt ? [narrowed.wrong, altNarrowed.wrong] : [narrowed.wrong],
    },
  };
}

/**
 * 선택지가 절 길이로 잡혀 네모 안에 넣기 어려운 후보인지 본다.
 * be made to V처럼 구문 전체가 보여야 하는 짧은 스팬은 건드리지 않는다.
 */
const WHOLE_CLAUSE_TOKEN_THRESHOLD = 4;

function spansWholeClause(candidate: GrammarCandidate): boolean {
  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  return (
    wordCount(candidate.correctAnswer) > WHOLE_CLAUSE_TOKEN_THRESHOLD ||
    wordCount(candidate.distractors[0] ?? "") > WHOLE_CLAUSE_TOKEN_THRESHOLD
  );
}
