import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A2742',
        accent: '#E9A23B',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
        success: '#10B981',
        error: '#EF4444',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        input: '6px',
      },
    },
  },
  plugins: [],
}

export default config
