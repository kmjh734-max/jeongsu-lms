"use client";

import { ListeningAssignPanel } from "@/components/listening/ListeningAssignPanel";

interface ClassOption {
  id: string;
  name: string;
}

interface ListeningSetAssignModalProps {
  setId: string;
  setTitle: string;
  classes: ClassOption[];
  assignedClassNames: string[];
  assignedStudentNames: string[];
  isPublished: boolean;
  onClose: () => void;
}

export function ListeningSetAssignModal({
  setId,
  setTitle,
  classes,
  assignedClassNames,
  assignedStudentNames,
  isPublished,
  onClose,
}: ListeningSetAssignModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listening-assign-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2
              id="listening-assign-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              학생·반 배정
            </h2>
            <p className="mt-1 text-sm text-slate-600">{setTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
        <ListeningAssignPanel
          setId={setId}
          classes={classes}
          assignedClassNames={assignedClassNames}
          assignedStudentNames={assignedStudentNames}
          isPublished={isPublished}
        />
      </div>
    </div>
  );
}
