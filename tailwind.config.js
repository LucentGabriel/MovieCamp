/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 Add this line
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cinema-red': '#E50914',
        'cinema-black': '#000000',
        'cinema-gray': '#1A1A1A',
        'cinema-light': '#FFFFFF',
        'cinema-text': '#1A1A1A',
        'cinema-gold': '#ffcc008e',
      },
    },
  },
  plugins: [],
}
