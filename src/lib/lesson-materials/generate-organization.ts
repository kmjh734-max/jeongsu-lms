export type LessonMaterialAnalysisCard = {
  title: string;
  desc: string;
};

export type LessonMaterialOrganizationDraft = {
  analysisCards: LessonMaterialAnalysisCard[];
  illustrationPrompt: string;
};

type InputItem = { english: string; korean?: string | null };

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `너는 영어 수업 교재를 만드는 제작자다.
아래 입력(선택된 지문/문장들)을 바탕으로 "자료 정리하기(2단계)"용 분석과 삽화 프롬프트를 만든다.

반환 형식은 반드시 JSON만 반환한다.
{
  "analysisCards": [
    { "title": "구성의 이유에 대한 요해", "desc": "..." },
    { "title": "상황과 요거주 핵심 결합의 관계", "desc": "..." },
    { "title": "전체 관계의 중요성", "desc": "..." }
  ],
  "illustrationPrompt": "..."
}

규칙:
- analysisCards는 반드시 위 title 3개를 그대로 사용하고, desc는 한국어로 2~3문장 내로 짧게 작성한다.
- illustrationPrompt는 이미지 생성용으로 쓰기 좋게 1문장짜리 영어 프롬프트로 작성한다.
`;

export async function generateLessonMaterialsOrganizationDraft(
  input: { items: InputItem[] }
): Promise<LessonMaterialOrganizationDraft> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);

  try {
    const itemsText = input.items
      .map((it, idx) => {
        const korean = (it.korean ?? "").trim();
        return `${idx + 1}. EN: ${it.english.trim()}\nKR: ${
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
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `선택된 지문/문장들:\n${itemsText}` },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`OpenAI HTTP ${res.status}: ${bodyText.slice(0, 500)}`);
    }

    const parsed = parseJsonSafe<{
      analysisCards: LessonMaterialAnalysisCard[];
      illustrationPrompt: string;
    }>(JSON.parse(bodyText).choices?.[0]?.message?.content ?? "{}");

    // response_format=json_object 면 보통 content가 JSON 문자열이지만,
    // 안전하게 한번 더 가드합니다.
    if (!parsed?.analysisCards?.length || !parsed.illustrationPrompt) {
      // fallback: 최소 placeholder
      return {
        analysisCards: [
          { title: "구성의 이유에 대한 요해", desc: "입력 지문을 바탕으로 핵심 흐름을 정리합니다." },
          { title: "상황과 요거주 핵심 결합의 관계", desc: "문장들이 연결되는 논리/상황 관계를 요약합니다." },
          { title: "전체 관계의 중요성", desc: "전체 메시지가 어떻게 완성되는지 설명합니다." },
        ],
        illustrationPrompt:
          "A warm classroom scene with a teacher pointing at an English passage on a board, educational and friendly atmosphere, soft lighting",
      };
    }

    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

