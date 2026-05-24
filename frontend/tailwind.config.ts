import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vibe-low': '#22c55e',
        'vibe-mid': '#f59e0b',
        'vibe-high': '#ef4444',
      },
    },
  },
  plugins: [],
};

export default config;
