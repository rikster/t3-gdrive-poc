import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/**/*.tsx",
    "./.storybook/preview.ts",
    "./src/**/*.stories.tsx"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Sans", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
