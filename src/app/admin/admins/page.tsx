import { createClient } from "@/lib/supabase/server";
import { loadLastSignIns } from "@/lib/accounts/last-sign-in";
import {
  StaffAccountsBoard,
  type StaffRow,
} from "@/components/accounts/StaffAccountsBoard";
import type { Profile } from "@/types/database";

export default async function AdminAdminsPage() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .order("name");

  const adminList = (admins ?? []) as Profile[];
  const lastSignIns = await loadLastSignIns(adminList.map((a) => a.id));

  const rows: StaffRow[] = adminList.map((a) => ({
    id: a.id,
    name: a.name,
    username: a.username,
    email: a.email,
    is_active: a.is_active,
    lastSignInAt: lastSignIns[a.id] ?? null,
  }));

  return (
    <StaffAccountsBoard
      title="관리자 계정"
      description="학원을 함께 관리할 계정을 등록하고 관리합니다."
      roleLabel="관리자"
      apiBasePath="/api/admin/admins"
      users={rows}
      allowUsernameEdit
      note="마지막 남은 관리자 계정은 삭제할 수 없어요. 쉬게 한 계정은 다시 활성으로 바꾸기 전까지 로그인할 수 없어요."
    />
  );
}
