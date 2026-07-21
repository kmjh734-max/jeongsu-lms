import type { UserRole } from "@/types/database";

export const ROLE_COOKIE = "engcore_role";
export const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const VALID_ROLES = new Set<string>([
  "admin",
  "teacher",
  "student",
  "super_admin",
]);

export function isUserRole(value: string | undefined | null): value is UserRole {
  return !!value && VALID_ROLES.has(value);
}

export function parseRoleCookie(value: string | undefined | null): UserRole | null {
  return isUserRole(value) ? value : null;
}

/** Client-side: set role hint for middleware (non-httpOnly). */
export function setRoleCookieClient(role: UserRole) {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${ROLE_COOKIE}=${role}; Path=/; Max-Age=${ROLE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearRoleCookieClient() {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
