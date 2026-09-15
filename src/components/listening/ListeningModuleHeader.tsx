"use client";

import type { ReactNode } from "react";
import { ModuleHeader } from "@/components/ui/ModuleTabs";

export type ListeningBasePath = "/admin/listening" | "/teacher/listening";

/** 듣기학습 제목 + [세트] [배정] [현황] 탭 — 이 화면의 유일한 제목 */
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
      description="듣기 세트를 만들고, 날마다 나눠 배정하고, 수행을 봅니다."
      tabs={[
        { href: `${basePath}/sets`, label: "세트", count: setCount },
        { href: `${basePath}/assign`, label: "배정", count: assignCount },
        { href: `${basePath}/status`, label: "현황" },
      ]}
      action={action}
    />
  );
}
