import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import type { PassageAnalysis } from "@/lib/question-generator/types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

export async function analyzePassage(opts: {
  passage: string;
  grade: string;
  overallDifficulty: string;
}): Promise<PassageAnalysis> {
  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `You are an expert Korean high-school English reading exam designer.
Analyze the passage carefully. Return ONLY valid JSON.
Do NOT alter the original passage wording, punctuation, quotes, or dashes.
Respond in Korean for descriptive fields unless the field is an English quote from the passage.`,
    user: JSON.stringify({
      grade: opts.grade,
      overallDifficulty: opts.overallDifficulty,
      passage: opts.passage,
      schema: {
        overallTopic: "string",
        overallMainIdea: "string",
        titleCandidates: ["string"],
        paragraphRoles: [{ index: 0, role: "string", summary: "string" }],
        sentenceFacts: [{ sentence: "string", keyInfo: "string" }],
        eventRelations: ["string"],
        causeEffect: ["string"],
        compareContrast: ["string"],
        timeOrder: ["string"],
        properNouns: ["string"],
        numbers: ["string"],
        keyVocabulary: ["string"],
        antonymCandidates: [{ word: "string", antonym: "string", reason: "string" }],
        grammarPoints: [{ span: "string", point: "string" }],
        insertionClues: ["string"],
        orderClues: ["string"],
        blankCandidates: ["string"],
        writingCandidates: ["string"],
        estimatedDifficulty: "string",
        unsuitableTypes: [{ type: "order|grammar|...", reason: "string" }],
        warnings: ["string"],
      },
    }),
    temperature: 0.2,
    maxTokens: 5000,
  })) as Record<string, unknown>;

  return {
    overallTopic: asString(raw.overallTopic),
    overallMainIdea: asString(raw.overallMainIdea),
    titleCandidates: asStringArray(raw.titleCandidates),
    paragraphRoles: Array.isArray(raw.paragraphRoles)
      ? raw.paragraphRoles.map((p, i) => {
          const row = (p ?? {}) as Record<string, unknown>;
          return {
            index: typeof row.index === "number" ? row.index : i,
            role: asString(row.role),
            summary: asString(row.summary),
          };
        })
      : [],
    sentenceFacts: Array.isArray(raw.sentenceFacts)
      ? raw.sentenceFacts.map((p) => {
          const row = (p ?? {}) as Record<string, unknown>;
          return {
            sentence: asString(row.sentence),
            keyInfo: asString(row.keyInfo),
          };
        })
      : [],
    eventRelations: asStringArray(raw.eventRelations),
    causeEffect: asStringArray(raw.causeEffect),
    compareContrast: asStringArray(raw.compareContrast),
    timeOrder: asStringArray(raw.timeOrder),
    properNouns: asStringArray(raw.properNouns),
    numbers: asStringArray(raw.numbers),
    keyVocabulary: asStringArray(raw.keyVocabulary),
    antonymCandidates: Array.isArray(raw.antonymCandidates)
      ? raw.antonymCandidates.map((p) => {
          const row = (p ?? {}) as Record<string, unknown>;
          return {
            word: asString(row.word),
            antonym: asString(row.antonym),
            reason: asString(row.reason),
          };
        })
      : [],
    grammarPoints: Array.isArray(raw.grammarPoints)
      ? raw.grammarPoints.map((p) => {
          const row = (p ?? {}) as Record<string, unknown>;
          return { span: asString(row.span), point: asString(row.point) };
        })
      : [],
    insertionClues: asStringArray(raw.insertionClues),
    orderClues: asStringArray(raw.orderClues),
    blankCandidates: asStringArray(raw.blankCandidates),
    writingCandidates: asStringArray(raw.writingCandidates),
    estimatedDifficulty: asString(raw.estimatedDifficulty, "중"),
    unsuitableTypes: Array.isArray(raw.unsuitableTypes)
      ? raw.unsuitableTypes.map((p) => {
          const row = (p ?? {}) as Record<string, unknown>;
          return {
            type: asString(row.type) as PassageAnalysis["unsuitableTypes"][number]["type"],
            reason: asString(row.reason),
          };
        })
      : [],
    warnings: asStringArray(raw.warnings),
  };
}
