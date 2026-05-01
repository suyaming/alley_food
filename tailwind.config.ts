import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/pages/**/*.{vue,js,ts}',
    './app/composables/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  // These class names are toggled at runtime by Vue's <Transition>/<NuxtPage>
  // and never appear literally in source files, so Tailwind would purge them.
  safelist: [
    'page-enter-active',
    'page-enter-from',
    'page-leave-active',
    'page-leave-to',
    'caption-rise',
    'shimmer-hairline',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        subtle: 'var(--subtle)',
        line: 'var(--border)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        invert: 'var(--invert)',
        'invert-fg': 'var(--invert-fg)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Fraunces', ...defaultTheme.fontFamily.serif],
        cn: ['"Noto Serif SC"', '"Songti SC"', '"STSong"', 'serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'editorial-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        300: '300ms',
        400: '400ms',
        700: '700ms',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1.0)' },
          '100%': { transform: 'scale(1.06)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fadeUp-fast': 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeIn: 'fadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        scaleIn: 'scaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        kenBurns: 'kenBurns 18s cubic-bezier(0.4, 0, 0.6, 1) both infinite alternate',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
      letterSpacing: {
        widest: '0.2em',
      },
      fontSize: {
        'display-sm': ['clamp(2.25rem, 4vw, 3rem)', { lineHeight: '1.05' }],
        display: ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '0.98' }],
        'display-lg': ['clamp(3.5rem, 9vw, 7.5rem)', { lineHeight: '0.95' }],
      },
    },
  },
  plugins: [],
} satisfies Config
