import { proposeChunksFromText } from "@/lib/exam-prep/stage8-types";
import {
  parseWritingCues,
  parseWritingSegments,
  composeSegmentsToText,
} from "@/lib/exam-prep/stage10-types";
import { formatWritingSlotLine } from "@/lib/exam-prep/guided-writing";
import { parseSentenceIds } from "@/lib/exam-prep/stage9-types";
import { WORKBOOK_10_STEPS } from "@/lib/exam-prep/presets";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

export type PrintBlankRow = {
  id: string;
  sentence_id: string;
  blank_order: number;
  answer_text: string;
  korean_start?: number | null;
  korean_end?: number | null;
  english_start?: number | null;
  english_end?: number | null;
  selected_text?: string | null;
  cue_words?: unknown;
  choice_options?: unknown;
  writing_segments?: unknown;
  writing_cues?: unknown;
  sentence_ids?: unknown;
  display_label?: string | null;
  reorder_chunks?: unknown;
  is_error?: boolean | null;
  stage7_display?: string | null;
  question_category?: string | null;
};

export type PrintItem = {
  order: number;
  english?: string;
  korean?: string;
  englishWithBlanks?: string;
  koreanWithBlanks?: string;
  cues?: string[];
  optionsLine?: string;
  chunks?: string[];
  label?: string;
  writingLines?: string[];
  answerLines?: string[];
};

export type PrintStageBlock = {
  stageNumber: number;
  title: string;
  prompt: string;
  items: PrintItem[];
};

function underline(len: number) {
  return "_".repeat(Math.max(6, Math.min(18, len + 2)));
}

function withEnglishBlanks(
  english: string,
  blanks: Array<{ english_start: number; english_end: number; answer_text: string }>
) {
  const sorted = [...blanks].sort((a, b) => a.english_start - b.english_start);
  let out = "";
  let cursor = 0;
  for (const b of sorted) {
    if (b.english_start > cursor) out += english.slice(cursor, b.english_start);
    out += underline(Math.max(4, b.answer_text.length));
    cursor = b.english_end;
  }
  if (cursor < english.length) out += english.slice(cursor);
  return out || english;
}

function withVerbCues(
  english: string,
  blanks: Array<{ english_start: number; english_end: number; cue_words: unknown }>
) {
  const sorted = [...blanks].sort((a, b) => a.english_start - b.english_start);
  let out = "";
  let cursor = 0;
  for (const b of sorted) {
    if (b.english_start > cursor) out += english.slice(cursor, b.english_start);
    const cues = Array.isArray(b.cue_words)
      ? b.cue_words.map(String).filter(Boolean)
      : [];
    out += cues.length > 0 ? `(${cues.join(", ")})` : "________";
    cursor = b.english_end;
  }
  if (cursor < english.length) out += english.slice(cursor);
  return out || english;
}

function withChoiceBrackets(
  english: string,
  blanks: Array<{
    english_start: number;
    english_end: number;
    choice_options: unknown;
  }>
) {
  const sorted = [...blanks].sort((a, b) => a.english_start - b.english_start);
  let out = "";
  let cursor = 0;
  for (const b of sorted) {
    if (b.english_start > cursor) out += english.slice(cursor, b.english_start);
    const opts = Array.isArray(b.choice_options)
      ? b.choice_options
          .map((o) =>
            o && typeof o === "object"
              ? String((o as { text?: string }).text ?? "")
              : ""
          )
          .filter(Boolean)
      : [];
    out += opts.length > 0 ? `[${opts.join(" / ")}]` : "________";
    cursor = b.english_end;
  }
  if (cursor < english.length) out += english.slice(cursor);
  return out || english;
}

export function buildPrintStagesFromPassage(input: {
  sentences: ExamPassageSentence[];
  blanksByStage: Record<number, PrintBlankRow[]>;
  stage7DisplayBySentence?: Record<string, string>;
  showAnswers?: boolean;
}): PrintStageBlock[] {
  const ordered = [...input.sentences].sort(
    (a, b) => a.sentence_order - b.sentence_order
  );
  const byId = new Map(ordered.map((s) => [s.id, s]));
  const showAnswers = Boolean(input.showAnswers);
  const stages: PrintStageBlock[] = [];

  // 1
  {
    const preset = WORKBOOK_10_STEPS[0]!;
    stages.push({
      stageNumber: 1,
      title: preset.shortLabel,
      prompt: preset.prompt,
      items: ordered.map((s, i) => ({
        order: i + 1,
        english: s.english_text,
        korean: s.korean_text ?? "",
      })),
    });
  }

  // 2 영어 빈칸 (data stage 3)
  {
    const preset = WORKBOOK_10_STEPS[1]!;
    const blanks = input.blanksByStage[3] ?? [];
    const bySent = new Map<string, PrintBlankRow[]>();
    for (const b of blanks) {
      const list = bySent.get(b.sentence_id) ?? [];
      list.push(b);
      bySent.set(b.sentence_id, list);
    }
    const items: PrintItem[] = [];
    let order = 1;
    for (const s of ordered) {
      const list = bySent.get(s.id);
      if (!list?.length) continue;
      items.push({
        order: order++,
        korean: s.korean_text ?? "",
        englishWithBlanks: withEnglishBlanks(
          s.english_text,
          list.map((b) => ({
            english_start: Number(b.english_start) || 0,
            english_end: Number(b.english_end) || 0,
            answer_text: b.answer_text,
          }))
        ),
        answerLines: showAnswers
          ? list.map((b) => b.answer_text).filter(Boolean)
          : undefined,
      });
    }
    if (items.length > 0) {
      stages.push({
        stageNumber: 2,
        title: preset.shortLabel,
        prompt: preset.prompt,
        items,
      });
    }
  }

  // 3 해석 연습
  {
    const preset = WORKBOOK_10_STEPS[2]!;
    stages.push({
      stageNumber: 3,
      title: preset.shortLabel,
      prompt: preset.prompt,
      items: ordered.map((s, i) => ({
        order: i + 1,
        english: s.english_text,
        answerLines: showAnswers && s.korean_text ? [s.korean_text] : undefined,
      })),
    });
  }

  // 4 동사형 (data stage 5)
  {
    const preset = WORKBOOK_10_STEPS[3]!;
    const blanks = input.blanksByStage[5] ?? [];
    const bySent = new Map<string, PrintBlankRow[]>();
    for (const b of blanks) {
      const list = bySent.get(b.sentence_id) ?? [];
      list.push(b);
      bySent.set(b.sentence_id, list);
    }
    const items: PrintItem[] = [];
    let order = 1;
    for (const s of ordered) {
      const list = bySent.get(s.id);
      if (!list?.length) continue;
      items.push({
        order: order++,
        korean: s.korean_text ?? "",
        englishWithBlanks: withVerbCues(
          s.english_text,
          list.map((b) => ({
            english_start: Number(b.english_start) || 0,
            english_end: Number(b.english_end) || 0,
            cue_words: b.cue_words,
          }))
        ),
        answerLines: showAnswers
          ? list.map((b) => b.answer_text).filter(Boolean)
          : undefined,
      });
    }
    if (items.length > 0) {
      stages.push({
        stageNumber: 4,
        title: preset.shortLabel,
        prompt: preset.prompt,
        items,
      });
    }
  }

  // 5 어법 / 6 어휘 (data stage 6, question_category)
  for (const { workbookIdx, category } of [
    { workbookIdx: 4, category: "grammar" as const },
    { workbookIdx: 5, category: "vocabulary" as const },
  ]) {
    const preset = WORKBOOK_10_STEPS[workbookIdx]!;
    const blanks = (input.blanksByStage[6] ?? []).filter((b) => {
      const cat = String(b.question_category || "grammar");
      return cat === category;
    });
    const bySent = new Map<string, PrintBlankRow[]>();
    for (const b of blanks) {
      const list = bySent.get(b.sentence_id) ?? [];
      list.push(b);
      bySent.set(b.sentence_id, list);
    }
    const items: PrintItem[] = [];
    let order = 1;
    for (const s of ordered) {
      const list = bySent.get(s.id);
      if (!list?.length) continue;
      items.push({
        order: order++,
        korean: s.korean_text ?? "",
        englishWithBlanks: withChoiceBrackets(
          s.english_text,
          list.map((b) => ({
            english_start: Number(b.english_start) || 0,
            english_end: Number(b.english_end) || 0,
            choice_options: b.choice_options,
          }))
        ),
        answerLines: showAnswers
          ? list.map((b) => b.answer_text).filter(Boolean)
          : undefined,
      });
    }
    if (items.length > 0) {
      stages.push({
        stageNumber: preset.number,
        title: preset.shortLabel,
        prompt: preset.prompt,
        items,
      });
    }
  }

  // 7
  {
    const preset = WORKBOOK_10_STEPS[6]!;
    const blanks = (input.blanksByStage[7] ?? []).filter((b) => b.is_error);
    const display =
      ordered
        .map((s) =>
          input.stage7DisplayBySentence?.[s.id] || s.english_text
        )
        .join(" ") || ordered.map((s) => s.english_text).join(" ");
    stages.push({
      stageNumber: 7,
      title: preset.shortLabel,
      prompt: preset.prompt,
      items: [
        {
          order: 1,
          english: display,
          answerLines: showAnswers
            ? blanks.map(
                (b) =>
                  `${b.selected_text || "…"} → ${b.answer_text}`
              )
            : ["(1) __________ → __________", "(2) __________ → __________", "(3) __________ → __________"],
        },
      ],
    });
  }

  // 8
  {
    const preset = WORKBOOK_10_STEPS[7]!;
    const blanks = input.blanksByStage[8] ?? [];
    const items: PrintItem[] = [];
    let order = 1;
    for (const b of blanks) {
      const s = byId.get(b.sentence_id);
      if (!s) continue;
      const start = Number(b.english_start) || 0;
      const end = Number(b.english_end) || 0;
      const mid = s.english_text.slice(start, end) || b.answer_text;
      const chunks = Array.isArray(b.reorder_chunks)
        ? b.reorder_chunks
            .map((c) =>
              c && typeof c === "object"
                ? String((c as { chunkText?: string }).chunkText ?? "")
                : ""
            )
            .filter(Boolean)
        : proposeChunksFromText(mid).map((c) => c.chunkText);
      items.push({
        order: order++,
        korean: s.korean_text ?? "",
        english: `${s.english_text.slice(0, start)}[ ${chunks.join(" / ")} ]${s.english_text.slice(end)}`,
        chunks,
        answerLines: showAnswers ? [mid] : undefined,
      });
    }
    if (items.length > 0) {
      stages.push({
        stageNumber: 8,
        title: preset.shortLabel,
        prompt: preset.prompt,
        items,
      });
    }
  }

  // 9 — 인천 PDF: 답란 (   )-(   )-(   ) + (A)(B)(C) 문단(라벨 순, 정답 순서 아님)
  {
    const preset = WORKBOOK_10_STEPS[8]!;
    const raw = [...(input.blanksByStage[9] ?? [])];
    if (raw.length >= 2) {
      const byLabel = [...raw].sort((a, b) =>
        String(a.display_label ?? "").localeCompare(
          String(b.display_label ?? ""),
          "en"
        )
      );
      const byCorrect = [...raw].sort((a, b) => a.blank_order - b.blank_order);
      const answerBlank = byLabel.map(() => "(   )").join(" - ");
      const correctLine = byCorrect
        .map((b) => `(${String(b.display_label ?? "?").trim() || "?"})`)
        .join(" - ");
      const items: PrintItem[] = [
        {
          order: 0,
          writingLines: [answerBlank],
          answerLines: showAnswers ? [correctLine] : undefined,
        },
      ];
      byLabel.forEach((b, i) => {
        const ids = parseSentenceIds(b.sentence_ids);
        const text = ids
          .map((id) => byId.get(id)?.english_text ?? "")
          .filter(Boolean)
          .join(" ");
        const lab = String(b.display_label ?? String.fromCharCode(65 + i)).trim();
        items.push({
          order: i + 1,
          label: `(${lab})`,
          english: text,
        });
      });
      stages.push({
        stageNumber: 9,
        title: preset.shortLabel,
        prompt: preset.prompt,
        items,
      });
    }
  }

  // 10
  {
    const preset = WORKBOOK_10_STEPS[9]!;
    const blanks = [...(input.blanksByStage[10] ?? [])].sort(
      (a, b) => a.blank_order - b.blank_order
    );
    const items: PrintItem[] = [];
    let order = 1;
    for (const b of blanks) {
      const ids = parseSentenceIds(b.sentence_ids);
      const primary = byId.get(ids[0] || b.sentence_id);
      const cues = parseWritingCues(b.writing_cues).map((c) => c.cueText);
      const segs = parseWritingSegments(b.writing_segments);
      const writingLines =
        segs.length > 0 ? [formatWritingSlotLine(segs)] : [underline(40)];
      items.push({
        order: order++,
        korean: primary?.korean_text || String(b.selected_text ?? ""),
        cues,
        writingLines,
        answerLines: showAnswers
          ? [composeSegmentsToText(segs) || b.answer_text]
          : undefined,
      });
    }
    if (items.length > 0) {
      stages.push({
        stageNumber: 10,
        title: preset.shortLabel,
        prompt: preset.prompt,
        items,
      });
    }
  }

  return stages;
}
