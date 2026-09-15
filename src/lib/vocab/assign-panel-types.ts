/** 배정 창(반·학생 고르기)에서 쓰는 자료 모양 */

export interface AssignPanelClass {
  id: string;
  name: string;
  studentIds: string[];
}

export interface AssignPanelStudent {
  id: string;
  name: string;
  username: string | null;
  classIds: string[];
  /** 예: "2반, 3반" — 반이 없으면 "반 없음" */
  classLabel: string;
}

export interface AssignPanelAssignment {
  id: string;
  set_id: string;
  student_id: string | null;
  class_id: string | null;
  created_at: string;
  student_name: string;
  class_name: string | null;
}

export interface VocabAssignPanelData {
  sets: { id: string; title: string }[];
  classes: AssignPanelClass[];
  students: AssignPanelStudent[];
  assignments: AssignPanelAssignment[];
}
