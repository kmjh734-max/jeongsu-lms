"use client";

import { createContext, useContext } from "react";
import type {
  LessonMaterialFolderRow,
  LessonMaterialProjectRow,
} from "@/lib/lesson-materials/load-sidebar";

interface LessonMaterialsSidebarValue {
  folders: LessonMaterialFolderRow[];
  projects: LessonMaterialProjectRow[];
}

const LessonMaterialsSidebarContext =
  createContext<LessonMaterialsSidebarValue | null>(null);

export function LessonMaterialsSidebarProvider({
  value,
  children,
}: {
  value: LessonMaterialsSidebarValue;
  children: React.ReactNode;
}) {
  return (
    <LessonMaterialsSidebarContext.Provider value={value}>
      {children}
    </LessonMaterialsSidebarContext.Provider>
  );
}

export function useLessonMaterialsSidebar() {
  const ctx = useContext(LessonMaterialsSidebarContext);
  if (!ctx) {
    throw new Error("useLessonMaterialsSidebar must be used within provider");
  }
  return ctx;
}
