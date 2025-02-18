/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Couleur principale
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          500: '#f472b6', // Rose pour les accents
        }
      },
      boxShadow: {
        'glow': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
      },
    },
  },
  plugins: [],
};
