/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          950: 'rgb(var(--color-primary-950) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
        },
        accent: {
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          300: 'rgb(var(--color-accent-300) / <alpha-value>)',
          200: 'rgb(var(--color-accent-200) / <alpha-value>)',
          100: 'rgb(var(--color-accent-100) / <alpha-value>)',
          50: 'rgb(var(--color-accent-50) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Open Sauce One', 'Open Sans', 'system-ui', 'sans-serif'],
        display: ['Open Sauce One', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'tiny': '0.625rem', // 10px
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'popup': 'popup 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
      },
      keyframes: {
        popup: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      backgroundPosition: {
        'right-1': 'right 0.25rem center',
      },
      boxShadow: {
        'inner-md': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
      },
      zIndex: {
        '1': 1,
        '2': 2,
        '3': 3,
      }
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}; 