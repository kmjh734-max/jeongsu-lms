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
  /** 이 문장에서 이 문법이 어떻게 쓰였는지 짧은 설명(학생용, 1~2문장) */
  explanation?: string;
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

/**
 * 저장된 분석서를 그대로 쓸 수 있는지 가르는 형식 버전. 출력 항목이 바뀌면(예: 문법 설명
 * explanation 추가) 올려서, 옛 형식 분석서는 제작 때 한 번 새로 만들게 한다.
 */
export const ANALYSIS_REPORT_FORMAT_VERSION = "ar-2-explanation";

export type AnalysisReportData = {
  /** 만들 때의 영어 원문 해시. 원문이 그대로면 제작을 눌러도 다시 만들지 않는다. */
  sourceHash?: string;
  formatVersion?: string;
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
  explanation?: unknown;
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
    explanation: String(raw.explanation ?? "").trim() || undefined,
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

type RawAnalysisSentence = {
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
};

type RawSentenceNote = {
  sentenceId?: string;
  sentenceNumber?: number;
  discourseRole?: string;
  connectionType?: string;
  contextNote?: string;
};

type RawAnalysisResponse = {
  sentences?: RawAnalysisSentence[];
  sentenceNotes?: RawSentenceNote[];
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
    explanation?: string;
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
};

/** Whole-report deadline; the route allows 300s and still has to save. */
const REPORT_DEADLINE_MS = 240_000;
/** A passage up to this many sentences is written by a single sentence call. */
const SINGLE_GROUP_MAX_SENTENCES = 5;
/** Target sentences per parallel sentence call once a passage is split. */
const SENTENCES_PER_GROUP = 4;
/** Upper bound on parallel sentence calls per passage (8 passages run at once). */
const MAX_SENTENCE_GROUPS = 6;
/** Each call (grammar or one sentence group) is tried at most this many times. */
const CALL_ATTEMPTS = 2;

class ReportDeadlineError extends Error {}

type ReasoningEffort = "low" | "medium";
/**
 * The grammar call is the one every passage waits on (24-56s at medium against
 * 11-19s for the sentence calls, 3 passages). At low it took 15-18s and picked
 * and classified the same points; the sentence calls stay at medium because
 * lowering them does not shorten the report and chunking benefits from it.
 */
const GRAMMAR_EFFORT: ReasoningEffort = "low";
const SENTENCE_EFFORT: ReasoningEffort = "medium";
/** See requestHedged. Normal calls finish well inside this. */
const HEDGE_AFTER_MS = 30_000;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new ReportDeadlineError("aborted"));
      return;
    }
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new ReportDeadlineError("aborted"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function retryDelayMs(res: Response, attempt: number): number {
  const header = Number(res.headers.get("retry-after"));
  if (Number.isFinite(header) && header > 0) {
    return Math.min(20_000, header * 1000);
  }
  return Math.min(20_000, 1500 * 2 ** attempt + Math.floor(Math.random() * 500));
}

/**
 * One chat-completions call with the same model / parameter fallbacks as
 * before (temperature, reasoning_effort, response_format, unavailable model),
 * plus a couple of waits on rate-limit / server errors before falling through.
 * Returns the message content.
 */
async function requestAnalysisContent(
  apiKey: string,
  userContent: string,
  signal: AbortSignal,
  effort: ReasoningEffort
): Promise<string> {
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
    let transientRetries = 0;

    for (let attempt = 0; attempt < 6; attempt++) {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: ANALYSIS_REPORT_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      };
      // 분석서 호출끼리 같은 서버로 가게 해 긴 공통 지시문이 프롬프트 캐시에 걸리게 한다.
      body.prompt_cache_key = "analysis-report";
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
        if (includeReasoningEffort) body.reasoning_effort = effort;
        else delete body.reasoning_effort;
      } else {
        body.max_tokens = 8192;
      }

      let res: Response;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal,
          body: JSON.stringify(body),
        });
        bodyText = await res.text();
      } catch (e) {
        if (signal.aborted) throw new ReportDeadlineError("aborted");
        // Dropped connection: wait briefly and try the same model again.
        lastErr = e instanceof Error ? e.message : String(e);
        if (transientRetries < 2) {
          transientRetries++;
          await sleep(1500 * transientRetries, signal);
          continue;
        }
        break;
      }
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
      if (isTransientStatus(res.status) && transientRetries < 2) {
        await sleep(retryDelayMs(res, transientRetries), signal);
        transientRetries++;
        continue;
      }
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
  return envelope?.choices?.[0]?.message?.content ?? bodyText;
}

/** Splits sentences into contiguous, evenly sized groups. */
function splitSentenceGroups<T>(items: T[]): T[][] {
  if (items.length <= SINGLE_GROUP_MAX_SENTENCES) return [items];
  const count = Math.min(
    MAX_SENTENCE_GROUPS,
    Math.ceil(items.length / SENTENCES_PER_GROUP)
  );
  const base = Math.floor(items.length / count);
  const extra = items.length % count;
  const groups: T[][] = [];
  let at = 0;
  for (let g = 0; g < count; g++) {
    const size = base + (g < extra ? 1 : 0);
    groups.push(items.slice(at, at + size));
    at += size;
  }
  return groups;
}

/**
 * Grammar points stay a single passage-wide call so selection (count, one
 * representative per principle) is judged over the whole passage. Its output
 * is kept short: PART/CHAPTER are rebuilt from the UNIT number by
 * mapClassification, and itemId replaces the copied original sentence.
 */
function buildGrammarScopePrompt(baseUserContent: string): string {
  return `${baseUserContent}

<output_scope>
이번 응답은 지문 전체의 grammarPoints 선정·분석만 담당한다. 문장별 enChunks·koChunks·contextNote는 따로 작성되므로 쓰지 않는다.
- "sentences"는 []로 둔다.
- grammarPoints는 지문 전체를 기준으로 선별한다(권장 3∼6개, 최대 8개, 문장당 독립 포인트 최대 2개, 동일 원리 반복 시 대표만). 각 항목에 itemId·sentenceNumber를 넣고 originalSentence는 생략한다.
- 각 항목에 explanation(학생이 바로 이해할 한국어 1∼2문장 설명, ～한다체)을 반드시 쓴다.
- primaryClassification·relatedUnits의 각 분류는 {"unitNumber", "unitTitle"}만 쓴다. PART·CHAPTER는 UNIT 번호로 채워진다. 목차 외 보충이면 unitNumber는 null.
- 강조할 어법이 없으면 grammarPoints는 [], hasKeyGrammarPoints는 false로 두고 noPointMessage를 쓴다.
- JSON은 들여쓰기·줄바꿈 없이 한 줄로 출력한다.
</output_scope>`;
}

function buildSentenceGroupScopePrompt(
  baseUserContent: string,
  group: Array<{ id: string; number: number }>
): string {
  const first = group[0]?.number ?? 1;
  const last = group[group.length - 1]?.number ?? first;
  return `${baseUserContent}

<output_scope>
이번 응답은 전체 문장 중 ${first}번∼${last}번 문장(${group.length}개)만 담당한다. 지문 전체 흐름은 위 full_passage와 sentences로 파악하되, 출력은 아래 대상 문장만 쓴다.
target_sentence_ids: ${JSON.stringify(group.map((g) => g.id))}
- "sentences"에는 대상 문장만 입력 순서대로 하나씩 넣는다. 대상 밖 문장은 출력하지 않는다(문장 개수·순서 유지 규칙은 대상 범위에 적용한다).
- contextNote·discourseRole·connectionType은 대상 밖 문장을 포함한 앞뒤 문장과 지문 전체 흐름 속에서 판단한다.
- 어법 포인트는 따로 선정되므로 "grammarPoints"는 []로 두고 hasKeyGrammarPoints·noPointMessage는 쓰지 않는다.
- JSON은 들여쓰기·줄바꿈 없이 한 줄로 출력한다.
</output_scope>`;
}

/**
 * requestAnalysisContent with a hedge: when the answer has not come back after
 * HEDGE_AFTER_MS, the same request is sent once more and whichever answers
 * first wins (the other is aborted). Now and then one call takes several
 * times longer than its siblings and the whole report waits on it.
 */
function requestHedged(
  apiKey: string,
  userContent: string,
  signal: AbortSignal,
  effort: ReasoningEffort
): Promise<string> {
  return new Promise((resolve, reject) => {
    const children: AbortController[] = [];
    let settled = false;
    let failures = 0;
    const abortChildren = () => {
      for (const c of children) c.abort();
    };
    signal.addEventListener("abort", abortChildren, { once: true });
    const finish = () => {
      settled = true;
      clearTimeout(hedgeTimer);
      signal.removeEventListener("abort", abortChildren);
    };
    const launch = () => {
      const child = new AbortController();
      children.push(child);
      requestAnalysisContent(apiKey, userContent, child.signal, effort).then(
        (content) => {
          if (settled) return;
          finish();
          for (const c of children) if (c !== child) c.abort();
          resolve(content);
        },
        (e) => {
          if (settled) return;
          failures++;
          // The other request is still running: wait for it.
          if (failures < children.length) return;
          finish();
          reject(signal.aborted ? new ReportDeadlineError("aborted") : e);
        }
      );
    };
    const hedgeTimer = setTimeout(() => {
      if (!settled && failures === 0 && children.length === 1) launch();
    }, HEDGE_AFTER_MS);
    launch();
  });
}

/**
 * Runs one call, parses it and checks it with `score` (0 = unusable).
 * Retries once when the answer is unusable or incomplete, keeping the better
 * of the two; throws only when nothing usable came back.
 */
async function runScopedCall(
  apiKey: string,
  userContent: string,
  signal: AbortSignal,
  effort: ReasoningEffort,
  score: (parsed: RawAnalysisResponse) => { value: number; complete: boolean }
): Promise<RawAnalysisResponse> {
  let best: { parsed: RawAnalysisResponse; value: number } | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < CALL_ATTEMPTS; attempt++) {
    let content: string;
    try {
      content = await requestHedged(apiKey, userContent, signal, effort);
    } catch (e) {
      if (e instanceof ReportDeadlineError || signal.aborted) throw e;
      lastError = e;
      continue;
    }
    const parsed = parseJsonSafe<RawAnalysisResponse>(content);
    if (!parsed || typeof parsed !== "object") continue;
    const s = score(parsed);
    if (s.value > 0 && (!best || s.value > best.value)) {
      best = { parsed, value: s.value };
    }
    if (s.value > 0 && s.complete) break;
  }
  if (best) return best.parsed;
  if (lastError instanceof Error) throw lastError;
  throw new Error("분석서 생성 실패: 응답을 읽지 못했습니다.");
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
  const timer = setTimeout(() => controller.abort(), REPORT_DEADLINE_MS);

  try {
    // Every call sees the whole passage (so notes and grammar choice stay
    // passage-aware) but writes only its own part: one call picks the
    // passage's grammar points and the sentences are written in groups, all
    // in parallel. A single call was slow because of how much it had to write.
    const baseUserContent = buildAnalysisReportUserPrompt({
      title: input.title,
      lines,
    });

    const numbered = lines.map((l, i) => ({ id: l.id, number: i + 1 }));
    const groups = splitSentenceGroups(numbered);

    const grammarTask = runScopedCall(
      apiKey,
      buildGrammarScopePrompt(baseUserContent),
      controller.signal,
      GRAMMAR_EFFORT,
      (p) => {
        const said =
          Array.isArray(p.grammarPoints) ||
          !!String(p.noPointMessage ?? "").trim() ||
          p.hasKeyGrammarPoints === false;
        return { value: said ? 1 : 0, complete: said };
      }
    );

    const groupTasks = groups.map((group) => {
      const targetIds = new Set(group.map((g) => g.id));
      const numberToId = new Map(group.map((g) => [g.number, g.id] as const));
      // This group's sentences only, keyed by the input id.
      const ownSentences = (p: RawAnalysisResponse): RawAnalysisSentence[] =>
        (Array.isArray(p.sentences) ? p.sentences : [])
          .filter((s): s is RawAnalysisSentence => !!s && typeof s === "object")
          .map((s) => {
            const loose = s as RawAnalysisSentence & {
              sentenceId?: unknown;
              sentenceNumber?: unknown;
            };
            let id = String(loose.itemId ?? loose.sentenceId ?? "").trim();
            if (!targetIds.has(id) && typeof loose.sentenceNumber === "number") {
              id = numberToId.get(Math.floor(loose.sentenceNumber)) ?? id;
            }
            return { ...s, itemId: id };
          })
          .filter((s) => targetIds.has(s.itemId ?? ""));
      return runScopedCall(
        apiKey,
        buildSentenceGroupScopePrompt(baseUserContent, group),
        controller.signal,
        SENTENCE_EFFORT,
        (p) => {
          const got = new Set(ownSentences(p).map((s) => s.itemId));
          return { value: got.size, complete: got.size === targetIds.size };
        }
      ).then((p) => ({
        sentences: ownSentences(p),
        sentenceNotes: (Array.isArray(p.sentenceNotes)
          ? p.sentenceNotes
          : []
        ).filter((n) => {
          const id = String(n?.sentenceId ?? "").trim();
          if (id) return targetIds.has(id);
          return (
            typeof n?.sentenceNumber === "number" &&
            numberToId.has(Math.floor(n.sentenceNumber))
          );
        }),
      }));
    });

    let grammarPart: RawAnalysisResponse;
    let sentenceParts: Array<{
      sentences: RawAnalysisSentence[];
      sentenceNotes: RawSentenceNote[];
    }>;
    try {
      [grammarPart, sentenceParts] = await Promise.all([
        grammarTask,
        Promise.all(groupTasks),
      ]);
    } catch (e) {
      // Stop the sibling calls; the caller shows the error and offers a retry.
      controller.abort();
      if (e instanceof ReportDeadlineError) {
        throw new Error(
          "분석서 생성 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
        );
      }
      throw e;
    }

    const parsed: RawAnalysisResponse = {
      sentences: sentenceParts.flatMap((p) => p.sentences),
      sentenceNotes: sentenceParts.flatMap((p) => p.sentenceNotes),
      hasKeyGrammarPoints: grammarPart.hasKeyGrammarPoints,
      grammarPoints: Array.isArray(grammarPart.grammarPoints)
        ? grammarPart.grammarPoints
        : [],
      noPointMessage: grammarPart.noPointMessage,
    };

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
