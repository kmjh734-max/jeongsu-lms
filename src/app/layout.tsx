import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  LOGO_SRC,
  PRIMARY_COLOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: LOGO_SRC,
        width: 800,
        height: 800,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [LOGO_SRC],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeStyle = {
    "--academy-primary": PRIMARY_COLOR,
    "--academy-secondary": PRIMARY_COLOR,
  } as CSSProperties;

  return (
    <html lang="ko">
      <body style={themeStyle}>{children}</body>
    </html>
  );
}
