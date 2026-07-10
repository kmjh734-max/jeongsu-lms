import { emptyCounts } from "@/lib/question-generator/question-types";
import type { PresetConfig } from "@/lib/question-generator/types";

function withCounts(entries: Array<[string, number]>): PresetConfig {
  const counts = emptyCounts();
  for (const [key, n] of entries) {
    if (key in counts) counts[key] = n;
  }
  return { counts };
}

/** 우작 11단계 스타일 기본 프리셋 */
export const SYSTEM_PRESETS: Array<{
  slug: string;
  name: string;
  description: string;
  config: PresetConfig;
}> = [
  {
    slug: "woojack_core",
    name: "11단계 핵심 세트",
    description:
      "내용불일치·양자택일·문장삽입·어법·어휘·빈칸·순서·주제·영작 (지문 1개 기준)",
    config: withCounts([
      ["content_false:ko:default", 1],
      ["grammar:na:default:binary", 1],
      ["sentence_insertion:na:default", 1],
      ["grammar:na:default:underline", 1],
      ["vocabulary:na:default", 1],
      ["summary_short:na:default", 1],
      ["order:na:default", 1],
      ["topic:ko:default", 1],
      ["sentence_blank:en:default", 1],
      ["writing:na:default", 1],
    ]),
  },
  {
    slug: "woojack_objective",
    name: "객관식 집중",
    description: "내용·흐름·어법·어휘·주제·빈칸 객관식",
    config: withCounts([
      ["content_false:ko:default", 1],
      ["sentence_insertion:na:default", 1],
      ["irrelevant_sentence:na:default", 1],
      ["grammar:na:default:underline", 1],
      ["vocabulary:na:default", 1],
      ["order:na:default", 1],
      ["topic:ko:default", 1],
      ["title:ko:default", 1],
      ["sentence_blank:en:default", 1],
    ]),
  },
  {
    slug: "woojack_grammar_vocab",
    name: "어법·어휘 집중",
    description: "양자택일·어법·어휘·고쳐쓰기",
    config: withCounts([
      ["grammar:na:default:binary", 1],
      ["grammar:na:default:underline", 2],
      ["vocabulary:na:default", 2],
      ["grammar:na:default:rewrite", 1],
    ]),
  },
  {
    slug: "woojack_writing",
    name: "서술·빈칸 집중",
    description: "본문빈칸·영작",
    config: withCounts([
      ["summary_short:na:default", 2],
      ["writing:na:default", 2],
      ["grammar:na:default:rewrite", 1],
    ]),
  },
];
