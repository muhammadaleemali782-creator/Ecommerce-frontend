/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        brand: {
          bg: '#FFFFFF',
          surface: '#FFFFFF',
          primary: '#090D16',
          textDark: '#1E293B',
          textMuted: '#64748B',
        },
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'dark-card-gradient': 'linear-gradient(145deg, #0f1423 0%, #171b30 50%, #080b14 100%)',
      },
    },
  },
  plugins: [],
}