"use client";

import { useEffect, useState } from "react";
import { VocabAssignModal } from "@/components/vocab/VocabAssignModal";
import type { VocabAssignmentSectionProps } from "@/components/vocab/VocabAssignmentSection";

interface VocabSetAssignLauncherProps {
  title: string;
  assignment: VocabAssignmentSectionProps;
  /** 인라인 패널도 함께 표시 */
  showInline?: boolean;
}

export function VocabSetAssignLauncher({
  title,
  assignment,
  showInline = false,
}: VocabSetAssignLauncherProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#assign") {
      setOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-lg border-2 border-emerald-600 px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
      >
        학생·반 배정
      </button>
      <VocabAssignModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        assignment={assignment}
      />
      {showInline && (
        <section
          id="assign"
          className="scroll-mt-6 mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-slate-900">학생·반 배정</h2>
          {/* inline import would need duplicate - skip showInline default false */}
        </section>
      )}
    </>
  );
}
