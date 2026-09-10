/**
 * Final live Grammar Choice V2 quality run. Does not edit production code.
 * Run: npx tsx --env-file=.env.local scripts/test-grammar-choice-v2-live-quality.ts
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateWorkbookGrammarChoiceV2 } from "../src/lib/lesson-materials/grammar-choice-v2/generate";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { rejectCandidate } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
import { validateMinimalPair } from "../src/lib/lesson-materials/grammar-choice-v2/minimal-pair";

const EXPECTED = [
  {
    key: "loa",
    title: "긍정적 사고의 한계와 믿음의 힘",
    sourceId: "0cd85cff-26cb-44be-ba52-824855a4170e",
    sha256: "edb9152faf9ee1fbbc074039fc0a2bc2a559a5fbcdf5546faa845c4ac93f04d3",
  },
  {
    key: "movement",
    title: "우리는 움직이기 위해 태어났다",
    sourceId: "ff6fa8a9-b3b6-4c0b-99d7-09b8b06efc8c",
    sha256: "cb90468f5fad828b919d3aa71364410d273dfcf9c9bd8d467d04910a1276baa2",
  },
  {
    key: "uncertainty",
    title: "불확실성을 받아들이는 용기",
    sourceId: "3b01c20a-c147-4d30-b062-53d4f2efd9ac",
    sha256: "8facd0ed67dc5826b2b64fee261b07f66c47b752df015d45766e46f791ef640a",
  },
  {
    key: "darwin",
    title: "다양한 사고 방식의 중요성",
    sourceId: "15887084-262f-4c77-9c90-023c2551151f",
    sha256: "c1121f5907a6a5eb4252d42adf50e7bc8a91bfe182804200efff0e263acc8dfe",
  },
];

type CallLog = {
  stage: string;
  requestedModel: string;
  actualModel: string;
  reasoningEffort: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  ok: boolean;
  error?: string;
};

const calls: CallLog[] = [];
let openaiStarted = 0;
const originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input, init) => {
  const url = String(input);
  const started = Date.now();
  if (!url.includes("api.openai.com")) return originalFetch(input, init);
  if (process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT?.trim() === "1") {
    openaiStarted += 1;
    if (openaiStarted > 5) throw new Error("OPENAI_CALL_CAP");
  }
  let requestedModel = "";
  let reasoningEffort = "";
  try {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      model?: string;
      reasoning_effort?: string;
      reasoning?: { effort?: string };
    };
    requestedModel = body.model ?? "";
    reasoningEffort = body.reasoning_effort ?? body.reasoning?.effort ?? "";
  } catch {
    requestedModel = "";
  }
  try {
    const res = await originalFetch(input, init);
    const text = await res.clone().text();
    const json = JSON.parse(text) as {
      model?: string;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    calls.push({
      stage: url.includes("chat/completions") ? "chat" : url,
      requestedModel,
      actualModel: String(json.model ?? ""),
      reasoningEffort,
      latencyMs: Date.now() - started,
      inputTokens: json.usage?.prompt_tokens ?? null,
      outputTokens: json.usage?.completion_tokens ?? null,
      ok: res.ok,
      error: res.ok ? undefined : text.slice(0, 400),
    });
    return res;
  } catch (err) {
    calls.push({
      stage: "chat",
      requestedModel,
      actualModel: "",
      reasoningEffort,
      latencyMs: Date.now() - started,
      inputTokens: null,
      outputTokens: null,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
};

function studentContentDigest(sections: Array<{
  sourcePassage: string;
  segments: Array<{ type: string; text?: string; number?: number; leftText?: string; rightText?: string }>;
  items: Array<{
    number: number;
    correctText: string;
    incorrectText: string;
    explanationKo: string;
    incorrectReasonKo?: string;
  }>;
}>) {
  const normalized = sections.map((section) => ({
    passage: studentPassage(section).replace(/\s+/g, " ").trim(),
    questions: section.items.map((item) => ({
      number: item.number,
      choices: [item.correctText, item.incorrectText].map((s) => s.trim()),
    })),
    answers: section.items.map((item) => item.correctText.trim()),
    explanations: section.items.map((item) =>
      `${item.explanationKo} ${item.incorrectReasonKo ?? ""}`.replace(/\s+/g, " ").trim()
    ),
  }));
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

function studentPassage(section: {
  segments: Array<{ type: string; text?: string; number?: number; leftText?: string; rightText?: string }>;
}) {
  return section.segments
    .map((seg) =>
      seg.type === "text"
        ? seg.text ?? ""
        : `(${seg.number}) [${seg.leftText} / ${seg.rightText}]`
    )
    .join("");
}

function judge(item: {
  originalText: string;
  correctText: string;
  incorrectText: string;
  grammarCategoryId: string;
  explanationKo: string;
  sentence: string;
}) {
  const flags: string[] = [];
  const correct = item.correctText.trim();
  const wrong = item.incorrectText.trim();
  const spanOk = item.originalText === correct && item.sentence.includes(correct);
  if (!spanOk) flags.push("SPAN_OR_RESTORE");
  if (!correct || !wrong || correct.toLowerCase() === wrong.toLowerCase()) flags.push("NOT_UNIQUE");
  const pair = [correct, wrong].map((s) => s.toLowerCase()).sort().join("|");
  if (pair === "information|advices" || pair === "advice|informations") flags.push("CROSS_PAIR");
  if (/informations|advices|evidences|furnitures|importanter|gooder|thinkinging/.test(`${correct} ${wrong}`.toLowerCase()) &&
    !/^(information|informations|advice|advices)$/i.test(wrong) &&
    !/^(information|advice)$/i.test(correct)) {
    flags.push("NONSTANDARD");
  }
  if (correct.split(/\s+/).length > 4 || wrong.split(/\s+/).length > 4) flags.push("OVER_4_TOKENS");
  const local = rejectCandidate({
    candidate: {
      candidateId: "q",
      sentenceId: "s",
      pointCode: item.grammarCategoryId as never,
      subtype: "",
      sourceSpan: correct,
      occurrenceIndex: item.sentence.indexOf(correct),
      correctAnswer: correct,
      distractors: [wrong],
      priority: ontologyPoint(item.grammarCategoryId)?.priority ?? "CORE",
      confidence: "HIGH",
    },
    sentence: {
      sentenceId: "s",
      text: item.sentence,
      passageStart: 0,
      passageEnd: item.sentence.length,
    },
  });
  if (local) flags.push(local);
  const minimal = validateMinimalPair({
    pointCode: item.grammarCategoryId,
    sourceSpan: correct,
    distractor: wrong,
    sentence: item.sentence,
  });
  if (minimal) flags.push(minimal);
  if (!item.explanationKo.trim()) flags.push("EMPTY_EXPLANATION");
  if (!ontologyPoint(item.grammarCategoryId)) flags.push("UNKNOWN_CODE");
  const hard = flags.filter((f) =>
    [
      "SPAN_OR_RESTORE",
      "NOT_UNIQUE",
      "CROSS_PAIR",
      "BOTH_GRAMMATICAL",
      "AMBIGUOUS_SUBJECT_BOUNDARY",
      "MEANING_ONLY_CONTRAST",
      "NON_MINIMAL_SPAN",
      "MULTI_AXIS_EDIT",
      "SOURCE_ANSWER_MISMATCH",
      "SOURCE_SPAN_NOT_FOUND",
      "IMPLAUSIBLE_DISTRACTOR",
      "NONSTANDARD",
    ].includes(f)
  );
  return {
    verdict: hard.length ? "FAIL" : flags.length ? "WARN" : "PASS",
    flags,
  };
}

async function loadPassages() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const ids = EXPECTED.map((row) => row.sourceId);
  const { data: projects, error: pErr } = await admin
    .from("lesson_material_projects")
    .select("id,title")
    .in("id", ids);
  if (pErr) throw pErr;
  const { data: items, error: iErr } = await admin
    .from("lesson_material_items")
    .select("id,project_id,order_index,english_text")
    .in("project_id", ids)
    .order("order_index", { ascending: true });
  if (iErr) throw iErr;

  return EXPECTED.map((spec) => {
    const sentences = (items ?? [])
      .filter((row) => row.project_id === spec.sourceId)
      .map((row) => ({ id: String(row.id), english: String(row.english_text ?? "") }));
    const joined = sentences.map((s) => s.english).join("\n");
    const sha256 = createHash("sha256").update(joined).digest("hex");
    return {
      ...spec,
      dbTitle: projects?.find((p) => p.id === spec.sourceId)?.title ?? "",
      sentences,
      joined,
      sha256,
      hashMatch: sha256 === spec.sha256,
    };
  });
}

async function main() {
  process.env.OPENAI_GRAMMAR_V2_ANALYZER_MODEL = "gpt-5.6-sol";
  // 배포 기본값과 같은 effort로 검증한다. 생성이 검수보다 낮으면 안 된다.
  process.env.OPENAI_GRAMMAR_V2_ANALYZER_REASONING_EFFORT = "high";
  process.env.OPENAI_GRAMMAR_V2_AUDITOR_MODEL = "gpt-5.6-sol";
  process.env.OPENAI_GRAMMAR_V2_AUDITOR_REASONING_EFFORT = "high";

  const loaded = await loadPassages();
  const hashReport = loaded.map((row) => ({
    title: row.dbTitle || row.title,
    sourceId: row.sourceId,
    expected: row.sha256,
    actual: row.sha256,
    match: row.hashMatch,
    sentenceCount: row.sentences.length,
  }));
  if (loaded.some((row) => !row.hashMatch)) {
    writeFileSync(
      "scripts/_gc-v2-live-quality.json",
      JSON.stringify({ status: "SOURCE_HASH_MISMATCH", hashReport }, null, 2),
      "utf8"
    );
    console.log(JSON.stringify({ status: "SOURCE_HASH_MISMATCH", hashReport }, null, 2));
    process.exit(2);
  }

  const passages = loaded.map((row) => ({
    projectId: row.sourceId,
    title: row.dbTitle || row.title,
    source: null,
    sentences: row.sentences,
  }));

  const started = Date.now();
  const result = await generateWorkbookGrammarChoiceV2({
    forceRegenerate: true,
    passages,
  });
  const wallMs = Date.now() - started;
  const firstCalls = calls.length;

  const captureMode = process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT?.trim() === "1";
  const firstDigest = studentContentDigest(result.sections);
  let secondCalls = 0;
  let secondDigest = firstDigest;
  let cacheHit: Array<{ projectId: string; cacheHit: boolean }> = [];
  let secondWall = 0;
  let secondOpenAI = 0;
  if (captureMode) {
    process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT = "";
  }
  const cacheInput = passages.map((p) => ({
    ...p,
    grammarChoiceV2Cache: result.cachesToSave.find((c) => c.projectId === p.projectId)?.cache ?? null,
  }));
  const beforeSecond = calls.length;
  const secondStarted = Date.now();
  const second = await generateWorkbookGrammarChoiceV2({
    forceRegenerate: false,
    passages: cacheInput,
  });
  secondCalls = calls.length - beforeSecond;
  secondDigest = studentContentDigest(second.sections);
  secondWall = Date.now() - secondStarted;
  secondOpenAI = second.timing.openAiRequestCount;
  cacheHit = second.sections.map((s) => ({
    projectId: s.projectId,
    cacheHit: s.diagnostics?.cacheHit ?? false,
  }));
  if (captureMode) {
    process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT = "1";
  }

  const payload = {
    status: "RAN",
    hashReport,
    wallMs,
    openAI: result.timing.openAiRequestCount,
    performanceWarn: wallMs > 120_000,
    skipped: result.skipped,
    calls,
    snapshotDir: process.env.GRAMMAR_CHOICE_V2_SNAPSHOT_DIR ?? null,
    cacheSecond: {
      wallMs: secondWall,
      openAI: secondOpenAI,
      fetchCalls: secondCalls,
      cacheHit,
      studentDigestMatch: firstDigest === secondDigest,
    },
    sections: result.sections.map((section) => {
      const sentenceById = new Map(
        loaded
          .find((row) => row.sourceId === section.projectId)
          ?.sentences.map((s) => [s.id, s.english]) ?? []
      );
      const items = section.items.map((item) => {
        const sentence =
          sentenceById.get(item.sentenceId) ??
          section.sourcePassage.slice(
            Math.max(0, item.startCharIndex - 80),
            Math.min(section.sourcePassage.length, item.endCharIndex + 80)
          );
        const judged = judge({
          originalText: item.originalText,
          correctText: item.correctText,
          incorrectText: item.incorrectText,
          grammarCategoryId: item.grammarCategoryId,
          explanationKo: item.explanationKo,
          sentence,
        });
        return {
          number: item.number,
          sentenceId: item.sentenceId,
          code: item.grammarCategoryId,
          chapter: ontologyPoint(item.grammarCategoryId)?.referenceChapter ?? ontologyPoint(item.grammarCategoryId)?.chapter,
          priority: ontologyPoint(item.grammarCategoryId)?.priority,
          difficulty: item.difficulty,
          correct: item.correctText,
          wrong: item.incorrectText,
          left: item.leftText,
          right: item.rightText,
          correctSide: item.correctSide,
          explanationKo: item.explanationKo,
          incorrectReasonKo: item.incorrectReasonKo,
          span: item.originalText,
          start: item.startCharIndex,
          end: item.endCharIndex,
          sourceSlice: section.sourcePassage.slice(item.startCharIndex, item.endCharIndex),
          verdict: judged.verdict,
          flags: judged.flags,
        };
      });
      return {
        projectId: section.projectId,
        title: section.title,
        diagnostics: section.diagnostics,
        studentPassage: studentPassage(section),
        sourcePassage: section.sourcePassage,
        items,
      };
    }),
    reports: result.reports,
    firstCalls,
  };

  writeFileSync("scripts/_gc-v2-live-quality.json", JSON.stringify(payload, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        status: "RAN",
        wallMs,
        openAI: result.timing.openAiRequestCount,
        performanceWarn: wallMs > 120_000,
        skipped: result.skipped,
        counts: result.sections.map((s) => [
          s.title,
          s.items.length,
          s.diagnostics?.passageRestored,
          s.diagnostics?.renderedQuestionCount,
          s.diagnostics?.mandatoryDetected,
          s.diagnostics?.mandatoryEligible,
          s.diagnostics?.mandatoryRendered,
          s.diagnostics?.mandatoryExcludedWithValidReason,
        ]),
        cacheSecond: payload.cacheSecond,
        models: calls.map((c) => [c.actualModel, c.reasoningEffort, c.ok, c.latencyMs]),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  writeFileSync(
    "scripts/_gc-v2-live-quality.json",
    JSON.stringify({ status: "ERROR", error: err instanceof Error ? err.message : String(err), calls }, null, 2),
    "utf8"
  );
  process.exit(1);
});
