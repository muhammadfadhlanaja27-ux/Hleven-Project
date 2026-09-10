/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "warm-surface": "#F9F6F1",
        "deep-charcoal": "#2F3231",
        "status-active": "#768875",
        primary: "#4f604f",
        "primary-container": "#677967",
        secondary: "#4e644b",
        "secondary-container": "#d1eac9",
        tertiary: "#625b51",
        "tertiary-container": "#7c7369",
        error: "#ba1a1a",
        background: "#f8faf8",
        "border-subtle": "#E5E0D8",
      },
      fontFamily: {
        newsreader: ["'Newsreader'", "serif"],
        hanken: ["'Hanken Grotesk'", "sans-serif"],
      },
      spacing: {
        "sidebar-width": "260px",
        "header-height": "72px",
        "component-gap": "16px",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(47, 50, 49, 0.06)",
        modal: "0 12px 40px rgba(47, 50, 49, 0.12)",
      },
    },
  },
  plugins: [],
};