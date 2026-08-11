/**
 * 워크북 2·3·5·8·10단계 — 최고 상위 API로 지문 분석 후 시드 생성
 */
import { examPrepChatJson } from "@/lib/exam-prep/exam-prep-openai";
import { koreanCore, scoreEnglishBlank, scoreKoreanBlank } from "@/lib/exam-prep/blank-importance";
import { verbLemma } from "@/lib/exam-prep/verb-lemma";
import type { SeedSentence } from "@/lib/exam-prep/auto-seed-stages";
import type { BlankDraft } from "@/lib/exam-prep/stage2-types";
import type { Stage3BlankDraft } from "@/lib/exam-prep/stage3-types";
import type { Stage5ItemDraft } from "@/lib/exam-prep/stage5-types";
import type { Stage8GroupDraft } from "@/lib/exam-prep/stage8-types";
import { newChunkId } from "@/lib/exam-prep/stage8-types";
import type { Stage10ItemDraft } from "@/lib/exam-prep/stage10-types";
import {
  proposeFullSentenceSegments,
  tokenizeAnswerText,
} from "@/lib/exam-prep/stage10-types";
import {
  buildPdfWritingSegments,
  buildWritingCues,
  pickWritingCueTexts,
  writingLemmaCue,
} from "@/lib/exam-prep/guided-writing";

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

function overlaps(
  used: Array<{ a: number; b: number }>,
  start: number,
  end: number
) {
  return used.some((u) => start < u.b && end > u.a);
}

export async function generateStage2WithAi(
  sentences: SeedSentence[]
): Promise<{ drafts: BlankDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  try {
    const raw = await examPrepChatJson({
      system: `당신은 인천 WORKBOOK 2단계(빈칸 완성하기·우리말) 출제 전문가다.
지문을 분석해 핵심 어휘·표현의 우리말 어간만 빈칸으로 고른다.
금지: 있다/없고/있다고/것을/예를/들어/결과/맡고 등 기능·담화어. 조사는 빈칸 밖.
문장당 2~5개. 모든 문장 커버.
JSON만: {"blanks":[{"sentenceId","answer"}]}`,
      user: JSON.stringify({
        task: "stage2_korean_blanks",
        sentences: ordered.map((s) => ({
          id: s.id,
          order: s.sentence_order,
          english: s.english_text,
          korean: s.korean_text,
        })),
      }),
      maxTokens: 7000,
    });
    const list = (raw as { blanks?: Array<{ sentenceId?: string; answer?: string }> })?.blanks;
    if (!Array.isArray(list) || list.length === 0) {
      return { drafts: [], source: "none", error: "AI 2단계 blanks 없음" };
    }
    const drafts: BlankDraft[] = [];
    const usedBy = new Map<string, Array<{ a: number; b: number }>>();
    let order = 1;
    for (const item of list) {
      const sid = String(item?.sentenceId ?? "");
      const sent = ordered.find((s) => s.id === sid);
      if (!sent) continue;
      const answer = String(item?.answer ?? "").trim();
      if (answer.length < 2 || scoreKoreanBlank(answer) < 0) continue;
      const korean = String(sent.korean_text ?? "");
      const span = findSpanCi(korean, answer);
      if (!span) continue;
      const used = usedBy.get(sid) ?? [];
      if (overlaps(used, span.start, span.end) || used.length >= 5) continue;
      used.push({ a: span.start, b: span.end });
      usedBy.set(sid, used);
      drafts.push({
        sentence_id: sid,
        blank_order: order++,
        answer_text: span.text,
        accepted_answers: [span.text, koreanCore(span.text)].filter(
          (x, i, arr) => x && arr.indexOf(x) === i
        ),
        korean_start: span.start,
        korean_end: span.end,
        is_required: true,
      });
    }
    return drafts.length
      ? { drafts, source: "ai" }
      : { drafts: [], source: "none", error: "유효한 AI 2단계 0개" };
  } catch (e) {
    return { drafts: [], source: "none", error: e instanceof Error ? e.message : "AI 2단계 실패" };
  }
}

export async function generateStage3WithAi(
  sentences: SeedSentence[]
): Promise<{ drafts: Stage3BlankDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  try {
    const raw = await examPrepChatJson({
      system: `당신은 인천 WORKBOOK 3단계(빈칸 완성하기·영문) 출제 전문가다.
핵심 내용어만 빈칸. 금지: the/a/of/to/and, Suppose/sometimes 등 담화·기능어.
문장당 2~5개. JSON만: {"blanks":[{"sentenceId","answer"}]}`,
      user: JSON.stringify({
        task: "stage3_english_blanks",
        sentences: ordered.map((s) => ({
          id: s.id,
          order: s.sentence_order,
          english: s.english_text,
          korean: s.korean_text,
        })),
      }),
      maxTokens: 7000,
    });
    const list = (raw as { blanks?: Array<{ sentenceId?: string; answer?: string }> })?.blanks;
    if (!Array.isArray(list) || list.length === 0) {
      return { drafts: [], source: "none", error: "AI 3단계 blanks 없음" };
    }
    const drafts: Stage3BlankDraft[] = [];
    const usedBy = new Map<string, Array<{ a: number; b: number }>>();
    let order = 1;
    for (const item of list) {
      const sid = String(item?.sentenceId ?? "");
      const sent = ordered.find((s) => s.id === sid);
      if (!sent) continue;
      const answer = String(item?.answer ?? "").trim();
      if (scoreEnglishBlank(answer) < 0) continue;
      const english = String(sent.english_text ?? "");
      const span = findSpanCi(english, answer);
      if (!span) continue;
      const used = usedBy.get(sid) ?? [];
      if (overlaps(used, span.start, span.end) || used.length >= 5) continue;
      used.push({ a: span.start, b: span.end });
      usedBy.set(sid, used);
      drafts.push({
        sentence_id: sid,
        blank_order: order++,
        answer_text: span.text,
        accepted_answers: [],
        english_start: span.start,
        english_end: span.end,
        selected_text: span.text,
        is_required: true,
      });
    }
    return drafts.length
      ? { drafts, source: "ai" }
      : { drafts: [], source: "none", error: "유효한 AI 3단계 0개" };
  } catch (e) {
    return { drafts: [], source: "none", error: e instanceof Error ? e.message : "AI 3단계 실패" };
  }
}

export async function generateStage5WithAi(
  sentences: SeedSentence[]
): Promise<{ drafts: Stage5ItemDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  try {
    const raw = await examPrepChatJson({
      system: `당신은 인천 WORKBOOK 5단계(동사형) 출제 전문가다.
주요 동사·동사구·분사를 빈칸으로 두고 원형 cue를 준다.
예: have been dumping → ["have","be","dump"]. 문장 동사를 빠뜨리지 말 것.
JSON만: {"items":[{"sentenceId","answer","cues":["lemma"],"category":"present_perfect"}]}`,
      user: JSON.stringify({
        task: "stage5_verb_forms",
        sentences: ordered.map((s) => ({
          id: s.id,
          order: s.sentence_order,
          english: s.english_text,
        })),
      }),
      maxTokens: 8000,
    });
    const list = (raw as { items?: Array<{ sentenceId?: string; answer?: string; cues?: string[]; category?: string }> })?.items;
    if (!Array.isArray(list) || list.length === 0) {
      return { drafts: [], source: "none", error: "AI 5단계 items 없음" };
    }
    const drafts: Stage5ItemDraft[] = [];
    const usedBy = new Map<string, Array<{ a: number; b: number }>>();
    let order = 1;
    for (const item of list) {
      const sid = String(item?.sentenceId ?? "");
      const sent = ordered.find((s) => s.id === sid);
      if (!sent) continue;
      const answer = String(item?.answer ?? "").trim();
      if (!answer) continue;
      const english = String(sent.english_text ?? "");
      const span = findSpanCi(english, answer);
      if (!span) continue;
      const used = usedBy.get(sid) ?? [];
      if (overlaps(used, span.start, span.end)) continue;
      used.push({ a: span.start, b: span.end });
      usedBy.set(sid, used);
      const cues = (Array.isArray(item.cues) ? item.cues : [])
        .map((c) => verbLemma(String(c)))
        .filter(Boolean);
      drafts.push({
        sentence_id: sid,
        blank_order: order++,
        answer_text: span.text,
        accepted_answers: [],
        english_start: span.start,
        english_end: span.end,
        selected_text: span.text,
        cue_words: cues.length ? [...new Set(cues)] : [verbLemma(span.text)],
        grammar_category: [String(item.category ?? "verb_form")],
        is_required: true,
      });
    }
    return drafts.length
      ? { drafts, source: "ai" }
      : { drafts: [], source: "none", error: "유효한 AI 5단계 0개" };
  } catch (e) {
    return { drafts: [], source: "none", error: e instanceof Error ? e.message : "AI 5단계 실패" };
  }
}

export async function generateStage8WithAi(
  sentences: SeedSentence[]
): Promise<{ drafts: Stage8GroupDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences]
    .sort((a, b) => a.sentence_order - b.sentence_order)
    .filter((s) => String(s.english_text ?? "").trim().split(/\s+/).length >= 6);
  if (!ordered.length) return { drafts: [], source: "none", error: "8단계 대상 문장 없음" };
  try {
    const raw = await examPrepChatJson({
      system: `당신은 인천 WORKBOOK 8단계(순서 배열) 출제 전문가다.
의미 단위 어구로 나눈다. 카드 연결 시 원문과 같아야 한다.
JSON만: {"items":[{"sentenceId","chunks":["어구1","어구2"]}]}`,
      user: JSON.stringify({
        task: "stage8_phrase_reorder",
        sentences: ordered.map((s) => ({
          id: s.id,
          order: s.sentence_order,
          english: s.english_text,
          korean: s.korean_text,
        })),
      }),
      maxTokens: 8000,
    });
    const list = (raw as { items?: Array<{ sentenceId?: string; chunks?: string[] }> })?.items;
    if (!Array.isArray(list) || !list.length) {
      return { drafts: [], source: "none", error: "AI 8단계 items 없음" };
    }
    const drafts: Stage8GroupDraft[] = [];
    let order = 1;
    const norm = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();
    for (const item of list) {
      const sid = String(item?.sentenceId ?? "");
      const sent = ordered.find((s) => s.id === sid);
      if (!sent) continue;
      const english = String(sent.english_text ?? "").trim();
      const chunks = (Array.isArray(item.chunks) ? item.chunks : []).map((c) => String(c).trim()).filter(Boolean);
      if (chunks.length < 3) continue;
      if (norm(chunks.join(" ")) !== norm(english)) continue;
      drafts.push({
        sentence_id: sid,
        blank_order: order++,
        english_start: 0,
        english_end: english.length,
        original_text: english,
        chunks: chunks.map((chunkText, i) => ({
          id: newChunkId(),
          chunkOrder: i + 1,
          chunkText,
        })),
        is_required: true,
      });
    }
    return drafts.length
      ? { drafts, source: "ai" }
      : { drafts: [], source: "none", error: "유효한 AI 8단계 0개" };
  } catch (e) {
    return { drafts: [], source: "none", error: e instanceof Error ? e.message : "AI 8단계 실패" };
  }
}

export async function generateStage10WithAi(
  sentences: SeedSentence[]
): Promise<{ drafts: Stage10ItemDraft[]; source: "ai" | "none"; error?: string }> {
  const ordered = [...sentences]
    .sort((a, b) => a.sentence_order - b.sentence_order)
    .filter((s) => String(s.english_text ?? "").trim().length > 15 && String(s.korean_text ?? "").trim());
  if (!ordered.length) return { drafts: [], source: "none", error: "10단계 대상 문장 없음" };
  try {
    const raw = await examPrepChatJson({
      system: `당신은 인천 WORKBOOK 10단계(영작) 출제 전문가다.
문장마다 등장 순서의 중요 어휘 원형 제시어 4~6개.
JSON만: {"items":[{"sentenceId","cues":["lemma"]}]}`,
      user: JSON.stringify({
        task: "stage10_writing_cues",
        sentences: ordered.map((s) => ({
          id: s.id,
          order: s.sentence_order,
          english: s.english_text,
          korean: s.korean_text,
        })),
      }),
      maxTokens: 6000,
    });
    const list = (raw as { items?: Array<{ sentenceId?: string; cues?: string[] }> })?.items;
    const cueMap = new Map<string, string[]>();
    if (Array.isArray(list)) {
      for (const item of list) {
        const sid = String(item?.sentenceId ?? "");
        const cues = (Array.isArray(item.cues) ? item.cues : [])
          .map((c) => writingLemmaCue(String(c)))
          .filter((c) => c.length >= 2);
        if (sid && cues.length) cueMap.set(sid, [...new Set(cues)].slice(0, 6));
      }
    }
    if (!cueMap.size) return { drafts: [], source: "none", error: "AI 10단계 cues 없음" };

    const drafts: Stage10ItemDraft[] = [];
    let order = 1;
    for (const s of ordered) {
      const english = String(s.english_text ?? "").trim();
      const korean = String(s.korean_text ?? "").trim();
      let segments = buildPdfWritingSegments(english);
      if (segments.length < 1) segments = proposeFullSentenceSegments(english);
      const answerTexts = segments
        .filter((x) => x.segmentType === "answer_segment")
        .map((x) => x.originalAnswerText ?? "")
        .join(" ");
      let cueTexts = cueMap.get(s.id) ?? [];
      if (cueTexts.length < 2) cueTexts = pickWritingCueTexts(english, s.vocabulary, answerTexts);
      if (cueTexts.length < 1) {
        const first = tokenizeAnswerText(english)[0];
        if (first) cueTexts = [writingLemmaCue(first)];
      }
      if (cueTexts.length < 1) continue;
      drafts.push({
        blank_order: order++,
        sentence_ids: [s.id],
        korean_prompt: korean,
        full_english: english,
        writing_segments: segments,
        writing_cues: buildWritingCues(cueTexts, segments),
        writing_input_mode: "guided_segments",
        writing_blank_display_mode: "token_slots",
        is_required: true,
      });
    }
    return drafts.length
      ? { drafts, source: "ai" }
      : { drafts: [], source: "none", error: "유효한 AI 10단계 0개" };
  } catch (e) {
    return { drafts: [], source: "none", error: e instanceof Error ? e.message : "AI 10단계 실패" };
  }
}

export function stageCoverageOk(
  drafts: Array<{ sentence_id?: string; sentence_ids?: string[] }>,
  sentenceCount: number,
  minRatio = 0.7
): boolean {
  if (sentenceCount <= 0 || drafts.length === 0) return false;
  const ids = new Set<string>();
  for (const d of drafts) {
    if (d.sentence_id) ids.add(d.sentence_id);
    for (const id of d.sentence_ids ?? []) ids.add(id);
  }
  return ids.size >= Math.ceil(sentenceCount * minRatio);
}
