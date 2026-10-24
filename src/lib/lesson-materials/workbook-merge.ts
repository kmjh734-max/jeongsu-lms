import {
  isTbWorkbookType,
  sortWorkbookTypesByPrintOrder,
  type WorkbookData,
  type WorkbookTypeId,
} from "@/lib/lesson-materials/workbook-types";

/**
 * 만들어 둔 워크북에 유형을 더한다(선생님 2026-10-24).
 *
 * base는 저장된 워크북, fresh는 더할 유형만 골라 새로 만든 워크북이다. fresh에서 더한 유형의
 * 문항만 가져오고, 나머지(제목·단 수·지문 배치·이미 있는 유형의 문항·고친 내용)는 base를 그대로 둔다.
 * 항목 차례를 손으로 바꿔 둔 워크북(typeOrder)이면 새 유형은 맨 뒤에 붙는다(끌어서 옮길 수 있다).
 */
export function mergeAddedWorkbookTypes(
  base: WorkbookData,
  fresh: WorkbookData,
  added: WorkbookTypeId[]
): WorkbookData {
  const add = new Set(added);
  const selectedTypes = sortWorkbookTypesByPrintOrder([
    ...new Set<WorkbookTypeId>([...base.selectedTypes, ...added]),
  ]);
  const typeOrder = base.typeOrder?.length
    ? [...base.typeOrder, ...selectedTypes.filter((t) => !base.typeOrder!.includes(t))]
    : undefined;
  const out: WorkbookData = { ...base, selectedTypes, typeOrder };

  if (add.has("tf")) {
    out.sections = fresh.sections ?? [];
    out.tfOptions = fresh.tfOptions ?? base.tfOptions;
  }
  if (add.has("blank_fill")) {
    out.blankSections = fresh.blankSections ?? [];
    out.blankOptions = fresh.blankOptions ?? base.blankOptions;
  }
  // 어법 선택·수정은 같은 재료(어법 선택 결과)를 쓴다. 둘 중 하나를 더하면 재료도 새 것으로 둔다.
  if (add.has("grammar_choice") || add.has("grammar_fix")) {
    if (fresh.grammarChoiceSections?.length || !base.grammarChoiceSections?.length) {
      out.grammarChoiceSections = fresh.grammarChoiceSections ?? [];
    }
    if (add.has("grammar_choice")) out.grammarChoiceSkipped = fresh.grammarChoiceSkipped ?? [];
    if (add.has("grammar_fix")) {
      out.grammarFixSections = fresh.grammarFixSections ?? [];
      out.grammarFixSkipped = fresh.grammarFixSkipped ?? [];
      out.grammarFixOptions = fresh.grammarFixOptions ?? base.grammarFixOptions;
    }
  }
  if (add.has("vocab_choice") || add.has("vocab_fix")) {
    if (fresh.vocabChoiceSections?.length || !base.vocabChoiceSections?.length) {
      out.vocabChoiceSections = fresh.vocabChoiceSections ?? [];
      out.vocabWordLevel = fresh.vocabWordLevel ?? base.vocabWordLevel;
    }
    if (add.has("vocab_choice")) out.vocabChoiceSkipped = fresh.vocabChoiceSkipped ?? [];
    if (add.has("vocab_fix")) {
      out.vocabFixSections = fresh.vocabFixSections ?? [];
      out.vocabFixSkipped = fresh.vocabFixSkipped ?? [];
      out.vocabFixOptions = fresh.vocabFixOptions ?? base.vocabFixOptions;
    }
  }
  if (add.has("sentence_order")) {
    out.sentenceOrderQuestions = fresh.sentenceOrderQuestions ?? [];
    out.sentenceOrderSkipped = fresh.sentenceOrderSkipped ?? [];
  }
  if (add.has("one_line_ko")) {
    out.lineTranslationSections = fresh.lineTranslationSections ?? [];
    out.lineTranslationSkipped = fresh.lineTranslationSkipped ?? [];
  }
  if (add.has("full_en_writing")) {
    out.fullEnWritingSections = fresh.fullEnWritingSections ?? [];
    out.fullEnWritingSkipped = fresh.fullEnWritingSkipped ?? [];
  }
  if (add.has("word_order_writing")) {
    out.wordOrderWritingSections = fresh.wordOrderWritingSections ?? [];
    out.wordOrderWritingSkipped = fresh.wordOrderWritingSkipped ?? [];
  }
  if (add.has("key_word_order")) {
    out.keyWordOrderSections = fresh.keyWordOrderSections ?? [];
  }
  const tbAdded = added.filter(isTbWorkbookType);
  if (tbAdded.length) {
    const tbSections = { ...base.tbSections };
    const tbSkipped = { ...base.tbSkipped };
    for (const t of tbAdded) {
      if (t === "tb_vocab_exam") {
        out.vocabExam = fresh.vocabExam ?? null;
      } else {
        tbSections[t] = fresh.tbSections?.[t] ?? [];
      }
      tbSkipped[t] = fresh.tbSkipped?.[t] ?? [];
    }
    out.tbSections = tbSections;
    out.tbSkipped = tbSkipped;
  }
  return out;
}

/**
 * 유형 추가 창에서 「이미 있음」으로 막을 유형. 해석 적기는 문장마다(one_line_ko)와
 * 끊어 읽기(tb_chunk_line)가 한 칸이라, 어느 쪽이 있어도 해석 적기 칸을 막는다.
 */
export function workbookExistingTypesForAdd(selected: WorkbookTypeId[]): Set<WorkbookTypeId> {
  const out = new Set<WorkbookTypeId>(selected);
  if (out.has("tb_chunk_line")) out.add("one_line_ko");
  return out;
}
