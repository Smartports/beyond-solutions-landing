const base = require('../../tailwind.config.cjs');

module.exports = {
  ...base,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
    ...(base.content || []),
  ],
  safelist: [
    // primary & accent colour scale
    { pattern: /(bg|text|border|from|to|ring)-(primary|accent)-[0-9]{2,3}/ },
    // zinc greys for dark-mode
    { pattern: /(bg|text|border|ring)-(zinc)-[0-9]{2,3}/ },
    // StepIndicator explicit classes for accessibility
    'bg-gray-300', 'text-gray-700', 'bg-gray-700', 'text-gray-200',
    // size paddings generated in code (w-48, px-6, gap-4 …)
    { pattern: /^(w|h|max-w|max-h|min-w|min-h|p|m|gap)-\d+$/ },
  ],
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
    },
  },
};
