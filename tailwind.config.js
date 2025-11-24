/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,jsx}",
  ],
  theme: {
    screens: {
      'sm': '9999px',   // 절대 도달 불가능한 값
      'md': '9999px',   // 절대 도달 불가능한 값
      'lg': '9999px',   // 절대 도달 불가능한 값
      'xl': '9999px',   // 절대 도달 불가능한 값
      '2xl': '9999px',  // 절대 도달 불가능한 값
    },
    extend: {},
  },
  plugins: [],
}

