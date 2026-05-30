/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#ecfdf5",
          primary: "#10b981",
          dark: "#065f46",
        }
      }
    },
  },
  plugins: [],
}