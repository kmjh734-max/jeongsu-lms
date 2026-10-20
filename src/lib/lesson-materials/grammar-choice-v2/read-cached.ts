/**
 * 저장해 둔 워크북 어법 선택(V2)만 읽는다 — 모델을 부르지 않는다. 테스트 교재가 쓴다.
 * 만들 때(generate.ts)와 같은 원문 잇기·열쇠로 찾으므로, 원문이나 엔진 버전이 바뀌었으면 없다고 본다.
 */
import { buildV2CacheKey, getCachedGrammarChoiceV2, type StoredGrammarChoiceV2Cache } from "@/lib/lesson-materials/grammar-choice-v2/cache";
import {
  resolveGrammarChoiceEngineVersion,
  resolveV2AnalyzerEffort,
  resolveV2AnalyzerModel,
  resolveV2AuditorEffort,
  resolveV2AuditorModel,
} from "@/lib/lesson-materials/grammar-choice-v2/generate";
import { hashPassage } from "@/lib/lesson-materials/grammar-choice-v2/pipeline";
import { joinSourceLines } from "@/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import { joinWorkbookPassageLines, type WorkbookGrammarChoiceSection } from "@/lib/lesson-materials/workbook-types";

/** englishLines: lesson_material_items.english_text 차례 그대로(빈 줄 포함해도 된다) */
export function readCachedGrammarChoiceV2(
  cache: StoredGrammarChoiceV2Cache | null | undefined,
  projectId: string,
  englishLines: string[]
): WorkbookGrammarChoiceSection | null {
  if (!cache || resolveGrammarChoiceEngineVersion().version !== "v2") return null;
  const lines = englishLines.filter((s) => s.trim());
  const passage = joinSourceLines(lines) || joinWorkbookPassageLines(lines);
  if (!passage.trim()) return null;
  const key = buildV2CacheKey({
    passageHash: hashPassage(passage),
    analyzerModel: resolveV2AnalyzerModel(),
    analyzerReasoningEffort: resolveV2AnalyzerEffort(),
    auditorModel: resolveV2AuditorModel(),
    auditorReasoningEffort: resolveV2AuditorEffort(),
  });
  return getCachedGrammarChoiceV2(cache, projectId, key)?.section ?? null;
}
