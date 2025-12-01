// src/components/ExpiredSessionOverlay.jsx  (reemplaza contenido)
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Box, CircularProgress, Typography } from "@mui/joy";

export default function ExpiredSessionOverlay({ children }) {
  const { userData, checkingSession, isSessionExpired, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasShownExpiredAlert, setHasShownExpiredAlert] = useState(false);

  useEffect(() => {
    if (checkingSession) return;

    const publicPaths = [
      "/auth/login",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    // Ahora consideramos autenticado SÓLO si userData existe
    const isAuthenticated = !!userData;

    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      if (isSessionExpired && !hasShownExpiredAlert) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
          icon: "warning",
          confirmButtonColor: "#03624C",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          logout();
          setHasShownExpiredAlert(true);
        });
      } else if (!isSessionExpired) {
        // Si no hay userData y no es sesión expirada, simplemente logout
        logout();
      }
      return;
    }

    if (isAuthenticated && publicPaths.includes(location.pathname)) {
      // Si está en ruta pública y ya autenticado, podrías redirigir si quieres
      // navigate("/admin/home");
      return;
    }

    if (isAuthenticated && hasShownExpiredAlert) setHasShownExpiredAlert(false);
  }, [
    userData,
    checkingSession,
    isSessionExpired,
    logout,
    navigate,
    location.pathname,
    hasShownExpiredAlert,
  ]);

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

  return <>{children}</>;
}
