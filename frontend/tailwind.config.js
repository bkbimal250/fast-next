/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',   // PRIMARY (Main Brand)
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',   // Header/Footer
          900: '#134e4a',
        },
        gold: {
          400: '#E6B566',
          500: '#C9A24D',   // CTA / Accent (Primary Buttons)
          600: '#B8963C',
        },
        surface: {
          light: '#F7F9F8',
          dark: '#0F172A',
        },
        // Keep primary for backward compatibility, map to brand
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
    },
  },
  plugins: [],
}

