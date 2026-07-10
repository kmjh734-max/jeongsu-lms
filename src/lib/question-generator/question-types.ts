import type {
  QuestionCategory,
  QuestionTypeGroup,
  QuestionTypeOption,
} from "@/lib/question-generator/types";

/**
 * 아잉카 모의고사 변형문제 유형
 * 예: [202603H1_22요지추론_변형] + 한글 발문 + 지문 + ①~⑤
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
    category: "main_idea",
    label: "대의 파악 (주제·제목·요지)",
    options: [
      opt(
        "topic",
        "main_idea",
        "주제 추론",
        "default",
        "korean",
        true,
        "「다음 글의 주제로 가장 적절한 것은?」",
        "주제추론",
        "다음 글의 주제로 가장 적절한 것은?"
      ),
      opt(
        "title",
        "main_idea",
        "제목 추론",
        "default",
        "korean",
        true,
        "「다음 글의 제목으로 가장 적절한 것은?」",
        "제목추론",
        "다음 글의 제목으로 가장 적절한 것은?"
      ),
      opt(
        "summary_mcq",
        "main_idea",
        "요지 추론",
        "default",
        "korean",
        true,
        "「다음 글의 요지로 가장 적절한 것은?」",
        "요지추론",
        "다음 글의 요지로 가장 적절한 것은?"
      ),
      opt(
        "summary_mcq",
        "main_idea",
        "요약문 빈칸 (A)(B)",
        "default",
        "korean",
        true,
        "한 문장 요약 빈칸 (A)(B) 선택",
        "요약문추론",
        "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?"
      ),
    ],
  },
  {
    category: "details",
    label: "세부 정보 (일치·불일치·심경)",
    options: [
      opt(
        "content_true",
        "details",
        "내용 일치",
        "default",
        "korean",
        true,
        "「다음 글의 내용과 일치하는 것은?」",
        "내용일치",
        "다음 글의 내용과 일치하는 것은?"
      ),
      opt(
        "content_false",
        "details",
        "내용 불일치",
        "default",
        "korean",
        true,
        "「다음 글의 내용과 일치하지 않는 것은?」",
        "내용불일치",
        "다음 글의 내용과 일치하지 않는 것은?"
      ),
      opt(
        "underlined_inference",
        "details",
        "심경 변화",
        "default",
        "english",
        true,
        "「I의 심경 변화로 가장 적절한 것은?」 영어 선택지",
        "심경추론",
        "다음 글에 드러난 I의 심경 변화로 가장 적절한 것은?"
      ),
      opt(
        "underlined_inference",
        "details",
        "밑줄 의미 추론",
        "default",
        "korean",
        true,
        "밑줄 친 표현의 문맥상 의미",
        "함축의미추론",
        "다음 글에서 밑줄 친 부분이 의미하는 바로 가장 적절한 것은?"
      ),
    ],
  },
  {
    category: "inference",
    label: "추론 (빈칸·순서·삽입·무관)",
    options: [
      opt(
        "sentence_blank",
        "inference",
        "빈칸 추론",
        "default",
        "english",
        true,
        "「다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오.」",
        "빈칸추론",
        "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오."
      ),
      opt(
        "order",
        "inference",
        "글의 순서",
        "default",
        null,
        true,
        "주어진 글 다음 순서",
        "순서추론",
        "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?"
      ),
      opt(
        "sentence_insertion",
        "inference",
        "문장 삽입",
        "default",
        null,
        true,
        "「주어진 문장이 들어가기에 가장 적절한 곳」",
        "문장삽입",
        "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오."
      ),
      opt(
        "irrelevant_sentence",
        "inference",
        "무관한 문장",
        "default",
        null,
        true,
        "「전체 흐름과 관계 없는 문장은?」",
        "무관한문장",
        "다음 글에서 전체 흐름과 관계 없는 문장은?"
      ),
    ],
  },
  {
    category: "grammar_vocabulary",
    label: "어법·어휘",
    options: [
      opt(
        "grammar",
        "grammar_vocabulary",
        "어법",
        "default",
        null,
        true,
        "「밑줄 친 부분 중 어법상 틀린 것은?」",
        "어법추론",
        "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?"
      ),
      opt(
        "vocabulary",
        "grammar_vocabulary",
        "어휘",
        "default",
        null,
        true,
        "「문맥상 낱말의 쓰임이 적절하지 않은 것은?」",
        "어휘추론",
        "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?"
      ),
    ],
  },
  {
    category: "subjective",
    label: "서술·주관",
    options: [
      opt(
        "writing",
        "subjective",
        "영작 (주어진 단어)",
        "default",
        null,
        false,
        "우리말 + 제시 단어로 영작",
        "서술형영작",
        "다음 우리말 내용을 주어진 영어 단어를 모두 사용하여 영작하시오."
      ),
      opt(
        "summary_short",
        "subjective",
        "빈칸 단어 쓰기",
        "default",
        null,
        false,
        "빈칸에 알맞은 단어 쓰기",
        "빈칸쓰기",
        "다음 글의 빈칸에 들어갈 알맞은 단어를 쓰시오."
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

/** @deprecated use option.koreanStem via findAingkaOption */
export const KOREAN_INSTRUCTION_BY_KEY: Record<string, string> = Object.fromEntries(
  (ALL_QUESTION_OPTIONS as AingkaOption[]).map((o) => [o.key, o.koreanStem])
);
