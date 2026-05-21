import type { Class } from "@/types/database";
import type { TreeNode } from "@/lib/ui/tree-types";

export function buildClassPickerTree(classes: Class[]): TreeNode[] {
  return [...classes]
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .map((c) => ({
      type: "leaf" as const,
      id: c.id,
      label: c.name,
      searchText: c.name,
    }));
}
