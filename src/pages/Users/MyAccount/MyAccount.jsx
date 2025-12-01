import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Card,
  Avatar,
  Divider,
  Skeleton,
  useTheme,
  Grid,
  List,
  ListItemButton,
  ListItemContent,
  Sheet,
} from "@mui/joy";

import MyAccountForm from "../../../components/Users/MyAccount/MyAccountForm";
import SecuritySettingsForm from "../../../components/Users/MyAccount/SecuritySettingsForm";

import { getUsersById } from "../../../services/AuthServices";
import { useAuth } from "../../../context/AuthContext";

export default function MyAccount() {
  const { userData } = useAuth(); // <- AHORA TODO VIENE DE AQUÍ

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");

  const [selectedSection, setSelectedSection] = useState("profile");

  const theme = useTheme();

  const showSnackbar = (message, color = "neutral") => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  const loadUserData = useCallback(async () => {
    setLoading(true);

    try {
      // ID ahora viene directo del userData (AuthContext)
      const id = userData?.id_usuario || userData?.id;

      if (!id) {
        showSnackbar("No se pudo identificar al usuario.", "danger");
        setLoading(false);
        return;
      }

      // Pedimos datos detallados del usuario
      const data = await getUsersById(id);

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
  }, [userData]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const MyAccountLayoutSkeleton = () => (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%", mt: 2 }}>
      <Grid xs={12} md={4}>
        <Card sx={{ p: 3, borderRadius: "lg", boxShadow: theme.shadow.sm }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}>
            <Skeleton
              variant="circular"
              width={100}
              height={100}
              sx={{ mb: 2 }}
            />
            <Skeleton variant="text" width="80%" height={35} />
          </Box>
          <Divider sx={{ my: 2 }} />
          <List size="sm">
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
          </List>
        </Card>
      </Grid>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3, borderRadius: "lg", boxShadow: theme.shadow.sm }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
          <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width={180} height={45} />
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 },
        pb: { xs: 2, md: 4 },
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100dvh",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1000 }}>
        {loading ? (
          <MyAccountLayoutSkeleton />
        ) : !user ? (
          <Card sx={{ p: 3, borderRadius: "lg", textAlign: "center" }}>
            <Typography level="h4" color="warning">
              No se pudo cargar tu información.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Panel Izquierdo */}
            <Grid xs={12} md={4}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: "lg",
                  boxShadow: theme.shadow.sm,
                  bgcolor: "background.surface",
                }}>
                <Box textAlign="center" mb={2}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      mx: "auto",
                      borderRadius: "50%",
                      bgcolor: "primary.softBg",
                      color: "primary.softColor",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: "bold",
                      boxShadow: "sm",
                    }}>
                    {getInitials(user.nombre)}
                  </Box>

                  <Typography level="h3">
                    {user.nombre} {user.apellido}
                  </Typography>
                  <Typography level="body-md" color="text.secondary">
                    {user.puesto || "Puesto no asignado"}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Navegación */}
                <List>
                  <ListItemButton
                    selected={selectedSection === "profile"}
                    onClick={() => setSelectedSection("profile")}>
                    <ListItemContent>Mi Cuenta</ListItemContent>
                  </ListItemButton>

                  <ListItemButton
                    selected={selectedSection === "security"}
                    onClick={() => setSelectedSection("security")}>
                    <ListItemContent>Seguridad</ListItemContent>
                  </ListItemButton>
                </List>
              </Card>
            </Grid>

            {/* Panel Derecho */}
            <Grid xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: "lg" }}>
                {selectedSection === "profile" && (
                  <>
                    <Typography level="h3" mb={3}>
                      Información Personal
                    </Typography>
                    <MyAccountForm user={user} showSnackbar={showSnackbar} />
                  </>
                )}

                {selectedSection === "security" && (
                  <>
                    <Typography level="h3" mb={3}>
                      Ajustes de Seguridad
                    </Typography>
                    <SecuritySettingsForm
                      user={user}
                      showSnackbar={showSnackbar}
                    />
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        color={snackbarColor}
        variant="soft"
        autoHideDuration={4000}>
        {snackbarMessage}
      </Snackbar>
    </Sheet>
  );
}
