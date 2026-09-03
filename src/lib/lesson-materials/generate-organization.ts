type InputItem = { english: string; korean?: string | null };

export type LessonMaterialAnalysisCard = {
  title: string;
  desc: string;
};

export type LessonMaterialOrganizationDraft = {
  analysisCards: LessonMaterialAnalysisCard[];
  illustrationPrompt: string;
  comicCaptions: string[];
};

function oneKoreanSentence(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  const m = t.match(/^.+?[.。!?]/);
  return (m ? m[0] : t).trim();
}

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

const SYSTEM_PROMPT = `너는 한국 중·고등 영어 지문의 논리 흐름(Logical Flow)을 3단계로 정리하는 편집자다.
입력된 영어 지문(과 한글 해석이 있으면 함께)만 근거로 쓴다.

반드시 JSON만 반환:
{
  "analysisCards": [
    { "title": "지문에서 뽑은 짧은 제목1", "desc": "한 문장." },
    { "title": "지문에서 뽑은 짧은 제목2", "desc": "한 문장." },
    { "title": "지문에서 뽑은 짧은 제목3", "desc": "한 문장." }
  ],
  "comicCaptions": ["1컷 대사", "2컷 대사", "3컷 대사", "4컷 대사"],
  "illustrationPrompt": "..."
}

규칙:
- analysisCards는 정확히 3개, 지문의 논리 순서(문제/오해 → 원인·전개 → 결론·전체 관점).
- title은 이 지문 내용에서 만든 짧은 한국어 제목. 예: "구성의 오류에 대한 오해".
- 금지 제목: "수업에서 짚을 포인트", "지문의 핵심 주장", "논리 전개", "분석", "요약".
- desc는 한국어 한 문장만.
- comicCaptions는 정확히 4개, 각 컷 말풍선용 짧은 한국어(20자 내외).
- illustrationPrompt는 영어. 그림 안에는 한글/한자/가나 글자를 절대 그리지 말라고 명시한다.
  말풍선은 빈 흰 타원만. 아이콘·그림으로 설명. 2x2 4컷. bright educational manhwa.`;

export async function generateLessonMaterialsOrganizationDraft(input: {
  items: InputItem[];
}): Promise<LessonMaterialOrganizationDraft> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const itemsText = input.items
      .map((it, idx) => {
        const korean = (it.korean ?? "").trim();
        return `${idx + 1}. EN:\n${it.english.trim()}\nKR:\n${
          korean.length > 0 ? korean : "(없음)"
        }`;
      })
      .join("\n\n");

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
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `아래 지문의 논리 흐름과 4컷 대사·그림 프롬프트를 만들어라.\n\n${itemsText}`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`분석 생성 실패 (HTTP ${res.status})`);
    }

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{
      analysisCards?: LessonMaterialAnalysisCard[];
      illustrationPrompt?: string;
      comicCaptions?: unknown;
    }>(content);

    const cards = (parsed?.analysisCards ?? [])
      .map((c) => ({
        title: String(c.title ?? "").trim(),
        desc: oneKoreanSentence(String(c.desc ?? "").trim()),
      }))
      .filter((c) => c.title && c.desc)
      .filter(
        (c) =>
          !/수업에서 짚을 포인트|지문의 핵심 주장|^논리 전개$|^분석$|^요약$/.test(
            c.title
          )
      );

    const illustrationPrompt = String(parsed?.illustrationPrompt ?? "").trim();
    const comicCaptions = Array.isArray(parsed?.comicCaptions)
      ? parsed.comicCaptions.map((v) => String(v ?? "").trim()).filter(Boolean)
      : [];

    if (cards.length < 3) {
      throw new Error("분석 결과를 해석하지 못했습니다. 다시 시도해 주세요.");
    }

    const captions =
      comicCaptions.length >= 4
        ? comicCaptions.slice(0, 4)
        : [
            cards[0]?.title ?? "문제 제기",
            cards[1]?.title ?? "원인",
            cards[2]?.title ?? "교정",
            cards[2]?.desc ?? "결론",
          ];

    return {
      analysisCards: cards.slice(0, 3),
      illustrationPrompt:
        illustrationPrompt ||
        "2x2 educational manhwa comic, no text letters of any language, empty white speech bubbles only, icons and characters, bright flat colors",
      comicCaptions: captions,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("분석 생성 시간이 초과되었습니다. 다시 시도해 주세요.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
