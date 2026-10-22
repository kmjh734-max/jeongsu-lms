/**
 * 선생님이 분석지에서 문장 표시를 직접 고친다(2026-10-22 시안 승인).
 *
 * 화면에 보이는 표시는 저장본을 읽어 표기 규칙(analysis-markup-roles.ts)을 거친 것이다. 그래서 고칠 때는
 * 「보이는 그대로」를 그 문장의 저장본으로 삼고 그 위에 고친 것을 얹는다. 고친 항목에는 edited를 달아
 * 코드 검사가 다시 바꾸지 않게 하고, 처음 고치기 전 표시는 originalMarkup에 남겨 「원래대로」에 쓴다.
 */
import {
  canonicalMarkupLabel,
  readAnalysisMarkup,
  type AnalysisSentenceMarkup,
  type MarkupRoleCode,
  type MarkupRoleLevel,
} from "@/lib/lesson-materials/analysis-markup";
import type { AnalysisSentence } from "@/lib/lesson-materials/generate-analysis-report";

export type MarkupEdit =
  | { kind: "role"; i: number; role: MarkupRoleCode | null; level: MarkupRoleLevel }
  | { kind: "note"; i: number; label: string | null }
  | { kind: "point"; i: number; explanation: string | null }
  | { kind: "trans"; text: string }
  | { kind: "reset" };

export const plainSentenceText = (s: AnalysisSentence) => s.enChunks.map((c) => c.text).join(" ").trim();

/** 고친 문장을 돌려준다. 고칠 수 없으면(표시가 없는 예전 문장 등) null. */
export function applyMarkupEdit(sentence: AnalysisSentence, edit: MarkupEdit): AnalysisSentence | null {
  if (edit.kind === "reset") {
    if (!sentence.originalMarkup) return null;
    const { teacherEdited: _t, originalMarkup, ...rest } = sentence;
    void _t;
    return { ...rest, markup: originalMarkup };
  }
  const shown = readAnalysisMarkup(sentence.markup, plainSentenceText(sentence));
  if (!shown) return null;
  const m: AnalysisSentenceMarkup = JSON.parse(JSON.stringify(shown));

  if (edit.kind === "role") {
    const r = m.roles[edit.i];
    if (!r) return null;
    if (edit.role === null) m.roles.splice(edit.i, 1);
    else m.roles[edit.i] = { ...r, role: edit.role, level: edit.level, edited: true };
  } else if (edit.kind === "note") {
    const n = m.notes[edit.i];
    if (!n) return null;
    if (edit.label === null) m.notes.splice(edit.i, 1);
    else {
      const label = canonicalMarkupLabel(edit.label);
      if (!label) return null;
      m.notes[edit.i] = { ...n, label, edited: true };
    }
  } else if (edit.kind === "point") {
    const p = m.points[edit.i];
    if (!p) return null;
    if (edit.explanation === null) {
      m.points.splice(edit.i, 1);
      m.points.forEach((x, k) => (x.index = k + 1));
    } else {
      const text = edit.explanation.replace(/\s+/g, " ").trim();
      if (!text) return null;
      m.points[edit.i] = { ...p, explanation: text, edited: true };
    }
  } else if (edit.kind === "trans") {
    const text = edit.text.replace(/\s+/g, " ").trim();
    if (!text) return null;
    m.translation = text;
    m.translationEdited = true;
  }

  return {
    ...sentence,
    markup: m,
    teacherEdited: true,
    originalMarkup: sentence.originalMarkup ?? sentence.markup,
  };
}
