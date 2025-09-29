import { extendTheme } from "@mui/joy";

// paleta base indigo (tailwind-ish)
const indigo = {
  50: "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
};

// teams-ish
const teamsPrimary = "#6264A7"; // morado Teams clásico
const surfaceLight = "#ffffff";
const appBgLight = "#f7f7fb";

export function createAppTheme({
  brand = "default",
  font = "Poppins, sans-serif",
} = {}) {
  // Base común
  const base = {
    fontFamily: {
      body: font,
      display: font,
      code: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    },
    radius: { sm: 8, md: 12, lg: 16, xl: 20 },
    defaultColorScheme: "light",
    colorSchemes: {
      light: {
        palette: { background: { body: appBgLight, surface: surfaceLight } },
      },
      dark: {
        palette: { background: { body: "#0c0d12", surface: "#11131a" } },
      },
    },
    shadow: {
      sm: "0 1px 2px rgba(0,0,0,.06)",
      md: "0 4px 16px rgba(0,0,0,.10)",
    },
  };

  // Overrides por marca
  if (brand === "indigo") {
    base.colorSchemes.light.palette = {
      ...base.colorSchemes.light.palette,
      primary: {
        50: indigo[50],
        100: indigo[100],
        200: indigo[200],
        300: indigo[300],
        400: indigo[400],
        500: indigo[500],
        600: indigo[600],
        700: indigo[700],
        800: indigo[800],
        900: indigo[900],
        solidBg: indigo[600],
        solidColor: "#fff",
        softBg: indigo[50],
        softColor: indigo[700],
      },
    };
    base.colorSchemes.dark.palette = {
      ...base.colorSchemes.dark.palette,
      primary: {
        200: indigo[200],
        300: indigo[300],
        400: indigo[400],
        500: indigo[500],
        600: indigo[600],
        700: indigo[700],
        solidBg: indigo[500],
        solidColor: "#fff",
        softBg: "rgba(79,70,229,.15)",
        softColor: indigo[200],
      },
    };
  } else if (brand === "teams") {
    base.colorSchemes.light.palette = {
      ...base.colorSchemes.light.palette,
      primary: {
        solidBg: teamsPrimary,
        solidColor: "#fff",
        softBg: "#eef0fb",
        softColor: "#3f4270",
        500: teamsPrimary,
      },
      // “white app” look
      background: { body: "#ffffff", surface: "#ffffff" },
      neutral: { softBg: "#f4f5f8" },
    };
    base.colorSchemes.dark.palette = {
      ...base.colorSchemes.dark.palette,
      primary: {
        solidBg: "#8B8CC7",
        solidColor: "#0e0f14",
        softBg: "rgba(139,140,199,.2)",
        500: "#8B8CC7",
      },
    };
  } else {
    // default: usa primary joy por defecto; sin overrides.
  }

  return extendTheme(base);
}
