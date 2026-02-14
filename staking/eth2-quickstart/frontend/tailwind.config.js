/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.02)',
          foreground: '#fafafa',
        },
        primary: {
          DEFAULT: '#a855f7',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#71717a',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#18181b',
          foreground: '#a1a1aa',
        },
        border: 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
