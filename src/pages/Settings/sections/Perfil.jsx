import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Card,
  Divider,
  Skeleton,
  useTheme,
  Grid,
  Sheet,
  Stack,
  Avatar,
  Chip,
} from "@mui/joy";
import { getUsersById } from "../../../services/AuthServices.jsx";

// Vista de perfil (solo lectura) con layout vertical
export default function MyAccountProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");

  const theme = useTheme();

  const storedUser = useMemo(() => {
    try {
      const userString = localStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error al parsear el usuario del localStorage:", error);
      return null;
    }
  }, []);

  const id_usuario = storedUser?.id_usuario || storedUser?.id;

  const showSnackbar = (message, color = "neutral") => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  const getInitials = (name = "") => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const loadUserData = useCallback(async () => {
    setLoading(true);
    if (!id_usuario) {
      showSnackbar("No se pudo identificar el usuario.", "danger");
      setLoading(false);
      return;
    }
    try {
      const data = await getUsersById(id_usuario);
      if (Array.isArray(data) && data.length > 0) {
        setUser(data[0]);
      } else {
        showSnackbar("Usuario no encontrado.", "warning");
        setUser(null);
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      showSnackbar("Error al cargar datos del usuario.", "danger");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id_usuario]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const SkeletonView = () => (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Card sx={{ p: 3, borderRadius: "lg", boxShadow: "sm" }}>
        <Stack alignItems="center" spacing={1.5}>
          <Skeleton variant="circular" width={96} height={96} />
          <Skeleton variant="text" width={220} height={32} />
          <Skeleton variant="text" width={160} height={20} />
        </Stack>
      </Card>
      <Card sx={{ p: 3, borderRadius: "lg", boxShadow: "sm" }}>
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 1 }} />
        <Grid container spacing={1.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} xs={12} md={6}>
              <Skeleton variant="text" width={140} height={18} />
              <Skeleton variant="text" width="90%" height={24} />
            </Grid>
          ))}
        </Grid>
      </Card>
    </Stack>
  );

  const InfoItem = ({ label, value, mono }) => (
    <Stack spacing={0.25}>
      <Typography level="body-xs" color="neutral">
        {label}
      </Typography>
      <Typography
        level="body-sm"
        sx={{
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : undefined,
        }}>
        {value || "—"}
      </Typography>
    </Stack>
  );

  return (
    <Sheet
      variant="outlined"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height, 0px))", md: 4 },
        pb: { xs: 2, sm: 2, md: 4 },
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        minHeight: "100dvh",
        borderRadius: 16,
        boxShadow: "sm",
      }}>
      <Box sx={{ width: "100%", maxWidth: 960 }}>
        {/* Encabezado (vertical) */}
        <Typography level="h3" sx={{ mb: 2 }}>
          Mi perfil
        </Typography>

        {loading ? (
          <SkeletonView />
        ) : !user ? (
          <Card
            sx={{
              width: "100%",
              p: 3,
              borderRadius: "lg",
              boxShadow: "sm",
              textAlign: "center",
              bgcolor: "background.surface",
            }}>
            <Typography level="h4" color="warning">
              No se pudo cargar la información del usuario.
            </Typography>
            <Typography level="body-md" color="neutral" sx={{ mt: 1 }}>
              Por favor, verifica tu conexión o intenta de nuevo más tarde.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {/* HERO de perfil */}
            <Card
              sx={{
                p: 3,
                borderRadius: "xl",
                boxShadow: "sm",
                bgcolor: "background.surface",
              }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "center", sm: "flex-start" }}>
                <Avatar sx={{ "--Avatar-size": "96px", fontSize: 32 }}>
                  {getInitials(user?.nombre || "")}
                </Avatar>
                <Stack
                  spacing={0.5}
                  sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography level="h3">
                    {`${user?.nombre || ""} ${user?.apellido || ""}`.trim() ||
                      "Usuario"}
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    {user?.email || user?.correo || "—"}
                  </Typography>
                  {user?.puesto && (
                    <Chip
                      size="sm"
                      color="primary"
                      variant="soft"
                      sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}>
                      {user.puesto}
                    </Chip>
                  )}
                </Stack>
              </Stack>
            </Card>

            {/* Datos principales */}
            <Card sx={{ p: 3, borderRadius: "xl", boxShadow: "sm" }}>
              <Typography level="title-md" sx={{ mb: 1 }}>
                Información personal
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Grid container spacing={1.5}>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Nombre"
                    value={`${user?.nombre || ""} ${
                      user?.apellido || ""
                    }`.trim()}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem label="Usuario" value={user?.username} mono />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Correo"
                    value={user?.email || user?.correo}
                    mono
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem label="Puesto" value={user?.puesto} />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Teléfono"
                    value={user?.telefono || user?.phone}
                    mono
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Estado"
                    value={user?.estatus ? "Activo" : "Inactivo"}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* Organización / metadatos (opcional) */}
            <Card sx={{ p: 3, borderRadius: "xl", boxShadow: "sm" }}>
              <Typography level="title-md" sx={{ mb: 1 }}>
                Organización
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Grid container spacing={1.5}>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Departamento"
                    value={user?.departamento || user?.area}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem label="Rol" value={user?.rol || user?.role} />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Fecha de alta"
                    value={user?.created_at || user?.fecha_alta}
                    mono
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <InfoItem
                    label="Último acceso"
                    value={user?.last_login || user?.ultimo_acceso}
                    mono
                  />
                </Grid>
              </Grid>
            </Card>
          </Stack>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        color={snackbarColor}
        variant="soft"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}>
        {snackbarMessage}
      </Snackbar>
    </Sheet>
  );
}
