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
  const a = correct.trim();
  const b = wrong.trim();
  if (!a || !b || a.toLowerCase() === b.toLowerCase()) return true;
  if (/^(a|an|the)$/i.test(a) || /^(a|an|the)$/i.test(b)) return true;
  if (/^(a|an|the)\s/i.test(a) && /^(a|an|the)\s/i.test(b)) {
    // as a result / as a results 류 — 관사+명사 단순 복수 장난 금지
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
  // 철자만 틀린 난센스
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
  const focus = pickGrammarFocus(Math.min(4, Math.max(2, ordered.length)));
  const system = `당신은 수능·내신 어법 출제 전문가다. 변형문제 어법 엔진과 동일 기준으로 워크북 6단계 [a / b]를 만든다.

${focus.focusBlock}

${grammarCatalogPromptBlock()}

${grammarExplanationRules()}

절대 규칙:
1. 원문 english를 절대 바꾸지 않는다. correct는 원문에 그대로 있는 부분문자열이어야 한다.
2. 각 blank는 영문 안 [correct / wrong] 2지. wrong는 위 CASE의 형태 쌍·심는 법에 맞는 그럴듯한 오답.
3. 금지: a/an/the 관사 선택, as a result/as a results 식 난센스 복수, 인접 단순 is/are, 철자 장난, 어휘 의미만 틀린 함정.
4. 수일치는 전체에서 최대 1개. 단원은 서로 다르게.
5. 문장마다 1~2개, 지문 전체 4~10개.
6. JSON만: {"blanks":[{"sentenceId","correct","wrong","grammarSub","koLabel","koTip"}]}
grammarSub 예: voice, relative_pronoun, relative_adverb, verb_form, participle, adjective_adverb, infinitive, gerund, conjunction, subject_verb_agreement, word_order, comparison`;

  const user = JSON.stringify({
    task: "stage6_inline_ab",
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
      temperature: 0.4,
      maxTokens: 2500,
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
      const sub = String(item.grammarSub ?? "other_grammar").trim() || "other_grammar";
      if (sub === "subject_verb_agreement") {
        if (usedSv) continue;
        usedSv = true;
      }
      // 단원 중복은 여유 있을 때만 허용
      if (usedUnits.has(sub) && drafts.length >= Math.min(6, ordered.length)) continue;
      const english = String(sent.english_text ?? "");
      const span = findSpanCi(english, correct);
      if (!span) continue;
      const used = usedBySent.get(sid) ?? [];
      if (used.some((u) => span.start < u.b && span.end > u.a)) continue;
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
        question_category: "grammar",
        grammar_subcategory: [sub],
        vocabulary_subcategory: [],
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

절대 규칙:
1. 원문 문장 id를 유지한다. wrong는 원문의 correct 자리에 심을 틀린 형태.
2. 서로 다른 단원 오류 정확히 3개(문장 분산). 수일치 최대 1.
3. 금지: a/an/the, as a result→as a results 난센스, 인접 단순 is/are, 철자 장난.
4. correct는 원문 부분문자열. wrong는 CASE 심는 법에 맞는 형태.
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
      temperature: 0.4,
      maxTokens: 2200,
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
