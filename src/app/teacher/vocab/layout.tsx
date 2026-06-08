import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabManageShell } from "@/components/vocab/VocabManageShell";

export default async function TeacherVocabLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") redirect("/login");

  return <VocabManageShell role="teacher">{children}</VocabManageShell>;
}
