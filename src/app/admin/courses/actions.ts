"use server";

import { revalidatePath } from "next/cache";
import {
  createCourseFolder as createFolder,
  deleteCourseFolder as deleteFolder,
  moveCoursesToFolder as moveToFolder,
  purgeCourses as purge,
  renameCourseFolder as renameFolder,
  reorderCourseFolders as reorderFolders,
  reorderCourses as reorder,
  restoreCourses as restore,
  setCoursesArchived as setArchived,
  setCoursesPublished as setPublished,
  trashCourses as trash,
  type CourseActionResult,
} from "@/lib/courses/manage";

/**
 * 동영상강좌 관리 동작. 관리자·강사 화면이 함께 쓴다.
 * 손댈 수 있는 강좌인지(강사는 자기 강좌만) 판단은 lib/courses/manage 안에서 한다.
 */

function done() {
  for (const p of ["/admin/courses", "/teacher/courses", "/student", "/student/courses"]) {
    revalidatePath(p);
  }
}

async function run(fn: () => Promise<CourseActionResult>): Promise<CourseActionResult> {
  const result = await fn();
  if (result.ok) done();
  return result;
}

export async function trashCoursesAction(ids: string[]) {
  return run(() => trash(ids));
}

export async function restoreCoursesAction(ids: string[]) {
  return run(() => restore(ids));
}

export async function purgeCoursesAction(ids: string[]) {
  return run(() => purge(ids));
}

export async function setCoursesArchivedAction(ids: string[], archived: boolean) {
  return run(() => setArchived(ids, archived));
}

export async function setCoursesPublishedAction(ids: string[], published: boolean) {
  return run(() => setPublished(ids, published));
}

export async function moveCoursesToFolderAction(ids: string[], folderId: string | null) {
  return run(() => moveToFolder(ids, folderId));
}

export async function reorderCoursesAction(orderedIds: string[]) {
  return run(() => reorder(orderedIds));
}

export async function createCourseFolderAction(name: string) {
  return run(() => createFolder(name));
}

export async function renameCourseFolderAction(folderId: string, name: string) {
  return run(() => renameFolder(folderId, name));
}

export async function deleteCourseFolderAction(folderId: string) {
  return run(() => deleteFolder(folderId));
}

export async function reorderCourseFoldersAction(orderedIds: string[]) {
  return run(() => reorderFolders(orderedIds));
}
