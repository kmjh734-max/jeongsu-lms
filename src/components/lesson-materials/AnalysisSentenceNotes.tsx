"use client";

import { findPhrase, type OnePageContent } from "@/lib/lesson-materials/one-page";

/*
 * 분석지 문장 밑 주석: 지칭·함축의미·바꿔 말하기(선생님 2026-10-20 — 끝에 모으지 말고 그 문장 바로 밑에).
 * 1장 자료 재료(onePageContent)에 든 것이라 값이 들지 않는다. 테스트 교재 분석 자료와 지문 분석서가 같이 쓴다.
 */

export type SentenceNote =
  | { kind: "ref"; surface: string; referent: string; meaningKo: string }
  | { kind: "imp"; expression: string; meaningKo: string; meaningEn: string }
  | { kind: "para"; expression: string; paraphrases: string[] };

/**
 * 분석서 문장(plains)마다 붙일 주석. 분석서 문장 나눔이 1장 자료와 다를 수 있어, 표현이 실제로 든
 * 문장 가운데 재료의 문장 번호에 가장 가까운 문장에 붙인다.
 */
export function sentenceNotesFor(plains: string[], content: OnePageContent | null | undefined): Map<number, SentenceNote[]> {
  const at = new Map<number, SentenceNote[]>();
  if (!content) return at;
  const attach = (si: number, phrase: string, note: SentenceNote) => {
    const hits = plains.map((t, i) => (findPhrase(t, phrase) ? i : -1)).filter((i) => i >= 0);
    if (!hits.length) return;
    const i = hits.sort((x, y) => Math.abs(x - si) - Math.abs(y - si))[0]!;
    at.set(i, [...(at.get(i) ?? []), note]);
  };
  for (const r of content.references ?? []) {
    if (r.surface.trim() && r.referent.trim())
      attach(r.sentenceIndex, r.surface, { kind: "ref", surface: r.surface, referent: r.referent, meaningKo: r.meaningKo });
  }
  for (const m of content.implications ?? []) {
    if (m.expression.trim())
      attach(m.sentenceIndex, m.expression, { kind: "imp", expression: m.expression, meaningKo: m.meaningKo, meaningEn: m.meaningEn });
  }
  for (const x of content.paraphrases ?? []) {
    if (x.expression.trim() && x.paraphrases.length)
      attach(x.sentenceIndex, x.expression, { kind: "para", expression: x.expression, paraphrases: x.paraphrases });
  }
  return at;
}

const KIND_LABEL: Record<SentenceNote["kind"], string> = { ref: "지칭", imp: "함축", para: "바꿔 말하기" };

/** 문장 밑 주석 상자(인쇄에서도 색이 그대로 나오게) */
export function SentenceNotes({ notes, accent = "#5b4bd8" }: { notes: SentenceNote[]; accent?: string }) {
  if (!notes.length) return null;
  return (
    <div
      className="ar-sentence-notes"
      style={{
        margin: "1mm 0 2.4mm 9mm",
        borderLeft: `2pt solid ${accent}`,
        padding: "1mm 0 1mm 2.6mm",
        display: "grid",
        gap: "0.8mm",
        background: "#f7f7fb",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        breakInside: "avoid",
      }}
    >
      {notes.map((n, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "15mm minmax(0,1fr)", gap: "2mm", alignItems: "baseline", fontSize: "8.6pt", lineHeight: 1.45 }}>
          <span style={{ fontSize: "7.5pt", fontWeight: 800, color: accent, letterSpacing: ".04em" }}>{KIND_LABEL[n.kind]}</span>
          <span>
            {n.kind === "ref" ? (
              <>
                <b>{n.surface}</b> → {n.referent}
                {n.meaningKo ? ` · ${n.meaningKo}` : ""}
              </>
            ) : n.kind === "imp" ? (
              <>
                <b>{n.expression}</b> → {n.meaningKo}
                {n.meaningEn ? <span style={{ color: "#6a707c" }}> ({n.meaningEn})</span> : null}
              </>
            ) : (
              <>
                <b>{n.expression}</b> = {n.paraphrases.join(" / ")}
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
