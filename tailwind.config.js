/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        coiny: ['Coiny', 'cursive'],
      },
      textShadow: {
        custom: '2px 2px 4px rgba(0, 0, 0, 0.5)', 
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
  ],
}

