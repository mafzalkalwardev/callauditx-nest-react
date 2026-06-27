/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: "#0F172A",
        darkSidebar: "#020617",
        darkCard: "#1E293B",
        lightBg: "#F8FAFC",
        lightCard: "#FFFFFF",
        accentBlue: "#3B82F6",
        accentPurple: "#8B5CF6",
        accentBlueLight: "#2563EB",
      }
    },
  },
  plugins: [],
}
