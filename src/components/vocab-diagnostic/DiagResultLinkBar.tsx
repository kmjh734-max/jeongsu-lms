"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { resultLinkAction } from "@/app/admin/marketing/vocab-diagnostic/actions";

/** 결과 상세의 결과 링크 복사·회수·재발급 */
export function DiagResultLinkBar({ attemptId, link }: { attemptId: string; link: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const url = (path: string) => `${window.location.origin}${path}`;
  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote(done);
    } catch {
      window.prompt("복사해 주세요", text);
    }
  };
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-600">학생·학부모 결과 링크</p>
      {link ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => copy(url(link), "결과 링크를 복사했습니다.")}>링크 복사</Button>
          <a href={link} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50">열어 보기</a>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => start(async () => { if (!window.confirm("결과 링크를 회수할까요? 받은 사람이 더는 볼 수 없습니다.")) return; const r = await resultLinkAction(attemptId, "revoke"); setNote(r.ok ? "회수했습니다." : r.error); router.refresh(); })}>회수</Button>
        </div>
      ) : (
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => { const r = await resultLinkAction(attemptId, "reissue"); if (!r.ok) return setNote(r.error); await copy(url(r.link!), "새 결과 링크를 복사했습니다."); router.refresh(); })}>새 결과 링크 만들기</Button>
      )}
      {note && <p className="text-xs text-slate-600">{note}</p>}
    </div>
  );
}
