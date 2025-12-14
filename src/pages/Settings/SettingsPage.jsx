// src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  CircularProgress,
} from "@mui/joy";
import {
  Home,
  Lock,
  Paintbrush,
  Bell,
  Globe,
  Info,
  Plug,
  Accessibility as AccessibilityIcon,
  Shield,
  Database,
} from "lucide-react";
import { SettingsProvider, useSettings } from "../../context/SettingsContext";

// Lazy sections
const Sections = {
  inicio: React.lazy(() => import("./sections/Inicio.jsx")),
  seguridad: React.lazy(() => import("./sections/Seguridad.jsx")),
  apariencia: React.lazy(() => import("./sections/Apariencia.jsx")),
  idioma: React.lazy(() => import("./sections/IdiomaRegion.jsx")),
  accesibilidad: React.lazy(() => import("./sections/Accesibilidad.jsx")),
  integraciones: React.lazy(() => import("./sections/Integraciones.jsx")),
  privacidad: React.lazy(() => import("./sections/Privacidad.jsx")),
  backups: React.lazy(() => import("./sections/Backups.jsx")),
  acerca: React.lazy(() => import("./sections/Acerca.jsx")),
};

// Precarga al hover
const lazyLoaders = {
  inicio: () => import("./sections/Inicio.jsx"),
  seguridad: () => import("./sections/Seguridad.jsx"),
  apariencia: () => import("./sections/Apariencia.jsx"),
  idioma: () => import("./sections/IdiomaRegion.jsx"),
  accesibilidad: () => import("./sections/Accesibilidad.jsx"),
  integraciones: () => import("./sections/Integraciones.jsx"),
  privacidad: () => import("./sections/Privacidad.jsx"),
  backups: () => import("./sections/Backups.jsx"),
  acerca: () => import("./sections/Acerca.jsx"),
};

function SettingsInner() {
  const [active, setActive] = useState("inicio");
  const { settings, loading, saveSection, savingMap } = useSettings();
  const { t, i18n } = useTranslation();

  // --- SINCRONIZACIÓN DE IDIOMA ---
  // Cuando cargan los settings, verificamos si el idioma guardado es diferente al actual
  // y lo actualizamos en i18n para que la app cambie al instante.
  useEffect(() => {
    if (settings?.language && settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings, i18n]);

  const ActiveSection = Sections[active] || Sections.inicio;

  // Soporte para estructura plana o anidada
  const initialData = settings
    ? settings[active] || settings // Intenta buscar en la sección, si no, pasa todo (para estructuras planas)
    : {};

  const NAV = [
    { key: "inicio", label: t("settings.menu.home"), icon: <Home size={16} /> },
    {
      key: "seguridad",
      label: t("settings.menu.security"),
      icon: <Lock size={16} />,
    },
    {
      key: "apariencia",
      label: t("settings.menu.appearance"),
      icon: <Paintbrush size={16} />,
    },
    {
      key: "idioma",
      label: t("settings.menu.language"),
      icon: <Globe size={16} />,
    },
    {
      key: "accesibilidad",
      label: t("settings.menu.accessibility"),
      icon: <AccessibilityIcon size={16} />,
    },
    {
      key: "integraciones",
      label: t("settings.menu.integrations"),
      icon: <Plug size={16} />,
    },
    {
      key: "privacidad",
      label: t("settings.menu.privacy"),
      icon: <Shield size={16} />,
    },
    {
      key: "backups",
      label: t("settings.menu.backups"),
      icon: <Database size={16} />,
    },
    {
      key: "acerca",
      label: t("settings.menu.about"),
      icon: <Info size={16} />,
    },
  ];

  const handleSave = async (data) => {
    try {
      // Si estamos guardando idioma, aplicarlo inmediatamente también
      if (active === "idioma" && data.language) {
        await i18n.changeLanguage(data.language);
      }

      const response = await saveSection(active, data);
      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleNavigate = (key) => {
    setActive(key);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pb: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
        <Card
          variant="outlined"
          sx={{
            width: { xs: "100%", md: 280 },
            flexShrink: 0,
            borderRadius: 16,
            boxShadow: "sm",
            position: "sticky",
            top: 12,
            alignSelf: "flex-start",
          }}>
          <List size="sm" sx={{ "--ListItem-radius": "10px" }}>
            {NAV.map((item) => (
              <ListItem key={item.key}>
                <ListItemButton
                  selected={active === item.key}
                  onClick={() => setActive(item.key)}
                  onMouseEnter={() => lazyLoaders[item.key]?.()}
                  variant={active === item.key ? "soft" : "plain"}
                  color={active === item.key ? "primary" : "neutral"}>
                  <ListItemDecorator>{item.icon}</ListItemDecorator>
                  {item.label}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Card>

        <Stack flex={1} gap={1.25}>
          <Suspense
            fallback={
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  minHeight: 400,
                }}>
                <CircularProgress />
              </Card>
            }>
            <ActiveSection
              initialData={initialData}
              allSettings={settings}
              onSave={handleSave}
              onNavigate={handleNavigate}
              saving={!!savingMap[active]}
            />
          </Suspense>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        bgcolor: "background.level1",
        minHeight: "100dvh",
        color: "text.primary",
        overflow: "auto",
      }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 2, pb: 1 }}>
        <Typography level="h3">{t("settings.page_title")}</Typography>
        <Typography level="body-sm" color="neutral">
          {t("settings.page_desc")}
        </Typography>
      </Box>

      <SettingsProvider>
        <SettingsInner />
      </SettingsProvider>
    </Box>
  );
}
