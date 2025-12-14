import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

export function useAccessibility() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // Buscamos la configuración (soporta anidado o plano, por si acaso)
    const accessConfig = settings.accesibilidad || settings.accessibility || {};

    // --- 1. Tamaño de Fuente (Escalado del Root) ---
    const html = document.documentElement;
    const size = accessConfig.fontSize || "medium";

    // El navegador base es 16px. Escalamos porcentualmente.
    if (size === "small") {
      html.style.fontSize = "90%"; // ~14.4px
    } else if (size === "large") {
      html.style.fontSize = "110%"; // ~17.6px
    } else {
      html.style.fontSize = "100%"; // 16px (Normal)
    }

    // --- 2. Reducción de Movimiento ---
    const body = document.body;
    if (accessConfig.reducedMotion) {
      body.classList.add("reduce-motion");
    } else {
      body.classList.remove("reduce-motion");
    }

    // --- 3. Alto Contraste ---
    if (accessConfig.highContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }
  }, [settings]);
}
