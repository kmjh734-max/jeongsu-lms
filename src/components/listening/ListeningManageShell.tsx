import type { ReactNode } from "react";
import { ListeningSidebar } from "@/components/listening/ListeningSidebar";

interface ListeningManageShellProps {
  role: "admin" | "teacher";
  children: ReactNode;
}

export function ListeningManageShell({
  role,
  children,
}: ListeningManageShellProps) {
  return (
    <div className="-mx-4 flex min-h-[calc(100vh-7rem)] flex-col bg-slate-100/80 sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
      <div className="flex flex-1 flex-col lg:flex-row">
        <ListeningSidebar role={role} />
        <main className="min-w-0 flex-1 bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
