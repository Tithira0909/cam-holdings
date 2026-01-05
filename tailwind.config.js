/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./admin/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#070708',
        accent: '#D6B25E',
      },
    },
  },
  plugins: [],
}
