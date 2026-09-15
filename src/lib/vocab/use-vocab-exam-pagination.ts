"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import type { PrintExamQuestion } from "@/lib/vocab/generate-print-test-questions";
import {
  paginateExamPrintFromHeights,
  paginateExamPrintPages,
  type ExamPrintPageSlice,
} from "@/lib/vocab/paginate-exam-print";
import type {
  ExamColumnCount,
  ExamLineSpacing,
} from "@/lib/vocab/vocab-print-exam-config";

function splitExamQuestions(questions: PrintExamQuestion[]) {
  const basic: PrintExamQuestion[] = [];
  const examples: PrintExamQuestion[] = [];
  for (const q of questions) {
    if (q.kind.startsWith("example_")) examples.push(q);
    else basic.push(q);
  }
  return { basic, examples };
}

function measureHeights(
  root: HTMLElement,
  attr: "data-measure-basic" | "data-measure-example",
  list: PrintExamQuestion[],
  fallback: number
): number[] {
  const byNumber = new Map<number, number>();
  root.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => {
    const num = Number(el.getAttribute(attr));
    if (Number.isFinite(num)) byNumber.set(num, el.offsetHeight);
  });
  return list.map((q) => byNumber.get(q.number) ?? fallback);
}

export function useVocabExamPagination(opts: {
  enabled: boolean;
  questions: PrintExamQuestion[];
  size: "a4" | "b5";
  cols: ExamColumnCount;
  rowGapPx: number;
  lineSpacing: ExamLineSpacing;
  /** 글자 크기·제본 여백이 바뀌면 문항 높이·본문 높이가 달라지므로 다시 잰다 */
  fontScale: string;
  bindingMargin: boolean;
  measureRef: React.RefObject<HTMLDivElement | null>;
  probeRef: React.RefObject<HTMLDivElement | null>;
}) {
  const {
    enabled,
    questions,
    size,
    cols,
    rowGapPx,
    lineSpacing,
    fontScale,
    bindingMargin,
    measureRef,
    probeRef,
  } = opts;

  // 글꼴이 늦게 불러와지거나 측정 영역 크기가 바뀌면 다시 잰다
  const [remeasureTick, setRemeasureTick] = useState(0);
  const hasQuestions = questions.length > 0;
  useEffect(() => {
    if (!enabled || !hasQuestions) return;
    let cancelled = false;
    let raf = 0;
    const bump = () => {
      if (cancelled || raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!cancelled) setRemeasureTick((t) => t + 1);
      });
    };
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    fonts?.ready.then(bump).catch(() => {});

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      const lastSize = new Map<Element, string>();
      ro = new ResizeObserver((entries) => {
        let changed = false;
        for (const entry of entries) {
          const r = entry.contentRect;
          const key = `${Math.round(r.width)}x${Math.round(r.height)}`;
          if (lastSize.get(entry.target) !== key) {
            // 첫 관측은 기준값만 기록
            if (lastSize.has(entry.target)) changed = true;
            lastSize.set(entry.target, key);
          }
        }
        if (changed) bump();
      });
      const measureRoot = measureRef.current;
      const bodyZone = probeRef.current?.querySelector<HTMLElement>(
        "[data-exam-body-zone]"
      );
      if (measureRoot) ro.observe(measureRoot);
      if (bodyZone) ro.observe(bodyZone);
    }
    return () => {
      cancelled = true;
      if (raf) window.cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [enabled, hasQuestions, measureRef, probeRef]);

  const { basic, examples } = useMemo(
    () => splitExamQuestions(questions),
    [questions]
  );

  const estimatedPages = useMemo(() => {
    if (!enabled || questions.length === 0) {
      return [{ basic: [], examples: [] }] as ExamPrintPageSlice[];
    }
    return paginateExamPrintPages(questions, size, cols, lineSpacing);
  }, [enabled, questions, size, cols, lineSpacing]);

  const [measuredPages, setMeasuredPages] = useState<ExamPrintPageSlice[] | null>(
    null
  );
  const bodyHeightRef = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setMeasuredPages(null);
      return;
    }
    if (questions.length === 0) {
      setMeasuredPages([{ basic: [], examples: [] }]);
      return;
    }

    const measureRoot = measureRef.current;
    const probe = probeRef.current;
    if (!measureRoot || !probe) return;

    const bodyZone = probe.querySelector<HTMLElement>("[data-exam-body-zone]");
    const bodyH = bodyZone?.clientHeight ?? 0;
    if (bodyH > 0) bodyHeightRef.current = bodyH;
    // 인쇄할 때는 쪽 높이가 줄어든다(globals.css: A4 297→286mm, B5 257→248mm, 빈 쪽 방지).
    // 화면 기준 높이로 나누면 인쇄에서 아래가 넘치므로 그만큼(+여유 1.5mm) 빼고 나눈다.
    const printShrinkPx = (((size === "b5" ? 9 : 11) + 1.5) * 96) / 25.4;
    const maxBodyHeightPx = bodyHeightRef.current - printShrinkPx;
    if (maxBodyHeightPx <= 0) return;

    const basicHeights = measureHeights(
      measureRoot,
      "data-measure-basic",
      basic,
      72
    );
    const exampleHeights = measureHeights(
      measureRoot,
      "data-measure-example",
      examples,
      96
    );

    const next = paginateExamPrintFromHeights(
      basic,
      examples,
      basicHeights,
      exampleHeights,
      maxBodyHeightPx,
      cols,
      rowGapPx
    );

    startTransition(() => {
      setMeasuredPages(next);
    });
  }, [
    enabled,
    questions,
    basic,
    examples,
    size,
    cols,
    rowGapPx,
    lineSpacing,
    fontScale,
    bindingMargin,
    remeasureTick,
    measureRef,
    probeRef,
  ]);

  return {
    pages: measuredPages ?? estimatedPages,
    basic,
    examples,
  };
}
