import type { ReactNode } from "react";
import { VocabModuleHeader } from "@/components/vocab/VocabModuleHeader";
import { loadVocabModuleData } from "@/lib/vocab/load-module-data";
import type { VocabRole } from "@/lib/vocab/module-types";

/** 단어학습 화면 공통 틀 — 제목·탭(세트 상세에서는 숨김) 아래에 각 화면을 둔다. */
export async function renderVocabShell(role: VocabRole, children: ReactNode) {
  const data = await loadVocabModuleData(role);
  const myFolders = data.folders
    .filter((f) => !f.isCurriculum)
    .map((f) => ({ id: f.id, name: f.name }));

  return (
    <div className="pb-24">
      <VocabModuleHeader
        role={role}
        setCount={data.mySetCount}
        folders={myFolders}
        teachers={data.teachers}
      />
      {children}
    </div>
  );
}
