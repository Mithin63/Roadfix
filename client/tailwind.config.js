import plugin from 'tailwindcss/plugin';

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
          main: 'var(--bg-main)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-elevated)',
          elevated: 'var(--bg-elevated)',
        },
        brand: {
          amber: 'var(--primary-amber)',
          yellow: 'var(--warm-highlight)',
          cyan: 'var(--nav-cyan)',
          green: 'var(--success)',
          500: 'var(--primary-amber)',
          400: 'var(--warm-highlight)',
          600: 'var(--primary-amber)',
        },
        theme: {
          main: 'var(--bg-main)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          elevated: 'var(--bg-elevated)',
          amber: 'var(--primary-amber)',
          highlight: 'var(--warm-highlight)',
          cyan: 'var(--nav-cyan)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          border: 'var(--border-color)',
          success: 'var(--success)',
          error: 'var(--error)',
        },
        parchment: '#F6F3EE',
        'parchment-deep': '#EFECE5',
        'ink-black': '#111215',
        'safety-amber': '#F59E0B',
        'safety-orange': '#FF6B00',
        'safety-yellow': '#FACC15',
        'road-slate': '#23272F',
        'tint-cream': '#FAF8F5',
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
          main: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          subtle: '#64748B',
        }
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-heading)', 'Manrope', 'system-ui', 'sans-serif'],
        headline: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        editorial: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        signature: ['var(--font-signature)', 'Caveat', 'cursive'],
        hand: ['"Caveat"', 'cursive'],
        mono: ['"Space Mono"', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
        'amber-glow': '0 0 20px rgba(255, 181, 27, 0.35)',
        'cyan-glow': '0 0 20px rgba(56, 189, 248, 0.35)',
      },
      transitionDuration: {
        '180': '180ms',
        '220': '220ms',
      }
    },
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('light', '.light &');
    })
  ],
}

