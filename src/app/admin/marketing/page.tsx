import { redirect } from "next/navigation";

/** 마케팅 탭의 첫 기능은 어휘 진단뿐이라 그리로 보낸다 */
export default function MarketingPage() {
  redirect("/admin/marketing/vocab-diagnostic");
}
