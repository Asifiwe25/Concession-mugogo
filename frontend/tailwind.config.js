/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50:'#fdfaf5',100:'#f7f0e4',200:'#ede0cc',300:'#deccb0',
          400:'#c8af8a',500:'#b09060',600:'#8c6e3f',700:'#6b5030',
          800:'#4a3520',900:'#2e1f10',
        },
      },
      fontFamily: {
        display:['"Playfair Display"','Georgia','serif'],
        body:['"DM Sans"','system-ui','sans-serif'],
        mono:['"JetBrains Mono"','monospace'],
      },
    },
  },
  plugins: [],
}
