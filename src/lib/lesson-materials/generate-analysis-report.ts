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
import {
  formatCheonilmunClassification,
  resolveCheonilmunUnit,
  type CheonilmunClassification,
} from "@/lib/lesson-materials/cheonilmun-basic-taxonomy";

export type AnalysisChunkRole =
  | "s"
  | "v"
  | "o"
  | "c"
  | "M"
  | "a"
  | "io"
  | "do"
  | "other";

export type AnalysisEnChunk = {
  text: string;
  role: AnalysisChunkRole;
};

export type AnalysisGrammarPoint = {
  /** Accurate grammar term (Cheonilmun-preferred) */
  title: string;
  /** Structure analysis (or legacy combined text) */
  detail: string;
  /** Target expression from the original sentence */
  example?: string;
  category?: string;
  sentenceStructure?: string;
  senseGroups?: string;
  sentencePattern?: string;
  innerStructure?: string;
  bookTerms?: string[];
  primaryClassification?: CheonilmunClassification;
  relatedUnits?: CheonilmunClassification[];
  decisionRule?: string;
  classificationLabel?: string;
  /** @deprecated kept for older saved reports */
  priority?: string;
  restoredStructure?: string;
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
  /** @deprecated prefer contextNote; kept for older saved reports */
  easyUnderstanding?: string;
  /** Passage-role / meaning note (not translation, not grammar) */
  contextNote?: string;
  discourseRole?: string;
  connectionType?: string;
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
  if (r === "a" || r === "adverbial") return "a";
  if (r === "io" || r === "indirect") return "io";
  if (r === "do" || r === "direct") return "do";
  return "other";
}

function stripPriorityLabel(text: string): string {
  return text
    .replace(/^(최우선|핵심|중요\s*구문)\s*[·•\-–—:]\s*/u, "")
    .trim();
}

function toStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean);
}

function mapClassification(raw: unknown): CheonilmunClassification | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const unitNumber = o.unitNumber;
  const unitTitle = String(o.unitTitle ?? "").trim();
  const resolved = resolveCheonilmunUnit(unitNumber, unitTitle);
  if (resolved) return resolved;
  if (unitTitle.includes("목차 외") || unitNumber == null) {
    return {
      partNumber: 0,
      partTitle: "",
      chapterNumber: 0,
      chapterTitle: "",
      unitNumber: null,
      unitTitle: unitTitle || "목차 외 보충",
      isOffCatalog: true,
    };
  }
  return null;
}

function mapRawGrammarPoint(raw: {
  priority?: unknown;
  category?: unknown;
  originalSentence?: unknown;
  targetExpression?: unknown;
  sentenceStructure?: unknown;
  outerStructure?: unknown;
  senseGroups?: unknown;
  sentencePattern?: unknown;
  innerStructure?: unknown;
  restoredStructure?: unknown;
  decisionRule?: unknown;
  correctReason?: unknown;
  contextualExplanation?: unknown;
  wrongForms?: unknown;
  wrongReasons?: unknown;
  translationConnection?: unknown;
  studentSummary?: unknown;
  teacherExplanation?: unknown;
  title?: unknown;
  detail?: unknown;
  example?: unknown;
  bookTerms?: unknown;
  primaryClassification?: unknown;
  relatedUnits?: unknown;
}): AnalysisGrammarPoint | null {
  const category = stripPriorityLabel(String(raw.category ?? "").trim());
  const targetExpression = String(
    raw.targetExpression ?? raw.example ?? ""
  ).trim();
  const primaryClassification = mapClassification(raw.primaryClassification);
  const relatedUnits = Array.isArray(raw.relatedUnits)
    ? raw.relatedUnits
        .map((u) => mapClassification(u))
        .filter((u): u is CheonilmunClassification => !!u)
        .slice(0, 3)
    : [];

  const title =
    stripPriorityLabel(String(raw.title ?? "").trim()) ||
    category ||
    targetExpression ||
    "어법";

  const sentenceStructureRaw = String(
    raw.sentenceStructure ?? raw.outerStructure ?? ""
  ).trim();
  const sentenceStructure = compactStructureLine(sentenceStructureRaw);
  const decisionRule = String(
    raw.decisionRule ?? raw.correctReason ?? raw.contextualExplanation ?? ""
  ).trim();
  const bookTerms = toStringList(raw.bookTerms);

  // Prefer the short one-line structure only (no 문형/의미단위/내부/판단 dump)
  const detail =
    sentenceStructure ||
    compactStructureLine(String(raw.detail ?? "").trim()) ||
    "";

  if (!title && !detail && !targetExpression) {
    return null;
  }

  const classificationLabel = primaryClassification
    ? formatCheonilmunClassification(primaryClassification)
    : undefined;

  return {
    title,
    detail,
    example: targetExpression || undefined,
    category: category || undefined,
    sentenceStructure: detail || undefined,
    senseGroups: undefined,
    sentencePattern: String(raw.sentencePattern ?? "").trim() || undefined,
    innerStructure: undefined,
    bookTerms: bookTerms.length ? bookTerms : undefined,
    primaryClassification: primaryClassification || undefined,
    relatedUnits: relatedUnits.length ? relatedUnits : undefined,
    decisionRule: decisionRule || undefined,
    classificationLabel,
  };
}

function compactStructureLine(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  // Drop verbose labeled sections often concatenated with " · "
  s = s
    .replace(/(?:^|\s*·\s*)문형\s+[A-Z/]+/giu, " · ")
    .replace(/(?:^|\s*·\s*)의미\s*단위\s*:[^·]*/giu, " · ")
    .replace(/(?:^|\s*·\s*)내부\s*:[^·]*/giu, " · ")
    .replace(/(?:^|\s*·\s*)판단\s*:[^·]*(?:·|$)/giu, " · ")
    .replace(/(?:^|\s*·\s*)복원\s*:[^·]*/giu, " · ");
  s = s
    .replace(/^\s*·\s*/u, "")
    .replace(/\s*·\s*$/u, "")
    .replace(/\s*·\s*·\s*/gu, " · ")
    .trim();
  // Prefer the clause starting with 주절: if present amid leftover noise
  const ju = s.match(/주절\s*:[^\n]+/u);
  if (ju && s.length > 180) return ju[0].trim();
  if (s.length > 220) {
    const cut = s.slice(0, 220);
    const last = Math.max(cut.lastIndexOf(" + "), cut.lastIndexOf(" · "));
    return (last > 80 ? cut.slice(0, last) : cut).trim() + "…";
  }
  return s;
}

export async function generateAnalysisReport(input: {
  lines: InputLine[];
  title?: string;
  headerLabel?: string;
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
        contextNote?: string;
        discourseRole?: string;
        connectionType?: string;
        grammarPoints?: Array<{
          title?: string;
          detail?: string;
          example?: string;
          category?: string;
          sentenceStructure?: string;
        }>;
      }>;
      sentenceNotes?: Array<{
        sentenceId?: string;
        sentenceNumber?: number;
        discourseRole?: string;
        connectionType?: string;
        contextNote?: string;
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
        outerStructure?: string;
        senseGroups?: string;
        sentencePattern?: string;
        innerStructure?: string;
        restoredStructure?: string;
        decisionRule?: string;
        correctReason?: string;
        contextualExplanation?: string;
        bookTerms?: unknown;
        primaryClassification?: unknown;
        relatedUnits?: unknown;
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

    const notesById = new Map<
      string,
      { contextNote: string; discourseRole?: string; connectionType?: string }
    >();
    for (const n of parsed?.sentenceNotes ?? []) {
      let id = String(n.sentenceId ?? "").trim();
      if (!id && typeof n.sentenceNumber === "number") {
        id = lines[Math.max(0, Math.floor(n.sentenceNumber) - 1)]?.id ?? "";
      }
      if (!id) continue;
      const note = String(n.contextNote ?? "").trim();
      if (!note) continue;
      notesById.set(id, {
        contextNote: note,
        discourseRole: String(n.discourseRole ?? "").trim() || undefined,
        connectionType: String(n.connectionType ?? "").trim() || undefined,
      });
    }

    const grammarByItemId = new Map<string, AnalysisGrammarPoint[]>();
    const passageGrammar = (parsed?.grammarPoints ?? []).slice(0, 8);

    for (const raw of passageGrammar) {
      const mapped = mapRawGrammarPoint(raw);
      if (!mapped) continue;

      let itemId = String(raw.itemId ?? "").trim();
      if (!itemId && typeof raw.sentenceNumber === "number") {
        const idx = Math.max(0, Math.floor(raw.sentenceNumber) - 1);
        itemId = lines[idx]?.id ?? "";
      }
      if (!itemId) {
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
      if (list.length >= 2) continue;
      list.push(mapped);
      grammarByItemId.set(itemId, list);
    }

    const sentences: AnalysisSentence[] = lines.map((line) => {
      const raw = byId.get(line.id);
      const noteExtra = notesById.get(line.id);
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

      let grammarPoints = grammarByItemId.get(line.id) ?? [];
      if (grammarPoints.length === 0 && passageGrammar.length === 0) {
        grammarPoints = (raw?.grammarPoints ?? [])
          .map((g) => mapRawGrammarPoint(g))
          .filter((g): g is AnalysisGrammarPoint => !!g)
          .slice(0, 2);
      }

      const contextNote =
        String(raw?.contextNote ?? "").trim() ||
        noteExtra?.contextNote ||
        String(raw?.easyUnderstanding ?? "").trim() ||
        "";

      return {
        itemId: line.id,
        enChunks,
        koChunks,
        easyUnderstanding: contextNote,
        contextNote,
        discourseRole:
          String(raw?.discourseRole ?? "").trim() ||
          noteExtra?.discourseRole ||
          undefined,
        connectionType:
          String(raw?.connectionType ?? "").trim() ||
          noteExtra?.connectionType ||
          undefined,
        grammarPoints,
      };
    });

    const hasAnyGrammar = sentences.some((s) => s.grammarPoints.length > 0);
    const noPointMessage = !hasAnyGrammar
      ? String(parsed?.noPointMessage ?? "").trim() ||
        "이 지문에는 별도로 강조할 만한 고등학교 핵심 어법이 없습니다."
      : undefined;

    return {
      headerLabel: input.headerLabel?.trim() || "26년도 1학기 중간고사 대비",
      sentences,
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
