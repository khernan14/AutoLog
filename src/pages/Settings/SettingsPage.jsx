// src/pages/Settings/SettingsPage.jsx
import React, { useState, Suspense } from "react";
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

// precarga al hover
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

const NAV = [
  { key: "inicio", label: "Inicio", icon: <Home size={16} /> },
  { key: "seguridad", label: "Seguridad", icon: <Lock size={16} /> },
  { key: "apariencia", label: "Apariencia", icon: <Paintbrush size={16} /> },
  { key: "idioma", label: "Idioma & Región", icon: <Globe size={16} /> },
  {
    key: "accesibilidad",
    label: "Accesibilidad",
    icon: <AccessibilityIcon size={16} />,
  },
  { key: "integraciones", label: "Integraciones", icon: <Plug size={16} /> },
  {
    key: "privacidad",
    label: "Datos & Privacidad",
    icon: <Shield size={16} />,
  },
  { key: "backups", label: "Respaldo & Backups", icon: <Database size={16} /> },
  { key: "acerca", label: "Acerca de", icon: <Info size={16} /> },
];

function SettingsInner() {
  const [active, setActive] = useState("inicio");
  const { settings, loading, saveSection, savingMap } = useSettings();

  const ActiveSection = Sections[active] || Sections.inicio;
  const initialData = settings?.[active] ?? {};

  const handleSave = async (data) => {
    try {
      const response = await saveSection(active, data);
      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleNavigate = (key) => {
    setActive(key);
  };

  // Puedes agregar un reload() aquí si quieres
  const handleReset = () => {};

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
                }}>
                <CircularProgress />
              </Card>
            }>
            {/* 🟢 Pasamos las props vitales */}
            <ActiveSection
              initialData={initialData}
              allSettings={settings}
              onSave={handleSave}
              onReset={handleReset}
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
  return (
    <Box
      sx={{
        bgcolor: "background.level1",
        minHeight: "100dvh",
        color: "text.primary",
        overflow: "auto",
      }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 2, pb: 1 }}>
        <Typography level="h3">Configuración</Typography>
        <Typography level="body-sm" color="neutral">
          Administra tu perfil y preferencias de la aplicación.
        </Typography>
      </Box>

      {/* 🟢 IMPORTANTE: El Provider envuelve todo */}
      <SettingsProvider>
        <SettingsInner />
      </SettingsProvider>
    </Box>
  );
}
