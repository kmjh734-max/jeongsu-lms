import { emptyCounts } from "@/lib/question-generator/question-types";
import type { PresetConfig } from "@/lib/question-generator/types";

function withCounts(entries: Array<[string, number]>): PresetConfig {
  const counts = emptyCounts();
  for (const [key, n] of entries) {
    if (key in counts) counts[key] = n;
  }
  return { counts };
}

/** 아잉카 모의고사 변형 스타일 프리셋 */
export const SYSTEM_PRESETS: Array<{
  slug: string;
  name: string;
  description: string;
  config: PresetConfig;
}> = [
  {
    slug: "aingka_core",
    name: "아잉카 핵심 변형",
    description:
      "내용일치·주제·제목·요지·빈칸·어법·어휘·순서·삽입·무관 (지문 1개)",
    config: withCounts([
      ["content_true:ko:default:내용일치", 1],
      ["content_false:ko:default:내용불일치", 1],
      ["topic:ko:default:주제추론", 1],
      ["title:ko:default:제목추론", 1],
      ["summary_mcq:ko:default:요지추론", 1],
      ["sentence_blank:en:default:빈칸추론", 1],
      ["grammar:na:default:어법추론", 1],
      ["vocabulary:na:default:어휘추론", 1],
      ["order:na:default:순서추론", 1],
      ["sentence_insertion:na:default:문장삽입", 1],
      ["irrelevant_sentence:na:default:무관한문장", 1],
    ]),
  },
  {
    slug: "aingka_main_idea",
    name: "대의 파악 집중",
    description: "주제·제목·요지·요약문",
    config: withCounts([
      ["topic:ko:default:주제추론", 1],
      ["title:ko:default:제목추론", 1],
      ["summary_mcq:ko:default:요지추론", 1],
      ["summary_mcq:ko:default:요약문추론", 1],
    ]),
  },
  {
    slug: "aingka_inference",
    name: "빈칸·배열 집중",
    description: "빈칸·순서·삽입·무관",
    config: withCounts([
      ["sentence_blank:en:default:빈칸추론", 2],
      ["order:na:default:순서추론", 1],
      ["sentence_insertion:na:default:문장삽입", 1],
      ["irrelevant_sentence:na:default:무관한문장", 1],
    ]),
  },
  {
    slug: "aingka_grammar_vocab",
    name: "어법·어휘 집중",
    description: "어법·어휘 객관식",
    config: withCounts([
      ["grammar:na:default:어법추론", 2],
      ["vocabulary:na:default:어휘추론", 2],
    ]),
  },
];
