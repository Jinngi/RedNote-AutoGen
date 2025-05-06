/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'redbook': '#FF5777',
        'redbook-dark': '#E64A6D',
        'accent': '#FFD700',
        'accent-light': '#FFDF4D',
        'light-gray': '#F8F8F8',
        'text-dark': '#333333',
        'text-medium': '#666666',
      },
      fontFamily: {
        sans: ['PingFang SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 