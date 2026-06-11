import type { VocabPrintEnrichment } from "@/lib/vocab/vocab-print-types";

export type EnrichPrintKind = "example-middle" | "example-high" | "companion";

export interface EnrichPrintInput {
  word: string;
  meaning: string;
}

export function buildEnrichPrintPrompt(
  kind: EnrichPrintKind,
  items: EnrichPrintInput[]
): string {
  const levelRule =
    kind === "example-high"
      ? "예문 난이도: 고등학교 수준 (어휘·문장 구조가 한 단계 높음, 수능·내신 고등에 맞게)"
      : kind === "example-middle"
        ? "예문 난이도: 중학교 수준 (짧고 명확, 중1~3 학생이 이해하기 쉬운 문장)"
        : "";

  const taskBlock =
    kind === "companion"
      ? `각 단어에 대해 「동반의어」를 만든다.
- 같은 뜻·비슷한 뜻의 영어 단어/숙어 2~4개 (쉼표 구분)
- 필요하면 짧은 한글 설명 병기 (예: glad, cheerful, delighted — 모두 '기쁜' 계열)
- companion_words 필드에만 작성`
      : `각 단어에 대해 예문 1개와 한글 해석을 만든다.
- ${levelRule}
- example_sentence, example_meaning 필드에 작성
- 단어 형태는 문맥에 맞게 활용 가능`;

  return `You are an English vocabulary editor for Korean students.

${taskBlock}

Return ONLY valid JSON:
{
  "items": [
    {
      "word": "exact word from input",
      "example_sentence": "optional English",
      "example_meaning": "optional Korean",
      "companion_words": "optional companion synonyms phrase"
    }
  ]
}

Input:
${JSON.stringify(items.map((i) => ({ word: i.word.trim(), meaning: i.meaning.trim() })))}`;
}

export function mergeEnrichment(
  items: EnrichPrintInput[],
  raw: unknown
): Map<string, VocabPrintEnrichment> {
  const map = new Map<string, VocabPrintEnrichment>();
  if (!raw || typeof raw !== "object") return map;
  const list = (raw as { items?: unknown[] }).items;
  if (!Array.isArray(list)) return map;

  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const word = String((entry as { word?: string }).word ?? "").trim();
    if (!word) continue;
    const key = word.toLowerCase();
    map.set(key, {
      example_sentence: String(
        (entry as { example_sentence?: string }).example_sentence ?? ""
      ).trim(),
      example_meaning: String(
        (entry as { example_meaning?: string }).example_meaning ?? ""
      ).trim(),
      companion_words: String(
        (entry as { companion_words?: string }).companion_words ?? ""
      ).trim(),
    });
  }

  return map;
}
