/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 🔥 এই লাইনটি না থাকলে ডার্ক মোড কাজ করবে না
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};