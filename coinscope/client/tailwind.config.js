/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Primary brand: emerald (10–900). Tailwind's emerald palette is fine,
        // but we expose a semantic 'brand' alias so we can swap shades centrally.
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Accent: gold/amber for highlights, the brand secondary.
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        ink: {
          DEFAULT: '#0b1220',
          soft: '#1f2937',
        },
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 4px 16px -2px rgba(16, 185, 129, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        glow: '0 0 0 4px rgba(16, 185, 129, 0.18)',
      },
      borderRadius: {
        xl: '0.9rem',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(120deg, #059669 0%, #10b981 45%, #f59e0b 100%)',
      },
    },
  },
  plugins: [],
};
