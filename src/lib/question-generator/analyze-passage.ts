import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import { cleanSourcePassage } from "@/lib/question-generator/passage-clean";
import type { PassageAnalysis } from "@/lib/question-generator/types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

function emptyAnalysis(): PassageAnalysis {
  return {
    overallTopic: "",
    overallMainIdea: "",
    titleCandidates: [],
    paragraphRoles: [],
    sentenceFacts: [],
    eventRelations: [],
    causeEffect: [],
    compareContrast: [],
    timeOrder: [],
    properNouns: [],
    numbers: [],
    keyVocabulary: [],
    antonymCandidates: [],
    grammarPoints: [],
    insertionClues: [],
    orderClues: [],
    blankCandidates: [],
    writingCandidates: [],
    estimatedDifficulty: "",
    unsuitableTypes: [],
    warnings: [],
  };
}

/** 빠른 요약 분석 (속도 우선) */
export async function analyzePassage(opts: {
  passage: string;
  grade: string;
  overallDifficulty: string;
}): Promise<PassageAnalysis> {
  try {
    const raw = (await questionGeneratorChatJsonWithRetry({
      system: `Summarize this English passage for exam writing. Return ONLY compact JSON. Korean for topic/mainIdea.`,
      user: JSON.stringify({
        grade: opts.grade,
        passage: cleanSourcePassage(opts.passage).slice(0, 3500),
        schema: {
          overallTopic: "string",
          overallMainIdea: "string",
          titleCandidates: ["string", "string", "string"],
        },
      }),
      temperature: 0.2,
      maxTokens: 600,
      /*
       * 모델을 안 정하면 기본 후보(gpt-5.5, 가장 비쌈)로 나갔다. 동형모의고사(지문 하나에 문항 하나)에서
       * 원가의 12~16%가 이 요약이었다(2026-10-05 점검). 제목·주제 힌트로만 쓰므로 가벼운 모델로 충분하다.
       */
      preferredModels: [process.env.OPENAI_MODEL_QG_LIGHT?.trim() || "gpt-5.6-terra"],
    })) as Record<string, unknown>;

    return {
      ...emptyAnalysis(),
      overallTopic: asString(raw.overallTopic),
      overallMainIdea: asString(raw.overallMainIdea),
      titleCandidates: asStringArray(raw.titleCandidates).slice(0, 5),
    };
  } catch {
    return emptyAnalysis();
  }
}
