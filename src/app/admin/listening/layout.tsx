import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningManageShell } from "@/components/listening/ListeningManageShell";

export default async function AdminListeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  return <ListeningManageShell role="admin">{children}</ListeningManageShell>;
}
