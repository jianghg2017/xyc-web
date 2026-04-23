/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F5FA',
          100: '#D3E0ED',
          200: '#B3C6DD',
          300: '#8FA8CA',
          400: '#6D8BB5',
          500: '#1A365D',
          600: '#0A2540',
          700: '#082038',
          800: '#061A2E',
          900: '#051526',
        },
        accent: {
          gold: '#C49F5F',
          'gold-light': '#D4B87A',
          'gold-dark': '#A8854A',
          teal: '#00D4AA',
          'teal-light': '#33DDBB',
          'teal-dark': '#00B892',
        },
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#FF4D4F',
        info: '#13C2C2',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A2540 0%, #1A365D 50%, #0A2540 100%)',
        'hero-radial': 'radial-gradient(ellipse at 30% 50%, rgba(0, 212, 170, 0.15) 0%, transparent 50%)',
        'section-gradient': 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(196, 159, 95, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
