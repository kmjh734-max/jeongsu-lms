import { detectComparisonCh12 } from "@/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { detectConditionalCh05 } from "@/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { detectConjunctionCh10 } from "@/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { detectGerundCh07 } from "@/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { detectInfinitiveCh06 } from "@/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { detectModalCh04 } from "@/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { detectNonfiniteCh09 } from "@/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { detectParticipleCh08 } from "@/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { detectPartsCh13 } from "@/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { detectRelativeCh11 } from "@/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import { detectSentenceCh01 } from "@/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectSpecialCh14 } from "@/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { detectTenseCh02 } from "@/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { detectVoiceCh03 } from "@/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import {
  generationPolicyFor,
  localTemplateDistractor,
} from "@/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { findOccurrences } from "@/lib/lesson-materials/grammar-choice-v2/span-resolver";
import type {
  DetectedGrammarPoint,
  GrammarCandidate,
  GrammarPointCode,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

/**
 * 14개 챕터 검출기가 공통으로 돌려주는 모양.
 * occurrenceIndex는 문자 오프셋이다(등장 순서가 아니다). 후보로 옮길 때 순서로 바꾼다.
 */
export type DetectorHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  /**
   * 13개 챕터는 이 값으로 출제 가능 여부를 말한다. ch05(가정법)만 이 필드가 없고
   * exclusionReason의 유무로 같은 것을 말한다. 그래서 "값이 없음"과 "false"는
   * 다르게 읽어야 한다 — undefined를 false로 뭉개면 가정법 히트가 통째로 사라진다.
   */
  questionable?: boolean;
  exclusionReason?: string;
};

const DETECTORS: Array<(text: string) => DetectorHit[]> = [
  detectSentenceCh01,
  detectTenseCh02,
  detectVoiceCh03,
  detectModalCh04,
  detectConditionalCh05,
  detectInfinitiveCh06,
  detectGerundCh07,
  detectParticipleCh08,
  detectNonfiniteCh09,
  detectConjunctionCh10,
  detectRelativeCh11,
  detectComparisonCh12,
  detectPartsCh13,
  detectSpecialCh14,
] as Array<(text: string) => DetectorHit[]>;

/** 이 문장에서 검출기가 찾은 문법 지점 전부. 제외 사유가 붙은 것은 뺀다. */
export function detectAllHits(text: string): DetectorHit[] {
  const out: DetectorHit[] = [];
  for (const detect of DETECTORS) {
    let hits: DetectorHit[] = [];
    try {
      hits = detect(text) ?? [];
    } catch {
      hits = [];
    }
    for (const hit of hits) {
      if (hit.exclusionReason) continue;
      if (!hit.code || !hit.sourceSpan) continue;
      out.push(hit);
    }
  }
  return out;
}

/**
 * 검출기 히트를 그대로 후보로 만든다.
 *
 * 예전에는 검출기 결과를 모델 프롬프트의 likelyCodes 힌트로만 쓰고, 후보는
 * 모델이 새로 만들게 했다. 그래서 모델이 어떤 문장을 그냥 건너뛰면 그 문장은
 * 문항 0개로 끝났다(실측: 문항 0개 문장 13개 중 5개가 모델이 후보를 아예 0개
 * 낸 경우였다. 검출기는 같은 문장에서 3~14개를 찾아 놓은 상태였다).
 *
 * 검출기는 스팬을 이미 알고 있고, localTemplateDistractor는 (코드, 스팬)에서
 * 오답을 결정적으로 만든다. 그래서 모델 없이도 후보가 나온다. 이렇게 만든
 * 후보는 모델 후보와 똑같이 resolveAndFilter의 게이트를 전부 통과해야 한다 —
 * 공급원이 늘어난 것이지 검증이 느슨해진 것이 아니다.
 */
export function localCandidatesFromDetectors(
  sentenceId: string,
  text: string
): GrammarCandidate[] {
  const source = text.replace(/[’]/g, "'");
  const out: GrammarCandidate[] = [];
  const seen = new Set<string>();

  for (const hit of detectAllHits(source)) {
    if (hit.questionable === false) continue;
    if (generationPolicyFor(hit.code) === "NOT_QUESTIONABLE") continue;
    if (!ontologyPoint(hit.code)) continue;
    const span = hit.sourceSpan;
    if (!source.toLowerCase().includes(span.toLowerCase())) continue;
    const wrong = localTemplateDistractor(hit.code, span);
    if (!wrong || wrong.toLowerCase() === span.toLowerCase()) continue;

    const key = `${hit.code}|${span.toLowerCase()}|${wrong.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // 검출기의 occurrenceIndex는 문자 오프셋이므로 등장 순서로 바꾼다.
    const offsets = findOccurrences(source, span);
    const ordinal = Math.max(0, offsets.indexOf(hit.occurrenceIndex));

    out.push({
      candidateId: `local-${sentenceId}-${hit.code}-${hit.occurrenceIndex}`,
      sentenceId,
      pointCode: hit.code,
      sourceSpan: span,
      occurrenceIndex: ordinal,
      correctAnswer: span,
      distractors: [wrong],
      transformCode: "FORM_SWAP",
      priority: ontologyPoint(hit.code)?.priority ?? "CORE",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
    });
  }
  return out;
}

/**
 * 문장별 검출 결과를 DetectedGrammarPoint 모양으로 돌려준다.
 *
 * 예전에는 이 목록을 모델이 detectedPoints로 뱉었다. 그런데 그 목록은 문항을
 * 만드는 데 쓰이지 않고 커버리지·진단 집계로만 흘러갔는데, 실측하면 분석 호출
 * 응답 본문의 62%(35.6KB / 57.4KB)를 그게 차지했다. 지연은 출력 토큰 수에
 * 비례하므로 진단용 산문을 모델에게 받아 적게 하는 것이 분석 단계에서 가장 비싼
 * 항목이었다. 같은 목록을 검출기가 0초에 만들 수 있으니 로컬로 옮긴다.
 */
export function detectedPointsFromSentences(
  sentences: Array<{ sentenceId: string; text: string }>
): DetectedGrammarPoint[] {
  const out: DetectedGrammarPoint[] = [];
  for (const sentence of sentences) {
    const source = sentence.text.replace(/[’]/g, "'");
    for (const hit of detectAllHits(source)) {
      const def = ontologyPoint(hit.code);
      if (!def) continue;
      const offsets = findOccurrences(source, hit.sourceSpan);
      out.push({
        sentenceId: sentence.sentenceId,
        pointCode: hit.code,
        sourceSpan: hit.sourceSpan,
        occurrenceIndex: Math.max(0, offsets.indexOf(hit.occurrenceIndex)),
        priority: def.priority,
        questionability: hit.questionable === false ? "NOT_SUITABLE" : "SAFE",
        evidence: "",
      });
    }
  }
  return out;
}
