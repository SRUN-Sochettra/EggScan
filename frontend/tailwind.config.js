export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FFF8EC',
        butter: '#FCE9B8',
        yolk: '#F5B544',
        shell: '#F4E4C1',
        brown: {
          50:  '#FAF3E3',
          100: '#F0E3C4',
          200: '#D9BF8A',
          300: '#B89968',
          400: '#8B6F47',
          500: '#6B5436',
          600: '#4A3A25',
          700: '#2E2416',
        },
        crack: '#C84A2E',
      },
      boxShadow: {
        egg:  '0 6px 0 -2px #2E2416',
        eggsm:'0 4px 0 -1px #2E2416',
        soft: '0 4px 20px rgba(74, 58, 37, 0.08)',
      },
      animation: {
        'wobble':    'wobble 1.2s ease-in-out infinite',
        'bounce-slow':'bounceSlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float':     'float 3s ease-in-out infinite',
        'pop':       'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%':      { transform: 'translateY(-8px) rotate(2deg)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
    }
  },
  plugins: []
}