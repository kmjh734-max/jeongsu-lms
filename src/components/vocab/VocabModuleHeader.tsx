"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import * as adminActions from "@/app/admin/vocab/actions";
import * as teacherActions from "@/app/teacher/vocab/actions";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { ModuleHeader } from "@/components/ui/ModuleTabs";
import { VocabSetCreateModal } from "@/components/vocab/VocabSetCreateModal";
import {
  vocabBasePath,
  type VocabRole,
  type VocabTeacherOption,
} from "@/lib/vocab/module-types";

/**
 * 단어학습 제목 + [세트] [현황] 탭. 세트 상세 화면에서는 숨긴다.
 * 선생님 요청(2026-09-28): 배정 탭을 없앴다. 배정은 세트 목록에서 단어장을 고르면
 * 바로 하도록 하나로 모았다 — 같은 일을 두 화면에서 하니 헷갈렸다.
 */
export function VocabModuleHeader({
  role,
  setCount,
  folders,
  teachers,
}: {
  role: VocabRole;
  setCount: number;
  /** 새 단어장을 넣을 수 있는 내 폴더 */
  folders: { id: string; name: string }[];
  teachers: VocabTeacherOption[];
}) {
  const pathname = usePathname();
  const base = vocabBasePath(role);
  const [createIntent, setCreateIntent] = useState<"direct" | "import" | null>(null);

  if (pathname.startsWith(`${base}/set/`)) return null;

  const onSetsTab = !pathname.startsWith(`${base}/status`);
  const folderMatch = pathname.match(/\/folder\/([^/]+)/);
  const currentFolderId =
    folderMatch && folders.some((f) => f.id === folderMatch[1]) ? folderMatch[1]! : "";
  const actions = role === "admin" ? adminActions : teacherActions;

  return (
    <>
      <ModuleHeader
        title="단어학습"
        description="단어장을 고르면 그 자리에서 반·학생에게 배정하고, 진행을 봅니다."
        tabs={[
          {
            href: `${base}/sets`,
            label: "세트",
            count: setCount,
            match: [`${base}/folder`, `${base}/unfiled`, `${base}/set`, `${base}/assign`],
          },
          { href: `${base}/status`, label: "현황" },
        ]}
        action={
          onSetsTab ? (
            <>
              <Button variant="secondary" onClick={() => setCreateIntent("import")}>
                <Icon name="upload" size={16} strokeWidth={2} />
                자료로 만들기
              </Button>
              <Button onClick={() => setCreateIntent("direct")}>
                <Icon name="plus" size={16} strokeWidth={2} />새 단어장
              </Button>
            </>
          ) : undefined
        }
      />
      <VocabSetCreateModal
        open={createIntent !== null}
        intent={createIntent ?? "direct"}
        onClose={() => setCreateIntent(null)}
        role={role}
        basePath={base}
        folders={folders}
        defaultFolderId={currentFolderId}
        teachers={teachers}
        onCreate={actions.createVocabSet}
      />
    </>
  );
}
