"use server";

import {
  createLessonMaterialFolder as createFolderLib,
  deleteLessonMaterialFolder as deleteFolderLib,
} from "@/lib/lesson-materials/folder-actions";
import {
  createLessonMaterialProject as createProjectLib,
  deleteLessonMaterialProject as deleteProjectLib,
  updateLessonMaterialProject as updateProjectLib,
} from "@/lib/lesson-materials/project-actions";
import type { LessonMaterialProjectContent } from "@/lib/lesson-materials/project-content";

const ROLE = "teacher" as const;

export async function createLessonMaterialFolder(name: string) {
  return createFolderLib(ROLE, { name });
}

export async function deleteLessonMaterialFolder(folderId: string) {
  return deleteFolderLib(ROLE, folderId);
}

export async function createLessonMaterialProject(input: {
  title?: string;
  sourcePassage?: string;
  lessonLabel?: string;
  folderId?: string | null;
}) {
  return createProjectLib(ROLE, input);
}

export async function updateLessonMaterialProject(
  projectId: string,
  input: {
    title?: string;
    lessonLabel?: string;
    sourcePassage?: string;
    folderId?: string | null;
    contentPatch?: Partial<LessonMaterialProjectContent>;
  }
) {
  return updateProjectLib(ROLE, projectId, input);
}

export async function deleteLessonMaterialProject(projectId: string) {
  return deleteProjectLib(ROLE, projectId);
}
