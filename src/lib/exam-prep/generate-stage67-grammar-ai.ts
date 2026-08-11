/**
 * 6·7단계 어법 — 변형문제(question-generator)와 동일 엔진
 * pickGrammarFocus + grammar-catalog + OpenAI JSON
 */
import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
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

export async function generateStage6WithAi(
  sentences: SeedSentence[]
): Promise<{ drafts: Stage6ItemDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const focusSlots = Math.min(8, Math.max(3, ordered.length * 2));
  const focus = pickGrammarFocus(focusSlots);
  const system = `당신은 수능·내신 어법·어휘 출제 전문가다.
워크북 6단계 [a / b]는 **변형문제(question-generator) 어법·어휘 엔진과 동일 기준**으로 만든다.
지문을 먼저 분석한 뒤, 인천 WORKBOOK 6단계처럼 **문장마다** 중요한 어법·어휘 포인트를 고른다.

${focus.focusBlock}

${grammarCatalogPromptBlock()}

${grammarExplanationRules()}

${grammarChoiceCraftNote()}

${vocabChoiceCraft()}

출제 품질 (인천 PDF 예시 방향):
- 어법: been dumping/been dumped, where/that(관계부사 자리), attracts/is attracted, which has/which have, growing 분사, desperately/desperate, illegal/illegally
- 어휘: garbage/garage, permitted/prevented, endless/temporary, strengthen/weaken, efficient/inefficient 등 문맥·혼동·반의
- 한 문장에 어법+어휘를 섞어 2~4개

절대 금지 (하드 — 해당 blank 폐기):
1. assume that / assume which, know that / know which 등 **명사절 that ↔ which** 장난
2. allow/allowing, know/knowing, to V / V-ing 단순 형태 장난
3. sometime/sometimes, whole/wholes, part/parts 식 ±s만 다른 쌍
4. a/an/the 관사, as a result/as a results, 인접 단순 is/are·has/have
5. 철자 1글자 장난·의미 없는 형태 변형
6. 원문에 없는 correct 문자열

규칙:
1. 원문 english를 절대 바꾸지 않는다. correct는 원문 부분문자열.
2. 각 blank = [correct / wrong] 2지. wrong는 CASE 메커니즘·혼동어에 맞는 그럴듯한 오답.
3. 수일치는 지문 전체 최대 1개. 단원은 서로 다르게(변형문제 pickGrammarFocus와 동일).
4. **모든 문장**에 최소 2개(아주 짧은 문장만 1개). 지문 전체 ≈ 문장수×2~4.
5. 어법이면 grammarSub, 어휘면 vocabularySub + questionKind:"vocabulary".
6. JSON만: {"blanks":[{"sentenceId","correct","wrong","grammarSub","vocabularySub","questionKind","koLabel","koTip"}]}
grammarSub 예: voice, relative_pronoun, relative_adverb, verb_form, participle, adjective_adverb, infinitive, gerund, conjunction, subject_verb_agreement, word_order, comparison`;

  const user = JSON.stringify({
    task: "stage6_inline_ab_qg_engine",
    engine: "question-generator-grammar-catalog",
    style: "incheon_workbook_stage6",
    sentences: ordered.map((s) => ({
      id: s.id,
      order: s.sentence_order,
      english: s.english_text,
    })),
  });

  try {
    const raw = await questionGeneratorChatJson({
      system,
      user,
      temperature: 0.25,
      maxTokens: 6000,
      reasoningEffort: "medium",
      preferredModels: [
        process.env.OPENAI_MODEL_EXAM_PREP_STAGE6?.trim() || "gpt-5.5",
        "gpt-5",
      ],
    });
    const list = (raw as { blanks?: AiStage6Blank[] })?.blanks;
    if (!Array.isArray(list) || list.length === 0) {
      return { drafts: [], source: "none", error: "AI 응답에 blanks 없음" };
    }

    const drafts: Stage6ItemDraft[] = [];
    const usedBySent = new Map<string, Array<{ a: number; b: number }>>();
    let order = 1;
    const usedUnits = new Set<string>();
    let usedSv = false;

    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const sid = typeof item.sentenceId === "string" ? item.sentenceId : "";
      const sent = ordered.find((s) => s.id === sid);
      if (!sent) continue;
      const correct = String(item.correct ?? "").trim();
      const wrong = String(item.wrong ?? "").trim();
      if (isBadGrammarPair(correct, wrong)) continue;
      const isVocab =
        String(item.questionKind ?? "").toLowerCase() === "vocabulary" ||
        Boolean(String(item.vocabularySub ?? "").trim());
      const sub = isVocab
        ? String(item.vocabularySub ?? "contextual_meaning").trim() ||
          "contextual_meaning"
        : String(item.grammarSub ?? "other_grammar").trim() || "other_grammar";
      if (!isVocab && sub === "subject_verb_agreement") {
        if (usedSv) continue;
        usedSv = true;
      }
      if (usedUnits.has(sub) && drafts.length >= Math.min(10, ordered.length * 2)) {
        continue;
      }
      const english = String(sent.english_text ?? "");
      const span = findSpanCi(english, correct);
      if (!span) continue;
      const used = usedBySent.get(sid) ?? [];
      if (used.some((u) => span.start < u.b && span.end > u.a)) continue;
      if (used.length >= 4) continue;
      used.push({ a: span.start, b: span.end });
      usedBySent.set(sid, used);
      usedUnits.add(sub);

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

    if (drafts.length === 0) {
      return { drafts: [], source: "none", error: "유효한 AI 어법 빈칸 0개" };
    }
    return { drafts, source: "ai" };
  } catch (e) {
    return {
      drafts: [],
      source: "none",
      error: e instanceof Error ? e.message : "AI 6단계 실패",
    };
  }
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
    const raw = await questionGeneratorChatJson({
      system,
      user,
      temperature: 0.3,
      maxTokens: 4000,
      reasoningEffort: "medium",
      preferredModels: ["gpt-5.5", "gpt-5"],
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

    // 함정 밑줄 (오류 없는 문장)
    for (const s of ordered) {
      if (usedSentences.has(s.id)) continue;
      const display = displayMap.get(s.id) ?? "";
      const m = display.match(
        /\b([A-Za-z]{5,})\b(?!\s*(?:which|that|where|who|whom)\b)/
      );
      if (!m || m.index == null) continue;
      if (/^(which|that|where|who|whom|whose|there|these|those|because|although)$/i.test(m[1]!)) {
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
