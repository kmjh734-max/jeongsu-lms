import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningManageShell } from "@/components/listening/ListeningManageShell";

export default async function TeacherListeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") redirect("/login");

  return <ListeningManageShell role="teacher">{children}</ListeningManageShell>;
}
