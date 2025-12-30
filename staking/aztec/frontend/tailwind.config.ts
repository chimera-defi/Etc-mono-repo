import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aztec-purple': '#7B3FE4',
        'aztec-purple-light': '#9B6FE8',
        'aztec-purple-dark': '#5B2FC4',
        'aztec-dark': '#0D0D1A',
        'aztec-card': '#1A1A2E',
        'aztec-border': '#2D2D44',
        'aztec-success': '#22C55E',
        'aztec-warning': '#F59E0B',
        'aztec-error': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7B3FE4 0%, #5B2FC4 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
