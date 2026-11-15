/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          brilliant: '#FFD700',
          glow: '#FFC928',
          metallic: '#D4AF37',
          DEFAULT: '#D4AF37',
          light: '#FFF0A6',
          dark: '#997B1A',
        },
        platinum: {
          50: '#F7F8FA',
          100: '#EEF0F3',
          200: '#DDE2E7',
          300: '#C5CBD3',
          DEFAULT: '#C5CBD3',
          400: '#9BA3AF',
          500: '#757E8D',
        },
        obsidian: {
          DEFAULT: '#17191D',
          dark: '#0F1013',
          card: '#1C1F25',
          border: '#2A2E38',
        },
        charcoal: {
          DEFAULT: '#22252B',
          light: '#2D313A',
          border: '#353A45',
        },
        softwhite: {
          DEFAULT: '#F8F9FB',
          card: '#FFFFFF',
          border: '#E3E6EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Consolas', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'gold-subtle': '0 2px 14px -2px rgba(212, 175, 55, 0.15)',
        'gold-glow': '0 0 25px rgba(255, 201, 40, 0.22)',
      }
    },
  },
  plugins: [],
}
