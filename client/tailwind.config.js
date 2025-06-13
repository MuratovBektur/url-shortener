/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // Префикс для Tailwind классов чтобы избежать конфликтов с Quasar
  // prefix: 'tw-',
  // Важно для работы с Quasar
  corePlugins: {
    preflight: false,
  },
};
