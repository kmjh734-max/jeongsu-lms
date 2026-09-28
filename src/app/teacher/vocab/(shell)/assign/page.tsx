import { redirect } from "next/navigation";

/**
 * 배정 화면은 없앴다(2026-09-28). 예전 주소나 즐겨찾기로 들어오면 세트 목록으로 보낸다.
 * 배정은 세트 목록에서 단어장을 고르면 바로 한다.
 */
export default function Page() {
  redirect("/teacher/vocab/sets");
}
