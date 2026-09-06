import { translateEnglishLinesToKorean } from "@/lib/lesson-materials/translate-lines";
import type { WorkbookTranslation } from "@/lib/lesson-materials/workbook-types";

export type TranslationCheck = {
  ok: boolean;
  reasons: string[];
};

/** Known bad / incomplete patterns from production samples. */
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

function countEnglishClauses(english: string): number {
  const parts = english
    .split(/\b(?:and that|and|but|yet|which|who|when|while|if|because)\b/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 12);
  return Math.max(1, parts.length);
}

/**
 * Heuristic completeness / quality check before showing Korean in workbook.
 */
export function assessWorkbookTranslation(
  english: string,
  korean: string
): TranslationCheck {
  const en = english.trim();
  const ko = korean.trim();
  const reasons: string[] = [];
  if (!ko) {
    return { ok: false, reasons: ["해석 없음"] };
  }

  const enWords = (en.match(/[A-Za-z]+/g) ?? []).length;
  const koLen = ko.replace(/\s+/g, "").length;
  // Rough: Korean chars often ~0.6–1.2× English words; truncated if far too short
  if (enWords >= 25 && koLen < enWords * 1.1) {
    reasons.push("절 누락 의(번역이 영어 대비 과도하게 짧음)");
  }
  if (enWords >= 35 && koLen < enWords * 1.4) {
    reasons.push("긴 문장 뒷부분 누락 의");
  }

  // Coordinating content markers in English should usually leave a trace in Korean
  if (/\band that\b/i.test(en) && !/(고|며|고,)/.test(ko)) {
    reasons.push("and that 병렬 절 누락 가능");
  }
  if (
    /\bby focusing\b/i.test(en) &&
    !/(집중|초점)/.test(ko) &&
    enWords > 20
  ) {
    reasons.push("focusing 절 누락 가능");
  }
  if (/\bbring about\b/i.test(en) && !/(가져|결과|초래)/.test(ko)) {
    reasons.push("bring about 결과 절 누락 가능");
  }

  for (const p of BAD_PATTERNS) {
    if (p.enIncludes.test(en) && p.koBad.test(ko)) {
      reasons.push(p.reason);
    }
  }

  if (/디자인에서/.test(ko) && /design/i.test(en)) {
    reasons.push("design 직역");
  }

  // Truncation: ends abruptly without Korean sentence ending
  if (koLen > 8 && !/[다요음임까]$/.test(ko.replace(/["'”’)\]]+$/g, ""))) {
    // many workbook translations end with 다/요 — soft signal only if also short
    if (enWords >= 20 && koLen < enWords * 1.5) {
      reasons.push("번역 잘림 가능");
    }
  }

  void countEnglishClauses;
  return { ok: reasons.length === 0, reasons };
}

async function refineKoreanLines(
  pairs: Array<{ english: string; korean: string }>
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return translateEnglishLinesToKorean(pairs.map((p) => p.english));
  }

  const numbered = pairs
    .map(
      (p, i) =>
        `${i + 1}.\nEN: ${p.english}\nKO_DRAFT: ${p.korean || "(없음)"}`
    )
    .join("\n\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `당신은 고등 영어 독해 지문의 한국어 해석을 검수·보정하는 교사이다.
규칙:
- 영어 한 문장 = 한국어 한 문장(대응 유지). 절·병렬(and/but/yet)·관계절을 생략하지 말 것.
- 문맥에 맞게 번역. magnetic→매력적이 아니라 끌어당기는 힘. available for→확인할 준비가 아니라 받아들일 준비. design→디자인이 아니라 본래 창조된 모습. Movement is life to us→우리에게 움직임은 곧 생명이다.
- 직역·비문·부정 전도 금지. ～한다/～이다 체로 자연스럽게.
- JSON만: {"korean":["..."]}`,
          },
          {
            role: "user",
            content: `다음 ${pairs.length}개 문장의 해석을 완전하고 자연스럽게 보정하라. 초안이 있으면 참고하되 오류·누락은 고친다.\n\n${numbered}`,
          },
        ],
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      return translateEnglishLinesToKorean(pairs.map((p) => p.english));
    }
    const envelope = JSON.parse(bodyText) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = envelope.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { korean?: unknown };
    const korean = Array.isArray(parsed.korean)
      ? parsed.korean.map((v) => String(v ?? "").trim())
      : [];
    if (korean.length !== pairs.length) {
      return translateEnglishLinesToKorean(pairs.map((p) => p.english));
    }
    return korean;
  } catch {
    return translateEnglishLinesToKorean(pairs.map((p) => p.english));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve workbook Korean lines with validation + refine.
 * Does not overwrite teacher DB rows — returns workbook-local translations only.
 * `teacherLocked[i] === true` skips auto-refine for that sentence.
 */
export async function resolveWorkbookTranslations(input: {
  sentenceIds: string[];
  english: string[];
  existingKorean: Array<string | null | undefined>;
  teacherLocked?: boolean[];
}): Promise<{
  translations: WorkbookTranslation[];
  korean: string[];
  warning?: string;
}> {
  const { sentenceIds, english, existingKorean, teacherLocked } = input;
  const translations: WorkbookTranslation[] = [];
  const korean: string[] = [];
  const toRefine: number[] = [];
  const toGenerate: number[] = [];

  for (let i = 0; i < english.length; i++) {
    const en = english[i]!;
    const ko = String(existingKorean[i] ?? "").trim();
    const locked = teacherLocked?.[i] === true;
    if (!ko) {
      toGenerate.push(i);
      korean.push("");
      continue;
    }
    if (locked) {
      korean.push(ko);
      translations.push({
        sentenceId: sentenceIds[i]!,
        english: en,
        korean: ko,
        source: "teacher",
        validated: true,
      });
      continue;
    }
    const check = assessWorkbookTranslation(en, ko);
    if (check.ok) {
      korean.push(ko);
      translations.push({
        sentenceId: sentenceIds[i]!,
        english: en,
        korean: ko,
        source: "stored",
        validated: true,
      });
    } else {
      toRefine.push(i);
      korean.push(ko);
    }
  }

  if (toGenerate.length) {
    const generated = await translateEnglishLinesToKorean(
      toGenerate.map((i) => english[i]!)
    );
    toGenerate.forEach((idx, j) => {
      let ko = generated[j] ?? "";
      const check = assessWorkbookTranslation(english[idx]!, ko);
      if (!check.ok) {
        toRefine.push(idx);
      }
      korean[idx] = ko;
      translations.push({
        sentenceId: sentenceIds[idx]!,
        english: english[idx]!,
        korean: ko,
        source: "generated",
        validated: check.ok,
      });
    });
  }

  const refineIdx = [...new Set(toRefine)];
  if (refineIdx.length) {
    const refined = await refineKoreanLines(
      refineIdx.map((i) => ({
        english: english[i]!,
        korean: korean[i] ?? "",
      }))
    );
    refineIdx.forEach((idx, j) => {
      const ko = refined[j] ?? korean[idx] ?? "";
      korean[idx] = ko;
      const check = assessWorkbookTranslation(english[idx]!, ko);
      const existing = translations.findIndex(
        (t) => t.sentenceId === sentenceIds[idx]
      );
      const row: WorkbookTranslation = {
        sentenceId: sentenceIds[idx]!,
        english: english[idx]!,
        korean: ko,
        source: "refined",
        validated: check.ok,
      };
      if (existing >= 0) translations[existing] = row;
      else translations.push(row);
    });
  }

  // Ensure order
  const ordered = sentenceIds.map((id, i) => {
    const found = translations.find((t) => t.sentenceId === id);
    return (
      found ?? {
        sentenceId: id,
        english: english[i]!,
        korean: korean[i] ?? "",
        source: "generated" as const,
        validated: false,
      }
    );
  });

  const warning = ordered.some((t) => !t.validated)
    ? "일부 해석이 완전성 검증을 통과하지 못했습니다. 내용을 확인해 주세요."
    : undefined;

  return {
    translations: ordered,
    korean: ordered.map((t) => t.korean),
    warning,
  };
}
