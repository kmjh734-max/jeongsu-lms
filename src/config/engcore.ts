/** EngCore 플랫폼 브랜드 (멀티테넌트 SaaS 공통) */

export const ENGCORE = {
  name: "EngCore",
  nameKo: "잉코어",
  fullName: "EngCore · 잉코어",
  tagline: "영어교육의 중심, EngCore",
  description: "영어학원의 모든 것을 하나로 · 영어 수업부터 학원 운영까지",
  slogans: [
    "영어교육의 중심, EngCore",
    "영어학원의 모든 것을 하나로",
    "영어 수업부터 학원 운영까지",
  ] as const,
  products: {
    admin: "EngCore Admin",
    learn: "EngCore Learn",
    teacher: "EngCore Teacher",
    words: "EngCore Words",
    listening: "EngCore Listening",
    ai: "EngCore AI",
    parent: "EngCore Parent",
  },
  meaning: "English + Core — 영어 학습과 학원 운영의 핵심 플랫폼",
} as const;
