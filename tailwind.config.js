/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'forest': '#2C4A3C',
        'olive': '#5D7B5F',
        'sage': '#A8B9A3',
        'cream': '#F5F2E8',
        'hub-bg': '#f4eaca',
      },
    },
  },
  plugins: [],
};
