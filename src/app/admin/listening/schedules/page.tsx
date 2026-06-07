import { redirect } from "next/navigation";

export default function AdminListeningSchedulesRedirect() {
  redirect("/admin/listening/assign");
}
