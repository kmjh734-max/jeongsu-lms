/**
 * 5·6단계 어법·어휘 — 변형문제(question-generator)와 동일 엔진
 * 5단계(어법): pickGrammarFocus + grammar-catalog + grammarChoiceCraft
 * 6단계(어휘): vocabChoiceCraft (문맥 혼동·반의)
 */
import { examPrepChatJson } from "@/lib/exam-prep/exam-prep-openai";
import {
  grammarCatalogPromptBlock,
  grammarExplanationRules,
  pickGrammarFocus,
} from "@/lib/question-generator/grammar-catalog";
import {
  grammarChoiceCraftNote,
  vocabChoiceCraft,
} from "@/lib/question-generator/choice-craft";
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

function blanksPerSentenceTarget(english: string): number {
  const words = english.split(/\s+/).filter(Boolean).length;
  if (words <= 8) return 1;
  if (words <= 18) return 2;
  return Math.min(4, Math.max(2, Math.ceil(words / 14)));
}

function buildGrammarSystem(focusBlock: string): string {
  return `당신은 수능·내신 **어법** 출제 전문가다.
워크북 5단계 [a / b]는 **변형문제(question-generator) 어법 엔진과 동일 기준**으로 만든다.
(어법추론·어법개수와 같은 grammar-catalog / CASE / craft 규칙을 따른다.)

${focusBlock}

${grammarCatalogPromptBlock()}

${grammarExplanationRules()}

${grammarChoiceCraftNote()}

출제 품질 (인천 PDF · 변형문제 어법):
- been dumping/been dumped, where/that(관계부사), attracts/is attracted, which has/which have
- growing 분사, desperately/desperate, illegal/illegally, 준동사·태·시제·병렬·비교 등
- **어휘 혼동 쌍은 넣지 말 것** (garbage/garage 등은 6단계 전용)

절대 금지 (하드 — 해당 blank 폐기):
1. assume that / assume which, know that / know which 등 **명사절 that ↔ which** 장난
2. allow/allowing, know/knowing, to V / V-ing 단순 형태 장난
3. sometime/sometimes, whole/wholes, part/parts 식 ±s만 다른 쌍
4. a/an/the 관사, as a result/as a results, 인접 단순 is/are·has/have
5. 철자 1글자 장난·의미 없는 형태 변형
6. 원문에 없는 correct 문자열

규칙:
1. 원문 english를 절대 바꾸지 않는다. correct는 원문 부분문자열.
2. 각 blank = [correct / wrong] 2지. wrong는 CASE 메커니즘에 맞는 그럴듯한 어법 오답.
3. 수일치는 지문 전체 최대 1개. 단원은 가능한 한 다양하게(변형문제 pickGrammarFocus와 동일).
4. **지문의 모든 문장**에 최소 목표 개수(짧은 문장 1, 보통 2~4). 빠뜨린 문장 금지.
5. questionKind는 항상 "grammar". grammarSub 필수.
6. JSON만: {"blanks":[{"sentenceId","correct","wrong","grammarSub","questionKind","koLabel","koTip"}]}
grammarSub 예: voice, relative_pronoun, relative_adverb, verb_form, participle, adjective_adverb, infinitive, gerund, conjunction, subject_verb_agreement, word_order, comparison`;
}

function buildVocabSystem(): string {
  return `당신은 수능·내신 **어휘(문맥)** 출제 전문가다.
워크북 6단계 [a / b]는 **변형문제(question-generator) 어휘 엔진과 동일 기준**으로 만든다.
(어휘추론·어휘개수와 같은 문맥 혼동·논리 방향 반전 craft를 따른다.)

${vocabChoiceCraft()}

출제 품질 (인천 PDF · 변형문제 어휘):
- garbage/garage, permitted/prevented, endless/temporary, strengthen/weaken, efficient/inefficient
- 문장만 보면 가능해 보이지만 앞뒤·전체 논리를 보면 틀린 단어
- **어법 최소쌍은 넣지 말 것** (been dumping/been dumped, where/that 등은 5단계 전용)

절대 금지 (하드 — 해당 blank 폐기):
1. 어법만 다른 쌍 (분사/태/관계사/수일치 등)
2. ±s만 다른 쌍, 관사 a/an/the, 철자 1글자 장난
3. 원문에 없는 correct 문자열
4. 주제와 무관한 황당 단어

규칙:
1. 원문 english를 절대 바꾸지 않는다. correct는 원문 부분문자열(내용어 위주).
2. 각 blank = [correct / wrong] 2지. wrong는 문맥상 그럴듯한 혼동·반의·유사어.
3. **지문의 모든 문장**에 최소 목표 개수(짧은 문장 1, 보통 2~3). 빠뜨린 문장 금지.
4. questionKind는 항상 "vocabulary". vocabularySub 필수.
5. JSON만: {"blanks":[{"sentenceId","correct","wrong","vocabularySub","questionKind","koLabel","koTip"}]}
vocabularySub 예: contextual_meaning, antonym, confusion, collocation, register`;
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
          text: wrong,
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
 * 5단계 어법 / 6단계 어휘 AI 생성 (변형문제 엔진)
 * @param mode grammar = 워크북 5단계, vocabulary = 워크북 6단계
 */
export async function generateStage6WithAi(
  sentences: SeedSentence[],
  mode: Stage6AiMode = "mixed"
): Promise<{ drafts: Stage6ItemDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  if (ordered.length === 0) {
    return { drafts: [], source: "none", error: "문장 없음" };
  }

  const focusSlots = Math.min(12, Math.max(4, ordered.length * 2));
  const focus = pickGrammarFocus(focusSlots);

  const targets = ordered.map((s) => ({
    id: s.id,
    order: s.sentence_order,
    english: s.english_text,
    minBlanks: blanksPerSentenceTarget(String(s.english_text ?? "")),
  }));

  const system =
    mode === "vocabulary"
      ? buildVocabSystem()
      : mode === "grammar"
        ? buildGrammarSystem(focus.focusBlock)
        : `${buildGrammarSystem(focus.focusBlock)}

--- 혼합 모드 추가 ---
${vocabChoiceCraft()}
어법·어휘를 문장마다 섞어 내되 questionKind로 구분한다.`;

  const user = JSON.stringify({
    task:
      mode === "grammar"
        ? "stage5_grammar_inline_ab_qg_engine"
        : mode === "vocabulary"
          ? "stage6_vocab_inline_ab_qg_engine"
          : "stage6_inline_ab_qg_engine",
    engine:
      mode === "vocabulary"
        ? "question-generator-vocab-craft"
        : "question-generator-grammar-catalog",
    mode,
    requireEverySentence: true,
    sentences: targets,
  });

  try {
    const raw = await examPrepChatJson({
      system,
      user,
      maxTokens: 7000,
    });
    const list = (raw as { blanks?: AiStage6Blank[] })?.blanks;
    if (!Array.isArray(list) || list.length === 0) {
      return { drafts: [], source: "none", error: "AI 응답에 blanks 없음" };
    }

    const drafts = parseAiBlanks(list, ordered, mode);
    if (drafts.length === 0) {
      return {
        drafts: [],
        source: "none",
        error:
          mode === "vocabulary"
            ? "유효한 AI 어휘 빈칸 0개"
            : "유효한 AI 어법 빈칸 0개",
      };
    }
    return { drafts, source: "ai" };
  } catch (e) {
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
