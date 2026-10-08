/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          main: '#080D1C',
          card: '#111A2E',
          'card-hover': '#17233D',
          elevated: '#1A2846',
        },
        brand: {
          amber: '#FFB51B',
          yellow: '#FFD166',
          cyan: '#38BDF8',
          green: '#10B981',
          500: '#FFB51B',
          400: '#FFD166',
          600: '#E59F0B',
        },
        slate: {
          950: '#080D1C',
          900: '#111A2E',
          850: '#15213B',
          800: '#1B2A4A',
          700: '#253860',
          600: '#3B527E',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        text: {
          main: '#F1F5F9',
          muted: '#94A3B8',
          subtle: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        'amber-glow': '0 0 20px rgba(255, 181, 27, 0.35)',
        'cyan-glow': '0 0 20px rgba(56, 189, 248, 0.35)',
      },
      transitionDuration: {
        '180': '180ms',
        '220': '220ms',
      }
    },
  },
  plugins: [],
}
