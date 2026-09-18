import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL as SITE_URL } from "@/lib/branding";

/** 검색엔진: 공개 소개 페이지만 모으고, 로그인 뒤 화면·공유 링크·API는 넣지 않는다 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/features", "/pricing", "/signup", "/terms", "/privacy", "/refund-policy"],
      disallow: [
        "/api/",
        "/admin",
        "/teacher",
        "/student",
        "/super-admin",
        "/report/",
        "/student-record/",
        "/nelt/",
        "/listen/",
        "/exam-vocab",
        "/login",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
