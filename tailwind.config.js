/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sedec: {
          50: '#EBF1FA',
          100: '#D6E4F0',
          200: '#B0C9E4',
          300: '#7BA8D4',
          400: '#4A87C4',
          500: '#2E75B6',
          600: '#1F3864',
          700: '#162A4A',
          800: '#0E1C32',
          900: '#070E19',
        },
        dc: {
          orange: '#E97724',
          'orange-light': '#F5A623',
          dark: '#1A1A1A',
        }
      }
    }
  },
  plugins: [],
}
