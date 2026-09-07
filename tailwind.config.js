/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        cyber: {
          dark: '#05050a',
          card: '#121224',
          accent: '#00ffcc',
          pink: '#ff00ff',
          purple: '#3a1a5a',
        }
      }
    },
  },
  plugins: [],
}
