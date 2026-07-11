"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import {
  buildStage3Questions,
  STAGE3_PASS_SCORE,
  type Stage3Question,
} from "@/lib/vocab/build-stage3-questions";
import {
  isSpeechSupported,
  speakEnglish,
  stopSpeaking,
} from "@/lib/vocab/speak-client";
import type { VocabItem } from "@/types/database";

type Stage = 1 | 2 | 3;

type Progress = {
  stage1Done: boolean;
  stage1Seen: string[];
  stage2Done: boolean;
  stage3Best: number;
  stage3Passed: boolean;
};

function storageKey(setId: string) {
  return `exam-vocab-progress:${setId}`;
}

function loadProgress(setId: string): Progress {
  try {
    const raw = localStorage.getItem(storageKey(setId));
    if (!raw) {
      return {
        stage1Done: false,
        stage1Seen: [],
        stage2Done: false,
        stage3Best: 0,
        stage3Passed: false,
      };
    }
    return { ...JSON.parse(raw) } as Progress;
  } catch {
    return {
      stage1Done: false,
      stage1Seen: [],
      stage2Done: false,
      stage3Best: 0,
      stage3Passed: false,
    };
  }
}

function saveProgress(setId: string, p: Progress) {
  try {
    localStorage.setItem(storageKey(setId), JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function shuffleIds(ids: string[]): string[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ExamVocabGuestClient({
  setId,
  title,
  items,
}: {
  setId: string;
  title: string;
  items: VocabItem[];
}) {
  const [stage, setStage] = useState<Stage | "hub">("hub");
  const [progress, setProgress] = useState<Progress>(() => loadProgress(setId));

  useEffect(() => {
    setProgress(loadProgress(setId));
  }, [setId]);

  const patchProgress = useCallback(
    (next: Progress) => {
      setProgress(next);
      saveProgress(setId, next);
    },
    [setId]
  );

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-50 px-4 py-6">
      <header className="mb-5">
        <p className="text-xs font-semibold text-brand-700">보기 단어 학습</p>
        <h1 className="mt-1 text-lg font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-xs text-slate-500">
          로그인 없이 이용 · 진행 상태는 이 기기에 저장됩니다
        </p>
      </header>

      {stage === "hub" ? (
        <Hub
          progress={progress}
          itemCount={items.length}
          onGo={(s) => setStage(s)}
        />
      ) : stage === 1 ? (
        <Stage1
          items={items}
          progress={progress}
          onPatch={patchProgress}
          onBack={() => setStage("hub")}
        />
      ) : stage === 2 ? (
        <Stage2
          items={items}
          progress={progress}
          onPatch={patchProgress}
          onBack={() => setStage("hub")}
        />
      ) : (
        <Stage3
          items={items}
          progress={progress}
          onPatch={patchProgress}
          onBack={() => setStage("hub")}
        />
      )}
    </div>
  );
}

function Hub({
  progress,
  itemCount,
  onGo,
}: {
  progress: Progress;
  itemCount: number;
  onGo: (s: Stage) => void;
}) {
  const rows: Array<{
    stage: Stage;
    title: string;
    desc: string;
    locked: boolean;
    done: boolean;
  }> = [
    {
      stage: 1,
      title: "1단계 · 카드 학습",
      desc: "영단어 ↔ 뜻",
      locked: false,
      done: progress.stage1Done,
    },
    {
      stage: 2,
      title: "2단계 · 스펠링",
      desc: "뜻 보고 영단어 쓰기",
      locked: !progress.stage1Done,
      done: progress.stage2Done,
    },
    {
      stage: 3,
      title: "3단계 · 테스트",
      desc: `합격 ${STAGE3_PASS_SCORE}점`,
      locked: !progress.stage2Done,
      done: progress.stage3Passed,
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">{itemCount}단어</p>
      {rows.map((r) => (
        <button
          key={r.stage}
          type="button"
          disabled={r.locked}
          onClick={() => onGo(r.stage)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm disabled:opacity-50"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{r.title}</p>
            <p className="text-xs text-slate-500">{r.desc}</p>
          </div>
          <span className="text-xs font-semibold text-brand-700">
            {r.locked ? "잠김" : r.done ? "완료" : "시작"}
          </span>
        </button>
      ))}
      {progress.stage3Best > 0 && (
        <p className="text-center text-xs text-slate-500">
          테스트 최고 {progress.stage3Best}점
          {progress.stage3Passed ? " · 합격" : ""}
        </p>
      )}
    </div>
  );
}

function Stage1({
  items,
  progress,
  onPatch,
  onBack,
}: {
  items: VocabItem[];
  progress: Progress;
  onPatch: (p: Progress) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(() => new Set(progress.stage1Seen));
  const speechOk = isSpeechSupported();
  const current = items[index];
  const total = items.length;
  const doneCount = progress.stage1Done ? index + 1 : seen.size;

  useEffect(() => {
    if (!speechOk || !current || flipped) return;
    const t = window.setTimeout(() => speakEnglish(current.word), 60);
    return () => window.clearTimeout(t);
  }, [index, speechOk, current, flipped]);

  useEffect(() => () => stopSpeaking(), []);

  function mark(known: boolean) {
    if (!current) return;
    void known;
    const nextSeen = new Set(seen);
    nextSeen.add(current.id);
    setSeen(nextSeen);
    const all = nextSeen.size >= total;
    onPatch({
      ...progress,
      stage1Seen: [...nextSeen],
      stage1Done: all || progress.stage1Done,
    });
    if (index + 1 >= total) {
      onPatch({
        ...progress,
        stage1Seen: [...nextSeen],
        stage1Done: true,
      });
      onBack();
      return;
    }
    setIndex(index + 1);
    setFlipped(false);
  }

  if (!current) {
    return (
      <div>
        <Button type="button" variant="secondary" onClick={onBack}>
          ← 단계 선택
        </Button>
        <p className="mt-4 text-sm">단어가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-slate-600 hover:underline"
          onClick={onBack}
        >
          ← 단계 선택
        </button>
        <span className="text-xs text-slate-500">
          {doneCount}/{total}
        </span>
      </div>
      <ProgressBar percent={total ? Math.round((doneCount / total) * 100) : 0} />
      <button
        type="button"
        className="mt-4 flex min-h-[160px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onClick={() => setFlipped((f) => !f)}
      >
        <p className="text-2xl font-bold text-slate-900">
          {flipped ? current.meaning : current.word}
        </p>
        <p className="mt-2 text-xs text-slate-400">탭하여 뒤집기</p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={() => mark(false)}>
          모름
        </Button>
        <Button type="button" onClick={() => mark(true)}>
          앎
        </Button>
      </div>
    </div>
  );
}

function Stage2({
  items,
  progress,
  onPatch,
  onBack,
}: {
  items: VocabItem[];
  progress: Progress;
  onPatch: (p: Progress) => void;
  onBack: () => void;
}) {
  const [queue, setQueue] = useState(() => shuffleIds(items.map((i) => i.id)));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    show: boolean;
  } | null>(null);
  const [mastered, setMastered] = useState(0);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const current = queue[0] ? byId.get(queue[0]) : undefined;
  const total = items.length;

  function check() {
    if (!current || feedback?.show) return;
    const ok = gradeSpellingAnswer(current.word, answer.trim());
    if (ok) {
      const next = queue.slice(1);
      setMastered((m) => m + 1);
      setAnswer("");
      setFeedback(null);
      if (next.length === 0) {
        onPatch({ ...progress, stage2Done: true });
        onBack();
        return;
      }
      setQueue(next);
    } else {
      setFeedback({ correct: false, show: true });
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-slate-600 hover:underline"
          onClick={onBack}
        >
          ← 단계 선택
        </button>
        <span className="text-xs text-slate-500">
          {mastered}/{total}
        </span>
      </div>
      <ProgressBar percent={total ? Math.round((mastered / total) * 100) : 0} />
      {current ? (
        <>
          <p className="mt-4 text-center text-lg font-semibold text-slate-900">
            {current.meaning}
          </p>
          <input
            className="ui-input mt-3 text-center"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            placeholder="영단어 입력"
            autoFocus
          />
          {feedback?.show && (
            <p className="mt-2 text-center text-sm text-rose-600">
              정답: {current.word}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            {feedback?.show ? (
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setQueue((q) => [...q.slice(1), q[0]!]);
                  setAnswer("");
                  setFeedback(null);
                }}
              >
                다음
              </Button>
            ) : (
              <Button type="button" className="w-full" onClick={check}>
                확인
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm">완료되었습니다.</p>
      )}
    </div>
  );
}

function Stage3({
  items,
  progress,
  onPatch,
  onBack,
}: {
  items: VocabItem[];
  progress: Progress;
  onPatch: (p: Progress) => void;
  onBack: () => void;
}) {
  const questions = useMemo(() => buildStage3Questions(items), [items]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const q = questions[idx] as Stage3Question | undefined;

  function submitOne() {
    if (!q) return;
    const ok =
      q.questionType === "spelling"
        ? gradeSpellingAnswer(q.correctAnswer, answer.trim())
        : answer.trim() === q.correctAnswer.trim() ||
          answer.trim().includes(q.correctAnswer.trim()) ||
          q.correctAnswer.trim().includes(answer.trim());
    const nextCorrect = correct + (ok ? 1 : 0);
    setCorrect(nextCorrect);
    setAnswer("");
    if (idx + 1 >= questions.length) {
      const sc = Math.round((nextCorrect / questions.length) * 100);
      setScore(sc);
      setDone(true);
      onPatch({
        ...progress,
        stage3Best: Math.max(progress.stage3Best, sc),
        stage3Passed: progress.stage3Passed || sc >= STAGE3_PASS_SCORE,
      });
    } else {
      setIdx(idx + 1);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">{score}점</p>
        <p className="mt-2 text-sm text-slate-600">
          {score >= STAGE3_PASS_SCORE ? "합격입니다!" : "다시 도전해 보세요."}
        </p>
        <Button type="button" className="mt-4" onClick={onBack}>
          단계 선택으로
        </Button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-slate-600 hover:underline"
          onClick={onBack}
        >
          ← 단계 선택
        </button>
        <span className="text-xs text-slate-500">
          {idx + 1}/{questions.length}
        </span>
      </div>
      <ProgressBar
        percent={Math.round(((idx + 1) / questions.length) * 100)}
      />
      <p className="mt-4 text-center text-xs text-slate-500">
        {q.questionType === "meaning" ? "뜻 쓰기" : "스펠링"}
      </p>
      <p className="mt-2 text-center text-xl font-bold text-slate-900">
        {q.questionText}
      </p>
      {q.promptExtra && (
        <p className="mt-1 text-center text-xs text-slate-500">{q.promptExtra}</p>
      )}
      <input
        className="ui-input mt-4 text-center"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitOne();
        }}
        autoFocus
      />
      <Button type="button" className="mt-4 w-full" onClick={submitOne}>
        다음
      </Button>
    </div>
  );
}
