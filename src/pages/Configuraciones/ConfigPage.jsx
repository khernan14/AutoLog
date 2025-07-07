// src/pages/Configuraciones/ConfigPage.jsx

import React, { useState, useCallback } from "react";
import { Box, Typography, Alert, Button, CircularProgress } from "@mui/joy";

// Importa los componentes de configuración
import ConfigSidebar from "../../components/Configuraciones/ConfigSidebar";
import AppearanceSettings from "../../components/Configuraciones/AppearanceSettings";
import NotificationSettings from "../../components/Configuraciones/NotificationSettings";
import LanguageSettings from "../../components/Configuraciones/LanguageSettings";
import AboutSettings from "../../components/Configuraciones/AboutSettings";

// Importa tu contexto de autenticación para los permisos
import { useAuth } from "../../context/AuthContext"; // Ajusta la ruta si es necesario

export default function ConfigPage() {
  const [activeSection, setActiveSection] = useState("appearance"); // Sección activa por defecto

  const { userData, hasPermiso } = useAuth();
  const esAdmin = userData?.rol?.toLowerCase() === "admin";

  // Función auxiliar para verificar permisos (Admin o permiso específico)
  const canPerformAction = useCallback(
    (permissionName) => {
      return esAdmin || hasPermiso(permissionName);
    },
    [esAdmin, hasPermiso]
  );

  // Permiso para acceder a la página de configuraciones
  const canViewConfigPage = canPerformAction("ver_configuraciones"); // Asegúrate de tener este permiso

  // Si no tiene permiso para ver la página de configuraciones
  if (!canViewConfigPage) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para ver las configuraciones del
            sistema.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Función para renderizar el contenido de la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "language":
        return <LanguageSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return (
          <Box textAlign="center" py={4}>
            <Typography level="body-md" color="text.secondary">
              Selecciona una opción del menú para ver las configuraciones.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Columna en móvil, fila en escritorio
        gap: 3,
        p: { xs: 2, md: 4 }, // Padding responsivo
        bgcolor: "background.body",
        minHeight: "calc(100vh - 64px)", // Ajusta según la altura de tu navbar
      }}>
      {/* Sidebar de Configuraciones */}
      <ConfigSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Contenido Principal de la Configuración */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.surface",
          borderRadius: "lg",
          boxShadow: "md",
          p: { xs: 2, md: 4 }, // Padding responsivo
          overflowY: "auto", // Permite scroll en el contenido si es muy largo
        }}>
        {renderActiveSection()}
      </Box>
    </Box>
  );
}
