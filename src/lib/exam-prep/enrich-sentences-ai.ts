import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

export type SentenceEnrichment = {
  sentenceId: string;
  korean: string;
  vocabulary: Array<{ word: string; meaning: string }>;
  grammarPoints: string[];
};

/**
 * 문장별 우리말 해석·핵심 어휘·문법 포인트 AI 초안.
 * 원문 영어는 절대 수정하지 않는다.
 */
export async function enrichSentencesWithAi(
  sentences: Pick<ExamPassageSentence, "id" | "english_text" | "korean_text">[]
): Promise<SentenceEnrichment[]> {
  const targets = sentences.filter(
    (s) => s.english_text.trim() && !(s.korean_text ?? "").trim()
  );
  // 해석 있는 문장도 어휘가 비면 포함하려면 호출측에서 필터 — 여기선 해석 빈 것만
  const list = targets.length > 0 ? targets : sentences.slice(0, 20);
  if (list.length === 0) return [];

  const raw = await questionGeneratorChatJson({
    system: `당신은 중고등 영어 내신 지문 해석 도우미다.
입력 영어 문장만 해석한다. 영어 원문을 바꾸지 않는다.
JSON만 출력: {"items":[{"sentenceId":"...","korean":"자연스러운 우리말","vocabulary":[{"word":"원문에 나온 단어","meaning":"뜻"}],"grammarPoints":["짧은 문법 포인트"]}]}
vocabulary는 문장당 0~4개, grammarPoints는 0~2개.`,
    user: JSON.stringify({
      sentences: list.map((s) => ({
        sentenceId: s.id,
        english: s.english_text,
        existingKorean: s.korean_text,
      })),
    }),
    temperature: 0.3,
    maxTokens: 5000,
  });

  const items =
    raw && typeof raw === "object"
      ? (raw as { items?: unknown }).items
      : null;
  if (!Array.isArray(items)) return [];

  const out: SentenceEnrichment[] = [];
  for (const row of items) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = typeof r.sentenceId === "string" ? r.sentenceId : "";
    if (!id || !list.some((s) => s.id === id)) continue;
    const korean = typeof r.korean === "string" ? r.korean.trim() : "";
    if (!korean) continue;
    const vocabulary = Array.isArray(r.vocabulary)
      ? (r.vocabulary as unknown[])
          .map((v) => {
            if (!v || typeof v !== "object") return null;
            const o = v as Record<string, unknown>;
            const word = typeof o.word === "string" ? o.word.trim() : "";
            const meaning =
              typeof o.meaning === "string" ? o.meaning.trim() : "";
            if (!word || !meaning) return null;
            return { word, meaning };
          })
          .filter((x): x is { word: string; meaning: string } => !!x)
      : [];
    const grammarPoints = Array.isArray(r.grammarPoints)
      ? r.grammarPoints
          .filter((g): g is string => typeof g === "string")
          .map((g) => g.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];
    out.push({ sentenceId: id, korean, vocabulary, grammarPoints });
  }
  return out;
}
