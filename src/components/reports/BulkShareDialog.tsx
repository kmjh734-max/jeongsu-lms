"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ReportRange, ReportStudentOption } from "@/lib/reports/types";

type Row = { id: string; name: string; status: "wait" | "work" | "ok" | "fail"; url?: string; message?: string };

/**
 * 반 전체(지금 목록에 보이는 학생 모두)의 학부모 링크를 한 번에 만든다 — 월말 일괄 발송.
 * 학생마다 리포트를 새로 계산해 링크를 만들고, 링크를 한꺼번에 복사할 수 있게 보여 준다.
 */
export function BulkShareDialog({
  students,
  range,
  onClose,
  onShared,
}: {
  students: ReportStudentOption[];
  range: ReportRange;
  onClose: () => void;
  onShared: (studentId: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>(students.map((s) => ({ id: s.id, name: s.name, status: "wait" })));
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  async function run() {
    setRunning(true);
    for (const s of students) {
      update(s.id, { status: "work" });
      try {
        const rep = await fetch(`/api/reports/student?${new URLSearchParams({ studentId: s.id, range })}`).then((r) => r.json());
        if (!rep.ok) throw new Error(rep.message ?? "리포트를 만들지 못했어요.");
        const share = await fetch("/api/reports/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: s.id, reportData: rep.report, parentMessage: "" }),
        }).then((r) => r.json());
        if (!share.ok) throw new Error(share.message ?? "링크를 만들지 못했어요.");
        update(s.id, { status: "ok", url: share.shareUrl });
        onShared(s.id);
      } catch (e) {
        update(s.id, { status: "fail", message: e instanceof Error ? e.message : "실패" });
      }
    }
    setRunning(false);
  }

  const done = rows.filter((r) => r.status === "ok");
  async function copyAll() {
    const text = done.map((r) => `${r.name} 학습 리포트: ${r.url}`).join("\n");
    await navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label="반 전체 리포트 링크">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">반 전체 리포트 링크 만들기</h2>
          <p className="mt-1 text-xs text-slate-500">
            목록에 보이는 {students.length}명의 학부모 링크를 한 번에 만들어요. 선생님 말씀 없이 학습 기록으로만 만들어져요.
          </p>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-24 shrink-0 truncate font-medium text-slate-800">{r.name}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
                {r.status === "ok" ? r.url : r.status === "fail" ? r.message : r.status === "work" ? "만드는 중…" : "대기"}
              </span>
              <span
                className={`shrink-0 text-xs font-semibold ${
                  r.status === "ok" ? "text-emerald-700" : r.status === "fail" ? "text-rose-700" : "text-slate-400"
                }`}
              >
                {r.status === "ok" ? "완료" : r.status === "fail" ? "실패" : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={running}>
            닫기
          </Button>
          {done.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => void copyAll()}>
              {copied ? "복사했어요" : `링크 ${done.length}개 모두 복사`}
            </Button>
          ) : null}
          <Button size="sm" onClick={() => void run()} disabled={running || done.length === rows.length}>
            {running ? "만드는 중…" : done.length ? "남은 학생 다시" : `${students.length}명 링크 만들기`}
          </Button>
        </div>
      </div>
    </div>
  );
}
