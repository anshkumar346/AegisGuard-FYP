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
        cyber: {
          darkest: '#080B11',
          bg: '#0B0F19',
          surface: '#111827',
          card: '#131B2E',
          cardHover: '#18223B',
          border: '#1F293D',
          borderLight: '#2D3A54',
          accent: '#38BDF8',
          accentGlow: 'rgba(56, 189, 248, 0.25)',
          neonGreen: '#10B981',
          neonEmerald: '#059669',
          neonCyan: '#06B6D4',
          neonRed: '#EF4444',
          neonOrange: '#F59E0B',
          neonPurple: '#8B5CF6',
          muted: '#94A3B8'
        }
      },
      boxShadow: {
        'cyber-cyan': '0 0 20px -3px rgba(56, 189, 248, 0.25)',
        'cyber-green': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'cyber-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.2))' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
