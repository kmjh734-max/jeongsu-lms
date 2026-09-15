/** 대시보드 메뉴 항목과 묶음·활성 판단 (왼쪽 메뉴·위 막대·학생 탭이 함께 씀) */

export interface AppNavItem {
  href: string;
  label: string;
  /** 메뉴 묶음 (예: "학습", "리포트", "관리"). 없으면 기본 묶음 */
  group?: string;
}

export type HeaderBranding = {
  name: string;
  logoUrl: string;
};

type NavGroup = { key: string; label: string | null; items: AppNavItem[] };

/** group 필드 기준으로 순서를 유지하며 묶는다. group이 하나뿐이면 라벨 숨김 */
export function groupNavItems(items: AppNavItem[]): NavGroup[] {
  const groups: NavGroup[] = [];
  const index = new Map<string, NavGroup>();
  for (const item of items) {
    const key = item.group ?? "";
    let g = index.get(key);
    if (!g) {
      g = { key: key || "_default", label: item.group ?? null, items: [] };
      index.set(key, g);
      groups.push(g);
    }
    g.items.push(item);
  }
  // 실제로 나뉜 묶음이 2개 이상일 때만 라벨/구분선을 노출
  if (groups.length < 2) {
    return [{ key: "_all", label: null, items }];
  }
  return groups;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (
    href === "/admin" ||
    href === "/teacher" ||
    href === "/student" ||
    href === "/super-admin"
  ) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
