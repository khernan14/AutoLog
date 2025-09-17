// src/pages/SoporteAdmin/StatusAdminPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Sheet,
  Card,
  CardContent,
  Typography,
  Stack,
  Table,
  Input,
  Select,
  Option,
  Button,
  IconButton,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/joy";

import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

import {
  getOverallStatus,
  listServices,
  statusToJoyColor,
} from "../../services/help.api.js";
import {
  createOverallStatus,
  upsertService,
} from "../../services/helpAdmin.api.js";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StatusCard from "../../components/common/StatusCard";

/* ---------------- helpers ---------------- */
const SERVICE_STATUSES = [
  { value: "OK", label: "Operacional" },
  { value: "Degradado", label: "Degradado" },
  { value: "Mantenimiento", label: "Mantenimiento" },
];

const OVERALL_STATUSES = [
  // El mini status de tu Home considera OK vs no-OK
  { value: "OK", label: "OK" },
  { value: "DEGRADADO", label: "Degradado" },
  { value: "INCIDENTE", label: "Incidente" },
];

function formatDt(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleString();
  } catch {
    return String(d);
  }
}

function ServiceStatusChip({ status }) {
  const color = statusToJoyColor(status);
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      sx={{ textTransform: "capitalize" }}>
      {status || "unknown"}
    </Chip>
  );
}

/* --------------- Modales --------------- */
function OverallModal({ open, onClose, onSave, initial }) {
  const [overall, setOverall] = useState(initial?.overall_status || "OK");
  const [desc, setDesc] = useState(initial?.description || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOverall(initial?.overall_status || "OK");
    setDesc(initial?.description || "");
    setSaving(false);
  }, [open, initial]);

  const submit = async () => {
    setSaving(true);
    try {
      await onSave({ overall_status: overall, description: desc || null });
      onClose?.();
    } catch (e) {
      // el padre muestra toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 640, maxWidth: "96vw" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">Actualizar estado global</Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.25}>
          <FormControl>
            <FormLabel>Estado</FormLabel>
            <Select value={overall} onChange={(_, v) => setOverall(v)}>
              {OVERALL_STATUSES.map((s) => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Descripción (opcional)</FormLabel>
            <Textarea
              minRows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Notas visibles a los usuarios (ej. causa, ETA, mitigación)…"
            />
          </FormControl>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="plain" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              startDecorator={<SaveRoundedIcon />}
              loading={saving}
              onClick={submit}>
              Guardar
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

function ServiceModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [groupName, setGroupName] = useState(initial?.group_name || "");
  const [status, setStatus] = useState(initial?.status || "operational");
  const [message, setMessage] = useState(initial?.message || "");
  const [order, setOrder] = useState(initial?.display_order ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setGroupName(initial?.group_name || "");
    setStatus(initial?.status || "operational");
    setMessage(initial?.message || "");
    setOrder(initial?.display_order ?? 0);
    setSaving(false);
  }, [open, initial]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        status,
        message: message?.trim() || null,
        group_name: groupName?.trim() || null,
        display_order: Number(order) || 0,
      });
      onClose?.();
    } catch (e) {
      // el padre muestra toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 680, maxWidth: "96vw" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">
            {initial ? "Editar servicio" : "Nuevo servicio"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.25}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. API, Base de datos, Jobs…"
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 260 } }}>
              <FormLabel>Grupo (opcional)</FormLabel>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Backend, Integraciones…"
              />
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
              <FormLabel>Estado</FormLabel>
              <Select value={status} onChange={(_, v) => setStatus(v)}>
                {SERVICE_STATUSES.map((s) => (
                  <Option key={s.value} value={s.value}>
                    {s.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Mensaje (opcional)</FormLabel>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Breve contexto"
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 140 } }}>
              <FormLabel>Orden</FormLabel>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="plain" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              startDecorator={<SaveRoundedIcon />}
              loading={saving}
              onClick={submit}>
              Guardar
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

/* --------------- Página principal --------------- */
export default function StatusAdminPage() {
  const { hasPermiso, userData, checkingSession } = useAuth();
  const { showToast } = useToast();

  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso?.(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("help_manage");
  const canEdit = can("help_manage");
  const canCreate = can("help_manage");

  const [overall, setOverall] = useState(null);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modales
  const [openOverall, setOpenOverall] = useState(false);
  const [openService, setOpenService] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const fetchAll = useCallback(async () => {
    if (checkingSession) return;
    if (!canView) {
      setOverall(null);
      setServices([]);
      setLoading(false);
      setErr(null);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const [ov, svcs] = await Promise.all([
        getOverallStatus({}, { cache: "no-cache" }), // ya en help.api usa no-cache
        listServices({}, { cache: "no-cache" }),
      ]);
      setOverall(ov || null);
      setServices(Array.isArray(svcs) ? svcs : []);
    } catch (e) {
      setErr(e?.message || "No se pudo cargar el estatus");
      setOverall(null);
      setServices([]);
      showToast(e?.message || "No se pudo cargar el estatus", "danger");
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const groupedServices = useMemo(() => {
    const groups = new Map();
    (services || []).forEach((s) => {
      const g = s.group_name || "General";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(s);
    });
    // respeta display_order ASC, id ASC (ya viene ordenado del backend),
    // pero por si acaso, ordena por display_order
    for (const [g, arr] of groups.entries()) {
      arr.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      groups.set(g, arr);
    }
    return Array.from(groups.entries());
  }, [services]);

  const onOpenNewService = () => {
    if (!canCreate) {
      showToast("No tienes permiso para crear servicios", "warning");
      return;
    }
    setEditingService(null);
    setOpenService(true);
  };

  const onEditService = (row) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar servicios", "warning");
      return;
    }
    setEditingService(row);
    setOpenService(true);
  };

  const saveOverall = async ({ overall_status, description }) => {
    try {
      await createOverallStatus({ overall_status, description });
      showToast("Estado global actualizado", "success");
      fetchAll();
    } catch (e) {
      showToast(e?.message || "No se pudo actualizar el estado", "danger");
      throw e;
    }
  };

  const saveService = async (payload) => {
    try {
      await upsertService(payload);
      showToast("Servicio guardado", "success");
      fetchAll();
    } catch (e) {
      showToast(e?.message || "No se pudo guardar el servicio", "danger");
      throw e;
    }
  };

  // View state
  const isNetworkErr = /conexión|failed to fetch|network/i.test(err || "");
  const viewState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : err
    ? "error"
    : loading
    ? "loading"
    : "data";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h4" mb={1}>
        Administración de Estado del Sistema
      </Typography>

      {/* Estados de carga/permiso */}
      {viewState === "checking" && (
        <StatusCard
          title="Verificando sesión…"
          description={<CircularProgress size="sm" />}
        />
      )}
      {viewState === "no-permission" && (
        <StatusCard
          color="danger"
          title="Sin permisos"
          description="Consulta con un administrador para obtener acceso."
        />
      )}
      {viewState === "error" && (
        <StatusCard
          color={isNetworkErr ? "warning" : "danger"}
          icon={
            isNetworkErr ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetworkErr
              ? "Problema de conexión"
              : "No se pudo cargar el estatus"
          }
          description={err}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={fetchAll}
              variant="soft">
              Reintentar
            </Button>
          }
        />
      )}

      {viewState !== "data" ? null : (
        <Stack spacing={2}>
          {/* ======= OVERALL ======= */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "md",
                      bgcolor: "primary.softBg",
                      color: "primary.solidColor",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}>
                    <InsightsRoundedIcon />
                  </Box>
                  <Typography level="title-md">Estado global</Typography>
                </Stack>
                <Button
                  onClick={() => setOpenOverall(true)}
                  disabled={!canEdit}
                  variant={canEdit ? "solid" : "soft"}>
                  Actualizar
                </Button>
              </Stack>

              <Divider sx={{ my: 1.25 }} />

              {overall ? (
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        (overall?.overall_status || "").toUpperCase() === "OK"
                          ? "success"
                          : "warning"
                      }
                      startDecorator={<BoltRoundedIcon />}>
                      {(overall?.overall_status || "").toUpperCase() || "—"}
                    </Chip>
                    <Typography level="body-sm" color="neutral">
                      {formatDt(overall?.status_timestamp)}
                    </Typography>
                  </Stack>
                  {overall?.description ? (
                    <Typography level="body-sm">
                      {overall.description}
                    </Typography>
                  ) : (
                    <Typography level="body-sm" color="neutral">
                      Sin descripción.
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography color="neutral">Aún no hay registros.</Typography>
              )}
            </CardContent>
          </Card>

          {/* ======= SERVICES ======= */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "md",
                      bgcolor: "primary.softBg",
                      color: "primary.solidColor",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}>
                    <CategoryRoundedIcon />
                  </Box>
                  <Typography level="title-md">Servicios</Typography>
                </Stack>
                <Button
                  startDecorator={<AddRoundedIcon />}
                  onClick={onOpenNewService}
                  disabled={!canCreate}
                  variant={canCreate ? "solid" : "soft"}>
                  Nuevo servicio
                </Button>
              </Stack>

              <Divider sx={{ my: 1.25 }} />

              {groupedServices.length === 0 ? (
                <Typography color="neutral">
                  Sin servicios configurados.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {groupedServices.map(([group, items]) => (
                    <Sheet
                      key={group}
                      variant="soft"
                      sx={{
                        p: 1.25,
                        borderRadius: "md",
                        border: "1px solid",
                        borderColor: "neutral.outlinedBorder",
                      }}>
                      <Typography level="title-sm" sx={{ mb: 1 }}>
                        {group}
                      </Typography>

                      <Sheet variant="plain" sx={{ overflowX: "auto" }}>
                        <Table
                          size="sm"
                          stickyHeader
                          hoverRow
                          sx={{ minWidth: 900 }}>
                          <thead>
                            <tr>
                              <th style={{ width: 220 }}>Servicio</th>
                              <th style={{ width: 160 }}>Estado</th>
                              <th>Mensaje</th>
                              <th style={{ width: 120 }}>Orden</th>
                              <th style={{ width: 200 }}>
                                Última actualización
                              </th>
                              <th style={{ width: 120, textAlign: "right" }}>
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((s) => (
                              <tr key={s.id}>
                                <td>
                                  <Typography
                                    level="body-sm"
                                    sx={{ fontWeight: 600 }}>
                                    {s.name}
                                  </Typography>
                                  {s.group_name ? (
                                    <Typography level="body-xs" color="neutral">
                                      {s.group_name}
                                    </Typography>
                                  ) : null}
                                </td>
                                <td>
                                  <ServiceStatusChip status={s.status} />
                                </td>
                                <td>
                                  <Typography level="body-sm">
                                    {s.message || "—"}
                                  </Typography>
                                </td>
                                <td>{s.display_order ?? 0}</td>
                                <td>{formatDt(s.lastUpdated)}</td>
                                <td style={{ textAlign: "right" }}>
                                  <Tooltip
                                    title={canEdit ? "Editar" : "Sin permiso"}
                                    variant="soft">
                                    <span>
                                      <IconButton
                                        size="sm"
                                        onClick={() => onEditService(s)}
                                        disabled={!canEdit}
                                        aria-disabled={!canEdit}
                                        variant={canEdit ? "soft" : "plain"}
                                        color={canEdit ? "primary" : "neutral"}>
                                        <EditRoundedIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Sheet>
                    </Sheet>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Modales */}
      <OverallModal
        open={openOverall}
        onClose={() => setOpenOverall(false)}
        onSave={saveOverall}
        initial={overall}
      />
      <ServiceModal
        open={openService}
        onClose={() => setOpenService(false)}
        onSave={saveService}
        initial={editingService}
      />
    </Box>
  );
}
