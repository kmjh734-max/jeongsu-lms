import { Suspense } from "react";
import { WorkbookWorkbench } from "@/components/lesson-materials/WorkbookWorkbench";

export const maxDuration = 300;

export default function TeacherWorkbookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center bg-slate-100">
          <p className="text-sm text-slate-600">워크북을 준비하고 있습니다…</p>
        </div>
      }
    >
      <WorkbookWorkbench role="teacher" />
    </Suspense>
  );
}
