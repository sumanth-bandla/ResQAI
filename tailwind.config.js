/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { 50: "#eef8f7", 100: "#d8eeeb", 600: "#12837f", 700: "#0c716e", 800: "#145c5b" },
        canvas: "#f3f5f7",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
