import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress, Snackbar } from "@mui/joy";
import MyAccountForm from "../../../components/Users/MyAccount/MyAccountForm";
import { getUsersById } from "../../../services/AuthServices.jsx";
import Swal from "sweetalert2";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const id_usuario = storedUser?.id || 1;

  const showSnackbar = (message, color = "neutral") => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsersById(id_usuario);
      if (Array.isArray(data) && data.length > 0) {
        setUser(data[0]);
      } else {
        showSnackbar("Usuario no encontrado", "warning");
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      showSnackbar("Error al cargar datos", "danger");
    } finally {
      setLoading(false);
    }
  }, [id_usuario]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography level="h4">Usuario no disponible</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="main"
        className="MainContent"
        sx={{
          pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
          overflow: "auto",
        }}>
        <MyAccountForm user={user} />
      </Box>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        color={snackbarColor}
        variant="outlined"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}>
        {snackbarMessage}
      </Snackbar>
    </Box>
  );
}
