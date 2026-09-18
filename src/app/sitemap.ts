import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL as SITE_URL } from "@/lib/branding";
import { FEATURE_PAGES } from "@/lib/site/feature-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("", 1, "weekly"),
    page("/features", 0.9, "monthly"),
    ...FEATURE_PAGES.map((p) => page(`/features/${p.slug}`, 0.8, "monthly")),
    page("/pricing", 0.7, "monthly"),
    page("/signup", 0.6, "yearly"),
    page("/terms", 0.2, "yearly"),
    page("/privacy", 0.2, "yearly"),
    page("/refund-policy", 0.2, "yearly"),
  ];
}
