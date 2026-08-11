/**
 * 5·6단계 어법·어휘 — 변형문제(question-generator)와 동일 엔진
 * 5단계(어법): 지문 분석 + grammar-catalog
 * 6단계(어휘): 지문 분석 + workbookVocabChoiceCraft (반의·유사형태)
 */
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import {
  examPrepChatJson,
  EXAM_PREP_MODEL_PRIMARY,
  getExamPrepPreferredModels,
  getExamPrepReasoningEffort,
} from "@/lib/exam-prep/exam-prep-openai";
import {
  grammarCatalogPromptBlock,
  grammarExplanationRules,
  pickGrammarFocus,
} from "@/lib/question-generator/grammar-catalog";
import {
  grammarChoiceCraftNote,
  vocabChoiceCraft,
  workbookVocabChoiceCraft,
} from "@/lib/question-generator/choice-craft";
import {
  analyzePassageGrammarForWorkbook,
  analysisHitsToSeedBlanks,
} from "@/lib/exam-prep/analyze-passage-grammar";
import {
  analyzePassageVocabForWorkbook,
  analysisVocabHitsToSeedBlanks,
} from "@/lib/exam-prep/analyze-passage-vocab";
import { isNonsenseChoicePair } from "@/lib/exam-prep/grammar-workbook-plants";
import type { Stage6ItemDraft } from "@/lib/exam-prep/stage6-types";
import type { Stage7CandidateDraft } from "@/lib/exam-prep/stage7-types";

type SeedSentence = {
  id: string;
  english_text: string;
  sentence_order: number;
};

export type Stage6AiMode = "grammar" | "vocabulary" | "mixed";

function findSpanCi(
  haystack: string,
  needle: string
): { start: number; end: number; text: string } | null {
  if (!needle) return null;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = haystack.match(new RegExp(escaped, "i"));
  if (!m || m.index == null) return null;
  return { start: m.index, end: m.index + m[0].length, text: m[0] };
}

function isBadGrammarPair(correct: string, wrong: string): boolean {
  if (isNonsenseChoicePair(correct, wrong)) return true;
  const a = correct.trim();
  const b = wrong.trim();
  if (!a || !b || a.toLowerCase() === b.toLowerCase()) return true;
  if (/^(a|an|the)$/i.test(a) || /^(a|an|the)$/i.test(b)) return true;
  if (/^(a|an|the)\s/i.test(a) && /^(a|an|the)\s/i.test(b)) {
    const stemA = a.replace(/^(a|an|the)\s+/i, "").replace(/s$/i, "");
    const stemB = b.replace(/^(a|an|the)\s+/i, "").replace(/s$/i, "");
    if (stemA.toLowerCase() === stemB.toLowerCase()) return true;
  }
  if (
    /^(is|are|was|were|has|have)$/i.test(a) &&
    /^(is|are|was|were|has|have)$/i.test(b)
  ) {
    return true;
  }
  if (a.length <= 2 || b.length <= 2) return true;
  return false;
}

function matchCase(replacement: string, matched: string): string {
  if (
    matched[0] &&
    matched[0] === matched[0].toUpperCase() &&
    matched[0] !== matched[0].toLowerCase()
  ) {
    return replacement[0]!.toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

type AiStage6Blank = {
  sentenceId?: string;
  correct?: string;
  wrong?: string;
  grammarSub?: string;
  vocabularySub?: string;
  questionKind?: string;
  koLabel?: string;
  koTip?: string;
};

type AiStage7Error = {
  sentenceId?: string;
  correct?: string;
  wrong?: string;
  errorSub?: string;
  koLabel?: string;
  koTip?: string;
};

async function stage56ChatJson(
  system: string,
  user: string,
  opts?: { temperature?: number; maxTokens?: number }
): Promise<unknown> {
  // 변형문제와 동일 경로: retry + 상위 모델 + high/xhigh reasoning
  return questionGeneratorChatJsonWithRetry({
    system,
    user,
    temperature: opts?.temperature ?? 0.25,
    maxTokens: opts?.maxTokens ?? 9000,
    reasoningEffort: getExamPrepReasoningEffort(),
    preferredModels: getExamPrepPreferredModels(),
  });
}

function blanksPerSentenceTarget(english: string): number {
  const words = english.split(/\s+/).filter(Boolean).length;
  if (words <= 8) return 1;
  if (words <= 18) return 2;
  return Math.min(3, Math.max(2, Math.ceil(words / 16)));
}

function buildGrammarSystem(focusBlock: string): string {
  return `당신은 한국 고등 영어 내신·학력평가 **어법** 출제위원이다.
워크북 5단계 [correct / wrong]는 아래 교재 기준으로만 출제한다.

교재:
1) 고등 영어 어법서술형 GRAMMAR POINT 01–15 (시제·태, 조동사, to부정사, 동명사, 분사구문, 접속사, 관계사, 가정법, 5형식/it, 도치·강조, 비교, 수일치)
2) 어법끝(개정) START — 네모 어법 CASE (Point·심는 법)
3) 처음 만나는 수능 어법 스타터(입문) UNIT/Point

**반드시 지문 분석 결과(아래 focus)에 나온 포인트 우선.** 분석에 없는 억지 함정 금지.

${focusBlock}

${grammarCatalogPromptBlock()}

${grammarExplanationRules()}

${grammarChoiceCraftNote()}

좋은 예:
- been dumping / been dumped (태·GP01)
- where / that (관계부사·GP10)
- attracts / is attracted (능동·수동)
- which has / which have (관계절 수일치 — 인접 단순 is/are 금지)
- desperately / desperate (부사·형용사)

절대 금지:
1. assume that/which, know that/which 명사절 장난
2. allow/allowing, to V/V-ing 단순 형태 장난
3. ±s만, 관사, 인접 단순 is/are·has/have, 철자 장난
4. 어휘 혼동 쌍 — 그건 6단계
5. 원문에 없는 correct

규칙:
1. correct = 원문 부분문자열. wrong = CASE/GP 메커니즘 오답.
2. 모든 sentenceId에 최소 1개(짧은 문장 1, 보통 2).
3. 수일치 지문 전체 ≤1.
4. questionKind:"grammar", grammarSub = unitKey (sv, voice, relative…).
5. JSON만: {"blanks":[{"sentenceId","correct","wrong","grammarSub","questionKind","koLabel","koTip"}]}`;
}

function buildVocabSystem(focusBlock: string): string {
  return `당신은 한국 고등 영어 내신·학력평가 **어휘 고르기** 출제위원이다.
워크북 6단계 [correct / wrong] 2지를 만든다. (학평·내신 어휘고르기 동형)

**반드시 지문 어휘 분석 결과(아래)의 반의·유사형태 쌍을 우선 반영.** 분석에 없는 억지 함정 금지.

${focusBlock || "(분석 시드 없음 — 아래 craft로 직접 출제)"}

${workbookVocabChoiceCraft()}

변형문제 어휘 craft (문맥 적합성 참고):
${vocabChoiceCraft()}

좋은 예 (반드시 이런 품질):
- 반의: endless/temporary, dreadful/delightful, strengthen/weaken, vast/narrow, growing/declining
- 유사형태: garbage/garage, permitted/prevented, affect/effect, principal/principle, composition/competition
- 문맥: remind/remember, interact/interfere

절대 금지:
1. 어법 최소쌍 (태·관계사·분사·수일치·±s) — 그건 5단계
2. 관사, be동사만, 황당 무관 단어, 단순 철자 오타
3. 원문에 없는 correct
4. 세트 전체가 전부 반의만 또는 전부 유사철자만

규칙:
1. 지문 전체 논리 방향을 읽고 blanks를 고른다.
2. correct = 원문 내용어. wrong = 반의·유사형태·문맥오답 (같은 품사·시제·수).
3. **모든 sentenceId**에 최소 1개(가능하면 2개). 반의≈유사형태 비율을 섞는다.
4. questionKind:"vocabulary", vocabularySub 필수
   (opposite_meaning|similar_spelling|contextual_meaning|collocation|positive_negative|increase_decrease|strengthen_weaken|word_form).
5. JSON만: {"blanks":[{"sentenceId","correct","wrong","vocabularySub","questionKind","technique","koLabel","koTip"}]}
   technique = antonym|lookalike|context|collocation`;
}

function parseAiBlanks(
  list: AiStage6Blank[],
  ordered: SeedSentence[],
  mode: Stage6AiMode
): Stage6ItemDraft[] {
  const drafts: Stage6ItemDraft[] = [];
  const usedBySent = new Map<string, Array<{ a: number; b: number }>>();
  let order = 1;
  let usedSv = false;
  const unitCount = new Map<string, number>();

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const sid = typeof item.sentenceId === "string" ? item.sentenceId : "";
    const sent = ordered.find((s) => s.id === sid);
    if (!sent) continue;
    const correct = String(item.correct ?? "").trim();
    const wrong = String(item.wrong ?? "").trim();
    if (isBadGrammarPair(correct, wrong)) continue;

    const kindRaw = String(item.questionKind ?? "").toLowerCase();
    const hasVocabSub = Boolean(String(item.vocabularySub ?? "").trim());
    let isVocab =
      kindRaw === "vocabulary" || (kindRaw !== "grammar" && hasVocabSub);

    if (mode === "grammar") {
      if (isVocab) continue;
      isVocab = false;
    } else if (mode === "vocabulary") {
      if (kindRaw === "grammar" && !hasVocabSub) continue;
      isVocab = true;
    }

    const sub = isVocab
      ? String(item.vocabularySub ?? "contextual_meaning").trim() ||
        "contextual_meaning"
      : String(item.grammarSub ?? "other_grammar").trim() || "other_grammar";

    if (!isVocab && sub === "subject_verb_agreement") {
      if (usedSv) continue;
      usedSv = true;
    }

    // 단원 다양성: 같은 sub가 너무 많으면만 스킵 (커버리지 우선 — 예전처럼 early drop 금지)
    const prevUnit = unitCount.get(sub) ?? 0;
    if (prevUnit >= 3 && drafts.length >= ordered.length) continue;

    const english = String(sent.english_text ?? "");
    const span = findSpanCi(english, correct);
    if (!span) continue;
    const used = usedBySent.get(sid) ?? [];
    const target = blanksPerSentenceTarget(english);
    if (used.length >= Math.max(4, target)) continue;
    if (used.some((u) => span.start < u.b && span.end > u.a)) continue;

    used.push({ a: span.start, b: span.end });
    usedBySent.set(sid, used);
    unitCount.set(sub, prevUnit + 1);

    const tip = [item.koLabel, item.koTip].filter(Boolean).join(" — ");
    const wrongMatched = matchCase(wrong, span.text);
    drafts.push({
      sentence_id: sid,
      blank_order: order++,
      answer_text: span.text,
      english_start: span.start,
      english_end: span.end,
      selected_text: span.text,
      choice_options: [
        {
          id: `opt-c-${order}-0`,
          text: span.text,
          isCorrect: true,
          explanation: tip || null,
        },
        {
          id: `opt-w-${order}-1`,
          text: wrongMatched,
          isCorrect: false,
          explanation: tip || null,
        },
      ],
      question_category: isVocab ? "vocabulary" : "grammar",
      grammar_subcategory: isVocab ? [] : [sub],
      vocabulary_subcategory: isVocab ? [sub] : [],
      shuffle_options: true,
      hint: item.koLabel?.trim() || null,
      explanation: tip || null,
      is_required: true,
    });
  }

  return drafts;
}

/**
 * 5단계 어법 / 6단계 어휘 AI 생성
 * 어법: 교재 기준 지문 분석 → 분석 시드 + AI 출제 → 빈 문장 보충
 * 어휘: 반의·유사형태 지문 분석 → 분석 시드 + AI 출제 → 빈 문장 보충
 */
export async function generateStage6WithAi(
  sentences: SeedSentence[],
  mode: Stage6AiMode = "mixed"
): Promise<{ drafts: Stage6ItemDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  if (ordered.length === 0) {
    return { drafts: [], source: "none", error: "문장 없음" };
  }

  // —— 어법: 지문 먼저 분석 (어법서술형·어법끝·처음만나는) ——
  let analysisFocus = "";
  let analysisSeedBlanks: AiStage6Blank[] = [];
  let analysisNote = "";
  if (mode === "grammar" || mode === "mixed") {
    const analysis = await analyzePassageGrammarForWorkbook({
      sentences: ordered,
    });
    analysisFocus = analysis.focusBlock;
    analysisNote = [
      analysis.overallTopic && `주제: ${analysis.overallTopic}`,
      analysis.overallMainIdea && `요지: ${analysis.overallMainIdea}`,
      `분석 hit ${analysis.hits.length}개`,
      analysis.rawError ? `분석경고: ${analysis.rawError}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    analysisSeedBlanks = analysisHitsToSeedBlanks(analysis).map((b) => ({
      sentenceId: b.sentenceId,
      correct: b.correct,
      wrong: b.wrong,
      grammarSub: b.grammarSub,
      questionKind: "grammar",
      koLabel: b.koLabel,
      koTip: b.koTip,
    }));
  }

  // —— 어휘: 지문 먼저 분석 (반의어·유사형태) ——
  let vocabFocus = "";
  let vocabSeedBlanks: AiStage6Blank[] = [];
  let vocabNote = "";
  if (mode === "vocabulary" || mode === "mixed") {
    const vAnalysis = await analyzePassageVocabForWorkbook({
      sentences: ordered,
    });
    vocabFocus = vAnalysis.focusBlock;
    vocabNote = [
      vAnalysis.overallTopic && `주제: ${vAnalysis.overallTopic}`,
      vAnalysis.logicDirection && `논리: ${vAnalysis.logicDirection}`,
      `어휘분석 hit ${vAnalysis.hits.length}개` +
        ` (반의 ${vAnalysis.hits.filter((h) => h.technique === "antonym").length}` +
        `·유사 ${vAnalysis.hits.filter((h) => h.technique === "lookalike").length})`,
      vAnalysis.rawError ? `분석경고: ${vAnalysis.rawError}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    vocabSeedBlanks = analysisVocabHitsToSeedBlanks(vAnalysis);
  }

  const focusSlots = Math.min(12, Math.max(5, ordered.length + 2));
  const focus = pickGrammarFocus(Math.min(5, focusSlots));
  const focusBlock =
    analysisFocus.trim().length > 40 ? analysisFocus : focus.focusBlock;

  const targets = ordered.map((s) => ({
    id: s.id,
    order: s.sentence_order,
    english: s.english_text,
    minBlanks: blanksPerSentenceTarget(String(s.english_text ?? "")),
  }));

  const fullPassage = ordered
    .map((s, i) => `[${s.id}|S${i + 1}] ${String(s.english_text ?? "").trim()}`)
    .join("\n");

  const system =
    mode === "vocabulary"
      ? buildVocabSystem(vocabFocus)
      : mode === "grammar"
        ? buildGrammarSystem(focusBlock)
        : `${buildGrammarSystem(focusBlock)}

--- 혼합 모드 (어휘) ---
${buildVocabSystem(vocabFocus)}`;

  const seedBlanksForMode =
    mode === "vocabulary"
      ? vocabSeedBlanks
      : mode === "grammar"
        ? analysisSeedBlanks
        : [...analysisSeedBlanks, ...vocabSeedBlanks];

  const noteForMode =
    mode === "grammar"
      ? "1) 지문 분석(analysisSeeds/focus)을 우선 반영해 blanks를 확정하라. 2) 빠진 문장만 CASE로 보충. 어휘 쌍 금지."
      : mode === "vocabulary"
        ? "1) 어휘 분석(analysisSeeds)의 반의·유사형태 쌍을 우선 확정하라. 2) 빠진 문장만 antonym/lookalike로 보충. 어법 쌍 금지. 세트에서 반의와 유사형태를 섞어라."
        : "어법·어휘 분석 시드를 반영하고 questionKind로 구분. 어휘는 반의·유사형태 우선.";

  const baseUser = {
    task:
      mode === "grammar"
        ? "stage5_grammar_after_passage_analysis"
        : mode === "vocabulary"
          ? "stage6_vocab_after_passage_analysis"
          : "stage6_mixed_like_qg",
    engine:
      mode === "vocabulary"
        ? "question-generator-workbook-vocab-craft+passage-analysis"
        : "question-generator-grammar-catalog+seosulhyeong",
    modelHint: EXAM_PREP_MODEL_PRIMARY,
    mode,
    requireEverySentence: true,
    requireVocabMix:
      mode === "vocabulary" || mode === "mixed"
        ? "blanks 중 opposite_meaning·similar_spelling(및 동계)를 모두 포함할 것"
        : undefined,
    fullPassage,
    sentences: targets,
    passageAnalysisNote:
      [analysisNote, vocabNote].filter(Boolean).join(" | ") || undefined,
    analysisSeeds: seedBlanksForMode.length
      ? seedBlanksForMode.slice(0, 28)
      : undefined,
    note: noteForMode,
  };

  const chatOpts =
    mode === "vocabulary"
      ? { temperature: 0.35, maxTokens: 10000 }
      : { temperature: 0.25, maxTokens: 9000 };

  try {
    // 분석 시드를 먼저 draft로 변환
    let drafts =
      mode === "vocabulary"
        ? parseAiBlanks(vocabSeedBlanks, ordered, "vocabulary")
        : mode === "grammar"
          ? parseAiBlanks(analysisSeedBlanks, ordered, "grammar")
          : [
              ...parseAiBlanks(analysisSeedBlanks, ordered, "grammar"),
              ...parseAiBlanks(vocabSeedBlanks, ordered, "vocabulary"),
            ];

    const raw1 = await stage56ChatJson(
      system,
      JSON.stringify(baseUser),
      chatOpts
    );
    const list1 = (raw1 as { blanks?: AiStage6Blank[] })?.blanks;
    if (Array.isArray(list1) && list1.length > 0) {
      const fromAi = parseAiBlanks(list1, ordered, mode);
      // AI를 앞에 두고, 분석 시드로 빈 문장 보충
      const bySent = new Map<string, Stage6ItemDraft[]>();
      for (const d of [...fromAi, ...drafts]) {
        const list = bySent.get(d.sentence_id) ?? [];
        if (list.length >= 3) continue;
        if (
          list.some(
            (x) =>
              x.english_start < d.english_end && x.english_end > d.english_start
          )
        ) {
          continue;
        }
        list.push(d);
        bySent.set(d.sentence_id, list);
      }
      drafts = [];
      let order = 1;
      for (const s of ordered) {
        for (const d of bySent.get(s.id) ?? []) {
          drafts.push({ ...d, blank_order: order++ });
        }
      }
    }

    const covered = new Set(drafts.map((d) => d.sentence_id));
    const missing = ordered.filter((s) => !covered.has(s.id));
    if (missing.length > 0) {
      const gapNote =
        mode === "vocabulary"
          ? `다음 ${missing.length}개 문장에만 반의어(antonym) 또는 유사형태(lookalike) blanks 추가. 이미 있는 문장 금지. 어법 쌍 금지.`
          : mode === "grammar"
            ? `다음 ${missing.length}개 문장에만 교재 CASE/GP로 blanks 추가. 이미 있는 문장 금지.`
            : `다음 ${missing.length}개 문장만 보충. questionKind 구분.`;
      const gapUser = {
        ...baseUser,
        task: `${baseUser.task}_gap_fill`,
        note: gapNote,
        sentences: missing.map((s) => ({
          id: s.id,
          order: s.sentence_order,
          english: s.english_text,
          minBlanks: blanksPerSentenceTarget(String(s.english_text ?? "")),
        })),
        fullPassage: missing
          .map((s) => `[${s.id}] ${String(s.english_text ?? "").trim()}`)
          .join("\n"),
      };
      try {
        const raw2 = await stage56ChatJson(
          system,
          JSON.stringify(gapUser),
          chatOpts
        );
        const list2 = (raw2 as { blanks?: AiStage6Blank[] })?.blanks;
        if (Array.isArray(list2) && list2.length > 0) {
          const more = parseAiBlanks(list2, missing, mode);
          drafts = [...drafts, ...more];
        }
      } catch {
        // keep
      }
    }

    if (drafts.length === 0) {
      const rawRetry = await stage56ChatJson(
        system,
        JSON.stringify({
          ...baseUser,
          retry: true,
          note:
            mode === "vocabulary"
              ? "이전 응답이 비어 재시도. 모든 문장에 최소 1개. 반의·유사형태만. 어법 금지."
              : "이전 응답이 비어 재시도. 모든 문장에 최소 1개. 교재 GP/CASE만.",
        }),
        chatOpts
      );
      const listRetry = (rawRetry as { blanks?: AiStage6Blank[] })?.blanks;
      if (Array.isArray(listRetry)) {
        drafts = parseAiBlanks(listRetry, ordered, mode);
      }
    }

    // 어휘: 분석 시드만이라도 있으면 사용
    if (drafts.length === 0 && vocabSeedBlanks.length > 0 && mode !== "grammar") {
      drafts = parseAiBlanks(
        vocabSeedBlanks,
        ordered,
        mode === "mixed" ? "vocabulary" : mode
      );
    }

    if (drafts.length === 0) {
      return {
        drafts: [],
        source: "none",
        error:
          mode === "vocabulary"
            ? `유효한 AI 어휘 빈칸 0개${vocabNote ? ` (${vocabNote})` : ""}`
            : `유효한 AI 어법 빈칸 0개${analysisNote ? ` (${analysisNote})` : ""}`,
      };
    }
    return {
      drafts,
      source: "ai",
      error:
        [analysisNote, vocabNote].filter(Boolean).join(" | ") || undefined,
    };
  } catch (e) {
    // 분석 시드만이라도 있으면 사용
    if (mode === "vocabulary" && vocabSeedBlanks.length > 0) {
      const drafts = parseAiBlanks(vocabSeedBlanks, ordered, "vocabulary");
      if (drafts.length > 0) {
        return {
          drafts,
          source: "ai",
          error: e instanceof Error ? e.message : "AI 출제 실패·어휘분석시드 사용",
        };
      }
    }
    if (analysisSeedBlanks.length > 0 && mode !== "vocabulary") {
      const drafts = parseAiBlanks(
        analysisSeedBlanks,
        ordered,
        mode === "mixed" ? "grammar" : mode
      );
      if (drafts.length > 0) {
        return {
          drafts,
          source: "ai",
          error: e instanceof Error ? e.message : "AI 출제 실패·분석시드 사용",
        };
      }
    }
    return {
      drafts: [],
      source: "none",
      error: e instanceof Error ? e.message : "AI 5·6단계 실패",
    };
  }
}

/** @deprecated use generateStage6WithAi(sentences, "grammar") */
export async function generateStage5GrammarWithAi(sentences: SeedSentence[]) {
  return generateStage6WithAi(sentences, "grammar");
}

/** @deprecated use generateStage6WithAi(sentences, "vocabulary") */
export async function generateStage6VocabWithAi(sentences: SeedSentence[]) {
  return generateStage6WithAi(sentences, "vocabulary");
}

export async function generateStage7WithAi(
  sentences: SeedSentence[]
): Promise<{
  displays: Array<{ sentenceId: string; stage7DisplayText: string }>;
  candidates: Stage7CandidateDraft[];
  requiredErrorCount: number;
  source: "ai" | "none";
  error?: string;
}> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const focus = pickGrammarFocus(3);
  const system = `당신은 수능·내신 어법 출제 전문가다. 변형문제 「어법오류수정3」과 동일 기준으로 워크북 7단계를 만든다.

${focus.focusBlock}

${grammarCatalogPromptBlock()}

${grammarExplanationRules()}

${grammarChoiceCraftNote()}

절대 규칙:
1. 원문 문장 id를 유지한다. wrong는 원문의 correct 자리에 심을 틀린 형태.
2. 서로 다른 단원 오류 정확히 3개(문장 분산). 수일치 최대 1.
3. 금지(하드):
   - assume→assumes, logical→logicals, example→examples 식 단순 ±s 장난
   - for example→for examples 관용구 파괴
   - a/an/the, as a result→as a results, 인접 단순 is/are, 철자 장난
4. correct는 원문 부분문자열. wrong는 CASE 심는 법(관계사·준동사·태·시제·병렬 등)에 맞는 형태.
5. JSON만: {"errors":[{"sentenceId","correct","wrong","errorSub","koLabel","koTip"}]}`;

  const user = JSON.stringify({
    task: "stage7_error_plant",
    targetErrors: 3,
    sentences: ordered.map((s) => ({
      id: s.id,
      order: s.sentence_order,
      english: s.english_text,
    })),
  });

  const empty = {
    displays: ordered.map((s) => ({
      sentenceId: s.id,
      stage7DisplayText: String(s.english_text ?? ""),
    })),
    candidates: [] as Stage7CandidateDraft[],
    requiredErrorCount: 1,
    source: "none" as const,
  };

  try {
    const raw = await examPrepChatJson({
      system,
      user,
      maxTokens: 4000,
    });
    const list = (raw as { errors?: AiStage7Error[] })?.errors;
    if (!Array.isArray(list) || list.length === 0) {
      return { ...empty, error: "AI 응답에 errors 없음" };
    }

    const displayMap = new Map<string, string>();
    for (const s of ordered) {
      displayMap.set(s.id, String(s.english_text ?? ""));
    }

    const candidates: Stage7CandidateDraft[] = [];
    const usedSentences = new Set<string>();
    const usedSubs = new Set<string>();
    let usedSv = false;
    let order = 1;

    for (const item of list) {
      if (candidates.filter((c) => c.is_error).length >= 3) break;
      if (!item || typeof item !== "object") continue;
      const sid = typeof item.sentenceId === "string" ? item.sentenceId : "";
      if (!sid || usedSentences.has(sid)) continue;
      const correct = String(item.correct ?? "").trim();
      const wrongRaw = String(item.wrong ?? "").trim();
      if (isBadGrammarPair(correct, wrongRaw)) continue;
      const sub = String(item.errorSub ?? "other").trim() || "other";
      if (usedSubs.has(sub)) continue;
      if (sub === "subject_verb_agreement") {
        if (usedSv) continue;
        usedSv = true;
      }

      let display = displayMap.get(sid) ?? "";
      const span = findSpanCi(display, correct);
      if (!span) continue;
      const replacement = matchCase(wrongRaw, span.text);
      display =
        display.slice(0, span.start) +
        replacement +
        display.slice(span.end);
      displayMap.set(sid, display);

      const tip = [item.koLabel, item.koTip].filter(Boolean).join(" — ");
      candidates.push({
        sentence_id: sid,
        blank_order: order++,
        english_start: span.start,
        english_end: span.start + replacement.length,
        displayed_text: replacement,
        is_error: true,
        correction_text: span.text,
        accepted_corrections: [span.text, correct],
        error_subcategory: [sub],
        hint: item.koLabel?.trim() || null,
        explanation: tip || null,
      });
      usedSentences.add(sid);
      usedSubs.add(sub);
    }

    for (const s of ordered) {
      if (usedSentences.has(s.id)) continue;
      const display = displayMap.get(s.id) ?? "";
      const m = display.match(
        /\b([A-Za-z]{5,})\b(?!\s*(?:which|that|where|who|whom)\b)/
      );
      if (!m || m.index == null) continue;
      if (
        /^(which|that|where|who|whom|whose|there|these|those|because|although)$/i.test(
          m[1]!
        )
      ) {
        continue;
      }
      candidates.push({
        sentence_id: s.id,
        blank_order: order++,
        english_start: m.index,
        english_end: m.index + m[0].length,
        displayed_text: m[0],
        is_error: false,
        correction_text: "",
        accepted_corrections: [],
        error_subcategory: [],
      });
    }

    const errorCount = candidates.filter((c) => c.is_error).length;
    if (errorCount === 0) {
      return { ...empty, error: "유효한 AI 오류 0개" };
    }

    return {
      displays: ordered.map((s) => ({
        sentenceId: s.id,
        stage7DisplayText: displayMap.get(s.id) ?? "",
      })),
      candidates,
      requiredErrorCount: Math.max(1, Math.min(3, errorCount)),
      source: "ai",
    };
  } catch (e) {
    return {
      ...empty,
      error: e instanceof Error ? e.message : "AI 7단계 실패",
    };
  }
}
