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
        },
        surface: {
          0: '#FFFFFF',
          1: '#F9FAFB',
          2: '#F3F4F6',
          3: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: [],
}
