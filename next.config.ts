import type { NextConfig } from "next";

const pdfTracePaths = [
  "./node_modules/pdf-parse/**/*",
  "./node_modules/pdfjs-dist/**/*",
  "./node_modules/@napi-rs/canvas/**/*",
];

const comicTracePaths = [
  "./assets/fonts/**/*",
  "./public/fonts/**/*",
  "./node_modules/@napi-rs/canvas/**/*",
  "./node_modules/sharp/**/*",
  "./node_modules/@img/**/*",
];

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@ffmpeg-installer/ffmpeg",
    "@napi-rs/canvas",
    "sharp",
    "pdf-parse",
    "pdfjs-dist",
  ],
  outputFileTracingIncludes: {
    "/api/student-records/extract": pdfTracePaths,
    "/api/student-records/analyze": pdfTracePaths,
    // Server Actions for lesson-material comics (Hangul speech bubbles)
    "/admin/lesson-materials/input": comicTracePaths,
    "/teacher/lesson-materials/input": comicTracePaths,
    "/admin/lesson-materials/project/[projectId]": comicTracePaths,
    "/teacher/lesson-materials/project/[projectId]": comicTracePaths,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
};

export default nextConfig;
