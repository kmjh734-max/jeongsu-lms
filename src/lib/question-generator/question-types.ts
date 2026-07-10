import type {
  QuestionCategory,
  QuestionTypeGroup,
  QuestionTypeOption,
} from "@/lib/question-generator/types";

/**
 * 우작 11단계 내신 변형문제 유형 (샘플 PDF 기준)
 */
function opt(
  type: QuestionTypeOption["type"],
  category: QuestionCategory,
  label: string,
  difficulty: QuestionTypeOption["difficulty"],
  choiceLanguage: QuestionTypeOption["choiceLanguage"],
  isObjective: boolean,
  preview: string,
  keySuffix?: string
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
    key: `${type}:${lang}:${diff}${keySuffix ? `:${keySuffix}` : ""}`,
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
    category: "details",
    label: "1단계 · 내용 일치",
    options: [
      opt(
        "content_false",
        "details",
        "내용 불일치 (한글 선택지)",
        "default",
        "korean",
        true,
        "「위 글의 내용과 일치하지 않는 것은?」 한글 5지선다"
      ),
      opt(
        "content_true",
        "details",
        "내용 일치 (한글 선택지)",
        "default",
        "korean",
        true,
        "「위 글의 내용과 일치하는 것은?」 한글 5지선다"
      ),
    ],
  },
  {
    category: "grammar_vocabulary",
    label: "2·4·5·6단계 · 어법·어휘",
    options: [
      opt(
        "grammar",
        "grammar_vocabulary",
        "2단계 어법·어휘 양자택일",
        "default",
        null,
        false,
        "본문 [A / B] 괄호에서 올바른 표현 고르기 (여러 곳)",
        "binary"
      ),
      opt(
        "grammar",
        "grammar_vocabulary",
        "4단계 어법 (밑줄 5곳)",
        "default",
        null,
        true,
        "「밑줄 친 부분 중 어법상 틀린 것은?」",
        "underline"
      ),
      opt(
        "vocabulary",
        "grammar_vocabulary",
        "5단계 어휘의 적절성",
        "default",
        null,
        true,
        "「밑줄 친 부분 중 문맥상 적절하지 않은 것은?」"
      ),
      opt(
        "grammar",
        "grammar_vocabulary",
        "6단계 어법 고쳐 쓰기",
        "default",
        null,
        false,
        "괄호 안 표현을 맥락·어법에 맞게 고쳐 쓰기",
        "rewrite"
      ),
    ],
  },
  {
    category: "inference",
    label: "3·8단계 · 글의 흐름·순서",
    options: [
      opt(
        "sentence_insertion",
        "inference",
        "3단계 문장 삽입 위치",
        "default",
        null,
        true,
        "「주어진 문장이 들어가기에 가장 적절한 곳은?」 ①~⑤"
      ),
      opt(
        "irrelevant_sentence",
        "inference",
        "3단계 흐름과 무관한 문장",
        "default",
        null,
        true,
        "「글의 흐름과 관계 없는 문장은?」"
      ),
      opt(
        "order",
        "inference",
        "8단계 글의 순서",
        "default",
        null,
        true,
        "주어진 글 다음에 이어질 순서로 알맞은 것은?"
      ),
    ],
  },
  {
    category: "main_idea",
    label: "7·9·10단계 · 빈칸·주제",
    options: [
      opt(
        "summary_short",
        "main_idea",
        "7단계 본문 이해 빈칸",
        "default",
        null,
        false,
        "우리말 해석을 보고 영어 빈칸에 알맞은 단어 채우기"
      ),
      opt(
        "topic",
        "main_idea",
        "9단계 주제 (한글 선택지)",
        "default",
        "korean",
        true,
        "「위 글의 주제로 가장 적절한 것은?」"
      ),
      opt(
        "sentence_blank",
        "main_idea",
        "10단계 빈칸 추론",
        "default",
        "english",
        true,
        "「빈칸에 들어갈 말로 가장 적절한 것은?」 영어 선택지"
      ),
      opt(
        "title",
        "main_idea",
        "9단계 제목 (한글 선택지)",
        "default",
        "korean",
        true,
        "「위 글의 제목으로 가장 적절한 것은?」"
      ),
    ],
  },
  {
    category: "subjective",
    label: "11단계 · 서술형",
    options: [
      opt(
        "writing",
        "subjective",
        "11단계 주어진 단어로 영작",
        "default",
        null,
        false,
        "우리말 조건을 주어진 영어 단어를 사용해 영작"
      ),
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

/** 발문 고정 템플릿 (항상 한글) */
export const KOREAN_INSTRUCTION_BY_KEY: Record<string, string> = {
  "content_false:ko:default": "위 글의 내용과 일치하지 않는 것은?",
  "content_true:ko:default": "위 글의 내용과 일치하는 것은?",
  "grammar:na:default:binary":
    "아래 괄호 안의 표현들 중에서 올바른 표현을 고르세요.",
  "grammar:na:default:underline":
    "위 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "vocabulary:na:default":
    "위 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
  "grammar:na:default:rewrite":
    "아래 글의 괄호 안에 주어진 표현들을 글의 맥락과 어법에 알맞게 고쳐 쓰시오.",
  "sentence_insertion:na:default":
    "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?",
  "irrelevant_sentence:na:default":
    "글의 흐름으로 보아, 주어진 글에서 흐름과 관계 없는 문장은?",
  "order:na:default":
    "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
  "summary_short:na:default":
    "주어진 우리말 해석에 알맞게 빈칸에 알맞은 단어들을 채워 넣으세요.",
  "topic:ko:default": "위 글의 주제로 가장 적절한 것은?",
  "title:ko:default": "위 글의 제목으로 가장 적절한 것은?",
  "sentence_blank:en:default": "빈칸에 들어갈 말로 가장 적절한 것은?",
  "writing:na:default":
    "다음 우리말 내용을 주어진 영어 단어를 모두 사용하여 영작하시오.",
};
