// tailwind.config.js
import { fontFamily } from "tailwindcss/defaultTheme";
import { theme } from "./src/constants/theme.js";

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: { sans: ["Poppins", ...fontFamily.sans] },
      colors: {
        background: theme.colors.background,
        text: theme.colors.text,
        primary: theme.colors.primary,
        accent: theme.colors.accent,
        warning: theme.colors.warning,
        success: theme.colors.success,
        secondary: theme.colors.secondary,
        hover: theme.colors.hover,
      },
    },
  },
};
