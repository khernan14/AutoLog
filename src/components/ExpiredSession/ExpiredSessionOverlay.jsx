import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Asegúrate de que la ruta sea correcta
import { useNavigate, useLocation } from "react-router-dom";
import { STORAGE_KEYS } from "../../config/variables"; // Asegúrate de que la ruta sea correcta
import Swal from "sweetalert2"; // Para las alertas de sesión expirada
import { Box, CircularProgress, Typography, Button } from "@mui/joy"; // Para el spinner de carga

export default function ExpiredSessionOverlay({ children }) {
  const { userData, checkingSession, isSessionExpired, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado local para controlar si la alerta de sesión expirada ya se mostró
  const [hasShownExpiredAlert, setHasShownExpiredAlert] = useState(false);

  useEffect(() => {
    // Rutas que NO requieren autenticación (rutas públicas)
    const publicPaths = [
      "/auth/login",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    // 1. Si la sesión aún se está verificando, no hagas nada en este useEffect.
    // El renderizado condicional de abajo mostrará un spinner.
    if (checkingSession) {
      return;
    }

    // 2. Lógica de redirección si el usuario NO está autenticado
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isAuthenticated = !!userData && !!token; // Consideramos autenticado si hay userData Y token

    // Si NO está autenticado Y la ruta actual NO es una ruta pública, redirige al login.
    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      // Solo muestra la alerta de expiración si realmente la sesión expiró
      if (isSessionExpired && !hasShownExpiredAlert) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
          icon: "warning",
          confirmButtonColor: "#03624C",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          logout(); // Limpia la sesión y redirige al login
          setHasShownExpiredAlert(true); // Marca que la alerta ya se mostró
        });
      } else if (!isSessionExpired) {
        // Si no expiró pero no está autenticado (ej. primera carga sin token)
        logout(); // Solo para asegurar que se limpia y redirige al login
      }
      return; // Detener la ejecución si se va a redirigir
    }

    // 3. Lógica de redirección si el usuario SÍ está autenticado y está en una ruta pública de autenticación
    if (isAuthenticated && publicPaths.includes(location.pathname)) {
      // Si está autenticado y en login/forgot/reset, redirige a su home
      // navigate("/admin/home"); // O la ruta por defecto de su rol
      return; // Detener la ejecución si se va a redirigir
    }

    // Si llegamos aquí, el usuario está autenticado y en una ruta protegida,
    // O no está autenticado pero está en una ruta pública.
    // Resetear la bandera de alerta si el usuario está autenticado y no se mostró.
    if (isAuthenticated && hasShownExpiredAlert) {
      setHasShownExpiredAlert(false);
    }
  }, [
    userData,
    checkingSession,
    isSessionExpired,
    logout,
    navigate,
    location.pathname,
    hasShownExpiredAlert,
  ]);

  // Renderizado condicional: Spinner mientras se verifica la sesión
  if (checkingSession) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}>
        <CircularProgress size="lg" />
        <Typography level="body-lg" sx={{ ml: 2 }}>
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  // Si no estamos cargando y no se ha redirigido, renderiza los hijos
  return <>{children}</>;
}
