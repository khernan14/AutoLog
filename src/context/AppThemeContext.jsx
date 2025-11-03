import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useLayoutEffect,
} from "react";
import { CssVarsProvider, CssBaseline } from "@mui/joy";
import { createAppTheme } from "../theme/createAppTheme";
import TailwindDarkSync from "@/theme/TailwindDarkSync";

// helpers persistentes
const getLS = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ?? d;
  } catch {
    return d;
  }
};
const setLS = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

const AppThemeCtx = createContext(null);

export function AppThemeProvider({ children }) {
  const [brand, setBrand] = useState(getLS("ui:brand", "default")); // default | indigo | teams
  const [font, setFont] = useState(getLS("ui:font", "Poppins, sans-serif"));

  // aplica la fuente también al <body> (afecta Tailwind/utilidades)
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--app-font", font);
  }, [font]);

  const theme = useMemo(() => createAppTheme({ brand, font }), [brand, font]);

  // NOTA: defaultMode='light' para NO respetar 'system' a menos que lo elija el usuario.
  return (
    <AppThemeCtx.Provider value={{ brand, setBrand, font, setFont }}>
      <CssVarsProvider
        theme={theme}
        defaultMode="light"
        modeStorageKey="ui:mode" // evita interferencia de otros sitios/libs
        disableTransitionOnChange // sin parpadeo al cambiar
      >
        <TailwindDarkSync />
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </AppThemeCtx.Provider>
  );
}

export const useAppTheme = () => useContext(AppThemeCtx);
