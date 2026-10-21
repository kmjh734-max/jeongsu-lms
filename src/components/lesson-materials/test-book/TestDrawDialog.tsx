"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import { postJson } from "@/lib/lesson-materials/post-json";
import type {
  loadDrawProjectsAction,
  prepareWorkbookExtrasAction,
} from "@/lib/lesson-materials/test-book-actions";
import {
  BASIC_TEST_BOOK_TYPES,
  DEFAULT_VOCAB_EXAM,
  buildTestSheet,
  buildVocabExam,
  isTestBookProjectReady,
  testBookTypeLabel,
  type BlankMode,
  type LineMode,
  type TestBookProjectInput,
  type TestBookTypeKey,
  type TestLevel,
  type VocabExamOptions,
  type WritingScope,
} from "@/lib/lesson-materials/test-book";
import {
  LevelSwitch,
  LineModeSwitch,
  TypeChecks,
  VocabExamControls,
  WritingScopeSwitch,
} from "@/components/lesson-materials/test-book/TestBookControls";

type LoadResult = Awaited<ReturnType<typeof loadDrawProjectsAction>>;
type PrepareResult = Awaited<ReturnType<typeof prepareWorkbookExtrasAction>>;

function newSeed(): string {
  return `draw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 테스트지 뽑기 창 — 워크북·최종통합자료가 같이 쓴다(선생님 2026-10-21: 테스트 교재를 합치며 뽑기는 둘 다).
 * 고른 지문·유형으로 새로 섞어 뽑고(지문 × 유형마다 값), 뽑은 그대로 「뽑은 테스트지」 파일로 저장해 새 탭에서 연다.
 * 재료(1장 자료·단어 정리)가 없는 지문은 먼저 만든다(지문당 한 번 값, 워크북 새 유형과 같은 재료).
 */
export function TestDrawDialog({
  role,
  projectIds,
  open,
  onClose,
}: {
  role: "admin" | "teacher";
  projectIds: string[];
  open: boolean;
  onClose: () => void;
}) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [projects, setProjects] = useState<TestBookProjectInput[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [types, setTypes] = useState<TestBookTypeKey[]>(BASIC_TEST_BOOK_TYPES);
  const [blankMode, setBlankMode] = useState<BlankMode>("diff");
  const [level, setLevel] = useState<TestLevel>("basic");
  const [lineMode, setLineMode] = useState<LineMode>("full");
  const [writing, setWriting] = useState<WritingScope>("all");
  const [vocabOn, setVocabOn] = useState(true);
  const [vocab, setVocab] = useState<VocabExamOptions>(DEFAULT_VOCAB_EXAM);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean; href?: string } | null>(null);
  const idsKey = projectIds.join(",");

  const load = async () => {
    setLoadError(null);
    const res = await postJson<LoadResult>("/api/lesson-materials/test-book", { role, op: "loadDraw", projectIds });
    if (!res.ok) {
      setLoadError(res.message);
      return;
    }
    setProjects(res.projects);
    setPicked(new Set(res.projects.filter(isTestBookProjectReady).map((p) => p.id)));
  };
  useEffect(() => {
    if (!open || !projectIds.length) return;
    setProjects(null);
    setMessage(null);
    void load().catch((e) => setLoadError(e instanceof Error ? e.message : "지문을 불러오지 못했습니다."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idsKey]);

  if (!open) return null;
  const list = projects ?? [];
  const ready = list.filter(isTestBookProjectReady);
  const missing = list.filter((p) => !isTestBookProjectReady(p));
  const indexOf = (id: string) => list.findIndex((p) => p.id === id);
  const chosen = ready.filter((p) => picked.has(p.id));

  async function prepareMissing() {
    if (busy || !missing.length) return;
    const go = await askCreditConfirm({
      title: "테스트지 재료",
      description: "지문마다 테스트지에 쓰는 재료(단어 정리·지칭·함축·요약 등)를 만듭니다. 이미 값을 낸 지문은 다시 받지 않습니다.",
      subject: `재료가 없는 지문 ${missing.length}개`,
      contents: missing.map((p) => p.title),
      items: [{ feature: "lesson_workbook_extras", quantity: missing.length }],
    });
    if (!go) return;
    const failed: string[] = [];
    for (let i = 0; i < missing.length; i++) {
      setBusy(`재료를 만들고 있습니다… (${i + 1}/${missing.length})`);
      try {
        const res = await postJson<PrepareResult>("/api/lesson-materials/test-book", {
          role,
          op: "prepareWorkbook",
          projectId: missing[i]!.id,
        });
        if (!res.ok) failed.push(`「${missing[i]!.title}」 ${res.message}`);
      } catch (e) {
        failed.push(`「${missing[i]!.title}」 ${e instanceof Error ? e.message : "만들지 못했습니다."}`);
      }
    }
    setBusy(null);
    if (failed.length) setMessage({ text: failed.join(" · "), error: true });
    await load();
  }

  async function runDraw() {
    if (busy || !chosen.length || !types.length) return;
    const typeCount = types.length + (vocabOn ? 1 : 0);
    const go = await askCreditConfirm({
      title: "테스트지 뽑기",
      description: "고른 지문과 유형으로 테스트지를 새로 뽑습니다. 누를 때마다 문항·보기 순서가 새로 나옵니다.",
      subject: `지문 ${chosen.length}개 × 유형 ${typeCount}개`,
      contents: [...types.map((t) => testBookTypeLabel(t)), ...(vocabOn ? ["단어 시험지"] : [])],
      items: [{ feature: "lesson_test_draw", quantity: chosen.length * typeCount }],
      sample: "one_page_test",
    });
    if (!go) return;
    const seed = newSeed();
    const snapshot = {
      sheets: chosen.map((p) => ({
        project: { id: p.id, index: indexOf(p.id), title: p.title, titleEn: p.titleEn, source: p.source },
        sheet: buildTestSheet(p, types, { seed, blankMode, writing, lineMode, level }),
      })),
      vocabExam: vocabOn
        ? buildVocabExam(
            chosen.map((p) => ({ passage: indexOf(p.id) + 1, vocab: p.material.vocab })),
            { ...vocab, seed: `${seed}|vocab` }
          )
        : null,
    };
    // 새 탭은 누른 순간 열어 둔다(응답 뒤에 열면 팝업 차단에 걸린다)
    const tab = window.open("", "_blank");
    setBusy("뽑는 중…");
    setMessage(null);
    try {
      const res = await postJson<{ ok: true; docId: string | null; name: string | null } | { ok: false; message: string }>(
        "/api/lesson-materials/test-book",
        { op: "chargeDraw", role, seed, projectIds: chosen.map((p) => p.id), typeCount, snapshot }
      );
      if (!res.ok) {
        tab?.close();
        setMessage({ text: res.message, error: true });
      } else if (res.docId) {
        const href = `${base}/test-book?doc=${encodeURIComponent(res.docId)}`;
        if (tab) tab.location.href = href;
        setMessage({ text: `「${res.name ?? "테스트지"}」로 저장했습니다 · 자료함 「뽑은 테스트지」에서 다시 열 수 있습니다.`, error: false, href });
      } else {
        tab?.close();
        setMessage({ text: "뽑았지만 파일로 저장하지 못했습니다. 다시 눌러 주세요.", error: true });
      }
    } catch (e) {
      tab?.close();
      setMessage({ text: e instanceof Error ? e.message : "뽑지 못했습니다.", error: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 p-4 print:hidden" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-base font-black text-slate-900">테스트지 뽑기</p>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            닫기
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-5 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500">범위</p>
              {loadError ? <p className="text-[12px] font-semibold text-rose-600">{loadError}</p> : null}
              {!projects && !loadError ? <p className="text-[12px] text-slate-500">지문을 불러오고 있습니다…</p> : null}
              {list.map((p, i) => {
                const ok = isTestBookProjectReady(p);
                return (
                  <label key={p.id} className="flex min-h-[26px] items-center gap-2 text-[13px] text-slate-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-violet-600"
                      disabled={!ok}
                      checked={picked.has(p.id)}
                      onChange={() =>
                        setPicked((prev) => {
                          const next = new Set(prev);
                          if (next.has(p.id)) next.delete(p.id);
                          else next.add(p.id);
                          return next;
                        })
                      }
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {String(i + 1).padStart(2, "0")} {p.title}
                    </span>
                    {!ok ? <span className="shrink-0 text-[10px] font-semibold text-amber-600">재료 없음</span> : null}
                  </label>
                );
              })}
              {missing.length ? (
                <Button type="button" size="sm" variant="secondary" className="mt-1 w-full" disabled={!!busy} onClick={() => void prepareMissing()}>
                  재료 만들기 (지문 {missing.length}개)
                </Button>
              ) : null}
            </div>
            <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50/60 p-3">
              <p className="text-xs font-bold text-violet-900">유형 (고른 유형을 모두 싣고, 문항은 누를 때마다 새로 섞음)</p>
              <TypeChecks value={types} onChange={setTypes} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500">빈칸 자리</p>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ["same", "견본과 같은 자리"],
                    ["diff", "다른 자리"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBlankMode(id)}
                    className={`rounded-md px-1 py-1.5 text-[11px] font-bold ${blankMode === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <LevelSwitch value={level} onChange={setLevel} />
            {types.includes("line") ? <LineModeSwitch value={lineMode} onChange={setLineMode} /> : null}
            {types.includes("writing") ? <WritingScopeSwitch value={writing} onChange={setWriting} /> : null}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={vocabOn} onChange={(e) => setVocabOn(e.target.checked)} />
              단어 시험지 함께(고른 지문 합침)
            </label>
            {vocabOn ? <VocabExamControls value={vocab} onChange={setVocab} /> : null}
            <p className="text-[11px] leading-relaxed text-slate-500">
              뽑은 테스트지는 정답지와 함께 새 탭에서 열리고, 자료함 「뽑은 테스트지」에 저장됩니다. 다시 열 때는 값이 들지 않습니다.
            </p>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-slate-100 px-5 py-3">
          <Button type="button" className="w-full" disabled={!!busy || !chosen.length || !types.length} onClick={() => void runDraw()}>
            {busy ?? `뽑기 (지문 ${chosen.length}개)`}
          </Button>
          {message ? (
            <p className={`text-[11px] font-semibold ${message.error ? "text-rose-600" : "text-emerald-700"}`}>
              {message.text}
              {message.href ? (
                <>
                  {" "}
                  <a href={message.href} target="_blank" rel="noreferrer" className="underline">
                    열기
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
