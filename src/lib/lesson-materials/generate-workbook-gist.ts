import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  WORKBOOK_GIST_SYSTEM_PROMPT,
  buildWorkbookGistUserPrompt,
} from "@/lib/lesson-materials/workbook-gist-prompt";
import {
  GIST_KIND_LABEL,
  clampGistCount,
  joinWorkbookPassageLines,
  type WorkbookGistItem,
  type WorkbookGistKind,
  type WorkbookGistOptions,
  type WorkbookGistSection,
  type WorkbookLineTranslationSkip,
} from "@/lib/lesson-materials/workbook-types";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { openAiFetch } from "@/lib/ai-usage/openai-fetch";

/**
 * 제목·주제·요지 해석(선생님 2026-10-24). 지문당 모델 호출 한 번(T/F와 같은 빠른 모델),
 * 걸리면 까닭을 붙여 한 번 더. 검수는 코드로(값 없음):
 *  · 바꿔 쓰기 — 지문 문장과 연속 5낱말 이상 같으면 베낀 것
 *  · 제목 4~10낱말 · 주제 명사구(마침표 없음, 6~14낱말) · 요지 완전한 문장(12~25낱말, 마침표)
 *  · 같은 갈래 안에서 같은 문장 반복 금지 · 우리말 해석에 한글이 있어야 함
 */
const GIST_PASSAGE_CONCURRENCY = 8;

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

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** 지문 문장의 연속 n낱말 묶음 */
function shingles(passage: string, n: number): Set<string> {
  const out = new Set<string>();
  const w = words(passage);
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

const COPY_RUN = 5;

type Pair = { en: string; ko: string };

function checkPair(
  kind: WorkbookGistKind,
  pair: Pair,
  passageShingles: Set<string>
): string | null {
  const en = pair.en.trim();
  const ko = pair.ko.trim();
  const label = GIST_KIND_LABEL[kind];
  if (!en) return `${label}: 영어가 비었다`;
  if (!ko || !/[가-힣]/.test(ko)) return `${label} "${en}": 우리말 해석이 없다`;
  if (/[가-힣]/.test(en)) return `${label} "${en}": 영어에 한글이 섞였다`;
  const w = words(en);
  if (kind === "title" && (w.length < 3 || w.length > 12)) return `${label} "${en}": 4~10낱말이어야 한다`;
  if (kind === "topic") {
    if (w.length < 4 || w.length > 18) return `${label} "${en}": 6~14낱말 명사구여야 한다`;
    if (/[.!?]\s*$/.test(en)) return `${label} "${en}": 주제는 명사구라 마침표를 찍지 않는다`;
    if (/^(the passage|this passage|the writer|the author|it is|there is|there are)\b/i.test(en))
      return `${label} "${en}": 「The passage …」 같은 문장 틀이 아니라 명사구로 쓴다`;
  }
  if (kind === "gist") {
    if (w.length < 8 || w.length > 32) return `${label} "${en}": 12~25낱말의 완전한 문장이어야 한다`;
    if (!/[.!?]\s*$/.test(en)) return `${label} "${en}": 요지는 문장이라 마침표로 끝난다`;
  }
  for (let i = 0; i + COPY_RUN <= w.length; i++) {
    const run = w.slice(i, i + COPY_RUN).join(" ");
    if (passageShingles.has(run)) return `${label} "${en}": 지문 문장을 그대로 베꼈다(「${run}」). 바꿔 써야 한다`;
  }
  return null;
}

function mapResult(
  raw: unknown,
  options: WorkbookGistOptions,
  passage: string
): { ok: true; items: WorkbookGistItem[] } | { ok: false; message: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const sh = shingles(passage, COPY_RUN);
  const problems: string[] = [];
  const items: WorkbookGistItem[] = [];
  const kinds: Array<[WorkbookGistKind, string, number]> = [
    ["title", "titles", options.title],
    ["topic", "topics", options.topic],
    ["gist", "gists", options.gist],
  ];
  for (const [kind, key, want] of kinds) {
    const list = Array.isArray(r[key]) ? (r[key] as unknown[]) : [];
    const pairs: Pair[] = list.map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return { en: String(o.en ?? "").trim(), ko: String(o.ko ?? "").trim() };
    });
    if (pairs.length < want) {
      problems.push(`${GIST_KIND_LABEL[kind]}이(가) ${want}개 있어야 하는데 ${pairs.length}개다`);
      continue;
    }
    const seen = new Set<string>();
    for (const pair of pairs.slice(0, want)) {
      const problem = checkPair(kind, pair, sh);
      if (problem) {
        problems.push(problem);
        continue;
      }
      const k = words(pair.en).join(" ");
      if (seen.has(k)) {
        problems.push(`${GIST_KIND_LABEL[kind]} "${pair.en}": 같은 갈래 안에서 같은 문장이 반복된다`);
        continue;
      }
      seen.add(k);
      items.push({
        orderIndex: items.length + 1,
        kind,
        english: pair.en,
        korean: pair.ko,
        // 제목·주제는 한 줄, 요지는 두 줄
        answerLineCount: kind === "gist" ? 2 : 1,
      });
    }
  }
  if (problems.length) return { ok: false, message: problems.join("\n") };
  return { ok: true, items };
}

async function callGistOpenAI(input: {
  title?: string;
  passage: string;
  options: WorkbookGistOptions;
}): Promise<WorkbookGistItem[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const configured = process.env.OPENAI_MODEL_WORKBOOK?.trim();
  // T/F와 같은 선택(2026-10-01 견줌: luna가 7배 싸고 더 정확)
  const candidates = configured
    ? configured.startsWith("gpt-5")
      ? [configured, "gpt-4o"]
      : [configured]
    : ["gpt-5.6-luna", "gpt-4o"];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  try {
    let retryNote: string | undefined;
    let lastProblem = "";
    // 걸리면 까닭을 붙여 한 번 더(두 번째도 걸리면 그 지문은 건너뛴다)
    for (let round = 0; round < 2; round++) {
      const userContent = buildWorkbookGistUserPrompt({ ...input, retryNote });
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
              { role: "system", content: WORKBOOK_GIST_SYSTEM_PROMPT },
              { role: "user", content: userContent },
            ],
            prompt_cache_key: "workbook-gist",
          };
          if (includeJsonMode) body.response_format = { type: "json_object" };
          if (includeTemperature) body.temperature = 0.5;
          else delete body.temperature;
          if (isGpt5FamilyModel(model)) {
            body.max_completion_tokens = 6_000;
            if (includeReasoningEffort) body.reasoning_effort = "low";
            else delete body.reasoning_effort;
          } else {
            body.max_tokens = 3_000;
          }
          const res = await openAiFetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
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
          if (includeReasoningEffort && isUnsupportedParameterError(bodyText, "reasoning_effort")) {
            includeReasoningEffort = false;
            continue;
          }
          if (includeJsonMode && isUnsupportedParameterError(bodyText, "response_format")) {
            includeJsonMode = false;
            continue;
          }
          lastErr = bodyText.slice(0, 200);
          if (isModelUnavailableError(res.status, bodyText)) break;
          break;
        }
        if (ok) break;
      }
      if (!ok) throw new Error(`제목·주제·요지 생성 실패${lastErr ? `: ${lastErr}` : ""}`.slice(0, 180));

      const envelope = parseJsonSafe<{ choices?: { message?: { content?: string } }[] }>(bodyText);
      const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
      const mapped = mapResult(parseJsonSafe(content), input.options, input.passage);
      if (mapped.ok) return mapped.items;
      lastProblem = mapped.message;
      retryNote = mapped.message;
    }
    throw new Error(`제목·주제·요지를 만들지 못했습니다: ${lastProblem}`.slice(0, 300));
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWorkbookGist(input: {
  passages: Array<{ projectId: string; title: string; source?: string | null; englishLines: string[] }>;
  options: WorkbookGistOptions;
}): Promise<{ sections: WorkbookGistSection[]; skipped: WorkbookLineTranslationSkip[] }> {
  const options: WorkbookGistOptions = {
    title: clampGistCount(input.options.title),
    topic: clampGistCount(input.options.topic),
    gist: clampGistCount(input.options.gist),
  };
  if (options.title + options.topic + options.gist === 0) {
    return { sections: [], skipped: input.passages.map((p) => ({ projectId: p.projectId, title: p.title, reason: "만들 개수가 0입니다." })) };
  }
  const results = await runWithConcurrency(input.passages, GIST_PASSAGE_CONCURRENCY, async (p) => {
    const passage = p.englishLines.join("\n").trim();
    if (!passage) return { skip: { projectId: p.projectId, title: p.title, reason: "영어 원문이 없습니다." } };
    try {
      const items = await callGistOpenAI({ title: p.title, passage, options });
      return { section: { projectId: p.projectId, title: p.title, source: p.source ?? null, items, passage: joinWorkbookPassageLines(p.englishLines) } };
    } catch (e) {
      return { skip: { projectId: p.projectId, title: p.title, reason: e instanceof Error ? e.message : "만들지 못했습니다." } };
    }
  });
  const sections: WorkbookGistSection[] = [];
  const skipped: WorkbookLineTranslationSkip[] = [];
  for (const r of results) {
    if ("section" in r && r.section) sections.push(r.section);
    else if ("skip" in r && r.skip) skipped.push(r.skip);
  }
  return { sections, skipped };
}
