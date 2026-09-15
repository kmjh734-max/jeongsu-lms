/** 왼쪽 메뉴 '오늘 할 일' 카드에 "방금 바뀌었어요"를 알리는 신호 (단계 완료·시험 제출 뒤) */
export const STUDENT_TODAY_CHANGED_EVENT = "student-today-changed";

export function notifyStudentTodayChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STUDENT_TODAY_CHANGED_EVENT));
}
