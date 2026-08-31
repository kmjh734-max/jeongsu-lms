import { revalidatePath } from "next/cache";

export function revalidateLessonMaterialPaths(
  role: "admin" | "teacher",
  opts?: { folderId?: string; projectId?: string }
) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";

  revalidatePath(base);
  revalidatePath(`${base}/projects`);
  revalidatePath(`${base}/unfiled`);
  if (opts?.folderId) revalidatePath(`${base}/folder/${opts.folderId}`);
  if (opts?.projectId) revalidatePath(`${base}/project/${opts.projectId}`);
}
