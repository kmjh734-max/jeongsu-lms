import type { ReactNode } from "react";
import { VocabNavSidebar } from "@/components/vocab/VocabNavSidebar";

interface VocabManageShellProps {
  role: "admin" | "teacher";
  children: ReactNode;
}

export function VocabManageShell({ role, children }: VocabManageShellProps) {
  return (
    <div className="-mx-4 flex min-h-[calc(100vh-7rem)] flex-col bg-slate-100/80 sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
      <div className="flex flex-1 flex-col lg:flex-row">
        <VocabNavSidebar role={role} />
        <main className="flex min-w-0 flex-1 flex-col bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
