/**
 * Heuristic checks for translation quality (used in unit tests / lesson-pack QA).
 * Workbook generation must NOT call OpenAI translation refine — this file has no
 * workbook OpenAI path anymore.
 */

export type TranslationCheck = {
  ok: boolean;
  reasons: string[];
};

const BAD_PATTERNS: Array<{
  enIncludes: RegExp;
  koBad: RegExp;
  reason: string;
}> = [
  {
    enIncludes: /magnetic/i,
    koBad: /매력적/,
    reason: "magnetic 문맥 오역(매력적)",
  },
  {
    enIncludes: /available for/i,
    koBad: /확인/,
    reason: "available for 문맥 오역",
  },
  {
    enIncludes: /from our design/i,
    koBad: /디자인/,
    reason: "design 직역",
  },
  {
    enIncludes: /Movement is life to us/i,
    koBad: /움직임은 우리에게 삶/,
    reason: "Movement is life 어색한 직역",
  },
];

export function assessWorkbookTranslation(
  english: string,
  korean: string
): TranslationCheck {
  const en = english.trim();
  const ko = korean.trim();
  const reasons: string[] = [];
  if (!ko) return { ok: false, reasons: ["해석 없음"] };

  const enWords = (en.match(/[A-Za-z]+/g) ?? []).length;
  const koLen = ko.replace(/\s+/g, "").length;
  if (enWords >= 25 && koLen < enWords * 1.1) {
    reasons.push("절 누락 의(번역이 영어 대비 과도하게 짧음)");
  }
  if (enWords >= 35 && koLen < enWords * 1.4) {
    reasons.push("긴 문장 뒷부분 누락 가능");
  }
  if (/\band that\b/i.test(en) && !/(고|며|고,)/.test(ko)) {
    reasons.push("and that 병렬 절 누락 가능");
  }
  if (/\bby focusing\b/i.test(en) && !/(집중|초점)/.test(ko) && enWords > 20) {
    reasons.push("focusing 절 누락 가능");
  }
  if (/\bbring about\b/i.test(en) && !/(가져|결과|초래)/.test(ko)) {
    reasons.push("bring about 결과 절 누락 가능");
  }
  for (const p of BAD_PATTERNS) {
    if (p.enIncludes.test(en) && p.koBad.test(ko)) reasons.push(p.reason);
  }
  if (/디자인에서/.test(ko) && /design/i.test(en)) {
    reasons.push("design 직역");
  }
  return { ok: reasons.length === 0, reasons };
}

/** Structure-only validation (no AI). */
export function validateTranslationStructure(input: {
  sourceSentenceIds: string[];
  generated: Array<{ sentenceId: string; koreanTranslation: string }>;
}): { ok: true } | { ok: false; message: string } {
  const ids = input.sourceSentenceIds;
  const out = input.generated;
  if (out.length !== ids.length) {
    return { ok: false, message: "문장 수와 해석 수가 다릅니다." };
  }
  const seen = new Set<string>();
  for (const row of out) {
    if (!ids.includes(row.sentenceId)) {
      return { ok: false, message: `알 수 없는 sentenceId: ${row.sentenceId}` };
    }
    if (seen.has(row.sentenceId)) {
      return { ok: false, message: `중복 sentenceId: ${row.sentenceId}` };
    }
    if (!String(row.koreanTranslation ?? "").trim()) {
      return { ok: false, message: `빈 해석: ${row.sentenceId}` };
    }
    seen.add(row.sentenceId);
  }
  for (const id of ids) {
    if (!seen.has(id)) {
      return { ok: false, message: `누락된 sentenceId: ${id}` };
    }
  }
  return { ok: true };
}
