
import type { Config } from "tailwindcss";
// Fix: Replaced require() with an ES module import for better TypeScript compatibility.
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-600': 'var(--accent-600)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.3s ease-out forwards',
      },
    },
  },
  plugins: [
    typography,
  ],
};
export default config;