// src/pages/Users/MyAccount.jsx
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Snackbar,
  Card,
  Avatar,
  Divider,
  Skeleton,
  useTheme,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Sheet,
  Alert,
  ListItemDecorator,
} from "@mui/joy";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded"; // Nuevo Icono

import MyAccountForm from "../../../components/Users/MyAccount/MyAccountForm";
import SecuritySettingsForm from "../../../components/Users/MyAccount/SecuritySettingsForm";

import { getUsersById } from "../../../services/AuthServices";
import { useAuth } from "../../../context/AuthContext";

export default function MyAccount() {
  const { t, i18n } = useTranslation(); // Agregamos i18n para el idioma de la fecha
  const { userData } = useAuth();
  const theme = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("profile");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "neutral",
  });

  const showSnackbar = (message, color = "neutral") => {
    setSnackbar({ open: true, message, color });
  };

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const id = userData?.id_usuario || userData?.id;
      if (!id) {
        showSnackbar(t("account.errors.no_id"), "danger");
        return;
      }

      const data = await getUsersById(id);
      if (Array.isArray(data) && data.length > 0) {
        setUser(data[0]);
      } else {
        showSnackbar(t("account.errors.not_found"), "warning");
        setUser(null);
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      showSnackbar(t("account.errors.load_failed"), "danger");
    } finally {
      setLoading(false);
    }
  }, [userData, t]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  // --- Helper para formatear fecha ---
  const formatLastReset = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleString(i18n.language, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        hour12: true,
      });
    } catch (e) {
      return null;
    }
  };

  // --- Skeleton Loading ---
  if (loading) {
    return (
      <Box
        sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto", width: "100%" }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 16 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}>
                <Skeleton
                  variant="circular"
                  width={100}
                  height={100}
                  sx={{ mb: 2 }}
                />
                <Skeleton variant="text" level="h3" width="60%" />
                <Skeleton variant="text" level="body-sm" width="40%" />
              </Box>
              <Divider />
              <List sx={{ mt: 2 }}>
                <Skeleton
                  variant="rectangular"
                  height={40}
                  sx={{ borderRadius: "md", mb: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={40}
                  sx={{ borderRadius: "md" }}
                />
              </List>
            </Card>
          </Grid>
          <Grid xs={12} md={8}>
            <Card
              variant="outlined"
              sx={{ p: 3, borderRadius: 16, height: "100%" }}>
              <Skeleton variant="text" level="h3" width="40%" sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={200} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <Alert
          color="warning"
          variant="soft"
          startDecorator={<ErrorOutlineRoundedIcon />}>
          {t("account.errors.load_failed")}
        </Alert>
      </Box>
    );
  }

  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 },
        pb: 4,
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100dvh",
        bgcolor: "background.body",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        <Typography level="h2" mb={3} sx={{ px: { xs: 0, md: 1 } }}>
          {t("account.page_title")}
        </Typography>

        <Grid container spacing={3}>
          {/* PANEL IZQUIERDO (MENU) */}
          <Grid xs={12} md={3.5}>
            <Card
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 16,
                boxShadow: "sm",
                position: { md: "sticky" },
                top: { md: 24 },
              }}>
              <Box textAlign="center" mb={2}>
                <Avatar
                  size="lg"
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 2,
                    fontSize: "2rem",
                    bgcolor: "primary.softBg",
                    color: "primary.softColor",
                    boxShadow: "md",
                  }}>
                  {getInitials(user.nombre)}
                </Avatar>

                <Typography level="h4" fontWeight="lg">
                  {user.nombre} {user.apellido}
                </Typography>
                <Typography level="body-sm" color="neutral">
                  {user.puesto || t("account.no_position")}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List size="sm" sx={{ "--ListItem-radius": "8px", gap: 0.5 }}>
                <ListItem>
                  <ListItemButton
                    selected={selectedSection === "profile"}
                    onClick={() => setSelectedSection("profile")}
                    variant={selectedSection === "profile" ? "soft" : "plain"}
                    color={
                      selectedSection === "profile" ? "primary" : "neutral"
                    }>
                    <ListItemDecorator>
                      <PersonRoundedIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                      {t("account.menu.profile")}
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>

                <ListItem>
                  <ListItemButton
                    selected={selectedSection === "security"}
                    onClick={() => setSelectedSection("security")}
                    variant={selectedSection === "security" ? "soft" : "plain"}
                    color={
                      selectedSection === "security" ? "primary" : "neutral"
                    }>
                    <ListItemDecorator>
                      <SecurityRoundedIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                      {t("account.menu.security")}
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              </List>
            </Card>
          </Grid>

          {/* PANEL DERECHO (CONTENIDO) */}
          <Grid xs={12} md={8.5}>
            <Card
              variant="outlined"
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 16,
                boxShadow: "sm",
                minHeight: 400,
              }}>
              {selectedSection === "profile" && (
                <>
                  <Typography level="h3" mb={1}>
                    {t("account.profile.title")}
                  </Typography>
                  <Typography level="body-sm" mb={3} color="neutral">
                    {t("account.profile.subtitle")}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MyAccountForm user={user} showSnackbar={showSnackbar} />
                </>
              )}

              {selectedSection === "security" && (
                <>
                  <Typography level="h3" mb={1}>
                    {t("account.security.title")}
                  </Typography>

                  {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
                  <Box mb={3}>
                    <Typography level="body-sm" color="neutral">
                      {t("account.security.subtitle")}
                    </Typography>

                    {/* Solo mostramos si user.last_password_change tiene valor */}
                    {user.last_password_change && (
                      <Typography
                        level="body-xs"
                        color="success"
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontWeight: "md",
                        }}>
                        <HistoryRoundedIcon style={{ fontSize: 16 }} />
                        {t("account.security.last_reset")}:{" "}
                        {formatLastReset(user.last_password_change)}
                      </Typography>
                    )}
                  </Box>
                  {/* --------------------------- */}

                  <Divider sx={{ mb: 3 }} />
                  <SecuritySettingsForm
                    user={user}
                    showSnackbar={showSnackbar}
                  />
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar Global */}
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        color={snackbar.color}
        variant="soft"
        startDecorator={
          snackbar.color === "success" ? (
            <CheckCircleRoundedIcon />
          ) : (
            <ErrorOutlineRoundedIcon />
          )
        }
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        {snackbar.message}
      </Snackbar>
    </Sheet>
  );
}
