/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1D7FBE",
          hover: "#21B6A8",
        },
        accent: "#21B6A8",
        background: "#F9FAFB",
        text: {
          DEFAULT: "#0F172A",
          secondary: "#64748B",
        },
        success: "#22C55E",
        error: "#EF4444",
        white: "#FFFFFF",
        input: {
          bg: "#FFFFFF",
          border: "#D1D5DB",
          "border-focus": "#1D7FBE",
          text: "#0F172A",
          placeholder: "#9CA3AF",
        },
        card: {
          bg: "#FFFFFF",
          border: "#E5E7EB",
          shadow: "rgba(0, 0, 0, 0.1)",
        },
        modal: {
          overlay: "rgba(0, 0, 0, 0.5)",
          bg: "#FFFFFF",
          border: "#E5E7EB",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
        hover: {
          bg: "#F3F4F6",
        },
        disabled: {
          text: "#9CA3AF",
          bg: "#F3F4F6",
        },
        focus: {
          ring: "rgba(29, 127, 190, 0.3)",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        modal:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
