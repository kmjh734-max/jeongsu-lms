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
  // 열어 둔 탭이 예전 배포의 코드인지 가린다(use-reload-on-new-deploy).
  env: {
    NEXT_PUBLIC_BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  },
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
    "/api/lesson-materials/illustration": comicTracePaths,
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
