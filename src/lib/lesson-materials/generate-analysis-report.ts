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

const SYSTEM = `너는 한국 고등 영어(수능·내신) 문장 분석서 전문 편집자다.
입력된 지문 전체의 흐름을 보면서, 각 문장마다 수업용 분석서 JSON을 만든다.

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
      "easyUnderstanding": "앞에서 부분의 성과를 더하면 전체가 된다고 오해할 수 있는데, 이 문장은 그 오해가 왜 틀리는지 짚는다. 부분끼리 서로 영향을 준다는 점을 놓치면 전체 성과를 잘못 예측하게 된다.",
      "grammarPoints": [
        {
          "title": "전치사 + 간접의문절(how절)",
          "detail": "allow for 뒤의 how절은 전치사 for의 목적어 역할을 하는 간접의문문이다. how는 의문사이면서 절을 이끈다.",
          "example": "fails to allow for how the parts interact"
        }
      ]
    }
  ]
}

공통 규칙:
- sentences 길이는 입력 문장 수와 같게. itemId는 입력 id를 그대로 쓴다.
- enChunks: 의미 단위로 나눈 영어 덩어리. role은 s|v|o|c|M (주어/동사/목적어/보어/수식어).
- koChunks: enChunks와 같은 개수·순서로 대응되는 한국어 해석 조각.

easyUnderstanding ([쉬운 이해]) — 매우 중요:
- 절대 단순 해석·직역·번역 요약이 아니다. (예: "~이다/~한다"만 반복 금지)
- 이 문장이 지문 흐름에서 하는 역할과 의미를 구체적으로 설명한다.
- 앞 문장과의 연결(반박·예시·원인·결론 등), 필자가 말하려는 포인트, 학생이 헷갈리기 쉬운 뉘앙스를 풀어 쓴다.
- 배경지식(경제·심리·과학·사회 개념 등)이 이해에 필요하면 1~2문장으로 쉽게 보충한다.
- 한국어 2~4문장, 자연스럽고 구체적(권장 80~180자). 라벨 문구([쉬운 이해] 등)는 본문에 넣지 말 것.

grammarPoints ([문법 분석]) — 자세히, 선별적으로:
- 너무 쉬운 문법은 생략한다. (단순 be동사, 일반 현재/과거, 기본 형용사 수식, 쉬운 and/but 등)
- 수업에서 짚을 만한 구문만 1~4개. 없으면 []도 허용.
- 관계사: 관계대명사(who/which/that/what)인지 관계부사(when/where/why/how)인지 명시. 선행사, 주격/목적격/소유격, 생략 여부, 전치사+관계대명사(in which, to whom 등)를 구분해 설명한다.
- 수동태: be+p.p. / get+p.p. / have+목적어+p.p. / 전치사 수동(be known for 등)처럼 종류를 밝히고, 능동 대응이나 의미 차이를 적는다.
- 기타: 가주어-진주어, 분사구문, 가정법, 도치, 강조, 명사절/부사절, 부정사·동명사 역할, 부분부정, 비교구문 등도 해당될 때만 자세히.
- title: 문법 포인트명(구체적). detail: 왜 그렇게 읽히는지 설명이 충분할 것(2~4문장 분량 가능). example: 문장에서 해당 영어 조각.`;

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
  const timer = setTimeout(() => controller.abort(), 120_000);

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
        model: "gpt-4o",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `제목: ${input.title?.trim() || "(없음)"}

아래는 한 지문의 문장들이다. 전체 흐름을 먼저 파악한 뒤 문장별 분석서를 만들어라.
- easyUnderstanding은 해석이 아니라 흐름·의미·필요 시 배경지식 설명
- grammarPoints는 쉬운 문법 제외, 관계사·수동태 등은 종류까지 자세히

${payload}`,
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
        .slice(0, 5);

      return {
        itemId: line.id,
        enChunks,
        koChunks,
        easyUnderstanding:
          String(raw?.easyUnderstanding ?? "").trim() ||
          "이 문장이 지문에서 하는 역할을 생각하며 읽어 보세요.",
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
