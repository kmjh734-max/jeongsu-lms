export type LessonPackVocabItem = {
  word: string;
  meaning: string; // e.g. "a. 생산적인"
  synonyms: string[];
  antonyms: string[];
};

export type LessonPackData = {
  headerLabel: string;
  vocab: LessonPackVocabItem[];
  updatedAt?: string;
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

const SYSTEM = `너는 한국 중·고등 영어 지문에서 수업용 핵심 어휘를 뽑는 편집자다.
반드시 JSON만 반환:
{
  "vocab": [
    {
      "word": "fallacy",
      "meaning": "n. 오류, 잘못된 생각",
      "synonyms": ["falsehood", "illusion", "myth"],
      "antonyms": ["truth", "fact", "certainty"]
    }
  ]
}

규칙:
- vocab는 지문에서 실제로 나온(또는 파생형으로 나온) 중요 단어 6~12개.
- word는 기본형(lemma) 영어 단어.
- meaning은 품사 약어(a./n./v./ad. 등) + 한국어 뜻.
- synonyms/antonyms는 영어 단어 3~5개씩. 시험 선택지로 쓸 수 있게 짧은 단어 위주.
- 너무 쉬운 기초 단어(the, make, good 등)는 제외.`;

export async function generateLessonPackVocab(input: {
  englishPassage: string;
  koreanPassage?: string;
  title?: string;
}): Promise<LessonPackVocabItem[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const passage = input.englishPassage.trim().slice(0, 6000);
  if (passage.length < 20) throw new Error("지문이 너무 짧습니다.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `제목: ${input.title ?? "(없음)"}\n\nEN:\n${passage}\n\nKR:\n${
              (input.koreanPassage ?? "").trim() || "(없음)"
            }\n\n위 지문으로 수업용 단어 목록을 만들어라.`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) throw new Error(`어휘 생성 실패 (HTTP ${res.status})`);

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{ vocab?: unknown }>(content);
    const raw = Array.isArray(parsed?.vocab) ? parsed!.vocab : [];

    const vocab: LessonPackVocabItem[] = raw
      .map((row) => {
        const r = row as Record<string, unknown>;
        const word = String(r.word ?? "").trim();
        const meaning = String(r.meaning ?? "").trim();
        const synonyms = Array.isArray(r.synonyms)
          ? r.synonyms.map((s) => String(s ?? "").trim()).filter(Boolean)
          : [];
        const antonyms = Array.isArray(r.antonyms)
          ? r.antonyms.map((s) => String(s ?? "").trim()).filter(Boolean)
          : [];
        return { word, meaning, synonyms, antonyms };
      })
      .filter((v) => v.word && v.meaning);

    if (vocab.length < 3) {
      throw new Error("어휘를 충분히 만들지 못했습니다. 다시 시도해 주세요.");
    }
    return vocab.slice(0, 16);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("어휘 생성 시간이 초과되었습니다.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Build mixed choices for synonym/antonym tests. */
export function buildChoiceList(
  primary: string[],
  secondary: string[],
  extra: string[] = []
): string[] {
  const set = new Set<string>();
  for (const w of [...primary, ...secondary, ...extra]) {
    const t = w.trim().toLowerCase();
    if (t) set.add(w.trim());
  }
  return [...set].slice(0, 6);
}
