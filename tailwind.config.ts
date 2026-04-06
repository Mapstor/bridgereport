import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from design system
        condition: {
          good: '#22c55e',     // green-500
          fair: '#eab308',     // yellow-500
          poor: '#ef4444',     // red-500
        },
      },
    },
  },
  plugins: [],
};

export default config;
