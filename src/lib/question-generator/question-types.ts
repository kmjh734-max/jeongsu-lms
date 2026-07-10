import type {
  QuestionCategory,
  QuestionTypeGroup,
  QuestionTypeOption,
} from "@/lib/question-generator/types";

/**
 * 고1 학력평가 수준의 변형 유형
 * 발문: 「윗글의 …」 / 태그: [202603H1_22요지추론_변형]
 */
function opt(
  type: QuestionTypeOption["type"],
  category: QuestionCategory,
  label: string,
  difficulty: QuestionTypeOption["difficulty"],
  choiceLanguage: QuestionTypeOption["choiceLanguage"],
  isObjective: boolean,
  preview: string,
  aingkaCode: string,
  koreanStem: string
): QuestionTypeOption & { aingkaCode: string; koreanStem: string } {
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
    key: `${type}:${lang}:${diff}:${aingkaCode}`,
    type,
    category,
    label,
    difficulty,
    choiceLanguage,
    isObjective,
    preview,
    aingkaCode,
    koreanStem,
  };
}

export type AingkaOption = ReturnType<typeof opt>;

export const QUESTION_TYPE_GROUPS: QuestionTypeGroup[] = [
  {
    category: "grammar_vocabulary",
    label: "Section · 어법·어휘",
    options: [
      opt(
        "grammar",
        "grammar_vocabulary",
        "어법 연결형 (ⓐⓑⓒ)",
        "default",
        "english",
        true,
        "괄호 ⓐⓑⓒ에서 어법상 알맞은 말 연결",
        "어법연결",
        "윗글의 괄호 ⓐ, ⓑ, ⓒ에서 어법상 알맞은 말로 바르게 연결된 것은?"
      ),
      opt(
        "grammar",
        "grammar_vocabulary",
        "어법 밑줄 (어색한 것)",
        "default",
        null,
        true,
        "밑줄 ⓐ~ⓔ 중 어법상 어색한 것",
        "어법추론",
        "윗글의 밑줄 친 ⓐ~ⓔ 중, 어법상 어색한 것은?"
      ),
      opt(
        "vocabulary",
        "grammar_vocabulary",
        "어휘 밑줄 (부적절)",
        "default",
        null,
        true,
        "문맥상 낱말 쓰임이 적절하지 않은 것",
        "어휘추론",
        "윗글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?"
      ),
      opt(
        "grammar",
        "grammar_vocabulary",
        "어법 고쳐 쓰기",
        "default",
        null,
        false,
        "어법상 어색한 부분을 찾아 고치기",
        "어법고쳐쓰기",
        "윗글에서 어법상 어색한 부분을 찾아 바르게 고쳐 쓰시오."
      ),
    ],
  },
  {
    category: "details",
    label: "Section · 세부·목적·심경",
    options: [
      opt(
        "underlined_inference",
        "details",
        "목적 추론",
        "default",
        "english",
        true,
        "「윗글의 목적으로 알맞은 것은?」 영어 선택지",
        "목적추론",
        "윗글의 목적으로 알맞은 것은?"
      ),
      opt(
        "underlined_inference",
        "details",
        "심경 변화",
        "default",
        "english",
        true,
        "심경 변화 영어 선택지",
        "심경추론",
        "윗글에 드러난 심경 변화로 알맞은 것은?"
      ),
      opt(
        "content_false",
        "details",
        "내용 불일치 (영어 선택지)",
        "default",
        "english",
        true,
        "「윗글의 내용과 일치하지 않는 것은?」",
        "내용불일치",
        "윗글의 내용과 일치하지 않는 것은?"
      ),
      opt(
        "content_true",
        "details",
        "내용 일치 (영어 선택지)",
        "default",
        "english",
        true,
        "「윗글의 내용과 일치하는 것은?」",
        "내용일치",
        "윗글의 내용과 일치하는 것은?"
      ),
      opt(
        "content_false",
        "details",
        "내용 불일치 (한글 선택지)",
        "default",
        "korean",
        true,
        "한글 선택지 내용 불일치",
        "내용불일치한글",
        "다음 글의 내용과 일치하지 않는 것은?"
      ),
      opt(
        "underlined_inference",
        "details",
        "함축 의미",
        "default",
        "korean",
        true,
        "밑줄 친 표현의 문맥상 의미",
        "함축의미추론",
        "윗글의 밑줄 친 부분이 의미하는 바로 알맞은 것은?"
      ),
    ],
  },
  {
    category: "inference",
    label: "Section · 빈칸·흐름·순서",
    options: [
      opt(
        "sentence_blank",
        "inference",
        "연결어 빈칸 (A)(B)",
        "default",
        "english",
        true,
        "담화 표지 (A)(B) 연결 선택",
        "연결어빈칸",
        "윗글의 빈칸 (A), (B)에 들어갈 알맞은 말로 연결된 것은?"
      ),
      opt(
        "sentence_blank",
        "inference",
        "빈칸 추론 (구·절)",
        "default",
        "english",
        true,
        "빈칸에 들어갈 말",
        "빈칸추론",
        "윗글의 빈칸에 들어갈 말로 알맞은 것은?"
      ),
      opt(
        "irrelevant_sentence",
        "inference",
        "무관한 문장",
        "default",
        null,
        true,
        "(A)~(E) 중 흐름상 관계없는 것",
        "무관한문장",
        "윗글의 (A)~(E) 중, 흐름상 관계없는 것은?"
      ),
      opt(
        "sentence_insertion",
        "inference",
        "문장 삽입",
        "default",
        null,
        true,
        "주어진 문장 위치",
        "문장삽입",
        "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?"
      ),
      opt(
        "order",
        "inference",
        "글의 순서",
        "default",
        null,
        true,
        "이어질 글의 순서",
        "순서추론",
        "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?"
      ),
    ],
  },
  {
    category: "main_idea",
    label: "Section · 대의 파악",
    options: [
      // 제목: (영/한) × (하/상)
      opt(
        "title",
        "main_idea",
        "(영) 하",
        "low",
        "english",
        true,
        "제목 · 영어 선택지 · 난이도 하",
        "제목추론",
        "윗글의 제목으로 알맞은 것은?"
      ),
      opt(
        "title",
        "main_idea",
        "(영) 상",
        "high",
        "english",
        true,
        "제목 · 영어 선택지 · 난이도 상",
        "제목추론",
        "윗글의 제목으로 알맞은 것은?"
      ),
      opt(
        "title",
        "main_idea",
        "(한) 하",
        "low",
        "korean",
        true,
        "제목 · 한글 선택지 · 난이도 하",
        "제목추론",
        "윗글의 제목으로 알맞은 것은?"
      ),
      opt(
        "title",
        "main_idea",
        "(한) 상",
        "high",
        "korean",
        true,
        "제목 · 한글 선택지 · 난이도 상",
        "제목추론",
        "윗글의 제목으로 알맞은 것은?"
      ),
      // 주제: (영/한) × (하/상)
      opt(
        "topic",
        "main_idea",
        "(영) 하",
        "low",
        "english",
        true,
        "주제 · 영어 선택지 · 난이도 하",
        "주제추론",
        "윗글의 주제로 알맞은 것은?"
      ),
      opt(
        "topic",
        "main_idea",
        "(영) 상",
        "high",
        "english",
        true,
        "주제 · 영어 선택지 · 난이도 상",
        "주제추론",
        "윗글의 주제로 알맞은 것은?"
      ),
      opt(
        "topic",
        "main_idea",
        "(한) 하",
        "low",
        "korean",
        true,
        "주제 · 한글 선택지 · 난이도 하",
        "주제추론",
        "윗글의 주제로 알맞은 것은?"
      ),
      opt(
        "topic",
        "main_idea",
        "(한) 상",
        "high",
        "korean",
        true,
        "주제 · 한글 선택지 · 난이도 상",
        "주제추론",
        "윗글의 주제로 알맞은 것은?"
      ),
      opt(
        "summary_mcq",
        "main_idea",
        "요지 (하)",
        "low",
        "korean",
        true,
        "요지 · 난이도 하",
        "요지추론",
        "윗글의 요지로 알맞은 것은?"
      ),
      opt(
        "summary_mcq",
        "main_idea",
        "요지 (상)",
        "high",
        "korean",
        true,
        "요지 · 난이도 상",
        "요지추론",
        "윗글의 요지로 알맞은 것은?"
      ),
    ],
  },
  {
    category: "subjective",
    label: "Section · 서술형",
    options: [
      opt(
        "writing",
        "subjective",
        "조건 영작",
        "default",
        null,
        false,
        "조건에 맞게 영작",
        "서술형영작",
        "다음 우리말 내용을 <조건>에 알맞게 영작하시오."
      ),
      opt(
        "summary_short",
        "subjective",
        "요약·요지 쓰기",
        "default",
        null,
        false,
        "요지를 조건에 맞게 쓰기",
        "요지영작",
        "다음 글의 요지를 주어진 <조건>에 알맞게 한 문장으로 영작하시오."
      ),
      opt(
        "short_title",
        "subjective",
        "제목 쓰기",
        "default",
        null,
        false,
        "제목 영작",
        "제목영작",
        "윗글의 제목을 영어로 쓰시오."
      ),
      opt(
        "short_topic",
        "subjective",
        "주제 쓰기",
        "default",
        null,
        false,
        "주제 영작",
        "주제영작",
        "윗글의 주제를 영어로 쓰시오."
      ),
    ],
  },
];

export const ALL_QUESTION_OPTIONS: QuestionTypeOption[] =
  QUESTION_TYPE_GROUPS.flatMap((g) => g.options);

export function findOptionByKey(key: string): QuestionTypeOption | undefined {
  return ALL_QUESTION_OPTIONS.find((o) => o.key === key);
}

export function findAingkaOption(key: string): AingkaOption | undefined {
  return ALL_QUESTION_OPTIONS.find((o) => o.key === key) as
    | AingkaOption
    | undefined;
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

export function buildAingkaTag(opts: {
  yearMonth?: string;
  gradeCode?: string;
  questionNo?: string | number;
  aingkaCode: string;
}): string {
  const ym = opts.yearMonth || "202603";
  const g = opts.gradeCode || "H1";
  const no = opts.questionNo != null ? String(opts.questionNo) : "";
  const prefix = no ? `${ym}${g}_${no}` : `${ym}${g}`;
  return `[${prefix}${opts.aingkaCode}_변형]`;
}

export const KOREAN_INSTRUCTION_BY_KEY: Record<string, string> =
  Object.fromEntries(
    (ALL_QUESTION_OPTIONS as AingkaOption[]).map((o) => [o.key, o.koreanStem])
  );
