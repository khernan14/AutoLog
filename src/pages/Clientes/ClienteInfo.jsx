// src/pages/Clientes/ClienteInfo.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import navigate
import { useTranslation } from "react-i18next"; // 👈 i18n

import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Input,
  Avatar,
  Divider,
  Chip,
  FormControl,
  FormLabel,
  Select,
  Option,
  Tooltip,
  CircularProgress,
  Grid,
  IconButton,
} from "@mui/joy";

// Iconos
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"; // Nuevo
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded"; // Nuevo

import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

// Services & Context
import { getClienteById, updateCliente } from "../../services/ClientesServices";
import { getSitesByCliente } from "../../services/SitesServices";
import { getActivosByCliente } from "../../services/ActivosServices";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import StatusCard from "../../components/common/StatusCard";

const ESTATUS = ["Activo", "Inactivo"];

export default function ClienteInfo() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (perm) => isAdmin || hasPermiso(perm),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_companias");
  const canEdit = can("editar_companias");

  // Estado
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    estatus: "Activo",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const prevBlobUrlRef = useRef(null);

  // Resumen
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [summary, setSummary] = useState({
    totalSites: 0,
    activeSites: 0,
    inactiveSites: 0,
    totalActivos: 0,
    activosByStatus: {},
  });

  // Carga Principal
  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getClienteById(id);
      if (!data) {
        setCliente(null);
      } else {
        setCliente(data);
        setForm({
          codigo: data.codigo || "",
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          estatus: data.estatus || "Activo",
        });
        setLogoPreview(data.logo_url || null);
        setLogoFile(null);
      }
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("clients.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canView, t]);

  // Carga Resumen
  const loadSummary = useCallback(async () => {
    if (!canView) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const [sites, activos] = await Promise.all([
        getSitesByCliente(id),
        getActivosByCliente(id),
      ]);

      const sitesArr = Array.isArray(sites) ? sites : [];
      const activosArr = Array.isArray(activos) ? activos : [];
      const isSiteActivo = (v) =>
        v === 1 || v === "1" || v === true || v === "true";

      const totalSites = sitesArr.length;
      const activeSites = sitesArr.filter((s) => isSiteActivo(s.activo)).length;

      const activosByStatus = {};
      activosArr.forEach((a) => {
        const key = a.estatus || "Sin estatus";
        activosByStatus[key] = (activosByStatus[key] || 0) + 1;
      });

      setSummary({
        totalSites,
        activeSites,
        inactiveSites: totalSites - activeSites,
        totalActivos: activosArr.length,
        activosByStatus,
      });
    } catch (err) {
      // Silent fail for summary is often better UX, just log it
      console.warn("Summary load error:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, [id, canView]);

  useEffect(() => {
    load();
    loadSummary();
  }, [load, loadSummary]);

  // Cleanup blobs
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
    };
  }, []);

  function onLogoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type))
      return showToast(t("clients.errors.image_only"), "warning");
    if (f.size > 2 * 1024 * 1024)
      return showToast(t("clients.errors.image_size"), "warning");

    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
      prevBlobUrlRef.current = null;
    }
    const blobUrl = URL.createObjectURL(f);
    prevBlobUrlRef.current = blobUrl;
    setLogoFile(f);
    setLogoPreview(blobUrl);
  }

  async function onSave() {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    if (!form.codigo.trim())
      return showToast(t("clients.errors.code_required"), "warning");
    if (!form.nombre.trim())
      return showToast(t("clients.errors.name_required"), "warning");

    setSaving(true);
    try {
      await updateCliente(id, form, logoFile);
      showToast(t("clients.success.updated"), "success");
      setEditMode(false);
      await load();
      await loadSummary();
    } catch (err) {
      showToast(err?.message || t("clients.errors.update_failed"), "danger");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    if (cliente) {
      setForm({
        codigo: cliente.codigo || "",
        nombre: cliente.nombre || "",
        descripcion: cliente.descripcion || "",
        estatus: cliente.estatus || "Activo",
      });
      setLogoFile(null);
      setLogoPreview(cliente.logo_url || null);
    }
    setEditMode(false);
  }

  const createdAtText = useMemo(() => {
    if (!cliente?.fecha_registro) return "—";
    const d = new Date(cliente.fecha_registro);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  }, [cliente?.fecha_registro]);

  // View State Logic
  const viewState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : error
    ? "error"
    : loading
    ? "loading"
    : !cliente
    ? "empty"
    : "data";

  // Render Status
  const renderStatus = () => {
    if (viewState === "checking")
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title={t("common.verifying_session")}
          description={<CircularProgress size="sm" />}
        />
      );
    if (viewState === "no-permission")
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title={t("common.no_permission")}
          description={t("common.contact_admin")}
        />
      );
    if (viewState === "error")
      return (
        <StatusCard
          color="danger"
          icon={<ErrorOutlineRoundedIcon />}
          title={t("common.error_title")}
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={load}
              variant="soft">
              {t("common.retry")}
            </Button>
          }
        />
      );
    if (viewState === "empty")
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title={t("clients.not_found")}
          description={t("clients.check_url")}
        />
      );
    if (viewState === "loading")
      return (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      );
    return null;
  };

  if (viewState !== "data") {
    return (
      <Box p={4} maxWidth={800} mx="auto">
        {renderStatus()}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        px: { xs: 2, md: 4 },
        py: 3,
        maxWidth: 1200,
        mx: "auto",
        minHeight: "100vh",
      }}>
      {/* HEADER & NAV */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        {/* <IconButton
          onClick={() => navigate("/admin/clientes")}
          variant="plain"
          color="neutral">
          <ArrowBackRoundedIcon />
        </IconButton> */}
        <Box>
          <Typography
            level="body-xs"
            fontWeight="bold"
            textColor="text.tertiary"
            textTransform="uppercase">
            {t("clients.module_name")} / {t("clients.detail")}
          </Typography>
          <Typography level="h2" fontSize="xl2" fontWeight="lg">
            {cliente?.nombre}
          </Typography>
        </Box>
        <Box flex={1} />

        {!editMode ? (
          canEdit && (
            <Button
              startDecorator={<EditIcon />}
              onClick={() => setEditMode(true)}
              variant="soft"
              color="primary">
              {t("common.actions.edit")}
            </Button>
          )
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="plain"
              color="neutral"
              disabled={saving}
              onClick={onCancel}
              startDecorator={<CloseIcon />}>
              {t("common.actions.cancel")}
            </Button>
            <Button
              variant="solid"
              color="primary"
              loading={saving}
              onClick={onSave}
              startDecorator={<SaveIcon />}>
              {t("common.actions.save")}
            </Button>
          </Stack>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: Info Principal */}
        <Grid xs={12} md={8}>
          <Stack spacing={3}>
            {/* TARJETA PRINCIPAL */}
            <Card variant="outlined">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                alignItems="flex-start">
                {/* Logo Section */}
                <Stack alignItems="center" spacing={2} minWidth={120}>
                  <Avatar
                    src={logoPreview}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: "2.5rem",
                      boxShadow: "sm",
                    }}
                    variant="rounded">
                    {cliente?.nombre?.[0]}
                  </Avatar>

                  {editMode && (
                    <Stack spacing={1} width="100%">
                      <Button
                        component="label"
                        size="sm"
                        variant="outlined"
                        startDecorator={<CloudUploadRoundedIcon />}>
                        {t("common.actions.upload")}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={onLogoChange}
                        />
                      </Button>
                      {logoPreview && (
                        <Button
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}>
                          {t("common.actions.remove")}
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>

                {/* Fields Section */}
                <Stack spacing={2} flex={1} width="100%">
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <FormControl>
                        <FormLabel>{t("clients.form.code")}</FormLabel>
                        {editMode ? (
                          <Input
                            value={form.codigo}
                            onChange={(e) =>
                              setForm({ ...form, codigo: e.target.value })
                            }
                          />
                        ) : (
                          <Typography level="title-lg" fontFamily="monospace">
                            {cliente.codigo}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <FormControl>
                        <FormLabel>{t("clients.form.name")}</FormLabel>
                        {editMode ? (
                          <Input
                            value={form.nombre}
                            onChange={(e) =>
                              setForm({ ...form, nombre: e.target.value })
                            }
                          />
                        ) : (
                          <Typography level="title-lg">
                            {cliente.nombre}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12}>
                      <FormControl>
                        <FormLabel>{t("clients.form.description")}</FormLabel>
                        {editMode ? (
                          <Input
                            value={form.descripcion}
                            onChange={(e) =>
                              setForm({ ...form, descripcion: e.target.value })
                            }
                          />
                        ) : (
                          <Typography
                            level="body-md"
                            textColor="text.secondary">
                            {cliente.descripcion || t("common.no_description")}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <FormControl>
                        <FormLabel>{t("clients.form.status")}</FormLabel>
                        {editMode ? (
                          <Select
                            value={form.estatus}
                            onChange={(_, v) =>
                              setForm({ ...form, estatus: v })
                            }>
                            <Option value="Activo">
                              {t("common.status.active")}
                            </Option>
                            <Option value="Inactivo">
                              {t("common.status.inactive")}
                            </Option>
                          </Select>
                        ) : (
                          <Chip
                            color={
                              cliente.estatus === "Activo"
                                ? "success"
                                : "neutral"
                            }
                            variant="soft">
                            {cliente.estatus === "Activo"
                              ? t("common.status.active")
                              : t("common.status.inactive")}
                          </Chip>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Stack>
              </Stack>
            </Card>

            {/* INFO ADICIONAL */}
            <Typography level="body-xs" textAlign="right" color="neutral">
              {t("common.created_at")}: {createdAtText}
            </Typography>
          </Stack>
        </Grid>

        {/* COLUMNA DERECHA: Resumen / Stats */}
        <Grid xs={12} md={4}>
          <Stack spacing={2}>
            {/* Resumen Activos */}
            <Card
              variant="soft"
              color="primary"
              invertedColors
              sx={{ boxShadow: "none" }}>
              <Typography level="title-md" mb={1}>
                {t("clients.stats.assets")}
              </Typography>
              <Typography level="h2">{summary.totalActivos}</Typography>
              <Typography level="body-sm">
                {t("clients.stats.total_registered")}
              </Typography>

              <Divider sx={{ my: 1.5, opacity: 0.2 }} />

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {Object.entries(summary.activosByStatus).map(([st, count]) => (
                  <Chip
                    key={st}
                    size="sm"
                    variant="solid"
                    color="neutral"
                    sx={{ bgcolor: "rgba(79, 68, 236, 0.2)" }}>
                    {st}: {count}
                  </Chip>
                ))}
                {Object.keys(summary.activosByStatus).length === 0 && (
                  <Typography level="body-xs">{t("common.no_data")}</Typography>
                )}
              </Stack>
            </Card>

            {/* Resumen Sites */}
            <Card variant="outlined">
              <Typography level="title-md" mb={1}>
                {t("clients.stats.sites")}
              </Typography>
              <Typography level="h2">{summary.totalSites}</Typography>
              <Typography level="body-sm" color="neutral" mb={2}>
                {t("clients.stats.total_registered")}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Chip variant="soft" color="success" size="sm">
                  {t("common.status.active")}: {summary.activeSites}
                </Chip>
                <Chip variant="soft" color="neutral" size="sm">
                  {t("common.status.inactive")}: {summary.inactiveSites}
                </Chip>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
