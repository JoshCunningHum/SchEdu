/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        main: {
          50: '#FAFBFB',
          100: '#F6F7F8',
          200: '#E5E8EB',
          300: '#CBD1D7',
          400: '#B9C2CA',
          500: '#A2ADB9',
          600: '#8B96A2',
          700: '#74808B',
          800: '#5D6974',
          900: '#424D57',
          950: '#28333E'
        },
        customPrimary: {
          50: '#F8F4EB',
          100: '#F3EBDB',
          200: '#E9DABD',
          300: '#DFC99E',
          400: '#D1B274',
          500: '#C39A4A',
          600: '#A07C35',
          700: '#765B27',
          800: '#4C3A19',
          900: '#211A0B',
          950: '#0C0A04',
        },
        customGray: {
          50: '#FFFFFF',
          100: '#F5F7F9',
          200: '#DCE2E9',
          300: '#C3CED9',
          400: '#AABAC9',
          500: '#91A6B9',
          600: '#7891A9',
          700: '#617D98',
          800: '#51697F',
          900: '#415466',
          950: '#364655',
        },
      }
    },
  },
  plugins: [],
}

