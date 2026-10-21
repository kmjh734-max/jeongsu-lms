"use server";

import { revalidatePath } from "next/cache";
import {
  assignCourse,
  loadCourseAssignPanel,
  unassignCourse,
  type CourseAssignPanelData,
} from "@/lib/courses/course-assign";

/** 강좌 화면·강좌 목록에서 배정하기(여러 강좌 한꺼번에도). 관리자·강사 화면이 함께 쓴다. */

function done() {
  for (const p of ["/admin/courses", "/teacher/courses", "/admin/classes", "/teacher/classes", "/student"]) {
    revalidatePath(p);
  }
}

export async function loadCourseAssignPanelAction(
  courseIds: string | string[]
): Promise<CourseAssignPanelData | null> {
  return loadCourseAssignPanel(courseIds);
}

export async function assignCourseAction(
  courseIds: string | string[],
  classIds: string[],
  studentIds: string[]
) {
  const r = await assignCourse(courseIds, classIds, studentIds);
  if (r.ok) done();
  return r;
}

export async function unassignCourseAction(
  courseIds: string | string[],
  opts: { classId?: string; studentId?: string }
) {
  const r = await unassignCourse(courseIds, opts);
  if (r.ok) done();
  return r;
}
