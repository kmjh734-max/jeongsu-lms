import type {
  QuestionCategory,
  QuestionTypeGroup,
  QuestionTypeOption,
} from "@/lib/question-generator/types";

function opt(
  type: QuestionTypeOption["type"],
  category: QuestionCategory,
  label: string,
  difficulty: QuestionTypeOption["difficulty"],
  choiceLanguage: QuestionTypeOption["choiceLanguage"],
  isObjective: boolean,
  preview: string
): QuestionTypeOption {
  const lang =
    choiceLanguage === "english"
      ? "en"
      : choiceLanguage === "korean"
        ? "ko"
        : "na";
  const diff =
    difficulty === "default"
      ? "default"
      : difficulty === "low"
        ? "low"
        : difficulty === "medium"
          ? "mid"
          : "high";
  return {
    key: `${type}:${lang}:${diff}`,
    type,
    category,
    label,
    difficulty,
    choiceLanguage,
    isObjective,
    preview,
  };
}

export const QUESTION_TYPE_GROUPS: QuestionTypeGroup[] = [
  {
    category: "main_idea",
    label: "대의 파악",
    options: [
      opt("title", "main_idea", "제목 · 영어 · 하", "low", "english", true, "지문 전체를 포괄하는 제목을 고르는 5지선다 (영어 선택지, 하)"),
      opt("title", "main_idea", "제목 · 영어 · 상", "high", "english", true, "지문 전체를 포괄하는 제목을 고르는 5지선다 (영어 선택지, 상)"),
      opt("title", "main_idea", "제목 · 한글 · 하", "low", "korean", true, "지문 전체를 포괄하는 제목을 고르는 5지선다 (한글 선택지, 하)"),
      opt("title", "main_idea", "제목 · 한글 · 상", "high", "korean", true, "지문 전체를 포괄하는 제목을 고르는 5지선다 (한글 선택지, 상)"),
      opt("topic", "main_idea", "주제 · 영어 · 하", "low", "english", true, "글의 중심 생각을 고르는 5지선다 (영어, 하)"),
      opt("topic", "main_idea", "주제 · 영어 · 상", "high", "english", true, "글의 중심 생각을 고르는 5지선다 (영어, 상)"),
      opt("topic", "main_idea", "주제 · 한글 · 하", "low", "korean", true, "글의 중심 생각을 고르는 5지선다 (한글, 하)"),
      opt("topic", "main_idea", "주제 · 한글 · 상", "high", "korean", true, "글의 중심 생각을 고르는 5지선다 (한글, 상)"),
      opt("summary_mcq", "main_idea", "요약문 완성 객관식", "default", null, true, "요지 요약문의 빈칸을 채우는 5지선다"),
    ],
  },
  {
    category: "details",
    label: "세부 정보",
    options: [
      opt("content_true", "details", "내용 일치 · 영어 · 하", "low", "english", true, "본문과 일치하는 내용을 고르는 5지선다 (영어, 하)"),
      opt("content_true", "details", "내용 일치 · 영어 · 상", "high", "english", true, "본문과 일치하는 내용을 고르는 5지선다 (영어, 상)"),
      opt("content_true", "details", "내용 일치 · 한글 · 하", "low", "korean", true, "본문과 일치하는 내용을 고르는 5지선다 (한글, 하)"),
      opt("content_true", "details", "내용 일치 · 한글 · 상", "high", "korean", true, "본문과 일치하는 내용을 고르는 5지선다 (한글, 상)"),
      opt("content_false", "details", "내용 불일치 · 영어 · 하", "low", "english", true, "본문과 일치하지 않는 내용을 고르는 5지선다 (영어, 하)"),
      opt("content_false", "details", "내용 불일치 · 영어 · 상", "high", "english", true, "본문과 일치하지 않는 내용을 고르는 5지선다 (영어, 상)"),
      opt("content_false", "details", "내용 불일치 · 한글 · 하", "low", "korean", true, "본문과 일치하지 않는 내용을 고르는 5지선다 (한글, 하)"),
      opt("content_false", "details", "내용 불일치 · 한글 · 상", "high", "korean", true, "본문과 일치하지 않는 내용을 고르는 5지선다 (한글, 상)"),
      opt("content_count", "details", "일치하는 내용의 개수", "default", null, true, "5개 진술 중 본문과 일치하는 개수를 고름"),
    ],
  },
  {
    category: "inference",
    label: "추론 능력",
    options: [
      opt("order", "inference", "글의 순서", "default", null, true, "도입부 + A/B/C 순서를 고르는 5지선다"),
      opt("sentence_blank", "inference", "문장 빈칸 · 하", "low", "english", true, "핵심 어구/문장 빈칸 5지선다 (하)"),
      opt("sentence_blank", "inference", "문장 빈칸 · 중", "medium", "english", true, "핵심 어구/문장 빈칸 5지선다 (중)"),
      opt("sentence_blank", "inference", "문장 빈칸 · 상", "high", "english", true, "핵심 어구/문장 빈칸 5지선다 (상)"),
      opt("irrelevant_sentence", "inference", "흐름과 무관한 문장 · 하", "low", null, true, "번호 매긴 문장 중 무관한 문장 고르기 (하)"),
      opt("irrelevant_sentence", "inference", "흐름과 무관한 문장 · 중", "medium", null, true, "번호 매긴 문장 중 무관한 문장 고르기 (중)"),
      opt("irrelevant_sentence", "inference", "흐름과 무관한 문장 · 상", "high", null, true, "번호 매긴 문장 중 무관한 문장 고르기 (상)"),
      opt("sentence_insertion", "inference", "문장 삽입 위치 · 하", "low", null, true, "주어진 문장이 들어갈 ①~⑤ 위치 고르기 (하)"),
      opt("sentence_insertion", "inference", "문장 삽입 위치 · 중", "medium", null, true, "주어진 문장이 들어갈 ①~⑤ 위치 고르기 (중)"),
      opt("sentence_insertion", "inference", "문장 삽입 위치 · 상", "high", null, true, "주어진 문장이 들어갈 ①~⑤ 위치 고르기 (상)"),
      opt("underlined_inference", "inference", "밑줄 의미 추론", "default", "english", true, "밑줄 친 표현의 문맥상 의미 5지선다"),
    ],
  },
  {
    category: "grammar_vocabulary",
    label: "어법·어휘",
    options: [
      opt("grammar", "grammar_vocabulary", "어법 · 하", "low", null, true, "본문 5곳 중 어법상 틀린 곳 1개 고르기 (하)"),
      opt("grammar", "grammar_vocabulary", "어법 · 중", "medium", null, true, "본문 5곳 중 어법상 틀린 곳 1개 고르기 (중)"),
      opt("grammar", "grammar_vocabulary", "어법 · 상", "high", null, true, "본문 5곳 중 어법상 틀린 곳 1개 고르기 (상)"),
      opt("vocabulary", "grammar_vocabulary", "어휘 · 하", "low", null, true, "본문 5곳 중 문맥상 부적절한 어휘 1개 고르기 (하)"),
      opt("vocabulary", "grammar_vocabulary", "어휘 · 중", "medium", null, true, "본문 5곳 중 문맥상 부적절한 어휘 1개 고르기 (중)"),
      opt("vocabulary", "grammar_vocabulary", "어휘 · 상", "high", null, true, "본문 5곳 중 문맥상 부적절한 어휘 1개 고르기 (상)"),
    ],
  },
  {
    category: "subjective",
    label: "주관식·서술형",
    options: [
      opt("summary_short", "subjective", "요약문 완성 주관식", "default", null, false, "요약문 빈칸을 직접 쓰는 주관식"),
      opt("writing", "subjective", "서술형 영작 · 하", "low", null, false, "조건에 맞는 영어 문장 작성 (하)"),
      opt("writing", "subjective", "서술형 영작 · 중", "medium", null, false, "조건에 맞는 영어 문장 작성 (중)"),
      opt("writing", "subjective", "서술형 영작 · 상", "high", null, false, "조건에 맞는 영어 문장 작성 (상)"),
      opt("short_title", "subjective", "서술형 제목", "default", null, false, "적절한 제목을 직접 작성"),
      opt("short_topic", "subjective", "서술형 주제", "default", null, false, "글의 주제를 직접 작성"),
    ],
  },
];

export const ALL_QUESTION_OPTIONS: QuestionTypeOption[] =
  QUESTION_TYPE_GROUPS.flatMap((g) => g.options);

export function findOptionByKey(key: string): QuestionTypeOption | undefined {
  return ALL_QUESTION_OPTIONS.find((o) => o.key === key);
}

export function emptyCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const o of ALL_QUESTION_OPTIONS) counts[o.key] = 0;
  return counts;
}

export function sumCounts(counts: Record<string, number>): {
  total: number;
  objective: number;
  subjective: number;
  selectedTypes: number;
} {
  let total = 0;
  let objective = 0;
  let subjective = 0;
  let selectedTypes = 0;
  for (const o of ALL_QUESTION_OPTIONS) {
    const n = Math.max(0, Math.floor(counts[o.key] ?? 0));
    if (n <= 0) continue;
    selectedTypes += 1;
    total += n;
    if (o.isObjective) objective += n;
    else subjective += n;
  }
  return { total, objective, subjective, selectedTypes };
}

export function expandCountRequests(
  counts: Record<string, number>
): QuestionTypeOption[] {
  const list: QuestionTypeOption[] = [];
  for (const o of ALL_QUESTION_OPTIONS) {
    const n = Math.max(0, Math.floor(counts[o.key] ?? 0));
    for (let i = 0; i < n; i++) list.push(o);
  }
  return list;
}
