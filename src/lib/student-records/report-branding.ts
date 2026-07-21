import { ACADEMY_NAME, LOGO_SRC, SITE_URL } from "@/lib/branding";
import type { AcademyBranding } from "@/lib/tenant/academy-branding";
import { fallbackAcademyBranding } from "@/lib/tenant/academy-branding";

function resolveLogoUrl(logoPath: string): string {
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath;
  }
  return new URL(logoPath, SITE_URL).toString();
}

/**
 * AI가 생성한 보고서 HTML에 학원 로고·학원명 머리말과 꼬리말을 삽입.
 * branding을 넘기면 해당 학원 기준으로, 없으면 env 폴백.
 */
export function applyAcademyBrandingToReportHtml(
  html: string,
  branding?: Pick<AcademyBranding, "name" | "logoUrl"> | null
): string {
  const b = branding ?? fallbackAcademyBranding();
  const academyName = b.name || ACADEMY_NAME;
  const hasLogo = Boolean(b.logoUrl?.trim());
  const logoUrl = hasLogo ? resolveLogoUrl(b.logoUrl) : "";

  const titleBranding = [
    `<span data-academy-branding="header" style="display:inline-flex;align-items:center;gap:10px;flex-shrink:0;">`,
    hasLogo
      ? [
          `<span style="display:inline-flex;background:#ffffff;border-radius:12px;padding:6px 10px;box-shadow:0 4px 14px rgba(0,0,0,.18);">`,
          `<img src="${logoUrl}" alt="${academyName}" style="height:30px;width:auto;display:block;"/>`,
          `</span>`,
        ].join("")
      : "",
    `<span style="font-size:1.15rem;font-weight:900;color:#ffffff;letter-spacing:-0.02em;text-shadow:0 2px 8px rgba(0,0,0,.25);">${academyName}</span>`,
    `</span>`,
  ].join("");

  const fallbackHeader = [
    `<div data-academy-branding="header" style="max-width:1180px;margin:0 auto;padding:22px 18px 0;display:flex;align-items:center;justify-content:center;gap:12px;">`,
    hasLogo
      ? `<img src="${logoUrl}" alt="${academyName}" style="height:40px;width:auto;display:block;"/>`
      : "",
    `<span style="font-size:1.25rem;font-weight:900;color:#1a237e;letter-spacing:-0.02em;">${academyName}</span>`,
    `</div>`,
  ].join("");

  const footer = [
    `<div data-academy-branding="footer" style="max-width:1180px;margin:30px auto 0;padding:18px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;gap:8px;color:#64748b;font-size:12px;">`,
    hasLogo
      ? `<img src="${logoUrl}" alt="" style="height:18px;width:auto;display:block;opacity:.9;"/>`
      : "",
    `<span style="font-weight:700;color:#475569;">${academyName}</span>`,
    `<span>· 본 보고서는 ${academyName}에서 제작했습니다.</span>`,
    `</div>`,
  ].join("");

  let out = html.replace(
    /<div data-academy-branding="header"[\s\S]*?<\/div>/i,
    ""
  );

  if (!out.includes('data-academy-branding="header"')) {
    const h1Pattern = /<h1([^>]*)>([\s\S]*?)<\/h1>/i;
    if (h1Pattern.test(out)) {
      out = out.replace(
        h1Pattern,
        (_m, attrs: string, inner: string) =>
          `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">` +
          `<h1${attrs}>${inner}</h1>${titleBranding}</div>`
      );
    } else if (/<body[^>]*>/i.test(out)) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}\n${fallbackHeader}`);
    } else {
      out = `${fallbackHeader}\n${out}`;
    }
  }

  if (!out.includes('data-academy-branding="footer"')) {
    if (/<\/body>/i.test(out)) {
      out = out.replace(/<\/body>/i, `${footer}\n</body>`);
    } else {
      out = `${out}\n${footer}`;
    }
  }

  return out;
}
