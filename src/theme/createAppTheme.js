import { extendTheme } from "@mui/joy/styles";

const BRANDS = {
  default: { primary: "#0B6BCB", name: "Azul Tecnasa" },
  indigo: { primary: "#6366f1", name: "Índigo" },
  forest: { primary: "#10b981", name: "Bosque" },
  orange: { primary: "#f97316", name: "Naranja" },
  teams: { primary: "#6264A7", name: "Teams" },
  rose: { primary: "#e11d48", name: "Rose Red" },
  purple: { primary: "#a855f7", name: "Deep Purple" },
  cyan: { primary: "#06b6d4", name: "Cyan Sky" },
  slate: { primary: "#64748b", name: "Slate Grey" },
  neon: { primary: "#d946ef", name: "Cyberpunk" },
};

export const BRAND_OPTIONS = Object.entries(BRANDS).map(([key, val]) => ({
  value: key,
  label: val.name,
  hex: val.primary,
}));

export const createAppTheme = ({ brand = "default", font = "Poppins" }) => {
  const selectedBrand = BRANDS[brand] || BRANDS.default;
  const color = selectedBrand.primary;

  const generatePalette = (mainColor) => ({
    primary: {
      main: mainColor,
      500: mainColor,

      solidBg: "var(--joy-palette-primary-main)",
      solidHoverBg: "var(--joy-palette-primary-main)",
      solidActiveBg: "var(--joy-palette-primary-main)",
      solidColor: "#fff",

      softColor: "var(--joy-palette-primary-main)",
      softBg: "rgba(var(--joy-palette-primary-mainChannel) / 0.15)",
      softHoverBg: "rgba(var(--joy-palette-primary-mainChannel) / 0.25)",
      softActiveBg: "rgba(var(--joy-palette-primary-mainChannel) / 0.35)",

      plainColor: "var(--joy-palette-primary-main)",
      plainHoverBg: "rgba(var(--joy-palette-primary-mainChannel) / 0.10)",
      plainActiveBg: "rgba(var(--joy-palette-primary-mainChannel) / 0.20)",

      outlinedColor: "var(--joy-palette-primary-main)",
      outlinedBorder: "rgba(var(--joy-palette-primary-mainChannel) / 0.50)",
      outlinedHoverBorder: "var(--joy-palette-primary-main)",
    },
  });

  return extendTheme({
    fontFamily: {
      body: font,
      display: font,
      code: "monospace",
    },
    colorSchemes: {
      light: {
        palette: generatePalette(color),
      },
      dark: {
        palette: generatePalette(color),
      },
    },
    components: {
      JoyListItemButton: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            ...(ownerState.selected && {
              color: "var(--joy-palette-primary-main)",
              backgroundColor:
                "rgba(var(--joy-palette-primary-mainChannel) / 0.15)",
              fontWeight: "600",
            }),
          }),
        },
      },
    },
  });
};
