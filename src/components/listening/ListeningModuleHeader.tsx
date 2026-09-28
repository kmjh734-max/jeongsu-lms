"use client";

import type { ReactNode } from "react";
import { ModuleHeader } from "@/components/ui/ModuleTabs";

export type ListeningBasePath = "/admin/listening" | "/teacher/listening";

/**
 * 듣기학습 제목 + [세트] [과제] [현황] 탭 — 이 화면의 유일한 제목.
 * 선생님 요청(2026-09-28): 단어학습과 방식을 맞춘다. 새 배정은 세트 탭에서 고른 뒤
 * 시작하고, 이 탭은 이미 만든 과제를 고치거나 멈추는 곳이라 이름도 「과제」로 둔다.
 */
export function ListeningModuleHeader({
  basePath,
  setCount,
  assignCount,
  action,
}: {
  basePath: ListeningBasePath;
  setCount: number;
  assignCount: number;
  action?: ReactNode;
}) {
  return (
    <ModuleHeader
      title="듣기학습"
      description="세트를 고르면 그 자리에서 날마다 나눠 배정하고, 수행을 봅니다."
      tabs={[
        { href: `${basePath}/sets`, label: "세트", count: setCount },
        { href: `${basePath}/assign`, label: "과제", count: assignCount },
        { href: `${basePath}/status`, label: "현황" },
      ]}
      action={action}
    />
  );
}
