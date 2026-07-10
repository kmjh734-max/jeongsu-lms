import { emptyCounts } from "@/lib/question-generator/question-types";
import type { PresetConfig } from "@/lib/question-generator/types";

function withCounts(
  entries: Array<[string, number]>
): PresetConfig {
  const counts = emptyCounts();
  for (const [key, n] of entries) {
    if (key in counts) counts[key] = n;
  }
  return { counts };
}

/** 시스템 기본 프리셋 (DB seed와 동일 키 사용) */
export const SYSTEM_PRESETS: Array<{
  slug: string;
  name: string;
  description: string;
  config: PresetConfig;
}> = [
  {
    slug: "basic_set",
    name: "기본 종합세트",
    description: "제목·주제·불일치·빈칸·어법·어휘·영작 중심 7문항",
    config: withCounts([
      ["title:en:high", 1],
      ["topic:en:high", 1],
      ["content_false:ko:high", 1],
      ["sentence_blank:en:mid", 1],
      ["grammar:na:mid", 1],
      ["vocabulary:na:mid", 1],
      ["writing:na:mid", 1],
    ]),
  },
  {
    slug: "naesin_set",
    name: "내신 종합세트",
    description: "내신 대비 객관식·서술형 혼합 13문항",
    config: withCounts([
      ["title:en:high", 1],
      ["topic:en:high", 1],
      ["summary_mcq:na:default", 1],
      ["content_true:ko:high", 1],
      ["content_false:ko:high", 1],
      ["order:na:default", 1],
      ["sentence_blank:en:high", 1],
      ["irrelevant_sentence:na:high", 1],
      ["sentence_insertion:na:high", 1],
      ["grammar:na:high", 1],
      ["vocabulary:na:high", 1],
      ["summary_short:na:default", 1],
      ["writing:na:high", 1],
    ]),
  },
  {
    slug: "grammar_vocab_focus",
    name: "어법·어휘 집중",
    description: "어법·어휘 난이도별 집중 8문항",
    config: withCounts([
      ["grammar:na:low", 1],
      ["grammar:na:mid", 2],
      ["grammar:na:high", 1],
      ["vocabulary:na:low", 1],
      ["vocabulary:na:mid", 2],
      ["vocabulary:na:high", 1],
    ]),
  },
  {
    slug: "writing_focus",
    name: "서술형 집중",
    description: "요약·영작·제목·주제 서술형 6문항",
    config: withCounts([
      ["summary_short:na:default", 1],
      ["writing:na:mid", 2],
      ["writing:na:high", 1],
      ["short_title:na:default", 1],
      ["short_topic:na:default", 1],
    ]),
  },
];
