/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1D7FBE", // Основной синий
          hover: "#21B6A8", // Бирюзовый для hover
        },
        accent: "#21B6A8", // Акцентный (бирюзовый)
        background: "#F9FAFB", // Светлый фон
        text: {
          DEFAULT: "#0F172A", // Основной текст
          secondary: "#64748B", // Второстепенный текст
        },
        success: "#22C55E", // Успешные состояния
        error: "#EF4444", // Ошибки
        white: "#FFFFFF", // Белый
      },
    },
  },
  plugins: [],
};
