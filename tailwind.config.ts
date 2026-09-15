import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4fc",
          100: "#dce8f9",
          200: "#bcd2f3",
          300: "#91b4ea",
          400: "#5f8edb",
          500: "#3b73d2",
          600: "#2563c9",
          700: "#1d4fa3",
          800: "#1a4283",
          900: "#16375f",
          950: "#0e1d2f",
        },
        /** 왼쪽 메뉴(어두운 남색) */
        side: {
          DEFAULT: "#0e1d2f",
          hover: "#162a42",
          active: "#1c3452",
          card: "#152840",
          text: "#a9b6c7",
          icon: "#6f829a",
          group: "#5a6d85",
          muted: "#8fa1b8",
        },
        /** 본문 바탕 */
        canvas: "#f1f3f6",
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          "Pretendard",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 26 42 / 0.05)",
        "card-hover":
          "0 4px 12px 0 rgb(15 26 42 / 0.08), 0 1px 3px 0 rgb(15 26 42 / 0.05)",
      },
      keyframes: {
        indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(250%)" },
        },
      },
      animation: {
        indeterminate: "indeterminate 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
