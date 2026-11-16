/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070915',
          900: '#0b0e1f',
          850: '#0f1329',
          800: '#141936',
          700: '#1c2347',
          600: '#283058',
          500: '#3a4270',
        },
        fog: {
          100: '#eef0fb',
          200: '#d4d8f0',
          300: '#a9afd2',
          400: '#7d84ad',
          500: '#5b6290',
        },
        brand: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(139,92,246,0.35), 0 10px 40px -10px rgba(139,92,246,0.45)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'none' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'none' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        pulsering: { '0%': { transform: 'scale(1)', opacity: '.55' }, '100%': { transform: 'scale(1.9)', opacity: '0' } },
        bar: { '0%,100%': { transform: 'scaleY(.3)' }, '50%': { transform: 'scaleY(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .35s cubic-bezier(.2,.7,.2,1) both',
        'scale-in': 'scale-in .2s cubic-bezier(.2,.7,.2,1) both',
        shimmer: 'shimmer 1.4s linear infinite',
        pulsering: 'pulsering 1.8s cubic-bezier(.2,.7,.2,1) infinite',
        bar: 'bar 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
