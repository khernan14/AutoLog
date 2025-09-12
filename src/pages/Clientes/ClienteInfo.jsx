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
  const [logoPreview, setLogoPreview] = useState(null); // url (server o blob)
  const prevBlobUrlRef = useRef(null);

  const load = useCallback(async () => {
    // si está verificando sesión, mantenemos el spinner
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

  useEffect(() => {
    load();
  }, [load]);

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

    // libera blob anterior si aplica
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
    } catch (err) {
      showToast(err?.message || "Error al actualizar cliente", "danger");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    // restaurar valores originales
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
              onClick={load}
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

  if (viewState !== "data") {
    return (
      <Box p={2}>
        <Card variant="plain">
          <Box p={2}>{renderStatus()}</Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Card variant="outlined" sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between">
          {/* Logo */}
          <Stack spacing={1} alignItems="center">
            <Avatar
              src={logoPreview || undefined}
              sx={{ "--Avatar-size": "96px" }}>
              {cliente?.nombre?.[0] || "C"}
            </Avatar>

            {editMode && (
              <Stack direction="row" spacing={1}>
                <Button component="label" variant="outlined" disabled={saving}>
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
            )}
          </Stack>

          {/* Info */}
          <Box flex={1} sx={{ width: "100%" }}>
            {!editMode ? (
              <>
                <Typography level="h5">{cliente.nombre}</Typography>
                <Typography level="body-sm" color="neutral">
                  Código: {cliente.codigo}
                </Typography>
                <Typography level="body-sm" sx={{ mt: 1 }}>
                  {cliente.descripcion || "Sin descripción"}
                </Typography>
                <Chip
                  variant="soft"
                  color={cliente.estatus === "Activo" ? "success" : "neutral"}
                  sx={{ mt: 1 }}>
                  {cliente.estatus}
                </Chip>
              </>
            ) : (
              <Stack spacing={1.5} mt={1}>
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
            )}
          </Box>

          {/* Acciones */}
          <Stack direction="row" spacing={1} mt={{ xs: 2, sm: 0 }}>
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

        <Divider sx={{ my: 2 }} />

        <Typography level="body-xs" color="neutral">
          Registrado el:{" "}
          {cliente?.fecha_registro
            ? new Date(cliente.fecha_registro).toLocaleString()
            : "—"}
        </Typography>
      </Card>
    </Box>
  );
}
