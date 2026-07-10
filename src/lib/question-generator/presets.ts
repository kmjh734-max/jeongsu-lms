import { emptyCounts } from "@/lib/question-generator/question-types";
import type { PresetConfig } from "@/lib/question-generator/types";

function withCounts(entries: Array<[string, number]>): PresetConfig {
  const counts = emptyCounts();
  for (const [key, n] of entries) {
    if (key in counts) counts[key] = n;
  }
  return { counts };
}

/**
 * 서울시 학력평가 예상문제(통합본) Section 구성 + 아잉카 변형
 * 1지문 n문항 종합 세트
 */
export const SYSTEM_PRESETS: Array<{
  slug: string;
  name: string;
  description: string;
  config: PresetConfig;
}> = [
  {
    slug: "seoul_section1",
    name: "서울시 Section ❶ 종합",
    description:
      "어법연결·연결어빈칸·목적·내용불일치·무관·빈칸 (1지문 6문항)",
    config: withCounts([
      ["grammar:en:default:어법연결", 1],
      ["sentence_blank:en:default:연결어빈칸", 1],
      ["underlined_inference:en:default:목적추론", 1],
      ["content_false:en:default:내용불일치", 1],
      ["irrelevant_sentence:na:default:무관한문장", 1],
      ["sentence_blank:en:default:빈칸추론", 1],
    ]),
  },
  {
    slug: "seoul_section2",
    name: "서울시 Section ❷ 종합",
    description: "어법·어휘·빈칸·주제·제목·요약 (1지문 6문항)",
    config: withCounts([
      ["grammar:na:default:어법추론", 1],
      ["vocabulary:na:default:어휘추론", 1],
      ["sentence_blank:en:default:빈칸추론", 1],
      ["topic:ko:default:주제추론", 1],
      ["title:ko:default:제목추론", 1],
      ["summary_mcq:ko:default:요약문추론", 1],
    ]),
  },
  {
    slug: "seoul_full",
    name: "서울시 통합 예상 (고난도)",
    description:
      "Section 구성에 가깝게 목적·불일치·어법·어휘·빈칸·순서·삽입·주제·제목·영작",
    config: withCounts([
      ["grammar:en:default:어법연결", 1],
      ["sentence_blank:en:default:연결어빈칸", 1],
      ["underlined_inference:en:default:목적추론", 1],
      ["content_false:en:default:내용불일치", 1],
      ["irrelevant_sentence:na:default:무관한문장", 1],
      ["sentence_blank:en:default:빈칸추론", 1],
      ["grammar:na:default:어법추론", 1],
      ["vocabulary:na:default:어휘추론", 1],
      ["order:na:default:순서추론", 1],
      ["sentence_insertion:na:default:문장삽입", 1],
      ["topic:ko:default:주제추론", 1],
      ["title:ko:default:제목추론", 1],
      ["underlined_inference:ko:default:함축의미추론", 1],
      ["writing:na:default:서술형영작", 1],
    ]),
  },
  {
    slug: "aingka_core",
    name: "아잉카 핵심 변형",
    description: "일치·주제·제목·요지·빈칸·어법·어휘·순서·삽입·무관",
    config: withCounts([
      ["content_true:en:default:내용일치", 1],
      ["content_false:en:default:내용불일치", 1],
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
];
