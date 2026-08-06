/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // H'Leven Brand Colors
        "primary": "#50604d",
        "on-primary": "#ffffff",
        "primary-container": "#687965",
        "on-primary-container": "#f7fff1",
        "primary-fixed": "#d5e8cf",
        "primary-fixed-dim": "#baccb4",
        "on-primary-fixed": "#111f10",
        "on-primary-fixed-variant": "#3b4b39",
        "inverse-primary": "#baccb4",

        "secondary": "#4c6546",
        "on-secondary": "#ffffff",
        "secondary-container": "#ceebc4",
        "on-secondary-container": "#526b4c",
        "secondary-fixed": "#ceebc4",
        "secondary-fixed-dim": "#b3cea9",
        "on-secondary-fixed": "#0a2008",
        "on-secondary-fixed-variant": "#354d30",

        "tertiary": "#645b4f",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#7d7366",
        "on-tertiary-container": "#fffbff",
        "tertiary-fixed": "#eee0d1",
        "tertiary-fixed-dim": "#d1c5b6",
        "on-tertiary-fixed": "#211b11",
        "on-tertiary-fixed-variant": "#4e453a",

        // Surfaces & Backgrounds
        "surface": "#fff8f0",
        "surface-dim": "#e0d9d0",
        "surface-bright": "#fff8f0",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#faf3ea",
        "surface-container": "#f4ede4",
        "surface-container-high": "#eee7de",
        "surface-container-highest": "#e8e2d9",
        "surface-variant": "#e8e2d9",
        "surface-tint": "#52634f",

        "on-surface": "#1e1b16",
        "on-surface-variant": "#444842",
        "inverse-surface": "#33302a",
        "inverse-on-surface": "#f7f0e7",

        "background": "#fff8f0",
        "on-background": "#1e1b16",

        // Named Brand Palette
        "forest-green": "#778873",
        "sage-green": "#A1BC98",
        "warm-beige": "#DCCFC0",
        "off-white": "#FDF6ED",
        "text-main": "#2D332C",

        // Status & Alerts
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "status-success": "#4F6F52",
        "status-error": "#A0522D",

        // Outlines
        "outline": "#747871",
        "outline-variant": "#c4c8bf",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        "section-gap": "5rem",
        "stack-lg": "2rem",
        "stack-md": "1rem",
        "stack-sm": "0.5rem",
        "margin-desktop": "2.5rem",
        "margin-mobile": "1rem",
        "container-max": "1280px",
        "gutter": "1.5rem",
      },
      fontFamily: {
        headline: ["Libre Caslon Text", "serif"],
        body: ["Hanken Grotesk", "sans-serif"],
        label: ["Hanken Grotesk", "sans-serif"],
        "headline-lg": ["Libre Caslon Text", "serif"],
        "headline-md": ["Libre Caslon Text", "serif"],
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "label-md": ["Hanken Grotesk", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 4px 20px -2px rgba(119, 136, 115, 0.08)",
        "ambient-hover": "0 8px 30px -4px rgba(119, 136, 115, 0.14)",
      },
    },
  },
  plugins: [],
};
