"use client";

import { useState } from "react";
import { VocabSetCreateModal } from "@/components/vocab/VocabSetCreateModal";
import type { Profile } from "@/types/database";

interface VocabSetCreateLauncherProps {
  role: "admin" | "teacher";
  teachers?: Profile[];
  basePath: "/admin/vocab" | "/teacher/vocab";
  onCreate: (input: {
    title: string;
    description?: string;
    teacherId?: string;
  }) => Promise<{ ok: boolean; message: string; setId?: string }>;
}

export function VocabSetCreateLauncher({
  role,
  teachers,
  basePath,
  onCreate,
}: VocabSetCreateLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-[#7cb518] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#6aa014]"
      >
        + 단어세트 생성하기
      </button>
      <VocabSetCreateModal
        open={open}
        onClose={() => setOpen(false)}
        role={role}
        teachers={teachers}
        basePath={basePath}
        onCreate={onCreate}
      />
    </>
  );
}
