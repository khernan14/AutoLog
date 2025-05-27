// components/ExpiredSessionOverlay.jsx
import { Box, Typography, Button, Sheet, CircularProgress } from "@mui/joy";
import { useAuth } from "../../context/AuthContext";

export default function ExpiredSessionOverlay() {
  const { isSessionExpired, logout, checkingSession } = useAuth();

  if (checkingSession) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(255,255,255,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isSessionExpired) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(255,255,255,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}>
      <Sheet
        sx={{
          p: 4,
          borderRadius: "md",
          textAlign: "center",
          boxShadow: "lg",
          maxWidth: 400,
        }}>
        <Typography level="h4">Sesión expirada</Typography>
        <Typography level="body-sm" sx={{ mt: 1, mb: 2 }}>
          Tu sesión ha expirado. Por favor, vuelve a iniciar sesión para
          continuar.
        </Typography>
        <Button onClick={logout}>Ir al login</Button>
      </Sheet>
    </Box>
  );
}
