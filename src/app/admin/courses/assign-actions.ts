"use server";

import { revalidatePath } from "next/cache";
import {
  assignCourse,
  loadCourseAssignPanel,
  unassignCourse,
  type CourseAssignPanelData,
} from "@/lib/courses/course-assign";

/** 강좌 화면에서 바로 배정하기. 관리자·강사 화면이 함께 쓴다. */

function done() {
  for (const p of ["/admin/courses", "/teacher/courses", "/admin/classes", "/teacher/classes", "/student"]) {
    revalidatePath(p);
  }
}

export async function loadCourseAssignPanelAction(
  courseId: string
): Promise<CourseAssignPanelData | null> {
  return loadCourseAssignPanel(courseId);
}

export async function assignCourseAction(
  courseId: string,
  classIds: string[],
  studentIds: string[]
) {
  const r = await assignCourse(courseId, classIds, studentIds);
  if (r.ok) done();
  return r;
}

export async function unassignCourseAction(
  courseId: string,
  opts: { classId?: string; studentId?: string }
) {
  const r = await unassignCourse(courseId, opts);
  if (r.ok) done();
  return r;
}
