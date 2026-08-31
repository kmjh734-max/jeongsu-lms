import { defaultDisplaySettings } from "@/lib/lesson-materials/display-settings";
import type {
  LineInterpretationDisplaySettings,
  LineInterpretationResult,
} from "@/lib/lesson-materials/types";

export interface LessonMaterialProjectContent {
  lineInterpretation?: LineInterpretationResult | null;
  displaySettings?: LineInterpretationDisplaySettings;
  passageTitleHint?: string;
}

export function parseProjectContent(raw: unknown): LessonMaterialProjectContent {
  if (!raw || typeof raw !== "object") {
    return { displaySettings: defaultDisplaySettings() };
  }
  const obj = raw as Record<string, unknown>;
  const displaySettings =
    obj.displaySettings && typeof obj.displaySettings === "object"
      ? ({ ...defaultDisplaySettings(), ...obj.displaySettings } as LineInterpretationDisplaySettings)
      : defaultDisplaySettings();

  return {
    lineInterpretation:
      obj.lineInterpretation && typeof obj.lineInterpretation === "object"
        ? (obj.lineInterpretation as LineInterpretationResult)
        : null,
    displaySettings,
    passageTitleHint:
      typeof obj.passageTitleHint === "string" ? obj.passageTitleHint : "",
  };
}

export function mergeProjectContent(
  current: LessonMaterialProjectContent,
  patch: Partial<LessonMaterialProjectContent>
): LessonMaterialProjectContent {
  return {
    ...current,
    ...patch,
    displaySettings: patch.displaySettings
      ? {
          ...(current.displaySettings ?? defaultDisplaySettings()),
          ...patch.displaySettings,
        }
      : current.displaySettings,
  };
}

export function defaultProjectTitle(passage: string): string {
  const trimmed = passage.trim();
  if (!trimmed) return "새 수업자료";
  const firstLine = trimmed.split(/\n/)[0]?.trim() ?? trimmed;
  const snippet = firstLine.slice(0, 48);
  return snippet.length < firstLine.length ? `${snippet}…` : snippet;
}
