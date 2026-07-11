import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

/**
 * ROOT de estilização do CifraLab.
 * Todos os design tokens (cores, tipografia, espaçamento, sombras, motion)
 * vivem AQUI. globals.css só tem resets que o Tailwind não cobre.
 *
 * Identidade: palco escuro (MultiTracks), acento âmbar quente
 * (luz de palco / madeira do violão). Otimizado para uso noturno.
 *
 * Fontes via next/font: --font-chakra, --font-inter, --font-jetbrains.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#fdeecd',
          200: '#fbdf9f',
          300: '#f8c96a',
          400: '#f2ab3c',
          500: '#e88f1f',
          600: '#c66d14',
          700: '#9e4f13',
          800: '#7f3e16',
          900: '#683316',
          950: '#3c1b09',
        },
        secondary: {
          0: '#ffffff',
          600: '#4a4440',
          700: '#37322e',
          800: '#26221f',
          900: '#1a1715',
          950: '#121009',
        },
        neutral: {
          100: '#e8e3d8',
          200: '#d4cec0',
          300: '#a4a4a4',
          500: '#8a8378',
          700: '#b5ada1',
          900: '#ece7dd',
        },
        stroke: {
          100: '#2b2723',
          200: '#3a342e',
        },
        auxiliary: {
          success: {
            default: '#7fd18a',
            background: '#12290f',
            border: '#2c5a2a',
          },
          danger: {
            default: '#f08a7a',
            background: '#33130e',
            border: '#6b2a20',
          },
          warning: {
            default: '#f2c24b',
            background: '#33270b',
            border: '#6b5518',
          },
          info: {
            default: '#7ab8f0',
            background: '#0e2033',
            border: '#20466b',
          },
        },
      },
      fontFamily: {
        chakra: ['var(--font-chakra)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      boxShadow: {
        glow: '0 0 18px rgba(242, 171, 60, 0.35)',
        'glow-sm': '0 0 10px rgba(242, 171, 60, 0.2)',
        'glow-lg': '0 0 32px rgba(242, 171, 60, 0.4)',
        '10': '0 1px 4px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(25, 25, 25, 0.08)',
        '60': '0 4px 12px 0 rgba(25, 25, 25, 0.20)',
        '69': '0 4px 16px 0 rgba(66, 69, 77, 0.06), 0 2px 6px 0 rgba(66, 69, 77, 0.10)',
        stage: '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(242, 171, 60, 0.06)',
        popover:
          '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(242, 171, 60, 0.1), 0 0 24px rgba(242, 171, 60, 0.12)',
        'negative-footer': '0 -4px 14px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms',
        slow: '320ms',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        iconTranslateLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-2px)' },
        },
        modalSlideIn: {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        modalSlideOut: {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(8px)', opacity: '0' },
        },
        overlayFadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        overlayFadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popoverIn: {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        progress: 'progress var(--slide-duration, 3s) linear forwards',
        'icon-translate-left': 'iconTranslateLeft 0.3s ease-in-out',
        'modal-slide-in': 'modalSlideIn 0.2s ease-out forwards',
        'modal-slide-out': 'modalSlideOut 0.2s ease-in forwards',
        'modal-overlay-fade-in': 'overlayFadeIn 0.2s ease-out forwards',
        'modal-overlay-fade-out': 'overlayFadeOut 0.2s ease-in forwards',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'popover-in': 'popoverIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      fontSize: {
        xs: ['0.75rem', '140%'],
        sm: ['0.875rem', '140%'],
        md: ['1rem', '140%'],
        xl: ['1.125rem', '140%'],
        '2xl': ['1.25rem', '140%'],
        '3xl': ['2rem', '120%'],
        '4xl': ['2.5rem', '120%'],
        '5xl': ['3rem', '120%'],
        '6xl': ['4rem', '120%'],
      },
      zIndex: {
        chord: '60',
        drawer: '50',
        overlay: '40',
      },
    },
    container: {
      center: true,
      padding: '5%',
      screens: {
        '2xl': '1440px',
        xl: '1440px',
        lg: '1440px',
        md: '100%',
        sm: '100%',
      },
    },
    screens: {
      ...defaultTheme.screens,
      '@mobile': { min: '639px' },
      '@tablet': { min: '999px' },
      '@laptop': { min: '1025px' },
      '@Desktop': { min: '1281px' },
      '@Desktop1440': { min: '1438px' },
      '@LargeDesktop': { min: '1537px' },
      '@UltraWide': { min: '1929px' },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const neutral100 = theme('colors.neutral.100') as string;
      const neutral300 = theme('colors.neutral.300') as string;
      const neutral500 = theme('colors.neutral.500') as string;

      addUtilities({
        '.scrollbar-custom': {
          '&::-webkit-scrollbar': { width: '12px' },
          '&::-webkit-scrollbar-track': {
            backgroundColor: neutral100,
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: neutral300,
            borderRadius: '9999px',
            border: `2px solid ${neutral100}`,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: neutral500,
          },
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
};

export default config;
