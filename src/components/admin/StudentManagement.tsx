"use client";

import { AccountManagement } from "@/components/admin/AccountManagement";
import type { TreeNode } from "@/lib/ui/tree-types";
import type { Profile } from "@/types/database";

interface StudentManagementProps {
  students: Profile[];
  studentTree: TreeNode[];
  /** 등록 카드와 명단 사이 영역 (이름 검색·페이지네이션 등) */
  beforeList?: React.ReactNode;
}

export function StudentManagement({
  students,
  studentTree,
  beforeList,
}: StudentManagementProps) {
  return (
    <AccountManagement
      roleLabel="학생"
      apiBasePath="/api/admin/students"
      users={students}
      allowUsernameEdit
      allowDelete={true}
      showListSearch
      listSearchPlaceholder="학생 이름·아이디 검색"
      listFilterTree={studentTree}
      listFilterLabel="반·학생으로 찾기"
      beforeList={beforeList}
    />
  );
}
