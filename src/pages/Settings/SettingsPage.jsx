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
  User,
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

// Lazy sections (code-splitting por archivo)
const Sections = {
  perfil: React.lazy(() => import("./sections/Perfil.jsx")),
  seguridad: React.lazy(() => import("./sections/Seguridad.jsx")),
  apariencia: React.lazy(() => import("./sections/Apariencia.jsx")),
  notificaciones: React.lazy(() => import("./sections/Notificaciones.jsx")),
  idioma: React.lazy(() => import("./sections/IdiomaRegion.jsx")),
  accesibilidad: React.lazy(() => import("./sections/Accesibilidad.jsx")),
  integraciones: React.lazy(() => import("./sections/Integraciones.jsx")),
  privacidad: React.lazy(() => import("./sections/Privacidad.jsx")),
  backups: React.lazy(() => import("./sections/Backups.jsx")),
  acerca: React.lazy(() => import("./sections/Acerca.jsx")),
};

const NAV = [
  { key: "perfil", label: "Perfil", icon: <User size={16} /> },
  { key: "seguridad", label: "Seguridad", icon: <Lock size={16} /> },
  { key: "apariencia", label: "Apariencia", icon: <Paintbrush size={16} /> },
  { key: "notificaciones", label: "Notificaciones", icon: <Bell size={16} /> },
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

export default function SettingsPage() {
  const [active, setActive] = useState("perfil");
  const ActiveSection = Sections[active] || Sections.perfil;

  return (
    <Box
      sx={{
        bgcolor: "background.level1",
        minHeight: "100dvh",
        color: "text.primary",
        overflow: "auto",
      }}>
      {/* Header simple */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 2, pb: 1 }}>
        <Typography level="h3">Configuración</Typography>
        <Typography level="body-sm" color="neutral">
          Administra tu perfil y preferencias de la aplicación.
        </Typography>
      </Box>

      {/* Cuerpo con nav lateral + contenido */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pb: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
          {/* NAV lateral */}
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
                    variant={active === item.key ? "soft" : "plain"}
                    color={active === item.key ? "primary" : "neutral"}>
                    <ListItemDecorator>{item.icon}</ListItemDecorator>
                    {item.label}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>

          {/* CONTENIDO */}
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
              <ActiveSection />
            </Suspense>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
