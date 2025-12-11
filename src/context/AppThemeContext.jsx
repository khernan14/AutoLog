import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";
import { CssVarsProvider, CssBaseline } from "@mui/joy";
import { createAppTheme } from "../theme/createAppTheme";
import TailwindDarkSync from "@/theme/TailwindDarkSync";

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
  const [brand, setBrand] = useState(getLS("ui:brand", "default"));
  const [font, setFont] = useState(getLS("ui:font", "Poppins, sans-serif"));

  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--app-font", font);
  }, [font]);
  useEffect(() => {
    setLS("ui:brand", brand);
  }, [brand]);
  useEffect(() => {
    setLS("ui:font", font);
  }, [font]);

  const theme = useMemo(() => createAppTheme({ brand, font }), [brand, font]);

  return (
    <AppThemeCtx.Provider value={{ brand, setBrand, font, setFont }}>
      <CssVarsProvider
        theme={theme}
        defaultMode="light"
        modeStorageKey="ui:mode"
        disableTransitionOnChange>
        <TailwindDarkSync />
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </AppThemeCtx.Provider>
  );
}

export const useAppTheme = () => {
  const ctx = useContext(AppThemeCtx);
  if (!ctx) {
    throw new Error(
      "useAppTheme debe usarse dentro de <AppThemeProvider>. ¿Estás importando el hook desde otra copia del archivo?"
    );
  }
  return ctx;
};
