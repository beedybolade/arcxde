import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Arcxde palette
        ink: {
          900: '#1a1918', // page background / dark text on cream
          800: '#1f1e1c',
        },
        cream: '#f4f0e7',
        accent: '#f3a9c0', // soft pink
      },
      boxShadow: {
        continue: '0 12px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.7)',
        card: '0 16px 46px rgba(0,0,0,0.42)',
      },
      backgroundImage: {
        continue: 'linear-gradient(180deg,#fbf8f1,#ece7db)',
      },
    },
  },
  plugins: [],
};

export default config;
