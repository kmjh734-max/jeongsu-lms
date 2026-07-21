import type { UserRole } from "@/types/database";

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

export function getDashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATH[role];
}

export function isRolePathAllowed(
  role: UserRole,
  pathname: string
): boolean {
  const prefix = ROLE_DASHBOARD_PATH[role];
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** 학원 관리자(admin) 또는 전체 운영자(super_admin) */
export function isStaffAdminRole(role: UserRole | string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}
