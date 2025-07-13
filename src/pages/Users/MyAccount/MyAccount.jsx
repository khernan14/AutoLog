import { useState, useEffect, useCallback, useMemo } from "react";
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
  Sheet, // Nuevo: Para el fondo principal y el efecto de capa
} from "@mui/joy";
import MyAccountForm from "../../../components/Users/MyAccount/MyAccountForm";
import { getUsersById } from "../../../services/AuthServices.jsx";
import Swal from "sweetalert2";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecuritySettingsForm from "../../../components/Users/MyAccount/SecuritySettingsForm.jsx";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");
  const [selectedSection, setSelectedSection] = useState("profile");

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

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

  // Componente Skeleton para el nuevo layout Win11
  const MyAccountLayoutSkeleton = () => (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%", mt: 2 }}>
      {/* Skeleton para el panel de perfil */}
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
            <Skeleton variant="text" width="80%" height={35} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={25} />
          </Box>
          <Divider sx={{ my: 2 }} />
          <List size="sm">
            <Skeleton
              variant="text"
              width="100%"
              height={40}
              sx={{ mb: 0.5 }}
            />
            <Skeleton
              variant="text"
              width="100%"
              height={40}
              sx={{ mb: 0.5 }}
            />
            <Skeleton variant="text" width="100%" height={40} />
          </List>
        </Card>
      </Grid>
      {/* Skeleton para el contenido principal */}
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3, borderRadius: "lg", boxShadow: theme.shadow.sm }}>
          <Skeleton variant="text" width={250} height={40} sx={{ mb: 3 }} />
          <Skeleton variant="text" width="100%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={40} sx={{ mb: 2 }} />
          <Skeleton
            variant="rectangular"
            width="180px"
            height={45}
            sx={{ mt: 3, ml: "auto" }}
          />
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Sheet
      variant="plain" // Fondo suave para emular el efecto de capa de Win11
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 }, // Padding superior para el contenido
        pb: { xs: 2, sm: 2, md: 4 },
        px: { xs: 2, md: 4 }, // Padding horizontal
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Centrar el contenido
        overflow: "auto", // Permite scroll
        minHeight: "100dvh", // Asegura que ocupe toda la altura
      }}>
      <Box sx={{ width: "100%", maxWidth: 1000 }}>
        {" "}
        {/* Contenedor para el contenido principal */}
        {/* Encabezado principal de la página */}
        <Typography level="h1" sx={{ mb: { xs: 2, md: 4 } }}></Typography>
        {loading ? (
          <MyAccountLayoutSkeleton />
        ) : !user ? (
          <Card
            sx={{
              width: "100%",
              p: 3,
              borderRadius: "lg",
              boxShadow: theme.shadow.md,
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
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Columna Izquierda: Panel de Perfil y Navegación (Más Win11 Style) */}
            <Grid xs={12} md={4}>
              <Card
                sx={{
                  p: 3, // Mayor padding para Win11
                  borderRadius: "lg",
                  boxShadow: theme.shadow.sm, // Sombra más sutil para Win11
                  bgcolor: "background.surface",
                  position: { md: "sticky" },
                  top: { md: "calc(var(--Header-height, 0px) + 24px)" }, // Ajusta el top según tu Header
                  maxHeight: {
                    md: "calc(100vh - var(--Header-height, 0px) - 48px)",
                  },
                  overflowY: { md: "auto" },
                }}>
                {/* Información de Perfil Destacada */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 2,
                    textAlign: "center",
                  }}>
                  <Box textAlign="center">
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
                        textTransform: "uppercase",
                        boxShadow: "sm",
                      }}>
                      {getInitials(user.nombre)}
                    </Box>
                  </Box>

                  <Typography level="h3" component="h1" sx={{ mb: 0.5 }}>
                    {user.nombre || "Usuario Desconocido"} {user.apellido || ""}
                  </Typography>
                  <Typography level="body-md" color="text.secondary">
                    {user.puesto || "Puesto no asignado"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 3 }} /> {/* Mayor espacio para el divisor */}
                {/* Navegación por Secciones (similar a Win11, pero con ListItemButton) */}
                <List size="md" sx={{ "--ListItem-radius": theme.radius.md }}>
                  {" "}
                  {/* Radio de borde de lista */}
                  <ListItemButton
                    selected={selectedSection === "profile"}
                    onClick={() => setSelectedSection("profile")}
                    // sx={{ py: 1.5 }} // Mayor padding para los botones de lista
                  >
                    <AccountCircleRoundedIcon />
                    <ListItemContent>Mi Cuenta</ListItemContent>
                  </ListItemButton>
                  <ListItemButton
                    selected={selectedSection === "security"}
                    onClick={() => setSelectedSection("security")}
                    // sx={{ py: 1.5 }}
                  >
                    <LockRoundedIcon />
                    <ListItemContent>Seguridad</ListItemContent>
                  </ListItemButton>
                  {/* <ListItemButton
                    selected={selectedSection === "preferences"}
                    onClick={() => setSelectedSection("preferences")}
                    // sx={{ py: 1.5 }}
                  >
                    <SettingsRoundedIcon />
                    <ListItemContent>Preferencias</ListItemContent>
                  </ListItemButton> */}
                </List>
              </Card>
            </Grid>

            {/* Columna Derecha: Contenido de la Sección Seleccionada */}
            <Grid xs={12} md={8}>
              <Card
                sx={{
                  p: { xs: 2, md: 3 }, // Mayor padding para el contenido
                  borderRadius: "lg",
                  boxShadow: theme.shadow.sm, // Sombra sutil
                  bgcolor: "background.surface",
                }}>
                {selectedSection === "profile" && (
                  <>
                    <Typography level="h3" component="h2" mb={3}>
                      Información Personal
                    </Typography>
                    <MyAccountForm user={user} showSnackbar={showSnackbar} />
                  </>
                )}
                {selectedSection === "security" && (
                  <>
                    <Typography level="h3" component="h2" mb={3}>
                      Ajustes de Seguridad
                    </Typography>
                    <SecuritySettingsForm
                      user={user}
                      showSnackbar={showSnackbar}
                    />
                  </>
                )}
                {selectedSection === "preferences" && (
                  <>
                    <Typography level="h3" component="h2" mb={3}>
                      Preferencias de Usuario
                    </Typography>
                    <Typography level="body-md">
                      Aquí ajustarías el idioma, notificaciones, tema de la
                      interfaz, etc.
                    </Typography>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Snackbar en la parte inferior para no interferir con el header
        autoHideDuration={4000}>
        {snackbarMessage}
      </Snackbar>
    </Sheet>
  );
}
