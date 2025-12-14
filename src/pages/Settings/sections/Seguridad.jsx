// src/pages/Settings/sections/Seguridad.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Stack,
  Typography,
  Switch,
  Button,
  Divider,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Chip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Table,
  Sheet,
  Avatar,
  Skeleton,
  Tooltip,
} from "@mui/joy";

// Iconos
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import LaptopRoundedIcon from "@mui/icons-material/LaptopRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CircleIcon from "@mui/icons-material/Circle";

// Componentes y Hooks compartidos
import { SectionHeader } from "./_shared/SectionHeader.jsx";
import TwoFactorSetupModal from "./modals/TwoFactorSetupModal.jsx";
import usePermissions from "../../../hooks/usePermissions.js";
import { useSettings } from "../../../context/SettingsContext.jsx";

// Servicios
import {
  getSecurityData,
  revokeOtherSessions,
} from "@/services/SettingsServices";

// --- Helper para formatear fechas ---
const formatDate = (isoString, locale = "es-HN") => {
  if (!isoString) return "-";
  try {
    return new Date(isoString).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: true,
    });
  } catch (e) {
    return isoString;
  }
};

export default function Seguridad({ initialData = {}, onSave }) {
  const { t, i18n } = useTranslation();
  const perms = usePermissions();
  const { reload } = useSettings();
  const canEdit = perms.has("editar_configuraciones") || perms.isAdmin;

  // --- Estados de Configuración (2FA / Alertas) ---
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false); // Para spinners de botones

  // --- Estados de Datos Dinámicos (Sesiones / Logs) ---
  const [sessions, setSessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true); // Para esqueletos de carga

  // 1. Sincronizar datos iniciales de props
  useEffect(() => {
    setTfaEnabled(Boolean(initialData?.tfa_enabled));
  }, [initialData]);

  // 2. Cargar datos reales de seguridad (Sesiones y Logs)
  const loadSecurityInfo = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await getSecurityData();
      setSessions(data.sessions || []);
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error cargando datos de seguridad:", error);
      // Aquí podrías mostrar un toast/snackbar si lo deseas
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadSecurityInfo();
  }, [loadSecurityInfo]);

  // --- MANEJADORES: 2FA ---

  const handleToggleTfa = async (event) => {
    const isChecking = event.target.checked;
    if (isChecking) {
      try {
        setLoadingAction(true);
        // Iniciamos el proceso en backend (genera secreto temporal)
        const res = await onSave({ tfa_enroll_init: true });
        const data = res.data || res;

        if (data?.qr_image) {
          setSetupData(data);
          setSetupModalOpen(true);
        } else {
          // Si por alguna razón no devuelve QR (ej: ya estaba configurado), recargamos
          await reload();
        }
      } catch (error) {
        console.error("Error iniciando 2FA", error);
        reload();
      } finally {
        setLoadingAction(false);
      }
    } else {
      // Si quiere desactivar, pedimos confirmación
      setConfirmDisableOpen(true);
    }
  };

  const handleVerifyCode = async (code) => {
    try {
      // Enviamos el código OTP para confirmar activación
      const res = await onSave({
        tfa_enroll_verify: true,
        token: code,
        secret: setupData?.secret,
      });
      setSetupModalOpen(false);
      setSetupData(null);
      await reload(); // Recargar settings globales
      return res;
    } catch (error) {
      throw error; // El modal manejará el error visualmente
    }
  };

  const handleConfirmDisable = async () => {
    try {
      setLoadingAction(true);
      await onSave({ tfa_enabled: false });
      setConfirmDisableOpen(false);
      await reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCloseModal = () => {
    setSetupModalOpen(false);
    setSetupData(null);
    reload();
  };

  // --- MANEJADORES: SESIONES ---

  const handleRevokeAll = async () => {
    try {
      setLoadingAction(true);
      await revokeOtherSessions();
      // Recargamos la lista para mostrar que solo queda la actual
      await loadSecurityInfo();
    } catch (error) {
      console.error("Error cerrando sesiones:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        {/* Cabecera Principal */}
        <SectionHeader
          title={t("settings.security.title")}
          subtitle={t("settings.security.subtitle")}
        />

        <List sx={{ "--ListItem-paddingY": "1rem" }}>
          {/* SECCIÓN 1: Autenticación de Dos Factores */}
          <ListItem
            endAction={
              <Switch
                checked={tfaEnabled}
                onChange={handleToggleTfa}
                disabled={!canEdit || loadingAction}
                sx={{ ml: 2 }}
              />
            }>
            <ListItemDecorator>
              <ShieldRoundedIcon fontSize="large" />
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">
                {t("settings.security.2fa.title")}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {t("settings.security.2fa.desc")}
              </Typography>
              {tfaEnabled && (
                <Chip size="sm" color="success" variant="soft" sx={{ mt: 1 }}>
                  {t("common.status.active")}
                </Chip>
              )}
            </ListItemContent>
          </ListItem>

          <Divider component="li" />

          {/* SECCIÓN 2: Alertas de Inicio de Sesión */}
          <ListItem
            endAction={
              <Switch
                checked={!!initialData?.login_alerts}
                disabled={!canEdit}
                onChange={async (e) => {
                  await onSave({ login_alerts: e.target.checked });
                }}
                sx={{ ml: 2 }}
              />
            }>
            <ListItemDecorator>
              <SmartphoneRoundedIcon fontSize="large" />
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">
                {t("settings.security.alerts.title")}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {t("settings.security.alerts.desc")}
              </Typography>
            </ListItemContent>
          </ListItem>

          <Divider component="li" />

          {/* SECCIÓN 3: Sesiones Activas */}
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <DevicesRoundedIcon
                sx={{ color: "text.secondary", fontSize: 28 }}
              />
              <Box>
                <Typography level="title-sm">
                  {t("settings.security.sessions.title")}
                </Typography>
                <Typography level="body-sm" color="neutral">
                  {t("settings.security.sessions.desc")}
                </Typography>
              </Box>
            </Stack>

            <Sheet
              variant="outlined"
              sx={{ borderRadius: "md", overflow: "hidden" }}>
              {loadingData ? (
                <Box p={2}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={30}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              ) : (
                <List sx={{ "--ListItem-paddingY": "12px" }}>
                  {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <React.Fragment key={session.id || index}>
                        <ListItem>
                          <ListItemDecorator>
                            <Avatar
                              size="sm"
                              color={session.current ? "success" : "neutral"}
                              variant="soft">
                              {/* Lógica simple para icono: Si dice mobile o android/ios es cel, sino laptop */}
                              {session.type === "mobile" ||
                              /android|iphone|ipad|mobile/i.test(
                                session.device || ""
                              ) ? (
                                <SmartphoneRoundedIcon />
                              ) : (
                                <LaptopRoundedIcon />
                              )}
                            </Avatar>
                          </ListItemDecorator>
                          <ListItemContent>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              flexWrap="wrap">
                              <Typography level="body-sm" fontWeight="md">
                                {session.device}
                              </Typography>
                              {session.current && (
                                <Chip
                                  size="sm"
                                  color="success"
                                  variant="solid"
                                  sx={{ minHeight: 20, px: 1 }}>
                                  {t("settings.security.sessions.current")}
                                </Chip>
                              )}
                            </Stack>
                            <Typography level="body-xs">
                              {session.ip} ·{" "}
                              {session.current
                                ? t("common.status.now")
                                : formatDate(
                                    session.last_active,
                                    i18n.language
                                  )}
                            </Typography>
                          </ListItemContent>
                        </ListItem>
                        {index < sessions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography
                      level="body-sm"
                      p={2}
                      textAlign="center"
                      color="neutral">
                      No se encontraron sesiones activas.
                    </Typography>
                  )}
                </List>
              )}

              {/* Botón Revocar: Solo aparece si ya cargó y hay más de una sesión */}
              {!loadingData && sessions.length > 1 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "flex-end",
                    bgcolor: "background.level1",
                  }}>
                  <Button
                    size="sm"
                    color="danger"
                    variant="outlined"
                    startDecorator={<LogoutRoundedIcon />}
                    onClick={handleRevokeAll}
                    loading={loadingAction}>
                    {t("settings.security.sessions.revoke_all")}
                  </Button>
                </Box>
              )}
            </Sheet>
          </Box>

          <Divider component="li" />

          {/* SECCIÓN 4: Historial de Actividad */}
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <HistoryRoundedIcon
                sx={{ color: "text.secondary", fontSize: 28 }}
              />
              <Box>
                <Typography level="title-sm">
                  {t("settings.security.logs.title")}
                </Typography>
                <Typography level="body-sm" color="neutral">
                  {t("settings.security.logs.desc")}
                </Typography>
              </Box>
            </Stack>

            <Sheet
              variant="outlined"
              sx={{ borderRadius: "md", overflow: "hidden" }}>
              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {loadingData ? (
                  <Box p={2}>
                    <Skeleton
                      variant="rectangular"
                      height={40}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={40}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="rectangular" height={40} />
                  </Box>
                ) : (
                  <Table stickyHeader hoverRow size="sm" borderAxis="header">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>
                          {t("settings.security.logs.action")}
                        </th>
                        <th>{t("settings.security.logs.device")}</th>
                        <th style={{ textAlign: "right" }}>
                          {t("settings.security.logs.date")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <tr key={log.id || index}>
                            <td>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center">
                                <CircleIcon
                                  sx={{ fontSize: 8, color: "neutral.400" }}
                                />
                                <Typography level="body-xs" fontWeight="md">
                                  {log.action}
                                </Typography>
                              </Stack>
                            </td>
                            <td>
                              <Tooltip
                                title={log.device_info || log.device || log.ip}>
                                <Typography
                                  level="body-xs"
                                  noWrap
                                  sx={{ maxWidth: 150 }}>
                                  {log.device_info || log.device || log.ip}
                                </Typography>
                              </Tooltip>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <Typography level="body-xs" color="neutral">
                                {formatDate(
                                  log.created_at || log.date,
                                  i18n.language
                                )}
                              </Typography>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "center",
                              padding: "2rem",
                              color: "var(--joy-palette-neutral-500)",
                            }}>
                            Sin actividad reciente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </Box>
            </Sheet>
          </Box>
        </List>
      </Card>

      {/* --- MODALES --- */}

      {/* Modal QR para 2FA */}
      <TwoFactorSetupModal
        open={setupModalOpen}
        onClose={handleCloseModal}
        setupData={setupData}
        onVerify={handleVerifyCode}
      />

      {/* Modal Confirmación Desactivar 2FA */}
      <Modal
        open={confirmDisableOpen}
        onClose={() => setConfirmDisableOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <WarningRoundedIcon /> {t("settings.security.disable_modal.title")}
          </DialogTitle>
          <Divider />
          <DialogContent>
            {t("settings.security.disable_modal.desc")}
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={handleConfirmDisable}
              loading={loadingAction}>
              {t("settings.security.disable_modal.confirm")}
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setConfirmDisableOpen(false)}>
              {t("common.actions.cancel")}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
