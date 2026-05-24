import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import type { Lesson, Section } from "@/types/database";

/** 순서대로: 이전 강의 완료 시에만 다음 강의 시청 가능 */
export function buildLessonUnlockMap(
  orderedLessonIds: string[],
  completedLessonIds: Iterable<string>
): Map<string, boolean> {
  const completed = new Set(completedLessonIds);
  const map = new Map<string, boolean>();
  for (let i = 0; i < orderedLessonIds.length; i++) {
    const id = orderedLessonIds[i];
    map.set(id, i === 0 || completed.has(orderedLessonIds[i - 1]));
  }
  return map;
}

export function isLessonUnlocked(
  orderedLessonIds: string[],
  completedLessonIds: Set<string>,
  lessonId: string
): boolean {
  const index = orderedLessonIds.indexOf(lessonId);
  if (index < 0) return false;
  if (index === 0) return true;
  return completedLessonIds.has(orderedLessonIds[index - 1]);
}

export function computeLessonUnlockFromCourse(
  sections: Pick<Section, "id" | "course_id" | "order_index">[],
  lessons: Pick<
    Lesson,
    "id" | "course_id" | "title" | "order_index" | "section_id" | "is_published"
  >[],
  progressRows: { lesson_id: string; is_completed: boolean | null }[]
): Map<string, boolean> {
  const published = lessons.filter((l) => l.is_published);
  const flat = flattenCourseLessons(
    sections as Section[],
    published as Lesson[]
  );
  const completed = progressRows
    .filter((p) => p.is_completed)
    .map((p) => p.lesson_id);
  return buildLessonUnlockMap(
    flat.map((l) => l.id),
    completed
  );
}
