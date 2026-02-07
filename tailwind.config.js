/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "about-bg": "#e6eff2",
        "portfolio-bg": "#d5e1e8",
        "contact-bg": "#E7EFF2",
        "brand-blue": "#008de5",
        "brand-text": "#242424",
      },
      fontFamily: {
        jaro: ["Jaro", "sans-serif"],
        quicksand: ["Quicksand", "sans-serif"],
      },
    },
  },
  plugins: [],
}
