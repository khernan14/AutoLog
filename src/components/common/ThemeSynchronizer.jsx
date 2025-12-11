import { useEffect } from "react";
import { useColorScheme } from "@mui/joy/styles";
import { useTranslation } from "react-i18next"; // 👈 Importamos el hook de idioma
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import { fetchConToken } from "../../utils/ApiHelper";
import { endpoints } from "../../config/variables";

export default function ThemeSynchronizer() {
  const { userData } = useAuth();
  const { setBrand, setFont } = useAppTheme();
  const { setMode } = useColorScheme();
  const { i18n } = useTranslation(); // 👈 Instancia para cambiar el idioma

  useEffect(() => {
    // Si no hay usuario logueado, no hacemos nada
    if (!userData) return;

    const syncPreferences = async () => {
      try {
        // ===============================================
        // 1. SINCRONIZAR APARIENCIA (Tu lógica existente)
        // ===============================================
        const urlApariencia = `${
          endpoints.getSettings
        }/apariencia?t=${Date.now()}`;
        const resAp = await fetchConToken(urlApariencia);

        if (resAp.ok) {
          const jsonResponse = await resAp.json();

          // Desempaquetado robusto (payload, data, o directo)
          let settings =
            jsonResponse.payload || jsonResponse.data || jsonResponse;

          // Doble verificación por si viene anidado en 'data'
          if (settings && settings.data && !settings.mode) {
            settings = settings.data;
          }

          // Parseo de seguridad si viene como string
          if (typeof settings === "string") {
            try {
              settings = JSON.parse(settings);
            } catch (e) {
              console.error("Error parseando apariencia:", e);
            }
          }

          // Aplicar cambios si hay datos
          if (settings && Object.keys(settings).length > 0) {
            // Modo (Dark/Light)
            const targetMode = settings.mode || settings.theme;
            if (targetMode) setMode(targetMode);

            // Marca (Color)
            if (settings.brand) setBrand(settings.brand);

            // Fuente
            if (settings.font) setFont(settings.font);
          }
        }

        // ===============================================
        // 2. SINCRONIZAR IDIOMA (Lo nuevo)
        // ===============================================
        const urlIdioma = `${endpoints.getSettings}/idioma?t=${Date.now()}`;
        const resLang = await fetchConToken(urlIdioma);

        if (resLang.ok) {
          const jsonLang = await resLang.json();

          // Misma lógica de desempaquetado
          let settingsLang = jsonLang.payload || jsonLang.data || jsonLang;

          if (settingsLang && settingsLang.data && !settingsLang.language) {
            settingsLang = settingsLang.data;
          }

          if (typeof settingsLang === "string") {
            try {
              settingsLang = JSON.parse(settingsLang);
            } catch (e) {
              console.error("Error parseando idioma:", e);
            }
          }

          // Aplicar idioma
          if (settingsLang && settingsLang.language) {
            // Solo cambiamos si es diferente al actual para evitar re-renders
            if (i18n.language !== settingsLang.language) {
              console.log("🌐 Sincronizando idioma:", settingsLang.language);
              i18n.changeLanguage(settingsLang.language);
            }
          }
        }
      } catch (error) {
        console.error("ThemeSync error:", error);
      }
    };

    syncPreferences();
  }, [userData, setBrand, setFont, setMode, i18n]);

  return null;
}
