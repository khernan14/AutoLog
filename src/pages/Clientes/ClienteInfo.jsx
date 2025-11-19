import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Sheet,
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
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { getClienteById, updateCliente } from "../../services/ClientesServices";
import { getSitesByCliente } from "../../services/SitesServices";
import { getActivosByCliente } from "../../services/ActivosServices";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import StatusCard from "../../components/common/StatusCard";

const ESTATUS = ["Activo", "Inactivo"];

export default function ClienteInfo() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";

  const can = useCallback(
    (perm) => isAdmin || hasPermiso(perm),
    [isAdmin, hasPermiso]
  );
  const canView = can("ver_companias");
  const canEdit = can("editar_companias");

  // ---- estado principal del cliente ----
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

  // ---- logo ----
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null); // url (server o blob)
  const prevBlobUrlRef = useRef(null);

  // ---- resumen (sites + activos) ----
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [summary, setSummary] = useState({
    totalSites: 0,
    activeSites: 0,
    inactiveSites: 0,
    totalActivos: 0,
    activosByStatus: {}, // { "Activo": 10, "En reparación": 2, ... }
  });

  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }

    if (!canView) {
      setLoading(false);
      setError(null); // tarjeta de "sin permisos" se encarga
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
      const msg = err?.message || "Error desconocido.";
      setError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : "No se pudo cargar el cliente."
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canView]);

  // resumen: sites + activos
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

      // normalizar activo flag
      const isSiteActivo = (v) =>
        v === 1 || v === "1" || v === true || v === "true";

      const totalSites = sitesArr.length;
      const activeSites = sitesArr.filter((s) => isSiteActivo(s.activo)).length;
      const inactiveSites = totalSites - activeSites;

      const totalActivos = activosArr.length;

      const activosByStatus = {};
      activosArr.forEach((a) => {
        const key = a.estatus || "Sin estatus";
        activosByStatus[key] = (activosByStatus[key] || 0) + 1;
      });

      setSummary({
        totalSites,
        activeSites,
        inactiveSites,
        totalActivos,
        activosByStatus,
      });
    } catch (err) {
      setSummaryError(
        err?.message || "No se pudo cargar el resumen de este cliente."
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [id, canView]);

  useEffect(() => {
    load();
    loadSummary();
  }, [load, loadSummary]);

  // Limpieza de blobs
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
      return showToast("Solo se permiten imágenes", "warning");
    if (f.size > 2 * 1024 * 1024) return showToast("Máximo 2MB", "warning");

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
    if (!canEdit) {
      showToast("No tienes permiso para editar este cliente.", "warning");
      return;
    }
    if (!form.codigo.trim())
      return showToast("El código es requerido", "warning");
    if (!form.nombre.trim())
      return showToast("El nombre es requerido", "warning");

    setSaving(true);
    try {
      await updateCliente(id, form, logoFile);
      showToast("Cliente actualizado correctamente", "success");
      setEditMode(false);
      await load(); // refresca datos
      await loadSummary(); // por si cambiaste estatus y quieres refrescar contexto
    } catch (err) {
      showToast(err?.message || "Error al actualizar cliente", "danger");
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
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  }, [cliente?.fecha_registro]);

  // ----- view state -----
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

  const renderStatus = () => {
    if (viewState === "checking") {
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title="Verificando sesión…"
          description={
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size="sm" />
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                Por favor, espera un momento.
              </Typography>
            </Stack>
          }
        />
      );
    }
    if (viewState === "no-permission") {
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title="Sin permisos para ver clientes"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (viewState === "error") {
      const isNetwork = /conexión|failed to fetch/i.test(error || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={
            isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetwork ? "Problema de conexión" : "No se pudo cargar el cliente"
          }
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={() => {
                load();
                loadSummary();
              }}
              variant="soft">
              Reintentar
            </Button>
          }
        />
      );
    }
    if (viewState === "empty") {
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Cliente no encontrado"
          description="Verifica el identificador en la URL."
        />
      );
    }
    if (viewState === "loading") {
      return (
        <Sheet p={3} sx={{ textAlign: "center" }}>
          <Stack spacing={1} alignItems="center">
            <CircularProgress />
            <Typography level="body-sm">Cargando…</Typography>
          </Stack>
        </Sheet>
      );
    }
    return null;
  };

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
        justifyContent: "center",
        overflow: "auto",
        minHeight: "100dvh",
        bgcolor: "background.body",
      }}>
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        {viewState !== "data" ? (
          <Card variant="plain" sx={{ mb: 2 }}>
            <Box p={2}>{renderStatus()}</Box>
          </Card>
        ) : (
          <>
            {/* Header de página */}
            <Stack spacing={0.5} mb={2}>
              <Typography
                level="body-xs"
                sx={{ textTransform: "uppercase", opacity: 0.7 }}>
                Cliente
              </Typography>
              <Typography level="h4">
                {cliente?.nombre || "Cliente sin nombre"}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap">
                {cliente?.codigo && (
                  <Chip size="sm" variant="soft" color="neutral">
                    Código: {cliente.codigo}
                  </Chip>
                )}
                <Chip
                  size="sm"
                  variant="soft"
                  color={cliente?.estatus === "Activo" ? "success" : "neutral"}>
                  {cliente?.estatus || "Sin estatus"}
                </Chip>
              </Stack>
            </Stack>

            {/* Resumen del cliente */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2}>
              {/* Card Activos */}
              <Card
                variant="soft"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 1.75,
                }}>
                <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                  Activos del cliente
                </Typography>
                {summaryLoading ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}>
                    <CircularProgress size="sm" />
                    <Typography level="body-sm">Cargando resumen…</Typography>
                  </Stack>
                ) : (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="baseline"
                      sx={{ mt: 0.5 }}>
                      <Typography level="h3">{summary.totalActivos}</Typography>
                      <Typography
                        level="body-xs"
                        color="neutral"
                        sx={{ opacity: 0.8 }}>
                        registrados
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      sx={{ mt: 1 }}>
                      {Object.keys(summary.activosByStatus).length === 0 ? (
                        <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                          Sin activos asociados.
                        </Typography>
                      ) : (
                        Object.entries(summary.activosByStatus).map(
                          ([st, count]) => (
                            <Chip
                              key={st}
                              size="sm"
                              variant="outlined"
                              color={
                                st === "Activo"
                                  ? "success"
                                  : st === "Baja"
                                  ? "danger"
                                  : "neutral"
                              }>
                              {st}: {count}
                            </Chip>
                          )
                        )
                      )}
                    </Stack>
                  </>
                )}
                {summaryError && !summaryLoading && (
                  <Typography
                    level="body-xs"
                    color="danger"
                    sx={{ mt: 1, opacity: 0.9 }}>
                    {summaryError}
                  </Typography>
                )}
              </Card>

              {/* Card Sites */}
              <Card
                variant="soft"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 1.75,
                }}>
                <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                  Sites del cliente
                </Typography>
                {summaryLoading ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}>
                    <CircularProgress size="sm" />
                    <Typography level="body-sm">Cargando resumen…</Typography>
                  </Stack>
                ) : (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="baseline"
                      sx={{ mt: 0.5 }}>
                      <Typography level="h3">{summary.totalSites}</Typography>
                      <Typography
                        level="body-xs"
                        color="neutral"
                        sx={{ opacity: 0.8 }}>
                        registrados
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ mt: 1 }}
                      flexWrap="wrap">
                      <Chip size="sm" variant="soft" color="success">
                        Activos: {summary.activeSites}
                      </Chip>
                      <Chip size="sm" variant="soft" color="neutral">
                        Inactivos: {summary.inactiveSites}
                      </Chip>
                    </Stack>
                  </>
                )}
              </Card>
            </Stack>

            {/* Contenido principal: ficha / edición */}
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                backgroundColor: "background.surface",
              }}>
              <Stack spacing={2}>
                {/* Top: logo + acciones */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}>
                  {/* Avatar + logo controls */}
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ minWidth: 0 }}>
                    <Avatar
                      src={logoPreview || undefined}
                      sx={{ "--Avatar-size": "80px", fontSize: "2rem" }}>
                      {cliente?.nombre?.[0] || "C"}
                    </Avatar>
                    {!editMode && (
                      <Box>
                        <Typography level="title-md">
                          {cliente?.nombre || "—"}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Acciones */}
                  <Stack
                    direction="row"
                    spacing={1}
                    mt={{ xs: 2, md: 0 }}
                    justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                    {!editMode ? (
                      <Tooltip
                        title={
                          canEdit
                            ? "Editar cliente"
                            : "No tienes permiso para editar. Solicítalo al administrador."
                        }
                        placement="top">
                        <span>
                          <Button
                            startDecorator={<EditIcon />}
                            onClick={() => canEdit && setEditMode(true)}
                            disabled={!canEdit}
                            aria-disabled={!canEdit}
                            variant={canEdit ? "solid" : "soft"}
                            color={canEdit ? "primary" : "neutral"}>
                            Editar
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <>
                        <Button
                          color="neutral"
                          startDecorator={<CloseIcon />}
                          disabled={saving}
                          onClick={onCancel}>
                          Cancelar
                        </Button>
                        <Button
                          color="primary"
                          startDecorator={<SaveIcon />}
                          loading={saving}
                          onClick={onSave}>
                          Guardar
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>

                <Divider />

                {/* Sección principal: lectura vs edición */}
                {!editMode ? (
                  <Stack spacing={1.5}>
                    <Sheet
                      variant="soft"
                      sx={{
                        p: 1.5,
                        borderRadius: "md",
                      }}>
                      <Typography level="title-sm">Descripción</Typography>
                      <Typography level="body-sm" sx={{ mt: 0.5 }}>
                        {cliente?.descripcion || "Sin descripción registrada."}
                      </Typography>
                    </Sheet>
                  </Stack>
                ) : (
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems="flex-start">
                    {/* Columna Izquierda: logo controls */}
                    <Stack spacing={1} sx={{ minWidth: 0 }}>
                      <Typography level="title-sm">Logo</Typography>
                      <Avatar
                        src={logoPreview || undefined}
                        sx={{ "--Avatar-size": "80px", fontSize: "2rem" }}>
                        {cliente?.nombre?.[0] || "C"}
                      </Avatar>
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                        <Button
                          component="label"
                          variant="outlined"
                          size="sm"
                          disabled={saving}>
                          Cambiar logo
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={onLogoChange}
                          />
                        </Button>
                        {logoPreview && (
                          <Button
                            variant="plain"
                            size="sm"
                            color="neutral"
                            startDecorator={<DeleteOutlineIcon />}
                            disabled={saving}
                            onClick={() => {
                              if (prevBlobUrlRef.current) {
                                URL.revokeObjectURL(prevBlobUrlRef.current);
                                prevBlobUrlRef.current = null;
                              }
                              setLogoFile(null);
                              setLogoPreview(null);
                            }}>
                            Quitar
                          </Button>
                        )}
                      </Stack>
                    </Stack>

                    {/* Columna Derecha: formulario */}
                    <Stack spacing={1.5} sx={{ flex: 1, width: "100%" }}>
                      <FormControl required>
                        <FormLabel>Código</FormLabel>
                        <Input
                          disabled={saving}
                          value={form.codigo}
                          onChange={(e) =>
                            setForm({ ...form, codigo: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl required>
                        <FormLabel>Nombre</FormLabel>
                        <Input
                          disabled={saving}
                          value={form.nombre}
                          onChange={(e) =>
                            setForm({ ...form, nombre: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Descripción</FormLabel>
                        <Input
                          disabled={saving}
                          value={form.descripcion}
                          onChange={(e) =>
                            setForm({ ...form, descripcion: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl required>
                        <FormLabel>Estatus</FormLabel>
                        <Select
                          disabled={saving}
                          value={form.estatus}
                          onChange={(_, v) => setForm({ ...form, estatus: v })}>
                          {ESTATUS.map((s) => (
                            <Option key={s} value={s}>
                              {s}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>
                )}

                <Divider sx={{ mt: 1 }} />

                <Typography level="body-xs" color="neutral">
                  Registrado el: {createdAtText}
                </Typography>
              </Stack>
            </Card>
          </>
        )}
      </Box>
    </Sheet>
  );
}
