import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@ffmpeg-installer/ffmpeg",
    "@napi-rs/canvas",
    "pdf-parse",
    "pdfjs-dist",
  ],
  outputFileTracingIncludes: {
    "/api/student-records/extract": [
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
      "./node_modules/@napi-rs/canvas/**/*",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
};

export default nextConfig;
