import {
  buildDifficultyPromptBlock,
  buildDifficultyRequirementBlock,
  type ListeningDifficultyMode,
} from "@/lib/listening/exam-difficulty";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import { gradeLevelShort, type ListeningGradeLevel } from "@/lib/listening/grade-level";
import {
  getCommonPrompt,
  getCopyrightBlock,
  getJsonOutputSchema,
} from "@/lib/listening/prompts/commonPrompt";
import {
  buildMiddle2TypeOnlyGenerationPrompt,
  getAllMiddle2TypePromptBlocks,
} from "@/lib/listening/prompts/middle2TypePrompts";
import { buildType1OnlyGenerationPrompt } from "@/lib/listening/prompts/type1DescribePrompt";
import { buildType2OnlyGenerationPrompt } from "@/lib/listening/prompts/type2PurchasePrompt";
import { buildType3OnlyGenerationPrompt } from "@/lib/listening/prompts/type3WeatherPrompt";
import { buildType4OnlyGenerationPrompt } from "@/lib/listening/prompts/type4IntentionPrompt";
import { buildType5OnlyGenerationPrompt } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import { buildType6OnlyGenerationPrompt } from "@/lib/listening/prompts/type6TimePrompt";
import { buildType7OnlyGenerationPrompt } from "@/lib/listening/prompts/type7CareerPrompt";
import { buildType8OnlyGenerationPrompt } from "@/lib/listening/prompts/type8EmotionPrompt";
import { buildType9OnlyGenerationPrompt } from "@/lib/listening/prompts/type9ImmediateActionPrompt";
import { buildType10OnlyGenerationPrompt } from "@/lib/listening/prompts/type10MainContentPrompt";
import { buildType11OnlyGenerationPrompt } from "@/lib/listening/prompts/type11TransportPrompt";
import { buildType12OnlyGenerationPrompt } from "@/lib/listening/prompts/type12ReasonPrompt";
import { buildType13OnlyGenerationPrompt } from "@/lib/listening/prompts/type13PlacePrompt";
import { buildType14OnlyGenerationPrompt } from "@/lib/listening/prompts/type14TablePrompt";
import { buildType15OnlyGenerationPrompt } from "@/lib/listening/prompts/type15RequestPrompt";
import { buildType16OnlyGenerationPrompt } from "@/lib/listening/prompts/type16SuggestionPrompt";
import { buildType17OnlyGenerationPrompt } from "@/lib/listening/prompts/type17SchedulePrompt";
import { buildType18OnlyGenerationPrompt } from "@/lib/listening/prompts/type18JobPrompt";
import { buildType19OnlyGenerationPrompt } from "@/lib/listening/prompts/type19ResponsePrompt";
import { buildType20OnlyGenerationPrompt } from "@/lib/listening/prompts/type20ResponsePrompt";
import { getAllTypePromptBlocks } from "@/lib/listening/prompts/typePrompts";
import { QUALITY_CHECK_CRITERIA } from "@/lib/listening/prompts/qualityCheckPrompt";

/**
 * 단일 유형 또는 여러 유형 시험 모드 최종 프롬프트
 */
export function buildListeningExamPrompt(
  types: ExamTypeTemplate[],
  difficultyMode: ListeningDifficultyMode,
  grade: ListeningGradeLevel = "middle1"
): string {
  if (grade === "middle2") {
    if (types.length === 1) {
      return buildMiddle2TypeOnlyGenerationPrompt(types[0]!.id);
    }
    const typeIds = types.map((t) => t.id);
    const difficultyBlock = buildDifficultyPromptBlock(types, difficultyMode, grade);
    return `
${getCommonPrompt(grade)}

${getCopyrightBlock(grade)}

이번 요청: 중2 영어듣기 ${types.length}개 유형을 순서대로 각 1문항씩 생성한다.
order_index는 유형 번호와 반드시 일치.

난이도 (유형별):
${difficultyBlock}

${getAllMiddle2TypePromptBlocks(typeIds)}

생성 후 스스로 검수:
${QUALITY_CHECK_CRITERIA}

${getJsonOutputSchema(grade)}
`.trim();
  }

  if (types.length === 1 && types[0]!.id === 1) {
    return buildType1OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 2) {
    return buildType2OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 3) {
    return buildType3OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 4) {
    return buildType4OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 5) {
    return buildType5OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 6) {
    return buildType6OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 7) {
    return buildType7OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 8) {
    return buildType8OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 9) {
    return buildType9OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 10) {
    return buildType10OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 11) {
    return buildType11OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 12) {
    return buildType12OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 13) {
    return buildType13OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 14) {
    return buildType14OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 15) {
    return buildType15OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 16) {
    return buildType16OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 17) {
    return buildType17OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 18) {
    return buildType18OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 19) {
    return buildType19OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 20) {
    return buildType20OnlyGenerationPrompt();
  }

  const typeIds = types.map((t) => t.id);
  const difficultyBlock = buildDifficultyPromptBlock(types, difficultyMode, grade);

  return `
${getCommonPrompt(grade)}

${getCopyrightBlock(grade)}

이번 요청: 아래 ${types.length}개 유형을 순서대로 각 1문항씩 생성한다.
order_index는 유형 번호와 반드시 일치 (예: 1번 유형 → order_index 1).

난이도 (유형별):
${difficultyBlock}

${getAllTypePromptBlocks(typeIds)}

생성 후 스스로 검수:
${QUALITY_CHECK_CRITERIA}

${getJsonOutputSchema(grade)}
`.trim();
}

/** 단일 유형 1문항 재생성 */
export function buildListeningSingleTypePrompt(
  type: ExamTypeTemplate,
  difficultyMode: ListeningDifficultyMode,
  previousProblems?: string[],
  grade: ListeningGradeLevel = "middle1"
): string {
  const difficultyBlock = buildDifficultyRequirementBlock(
    type,
    difficultyMode,
    grade
  );

  let core: string;
  if (grade === "middle2") {
    core = buildMiddle2TypeOnlyGenerationPrompt(type.id, previousProblems);
  } else if (type.id === 1) {
    core = buildType1OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 2) {
    core = buildType2OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 3) {
    core = buildType3OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 4) {
    core = buildType4OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 5) {
    core = buildType5OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 6) {
    core = buildType6OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 7) {
    core = buildType7OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 8) {
    core = buildType8OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 9) {
    core = buildType9OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 10) {
    core = buildType10OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 11) {
    core = buildType11OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 12) {
    core = buildType12OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 13) {
    core = buildType13OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 14) {
    core = buildType14OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 15) {
    core = buildType15OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 16) {
    core = buildType16OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 17) {
    core = buildType17OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 18) {
    core = buildType18OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 19) {
    core = buildType19OnlyGenerationPrompt(previousProblems);
  } else if (type.id === 20) {
    core = buildType20OnlyGenerationPrompt(previousProblems);
  } else {
    const avoid =
      previousProblems && previousProblems.length > 0
        ? `\n이전 생성에서 발견된 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n같은 상황·문장·선택지 패턴을 반복하지 말 것.\n`
        : "";
    core = `${buildListeningExamPrompt([type], difficultyMode, grade)}${avoid}`;
  }

  return `${core}\n\n${difficultyBlock}`;
}

/** 자유 생성 모드 (유형 미지정) */
export function buildListeningFreePrompt(
  count: number,
  grade: ListeningGradeLevel = "middle1"
): string {
  return `
${getCommonPrompt(grade)}

${getCopyrightBlock(grade)}

${gradeLevelShort(grade)} 듣기 문항 ${count}개를 자유 형식으로 생성한다.
각 문항은 서로 다른 일상 상황이어야 한다.
order_index는 1부터 순서대로.

${QUALITY_CHECK_CRITERIA}

${getJsonOutputSchema(grade)}
`.trim();
}
