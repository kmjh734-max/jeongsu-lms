"use client";

import { useState } from "react";
import { closeTabOrGo } from "@/components/lesson-materials/open-new-document";

/**
 * 자료 화면의 「닫기(저장)」(선생님 2026-10-22). 누르면 save(기다리던 저장을 바로 보내고 끝날 때까지
 * 기다림)를 마친 뒤 닫는다. save가 false를 돌려주면(저장 실패) 닫지 않는다 — 닫으면 고친 것이 사라진다.
 * closeTabOrGo는 기다리지 않고 창을 닫으므로, 저장을 먼저 끝내야 한다.
 */
export function CloseSaveButton({
  base,
  save,
  className,
  label = "← 닫기(저장)",
  disabled,
}: {
  base: string;
  save?: () => Promise<boolean | void>;
  className: string;
  label?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      if (save && (await save()) === false) {
        setBusy(false);
        return;
      }
    } catch {
      setBusy(false);
      return;
    }
    closeTabOrGo(base);
  }
  return (
    <button type="button" onClick={() => void run()} disabled={busy || disabled} className={`${className} disabled:opacity-60`}>
      {busy ? "저장 중…" : label}
    </button>
  );
}
