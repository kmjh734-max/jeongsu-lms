"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ArchiveClassButtonProps {
  classId: string;
  className: string;
  onArchive: (classId: string) => Promise<{ ok: boolean; message: string }>;
  /** 보관한 뒤 이동할 곳 */
  redirectTo: string;
  /** 보관을 되돌리는 방법 안내 (확인 창에 덧붙임) */
  restoreHint: string;
}

/** 반 보관 — 지우지 않고 목록의 '보관'으로 옮긴다 */
export function ArchiveClassButton({
  classId,
  className,
  onArchive,
  redirectTo,
  restoreHint,
}: ArchiveClassButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    if (
      !window.confirm(
        `「${className}」 반을 보관할까요?\n학생 계정과 학습 기록은 그대로 남아요. ${restoreHint}`
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await onArchive(classId);
    setLoading(false);

    if (!result.ok) {
      window.alert(result.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button variant="danger" onClick={handleArchive} disabled={loading}>
      {loading ? "보관하는 중…" : "반 보관"}
    </Button>
  );
}
