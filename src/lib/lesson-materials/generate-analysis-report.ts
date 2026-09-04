export type AnalysisChunkRole = "s" | "v" | "o" | "c" | "M" | "other";

export type AnalysisEnChunk = {
  text: string;
  role: AnalysisChunkRole;
};

export type AnalysisGrammarPoint = {
  title: string;
  detail: string;
  example?: string;
};

export type AnalysisSentence = {
  itemId: string;
  enChunks: AnalysisEnChunk[];
  koChunks: string[];
  easyUnderstanding: string;
  grammarPoints: AnalysisGrammarPoint[];
};

export type AnalysisReportData = {
  headerLabel: string;
  sentences: AnalysisSentence[];
  updatedAt?: string;
};

type InputLine = {
  id: string;
  english: string;
  korean?: string | null;
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

function normRole(raw: unknown): AnalysisChunkRole {
  const r = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (r === "s" || r === "subject") return "s";
  if (r === "v" || r === "verb") return "v";
  if (r === "o" || r === "object") return "o";
  if (r === "c" || r === "complement") return "c";
  if (r === "m" || r === "modifier" || r === "mod") return "M";
  return "other";
}

const SYSTEM = `너는 한국 중·고등 영어 문장 분석서 편집자다.
입력된 각 영어 문장(과 한글 해석)만 근거로, 수업용 분석서 JSON을 만든다.

반드시 JSON만 반환:
{
  "sentences": [
    {
      "itemId": "uuid",
      "enChunks": [
        { "text": "The fallacy of composition", "role": "s" },
        { "text": "fails to allow for", "role": "v" },
        { "text": "how the parts interact", "role": "o" }
      ],
      "koChunks": ["구성의 오류는", "고려하지 못한다", "부분들이 어떻게 상호작용하는지를"],
      "easyUnderstanding": "문장이 말하려는 핵심을 쉽게 풀어 쓴 한국어 2~3문장.",
      "grammarPoints": [
        {
          "title": "간접의문문이 전치사의 목적어",
          "detail": "전치사 뒤에서 how/what 절이 목적어로 온다.",
          "example": "fails to allow for how the parts interact"
        }
      ]
    }
  ]
}

규칙:
- sentences 배열 길이는 입력 문장 수와 같게. itemId는 입력 id를 그대로.
- enChunks: 의미 단위로 /로 나눌 덩어리. role은 s|v|o|c|M 중 하나(기타면 M).
- koChunks: enChunks와 같은 개수·같은 순서로 대응되는 한국어.
- easyUnderstanding: 쉽고 짧게(40~90자). 라벨 문구는 넣지 말 것.
- grammarPoints: 1~3개. title은 짧은 문법 포인트명, detail은 쉬운 설명, example은 문장에서 해당 영어 조각.
- 너무 어려운 용어만 나열하지 말 것. 수업용으로 명확하게.`;

export async function generateAnalysisReport(input: {
  lines: InputLine[];
  title?: string;
  headerLabel?: string;
}): Promise<AnalysisReportData> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const lines = input.lines.filter((l) => l.english.trim());
  if (lines.length === 0) {
    return {
      headerLabel: input.headerLabel?.trim() || "26년도 1학기 중간고사 대비",
      sentences: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    const payload = lines
      .map((l, i) => {
        const kr = (l.korean ?? "").trim();
        return `${i + 1}. id=${l.id}\nEN: ${l.english.trim()}\nKR: ${
          kr || "(없음)"
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
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `제목: ${input.title?.trim() || "(없음)"}\n\n아래 문장들로 분석서를 만들어라.\n\n${payload}`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`분석서 생성 실패 (HTTP ${res.status})`);
    }

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{
      sentences?: Array<{
        itemId?: string;
        enChunks?: Array<{ text?: string; role?: string }>;
        koChunks?: unknown;
        easyUnderstanding?: string;
        grammarPoints?: Array<{
          title?: string;
          detail?: string;
          example?: string;
        }>;
      }>;
    }>(content);

    const byId = new Map(
      (parsed?.sentences ?? []).map((s) => [String(s.itemId ?? ""), s] as const)
    );

    const sentences: AnalysisSentence[] = lines.map((line) => {
      const raw = byId.get(line.id);
      const enChunks = (raw?.enChunks ?? [])
        .map((c) => ({
          text: String(c.text ?? "").trim(),
          role: normRole(c.role),
        }))
        .filter((c) => c.text.length > 0);

      let koChunks: string[] = [];
      if (Array.isArray(raw?.koChunks)) {
        koChunks = raw!.koChunks.map((k) => String(k ?? "").trim());
      }

      if (enChunks.length === 0) {
        enChunks.push({ text: line.english.trim(), role: "other" });
      }
      while (koChunks.length < enChunks.length) koChunks.push("");
      if (koChunks.length > enChunks.length) {
        koChunks = koChunks.slice(0, enChunks.length);
      }
      if (!koChunks.some((k) => k) && (line.korean ?? "").trim()) {
        koChunks = enChunks.map((_, i) =>
          i === 0 ? String(line.korean).trim() : ""
        );
      }

      const grammarPoints = (raw?.grammarPoints ?? [])
        .map((g) => ({
          title: String(g.title ?? "").trim(),
          detail: String(g.detail ?? "").trim(),
          example: String(g.example ?? "").trim() || undefined,
        }))
        .filter((g) => g.title || g.detail)
        .slice(0, 4);

      return {
        itemId: line.id,
        enChunks,
        koChunks,
        easyUnderstanding:
          String(raw?.easyUnderstanding ?? "").trim() ||
          "이 문장의 핵심을 쉽게 이해해 보세요.",
        grammarPoints,
      };
    });

    return {
      headerLabel: input.headerLabel?.trim() || "26년도 1학기 중간고사 대비",
      sentences,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

export function hasAnalysisReport(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const report = json as { sentences?: unknown };
  return Array.isArray(report.sentences) && report.sentences.length > 0;
}
