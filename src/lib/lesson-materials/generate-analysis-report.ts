import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  ANALYSIS_REPORT_SYSTEM_PROMPT,
  buildAnalysisReportUserPrompt,
} from "@/lib/lesson-materials/analysis-report-grammar-prompt";

export type AnalysisChunkRole = "s" | "v" | "o" | "c" | "M" | "other";

export type AnalysisEnChunk = {
  text: string;
  role: AnalysisChunkRole;
};

export type AnalysisGrammarPriority = "최우선" | "핵심" | "중요 구문";

export type AnalysisGrammarPoint = {
  title: string;
  detail: string;
  example?: string;
  /** Extended CSAT-style fields (optional for older saved reports) */
  priority?: AnalysisGrammarPriority | string;
  category?: string;
  sentenceStructure?: string;
  restoredStructure?: string;
  decisionRule?: string;
  wrongForms?: string[];
  wrongReasons?: string[];
  translationConnection?: string;
  studentSummary?: string;
  teacherExplanation?: string;
};

export type AnalysisImportantConstruction = {
  itemId?: string;
  originalSentence: string;
  targetConstruction: string;
  structure: string;
  restoredElements?: string;
  translation?: string;
  readingTip?: string;
};

export type AnalysisSentence = {
  itemId: string;
  enChunks: AnalysisEnChunk[];
  koChunks: string[];
  easyUnderstanding: string;
  grammarPoints: AnalysisGrammarPoint[];
};

export type AnalysisReportData = {
  headerLabel: string;
  sentences: AnalysisSentence[];
  analysisSummary?: string;
  importantConstructions?: AnalysisImportantConstruction[];
  noPointMessage?: string;
  updatedAt?: string;
};

type InputLine = {
  id: string;
  english: string;
  korean?: string | null;
};

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normRole(raw: unknown): AnalysisChunkRole {
  const r = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (r === "s" || r === "subject") return "s";
  if (r === "v" || r === "verb") return "v";
  if (r === "o" || r === "object") return "o";
  if (r === "c" || r === "complement") return "c";
  if (r === "m" || r === "modifier" || r === "mod") return "M";
  return "other";
}

function normPriority(raw: unknown): AnalysisGrammarPriority | undefined {
  const p = String(raw ?? "").trim();
  if (p === "최우선" || p === "핵심" || p === "중요 구문") return p;
  return undefined;
}

function toStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean);
}

function mapRawGrammarPoint(raw: {
  priority?: unknown;
  category?: unknown;
  originalSentence?: unknown;
  targetExpression?: unknown;
  sentenceStructure?: unknown;
  restoredStructure?: unknown;
  decisionRule?: unknown;
  contextualExplanation?: unknown;
  wrongForms?: unknown;
  wrongReasons?: unknown;
  translationConnection?: unknown;
  studentSummary?: unknown;
  teacherExplanation?: unknown;
  title?: unknown;
  detail?: unknown;
  example?: unknown;
}): AnalysisGrammarPoint | null {
  const priority = normPriority(raw.priority);
  const category = String(raw.category ?? "").trim();
  const targetExpression = String(
    raw.targetExpression ?? raw.example ?? ""
  ).trim();
  const title =
    String(raw.title ?? "").trim() ||
    [priority, category].filter(Boolean).join(" · ") ||
    targetExpression ||
    "핵심 어법";

  const sentenceStructure = String(raw.sentenceStructure ?? "").trim();
  const restoredStructure = String(raw.restoredStructure ?? "").trim();
  const decisionRule = String(raw.decisionRule ?? "").trim();
  const contextualExplanation = String(
    raw.contextualExplanation ?? ""
  ).trim();
  const wrongForms = toStringList(raw.wrongForms);
  const wrongReasons = toStringList(raw.wrongReasons);
  const translationConnection = String(
    raw.translationConnection ?? ""
  ).trim();
  const studentSummary = String(raw.studentSummary ?? "").trim();
  const teacherExplanation = String(raw.teacherExplanation ?? "").trim();

  const detailParts = [
    sentenceStructure ? `구조: ${sentenceStructure}` : "",
    restoredStructure ? `복원: ${restoredStructure}` : "",
    decisionRule ? `판단 원리: ${decisionRule}` : "",
    contextualExplanation ? `원문 적용: ${contextualExplanation}` : "",
    wrongForms.length
      ? `출제 가능 오답: ${wrongForms.join(" / ")}`
      : "",
    wrongReasons.length ? `오답 이유: ${wrongReasons.join(" / ")}` : "",
    translationConnection ? `해석 연결: ${translationConnection}` : "",
    String(raw.detail ?? "").trim(),
  ].filter(Boolean);

  const detail =
    detailParts.join("\n") ||
    teacherExplanation ||
    studentSummary ||
    contextualExplanation;

  if (!title && !detail && !studentSummary && !teacherExplanation) {
    return null;
  }

  return {
    title,
    detail,
    example: targetExpression || undefined,
    priority,
    category: category || undefined,
    sentenceStructure: sentenceStructure || undefined,
    restoredStructure: restoredStructure || undefined,
    decisionRule: decisionRule || undefined,
    wrongForms: wrongForms.length ? wrongForms : undefined,
    wrongReasons: wrongReasons.length ? wrongReasons : undefined,
    translationConnection: translationConnection || undefined,
    studentSummary: studentSummary || undefined,
    teacherExplanation: teacherExplanation || undefined,
  };
}

export async function generateAnalysisReport(input: {
  lines: InputLine[];
  title?: string;
  headerLabel?: string;
  grade?: string | null;
}): Promise<AnalysisReportData> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const lines = input.lines.filter((l) => l.english.trim());
  if (lines.length === 0) {
    return {
      headerLabel: input.headerLabel?.trim() || "26년도 1학기 중간고사 대비",
      sentences: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  try {
    const userContent = buildAnalysisReportUserPrompt({
      title: input.title,
      grade: input.grade,
      lines,
    });

    const configured = process.env.OPENAI_MODEL_ANALYSIS_REPORT?.trim();
    const candidates = configured
      ? configured === "gpt-5.5"
        ? ["gpt-5.5", "gpt-5"]
        : [configured]
      : ["gpt-5.5", "gpt-5"];

    let bodyText = "";
    let lastErr = "";
    let ok = false;

    for (const model of candidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let includeReasoningEffort = isGpt5FamilyModel(model);
      let includeJsonMode = true;

      for (let attempt = 0; attempt < 4; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: ANALYSIS_REPORT_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        };
        if (includeJsonMode) {
          body.response_format = { type: "json_object" };
        }
        if (includeTemperature) {
          body.temperature = 0.25;
        } else {
          delete body.temperature;
        }
        if (isGpt5FamilyModel(model)) {
          body.max_completion_tokens = 16_384;
          if (includeReasoningEffort) body.reasoning_effort = "medium";
          else delete body.reasoning_effort;
        } else {
          body.max_tokens = 8192;
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify(body),
        });
        bodyText = await res.text();
        if (res.ok) {
          ok = true;
          break;
        }
        if (includeTemperature && isUnsupportedTemperatureError(bodyText)) {
          includeTemperature = false;
          continue;
        }
        if (
          includeReasoningEffort &&
          isUnsupportedParameterError(bodyText, "reasoning_effort")
        ) {
          includeReasoningEffort = false;
          continue;
        }
        if (
          includeJsonMode &&
          isUnsupportedParameterError(bodyText, "response_format")
        ) {
          includeJsonMode = false;
          continue;
        }
        if (isModelUnavailableError(res.status, bodyText)) {
          lastErr = bodyText.slice(0, 200);
          break;
        }
        lastErr = bodyText.slice(0, 200);
        break;
      }
      if (ok) break;
    }

    if (!ok) {
      throw new Error(
        `분석서 생성 실패${lastErr ? `: ${lastErr}` : ""}`.slice(0, 180)
      );
    }

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{
      sentences?: Array<{
        itemId?: string;
        enChunks?: Array<{ text?: string; role?: string }>;
        koChunks?: unknown;
        easyUnderstanding?: string;
        grammarPoints?: Array<{
          title?: string;
          detail?: string;
          example?: string;
        }>;
      }>;
      hasKeyGrammarPoints?: boolean;
      analysisSummary?: string;
      grammarPoints?: Array<{
        priority?: string;
        category?: string;
        itemId?: string;
        sentenceNumber?: number;
        originalSentence?: string;
        targetExpression?: string;
        sentenceStructure?: string;
        restoredStructure?: string;
        decisionRule?: string;
        contextualExplanation?: string;
        wrongForms?: unknown;
        wrongReasons?: unknown;
        translationConnection?: string;
        studentSummary?: string;
        teacherExplanation?: string;
        title?: string;
        detail?: string;
        example?: string;
      }>;
      importantConstructions?: Array<{
        itemId?: string;
        originalSentence?: string;
        targetConstruction?: string;
        structure?: string;
        restoredElements?: string;
        translation?: string;
        readingTip?: string;
      }>;
      noPointMessage?: string;
    }>(content);

    const byId = new Map(
      (parsed?.sentences ?? []).map((s) => [String(s.itemId ?? ""), s] as const)
    );

    const grammarByItemId = new Map<string, AnalysisGrammarPoint[]>();
    const passageGrammar = (parsed?.grammarPoints ?? []).slice(0, 8);

    for (const raw of passageGrammar) {
      const mapped = mapRawGrammarPoint(raw);
      if (!mapped) continue;
      // Skip "중요 구문" from sentence grammar boxes — they go to importantConstructions
      if (mapped.priority === "중요 구문") continue;

      let itemId = String(raw.itemId ?? "").trim();
      if (!itemId && typeof raw.sentenceNumber === "number") {
        const idx = Math.max(0, Math.floor(raw.sentenceNumber) - 1);
        itemId = lines[idx]?.id ?? "";
      }
      if (!itemId) {
        // Fallback: match original sentence text
        const orig = String(raw.originalSentence ?? "").trim().toLowerCase();
        if (orig) {
          const hit = lines.find(
            (l) => l.english.trim().toLowerCase() === orig
          );
          itemId = hit?.id ?? "";
        }
      }
      if (!itemId) continue;

      const list = grammarByItemId.get(itemId) ?? [];
      if (list.length >= 2) continue; // max 2 per sentence
      list.push(mapped);
      grammarByItemId.set(itemId, list);
    }

    const sentences: AnalysisSentence[] = lines.map((line) => {
      const raw = byId.get(line.id);
      const enChunks = (raw?.enChunks ?? [])
        .map((c) => ({
          text: String(c.text ?? "").trim(),
          role: normRole(c.role),
        }))
        .filter((c) => c.text.length > 0);

      let koChunks: string[] = [];
      if (Array.isArray(raw?.koChunks)) {
        koChunks = raw!.koChunks.map((k) => String(k ?? "").trim());
      }

      if (enChunks.length === 0) {
        enChunks.push({ text: line.english.trim(), role: "other" });
      }
      while (koChunks.length < enChunks.length) koChunks.push("");
      if (koChunks.length > enChunks.length) {
        koChunks = koChunks.slice(0, enChunks.length);
      }
      if (!koChunks.some((k) => k) && (line.korean ?? "").trim()) {
        koChunks = enChunks.map((_, i) =>
          i === 0 ? String(line.korean).trim() : ""
        );
      }

      // Prefer passage-level selected grammar; fall back to per-sentence only if
      // model still returned legacy inline points and no passage points exist.
      let grammarPoints = grammarByItemId.get(line.id) ?? [];
      if (grammarPoints.length === 0 && passageGrammar.length === 0) {
        grammarPoints = (raw?.grammarPoints ?? [])
          .map((g) => mapRawGrammarPoint(g))
          .filter((g): g is AnalysisGrammarPoint => !!g)
          .slice(0, 2);
      }

      return {
        itemId: line.id,
        enChunks,
        koChunks,
        easyUnderstanding:
          String(raw?.easyUnderstanding ?? "").trim() ||
          "이 문장이 지문에서 하는 역할을 생각하며 읽어 보세요.",
        grammarPoints,
      };
    });

    const importantFromPriority = passageGrammar
      .filter((g) => normPriority(g.priority) === "중요 구문")
      .map((g) => ({
        itemId: String(g.itemId ?? "").trim() || undefined,
        originalSentence: String(g.originalSentence ?? "").trim(),
        targetConstruction: String(g.targetExpression ?? "").trim(),
        structure: String(g.sentenceStructure ?? "").trim(),
        restoredElements: String(g.restoredStructure ?? "").trim() || undefined,
        translation: String(g.translationConnection ?? "").trim() || undefined,
        readingTip: String(g.studentSummary ?? g.teacherExplanation ?? "").trim() || undefined,
      }))
      .filter((c) => c.originalSentence || c.targetConstruction);

    const importantConstructions: AnalysisImportantConstruction[] = [
      ...importantFromPriority,
      ...(parsed?.importantConstructions ?? [])
        .map((c) => ({
          itemId: String(c.itemId ?? "").trim() || undefined,
          originalSentence: String(c.originalSentence ?? "").trim(),
          targetConstruction: String(c.targetConstruction ?? "").trim(),
          structure: String(c.structure ?? "").trim(),
          restoredElements: String(c.restoredElements ?? "").trim() || undefined,
          translation: String(c.translation ?? "").trim() || undefined,
          readingTip: String(c.readingTip ?? "").trim() || undefined,
        }))
        .filter((c) => c.originalSentence || c.targetConstruction),
    ].slice(0, 6);

    const hasAnyGrammar = sentences.some((s) => s.grammarPoints.length > 0);
    const noPointMessage =
      !hasAnyGrammar
        ? String(parsed?.noPointMessage ?? "").trim() ||
          "이 지문에는 별도로 강조할 만한 고등학교 핵심 어법이 없습니다."
        : undefined;

    return {
      headerLabel: input.headerLabel?.trim() || "26년도 1학기 중간고사 대비",
      sentences,
      analysisSummary: String(parsed?.analysisSummary ?? "").trim() || undefined,
      importantConstructions:
        importantConstructions.length > 0 ? importantConstructions : undefined,
      noPointMessage,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

export function hasAnalysisReport(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const report = json as { sentences?: unknown };
  return Array.isArray(report.sentences) && report.sentences.length > 0;
}
