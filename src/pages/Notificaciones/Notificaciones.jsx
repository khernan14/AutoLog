// src/pages/Notificaciones/Notificaciones.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Sheet,
  Card,
  Typography,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button,
  IconButton,
  Table,
  Chip,
  Input,
  Select,
  Option,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
  Switch,
  Checkbox,
  Skeleton,
} from "@mui/joy";

import {
  Bell,
  Settings,
  Mail,
  TriangleAlert,
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Link2,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Filter,
  Search as SearchIcon,
  Save as SaveIcon,
  Check,
  Download,
  XCircle,
  EyeOff,
  Timer,
  Copy,
  Braces,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";

// === Services ===
import {
  listEventos,
  createEvento,
  updateEvento,
  deleteEvento,
  setEventoEstado,
  getEventoGrupos,
  setEventoGrupos,
} from "../../services/NotificacionesEventosService";

import {
  listGrupos,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  setGrupoEstado,
  listMiembros,
  addMiembros,
  removeMiembro,
  getCanales,
  saveCanales,
  listUsuarios,
} from "../../services/NotificacionesGruposService";

import {
  listPlantillas as apiListPlantillas,
  createPlantilla as apiCreatePlantilla,
  updatePlantilla as apiUpdatePlantilla,
  deletePlantilla as apiDeletePlantilla,
  publishPlantilla as apiPublishPlantilla,
  previewPlantilla as apiPreviewPlantilla,
  testPlantilla as apiTestPlantilla,
  setPlantillaEstado,
} from "../../services/NotificacionesPlantillasService";

// ====== Helpers ======
const SEV_OPTIONS = ["low", "medium", "high", "critical"];

function SeveridadChip({ value }) {
  const map = {
    high: { color: "danger", label: "Alta" },
    medium: { color: "warning", label: "Media" },
    low: { color: "neutral", label: "Baja" },
  };
  const { color, label } = map[value] || map.low;
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      sx={{ textTransform: "capitalize" }}>
      {label}
    </Chip>
  );
}

function EstadoPill({ estado }) {
  const m = {
    delivered: { color: "success", text: "delivered" },
    sent: { color: "primary", text: "sent" },
    failed: { color: "danger", text: "failed" },
    suppressed: { color: "warning", text: "suppressed" },
    pending: { color: "neutral", text: "pending" },
    queued: { color: "neutral", text: "queued" },
  };
  const x = m[estado] || m.pending;
  return (
    <Chip size="sm" variant="soft" color={x.color}>
      {x.text}
    </Chip>
  );
}

function EstadoChip({ activo }) {
  return (
    <Chip size="sm" variant="soft" color={activo ? "success" : "neutral"}>
      {activo ? "Activo" : "Inactivo"}
    </Chip>
  );
}

// ====== Top Bar ======
function TopBar() {
  return (
    <Sheet
      variant="outlined"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 9,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.surface",
        backdropFilter: "blur(4px)",
        borderRadius: "12px",
        marginRight: "10rem",
        marginLeft: "10rem",
        padding: "0 1rem",
      }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 12,
              bgcolor: "primary.solidBg",
              color: "primary.solidColor",
              display: "grid",
              placeItems: "center",
            }}>
            <Bell size={16} />
          </Box>
          <Typography level="title-md">Notificaciones</Typography>
          <Typography level="body-sm" sx={{ color: "neutral.500" }}>
            · Panel Administrativo
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ color: "neutral.600" }}>
          <Settings size={18} />
        </Stack>
      </Box>
    </Sheet>
  );
}

function DashboardView() {
  // Si todavía no tienes datos, deja "—" y mostramos skeletons bonitos.
  const KPIs = [
    {
      key: "hoy",
      label: "Notificaciones hoy",
      value: "—",
      icon: <Bell size={16} />,
    },
    {
      key: "enviadas",
      label: "Enviadas",
      value: "—",
      icon: <Send size={16} />,
    },
    {
      key: "fallidas",
      label: "Fallidas",
      value: "—",
      icon: <XCircle size={16} />,
    },
    {
      key: "suprimidas",
      label: "Suprimidas",
      value: "—",
      icon: <EyeOff size={16} />,
    },
    {
      key: "tiempo",
      label: "T. promedio (s)",
      value: "—",
      icon: <Timer size={16} />,
    },
  ];

  const isEmpty = KPIs.every((k) => k.value === "—");

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: { xs: 1.5, sm: 2 },
      }}>
      {/* Header visual del bloque */}
      <Sheet
        variant="soft"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 16,
          bgcolor: "background.level1",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.06))",
        }}>
        {/* KPIs */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
            gap: 1.5,
          }}>
          {KPIs.map((k, idx) => (
            <Card
              key={k.key}
              variant="soft"
              color={
                idx === 0
                  ? "primary"
                  : idx === 1
                  ? "success"
                  : idx === 2
                  ? "danger"
                  : idx === 3
                  ? "warning"
                  : "neutral"
              }
              sx={{
                borderRadius: 16,
                boxShadow: "sm",
                overflow: "hidden",
                position: "relative",
                p: 1.25,
                // franja superior de color (look moderno)
                "&::before": {
                  content: '""',
                  position: "absolute",
                  insetInline: 0,
                  top: 0,
                  height: 3,
                  backgroundColor: "var(--joy-palette-solidBg)",
                },
              }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between">
                <Typography level="body-xs" color="neutral">
                  {k.label}
                </Typography>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "var(--joy-palette-softBg)",
                    color: "var(--joy-palette-solidBg)",
                  }}>
                  {k.icon}
                </Box>
              </Stack>
              <Typography level="h3" sx={{ mt: 0.5 }}>
                {k.value === "—" ? (
                  <Skeleton variant="text" width={40} />
                ) : (
                  k.value
                )}
              </Typography>
            </Card>
          ))}
        </Box>
      </Sheet>

      {/* Tabla de últimas notificaciones */}
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 1.25 }}>
          <Typography
            level="title-md"
            component="h3"
            sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <TriangleAlert size={16} /> Últimas notificaciones
          </Typography>
          <Stack direction="row" gap={1}>
            <Tooltip title="Filtrar">
              <IconButton size="sm" variant="outlined">
                <Filter size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar CSV">
              <IconButton size="sm" variant="outlined">
                <Download size={14} />
              </IconButton>
            </Tooltip>
            <Button size="sm" variant="soft">
              Ver historial
            </Button>
          </Stack>
        </Stack>
        <Divider />

        <Table
          size="sm"
          stickyHeader
          borderAxis="bothBetween"
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
          }}>
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Evento</th>
              <th style={{ width: 120 }}>Severidad</th>
              <th style={{ width: 120 }}>Estado</th>
              <th style={{ width: 180 }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {/* Estado vacío bonito mientras no hay datos */}
            <tr>
              <td colSpan={5}>
                <Sheet
                  variant="soft"
                  sx={{
                    my: 2,
                    mx: 1.5,
                    p: 3,
                    borderRadius: 12,
                    textAlign: "center",
                    color: "neutral.600",
                  }}>
                  <Box
                    sx={{
                      display: "inline-grid",
                      placeItems: "center",
                      gap: 1,
                    }}>
                    <TriangleAlert size={18} />
                    <Typography level="body-sm">
                      Conecta <code>/api/notificaciones</code> para ver
                      registros en tiempo real.
                    </Typography>
                  </Box>
                </Sheet>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Box>
  );
}

// ====== Modal: Crear/Editar Evento ======
function EventoModal({ open, onClose, initial, onSaved }) {
  const { showToast } = useToast();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    clave: "",
    nombre: "",
    descripcion: "",
    severidad_def: "medium",
    activo: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        clave: initial?.clave || "",
        nombre: initial?.nombre || "",
        descripcion: initial?.descripcion || "",
        severidad_def: initial?.severidad_def || "medium",
        activo: !!initial?.activo,
      });
    }
  }, [open, initial]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.clave.trim() || !form.nombre.trim()) {
      showToast("Clave y nombre son requeridos", "warning");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateEvento(initial.id, form);
        showToast("Evento actualizado", "success");
      } else {
        await createEvento(form);
        showToast("Evento creado", "success");
      }
      onSaved?.();
      onClose();
    } catch (err) {
      showToast(err.message || "Error al guardar evento", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog component="form" onSubmit={onSubmit} sx={{ width: 520 }}>
        <Typography level="title-lg">
          {isEdit ? "Editar evento" : "Nuevo evento"}
        </Typography>
        <Divider />
        <Stack spacing={1.25} mt={1}>
          <FormControl required>
            <FormLabel>Clave</FormLabel>
            <Input
              value={form.clave}
              onChange={(e) =>
                setForm({ ...form, clave: e.target.value.toUpperCase() })
              }
              placeholder="Ejem: VEHICULO_SALIDA"
              disabled={isEdit}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre legible"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              minRows={2}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </FormControl>
          <Stack direction="row" spacing={1.25}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Severidad por defecto</FormLabel>
              <Select
                value={form.severidad_def}
                onChange={(_, v) => setForm({ ...form, severidad_def: v })}>
                {SEV_OPTIONS.map((s) => (
                  <Option key={s} value={s} className="capitalize">
                    {s}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl orientation="horizontal" sx={{ alignItems: "center" }}>
              <FormLabel>Activo</FormLabel>
              <Switch
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
            </FormControl>
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Guardar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

// ====== Modal: Asignar grupos a evento ======
function EventoGruposModal({ open, onClose, evento, onSaved }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [checked, setChecked] = useState(new Set()); // ids
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const s = (search || "").toLowerCase();
    return todosGrupos.filter((g) => g.nombre.toLowerCase().includes(s));
  }, [todosGrupos, search]);

  useEffect(() => {
    if (!open || !evento?.id) return;
    (async () => {
      setLoading(true);
      try {
        const [todos, asignados] = await Promise.all([
          listGrupos({ limit: 500 }),
          getEventoGrupos(evento.id),
        ]);
        const assignedIds = new Set(
          (asignados || [])
            .filter((x) => !!x.asignacion_activa)
            .map((x) => x.id)
        );
        setTodosGrupos(todos?.rows || []);
        setChecked(assignedIds);
      } catch (e) {
        showToast("No se pudieron cargar grupos", "danger");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, evento?.id, showToast]);

  function toggle(id) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await setEventoGrupos(evento.id, [...checked]);
      showToast("Grupos asignados", "success");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e.message || "Error al guardar grupos", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog component="form" onSubmit={onSubmit} sx={{ width: 560 }}>
        <Typography level="title-lg">
          Asignar grupos — {evento?.clave}
        </Typography>
        <Divider />
        {loading ? (
          <Stack alignItems="center" p={2}>
            <CircularProgress />
            <Typography level="body-sm">Cargando grupos…</Typography>
          </Stack>
        ) : (
          <>
            <Stack direction="row" spacing={1} mb={1}>
              <Input
                startDecorator={<Filter size={14} />}
                placeholder="Buscar grupo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Chip size="sm" variant="soft">
                {visible.length} / {todosGrupos.length}
              </Chip>
            </Stack>
            <Sheet
              variant="soft"
              sx={{
                maxHeight: 320,
                overflow: "auto",
                p: 1,
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
              }}>
              {visible.map((g) => (
                <Stack
                  key={g.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 0.75,
                  }}>
                  <Stack spacing={0.3}>
                    <Typography level="body-sm" fontWeight={600}>
                      {g.nombre}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {g.descripcion || "—"}
                    </Typography>
                  </Stack>
                  <Checkbox
                    checked={checked.has(g.id)}
                    onChange={() => toggle(g.id)}
                  />
                </Stack>
              ))}
              {!visible.length && (
                <Typography level="body-sm" sx={{ p: 1 }}>
                  No hay grupos con ese filtro.
                </Typography>
              )}
            </Sheet>
          </>
        )}
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Guardar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

// ====== Vista: Eventos & ruteo ======
function RowSkeleton() {
  return (
    <tr>
      <td colSpan={6}>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5 }}>
          <Sheet variant="soft" sx={{ height: 10, borderRadius: 8, flex: 1 }} />
          <Sheet
            variant="soft"
            sx={{ height: 10, borderRadius: 8, width: 180 }}
          />
          <Sheet
            variant="soft"
            sx={{ height: 10, borderRadius: 8, width: 120 }}
          />
          <Sheet
            variant="soft"
            sx={{ height: 10, borderRadius: 8, width: 120 }}
          />
          <Sheet
            variant="soft"
            sx={{ height: 10, borderRadius: 8, width: 160 }}
          />
        </Stack>
      </td>
    </tr>
  );
}

function EventosView() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [activo, setActivo] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openGrupos, setOpenGrupos] = useState(false);
  const [eventoSel, setEventoSel] = useState(null);

  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return rows.filter(
      (r) =>
        (!search ||
          r.clave.toLowerCase().includes(s) ||
          (r.nombre || "").toLowerCase().includes(s)) &&
        (typeof activo === "undefined" || r.activo === (activo ? 1 : 0))
    );
  }, [rows, search, activo]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEventos({ limit: 200 });
      setRows(data.rows || []);
    } catch (e) {
      showToast("No se pudieron cargar eventos", "danger");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(id) {
    if (!window.confirm("¿Eliminar (soft) este evento?")) return;
    try {
      await deleteEvento(id);
      showToast("Evento eliminado (soft)", "success");
      load();
    } catch (e) {
      showToast(e.message || "Error al eliminar", "danger");
    }
  }

  async function onToggle(e) {
    const next = e.activo ? 0 : 1;
    try {
      await setEventoEstado(e.id, !!next);
      showToast(next ? "Evento activado" : "Evento desactivado", "success");
      load();
    } catch (err) {
      showToast(err.message || "No se pudo cambiar el estado", "danger");
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        {/* Toolbar */}
        <Sheet
          variant="soft"
          sx={{
            p: 1.25,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}>
          <Typography
            level="title-md"
            sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Link2 size={16} /> Eventos & ruteo
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Input
              placeholder="Buscar por clave o nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startDecorator={<Filter size={14} />}
              variant="soft"
              size="sm"
              sx={{ minWidth: { sm: 280 }, flex: { xs: 1, sm: "initial" } }}
            />

            <Select
              placeholder="Estado"
              value={typeof activo === "undefined" ? "" : activo ? "1" : "0"}
              onChange={(_, v) => setActivo(v === "" ? undefined : v === "1")}
              size="sm"
              variant="soft"
              sx={{ minWidth: 140 }}>
              <Option value="">Todos</Option>
              <Option value="1">Activos</Option>
              <Option value="0">Inactivos</Option>
            </Select>

            <IconButton
              size="sm"
              variant="outlined"
              onClick={load}
              title="Recargar">
              <RefreshCw size={14} />
            </IconButton>

            <Button
              size="sm"
              startDecorator={<Plus size={16} />}
              onClick={() => {
                setEditing(null);
                setOpenModal(true);
              }}>
              Nuevo evento
            </Button>
          </Stack>
        </Sheet>

        <Divider />

        {/* Tabla */}
        {loading ? (
          <Stack alignItems="center" p={3}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table
            size="sm"
            borderAxis="bothBetween"
            stickyHeader
            hoverRow
            stripe="odd"
            sx={{
              "--TableCell-headBackground":
                "var(--joy-palette-background-level1)",
              "& thead th": {
                fontWeight: 600,
                color: "text.secondary",
                whiteSpace: "nowrap",
              },
              "& tbody td": { verticalAlign: "middle" },
            }}>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Clave</th>
                <th>Nombre</th>
                <th style={{ width: 140 }}>Severidad</th>
                <th style={{ width: 120 }}>Estado</th>
                <th style={{ width: 160 }}>Grupos asignados</th>
                <th style={{ width: 260 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Typography
                      level="body-sm"
                      sx={{ fontFamily: "monospace" }}>
                      {e.clave}
                    </Typography>
                  </td>
                  <td>{e.nombre}</td>
                  <td>
                    <SeveridadChip value={e.severidad_def} />
                  </td>
                  <td>
                    <EstadoChip activo={!!e.activo} />
                  </td>
                  <td>
                    {typeof e.grupos_asignados === "number" ? (
                      <Chip size="sm" variant="soft" color="neutral">
                        {e.grupos_asignados} grupo
                        {e.grupos_asignados === 1 ? "" : "s"}
                      </Chip>
                    ) : (
                      e.grupos_asignados
                    )}
                  </td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Editar">
                        <span>
                          <IconButton
                            size="sm"
                            onClick={() => {
                              setEditing(e);
                              setOpenModal(true);
                            }}>
                            <Pencil size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={e.activo ? "Desactivar" : "Activar"}>
                        <span>
                          <IconButton
                            size="sm"
                            color={e.activo ? "danger" : "success"}
                            onClick={() => onToggle(e)}>
                            {e.activo ? (
                              <ToggleLeft size={16} />
                            ) : (
                              <ToggleRight size={16} />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Configurar grupos">
                        <span>
                          <IconButton
                            size="sm"
                            onClick={() => {
                              setEventoSel(e);
                              setOpenGrupos(true);
                            }}>
                            <Users size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Eliminar (soft)">
                        <span>
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => onDelete(e.id)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={6}>
                    <Sheet
                      variant="soft"
                      sx={{
                        my: 2,
                        mx: 1.5,
                        p: 3,
                        borderRadius: 12,
                        textAlign: "center",
                        color: "neutral.600",
                      }}>
                      No hay eventos con ese filtro.
                    </Sheet>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modales */}
      <EventoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initial={editing}
        onSaved={load}
      />
      <EventoGruposModal
        open={openGrupos}
        onClose={() => setOpenGrupos(false)}
        evento={eventoSel}
        onSaved={load}
      />
    </Box>
  );
}

// ====== Vista: Plantillas (con metadata + restaurar) ======
function PlantillasView() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  // filtros
  const [filters, setFilters] = useState({
    evento: "",
    canal: "email",
    locale: "es",
    activo: "", // ''(default)=solo activas ; true=todas ; false=inactivas
  });

  // plantilla seleccionada + draft
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ asunto: "", cuerpo: "" });
  const [metadataStr, setMetadataStr] = useState("{}");

  // preview
  const [payloadStr, setPayloadStr] = useState(
    JSON.stringify(
      {
        empleado_nombre: "Ana Pérez",
        vehiculo_placa: "HAA-1234",
        fecha: "2025-09-27 10:30",
        detalle: "Falla de frenos",
        link_detalle: "https://app/vehiculos/123",
      },
      null,
      2
    )
  );
  const [rendered, setRendered] = useState({ subject: "", html: "" });
  const [useServerPreview, setUseServerPreview] = useState(false);
  const [testing, setTesting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  // validación JSON en vivo
  const [metadataError, setMetadataError] = useState("");
  const [payloadError, setPayloadError] = useState("");

  const safeParse = (text) => {
    try {
      return [JSON.parse(text || "{}"), ""];
    } catch (e) {
      return [null, e.message || "JSON inválido"];
    }
  };

  useEffect(() => {
    const [, mErr] = safeParse(metadataStr);
    setMetadataError(mErr);
  }, [metadataStr]);
  useEffect(() => {
    const [, pErr] = safeParse(payloadStr);
    setPayloadError(pErr);
  }, [payloadStr]);

  const extractPlaceholders = useCallback((...strings) => {
    const set = new Set();
    strings.forEach((s = "") => {
      (s.match(/\{\{\s*[\w.]+\s*\}\}/g) || []).forEach((m) => {
        set.add(m.replace(/\{\{|\}\}/g, "").trim());
      });
    });
    return Array.from(set);
  }, []);

  const placeholders = useMemo(
    () =>
      extractPlaceholders(
        form.asunto,
        form.cuerpo,
        editing?.asunto,
        editing?.cuerpo
      ),
    [extractPlaceholders, form.asunto, form.cuerpo, editing]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiListPlantillas({ ...filters, page: 1, limit: 200 });
      setRows(data.rows || []);
      if (!editing && data.rows?.length) {
        const p = data.rows[0];
        setEditing(p);
        setForm({ asunto: p.asunto || "", cuerpo: p.cuerpo || "" });
        setMetadataStr(p.metadata ? JSON.stringify(p.metadata, null, 2) : "{}");
      }
    } catch (e) {
      showToast("No se pudieron cargar plantillas", "danger");
    } finally {
      setLoading(false);
    }
  }, [filters, editing, showToast]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.evento, filters.canal, filters.locale, filters.activo]);

  const renderLocalWithMetadata = useCallback(
    (subjectTpl, bodyTpl, payload, metadata) => {
      const getDeep = (obj, path) =>
        path
          .split(".")
          .reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : ""), obj);
      const render = (tpl = "") =>
        String(tpl).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
          const v = getDeep(payload, key);
          return v == null ? "" : String(v);
        });
      const prefix = metadata?.subject_prefix || "";
      const subject = prefix + render(subjectTpl || "");
      const html = render(bodyTpl || "");
      return { subject, html };
    },
    []
  );

  async function onPreview() {
    try {
      const [payloadUser, pErr] = safeParse(payloadStr);
      if (pErr) throw new Error("payload inválido");
      let metadata = {};
      if (metadataStr && metadataStr.trim()) {
        const [m, mErr] = safeParse(metadataStr);
        if (mErr) throw new Error("metadata inválida");
        metadata = m || {};
      }
      const payload = {
        ...(metadata?.default_payload || {}),
        ...(payloadUser || {}),
      };

      if (!useServerPreview) {
        const { subject, html } = renderLocalWithMetadata(
          form.asunto || editing?.asunto,
          form.cuerpo || editing?.cuerpo,
          payload,
          metadata
        );
        setRendered({ subject, html });
        return;
      }

      const evento_clave =
        editing?.evento || filters.evento || "VEHICULO_SALIDA";
      const resp = await apiPreviewPlantilla({
        evento_clave,
        canal: filters.canal || "email",
        locale: filters.locale || "es",
        payload,
      });
      setRendered({ subject: resp.subject, html: resp.html });
    } catch (e) {
      setRendered({ subject: "", html: "(payload o metadata inválidos)" });
    }
  }

  async function onSave() {
    if (!editing) return;
    setSaving(true);
    try {
      let metadata = null;
      if (metadataStr && metadataStr.trim()) {
        const [m, mErr] = safeParse(metadataStr);
        if (mErr) {
          showToast("Metadata inválida", "danger");
          setSaving(false);
          return;
        }
        metadata = m;
      }
      await apiUpdatePlantilla(editing.id, {
        asunto: form.asunto,
        cuerpo: form.cuerpo,
        metadata,
      });
      await load();
      showToast("Plantilla guardada", "success");
    } catch {
      // noop visual
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!editing) return;
    setPublishing(true);
    try {
      await apiPublishPlantilla(editing.id);
      await load();
      showToast("Publicada como default", "success");
    } finally {
      setPublishing(false);
    }
  }

  async function onCreate() {
    const evento = window.prompt("Clave del evento (ej: VEHICULO_SALIDA):");
    if (!evento) return;
    try {
      const resp = await apiCreatePlantilla({
        evento_clave: evento.trim().toUpperCase(),
        canal: filters.canal || "email",
        locale: filters.locale || "es",
        asunto: "Nuevo asunto",
        cuerpo: "Hola {{empleado_nombre}}",
        metadata: {},
      });
      setEditing(resp);
      setForm({ asunto: resp.asunto || "", cuerpo: resp.cuerpo || "" });
      setMetadataStr(
        resp.metadata ? JSON.stringify(resp.metadata, null, 2) : "{}"
      );
      load();
    } catch {
      // noop
    }
  }

  async function onDelete(id) {
    if (!window.confirm("¿Enviar a papelera esta plantilla (inactivar)?"))
      return;
    try {
      await apiDeletePlantilla(id); // soft => activo=0
      await load();
    } catch {
      // noop
    }
  }

  async function onRestore(id) {
    try {
      await setPlantillaEstado(id, true);
      await load();
    } catch {
      // noop
    }
  }

  const [copied, setCopied] = useState({ subject: false, html: false });
  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied((c) => ({ ...c, [key]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 1200);
    } catch {}
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        {/* Sidebar list */}
        <Card
          variant="outlined"
          sx={{
            width: { xs: "100%", md: 380 },
            flexShrink: 0,
            borderRadius: 16,
            boxShadow: "sm",
          }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}>
            <Typography
              level="title-md"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <FileText size={16} /> Plantillas
            </Typography>
            <Button
              size="sm"
              onClick={onCreate}
              startDecorator={<Plus size={14} />}>
              Nueva
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Input
              placeholder="Evento (clave)…"
              value={filters.evento}
              onChange={(e) =>
                setFilters((f) => ({ ...f, evento: e.target.value }))
              }
              size="sm"
              variant="soft"
            />
            <Select
              value={filters.canal}
              onChange={(_, v) => setFilters((f) => ({ ...f, canal: v }))}
              size="sm"
              variant="soft">
              <Option value="email">email</Option>
            </Select>
            <Select
              value={filters.locale}
              onChange={(_, v) => setFilters((f) => ({ ...f, locale: v }))}
              size="sm"
              variant="soft">
              <Option value="es">es</Option>
              <Option value="en">en</Option>
            </Select>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Select
              placeholder="Estado"
              value={String(filters.activo)}
              onChange={(_, v) =>
                setFilters((f) => ({
                  ...f,
                  activo: v === "true" ? true : v === "false" ? false : "",
                }))
              }
              sx={{ minWidth: 160 }}
              size="sm"
              variant="soft">
              <Option value="">Activas (default)</Option>
              <Option value="true">Todas</Option>
              <Option value="false">Inactivas</Option>
            </Select>
          </Stack>

          <Sheet
            variant="soft"
            sx={{
              borderRadius: 12,
              border: "1px solid",
              borderColor: "divider",
              maxHeight: 420,
              overflow: "auto",
            }}>
            {loading ? (
              <Stack alignItems="center" p={2}>
                <CircularProgress />
              </Stack>
            ) : rows.length ? (
              rows.map((p) => (
                <Sheet
                  key={p.id}
                  variant={editing?.id === p.id ? "soft" : "plain"}
                  sx={{
                    px: 1,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "background.level2" },
                  }}
                  onClick={() => {
                    setEditing(p);
                    setForm({ asunto: p.asunto || "", cuerpo: p.cuerpo || "" });
                    setMetadataStr(
                      p.metadata ? JSON.stringify(p.metadata, null, 2) : "{}"
                    );
                    setRendered({ subject: "", html: "" });
                  }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {!p.activo && (
                      <Chip size="sm" variant="soft" color="neutral">
                        inactiva
                      </Chip>
                    )}
                    {p.es_default && (
                      <Chip size="sm" variant="soft" color="success">
                        default
                      </Chip>
                    )}
                    <Typography level="body-sm" fontWeight={600}>
                      {p.evento} · {p.canal} ({p.locale})
                    </Typography>
                  </Stack>
                  <Typography level="body-xs" color="neutral" sx={{ mt: 0.25 }}>
                    {p.asunto}
                  </Typography>
                </Sheet>
              ))
            ) : (
              <Typography level="body-sm" sx={{ p: 1 }}>
                No hay plantillas con ese filtro.
              </Typography>
            )}
          </Sheet>
        </Card>

        {/* Editor + preview */}
        <Card
          variant="outlined"
          sx={{ flex: 1, borderRadius: 16, boxShadow: "sm" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.25 }}>
            <Typography
              level="title-md"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Mail size={16} /> Editor de plantilla (email)
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="sm" variant="soft">
                Preview: {useServerPreview ? "Servidor" : "Local"}
              </Chip>
              <Switch
                checked={useServerPreview}
                onChange={(e) => setUseServerPreview(e.target.checked)}
              />
              <Button
                size="sm"
                variant="outlined"
                startDecorator={<RefreshCw size={14} />}
                onClick={onPreview}>
                Previsualizar
              </Button>
              {editing?.activo ? (
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  startDecorator={<Trash2 size={14} />}
                  onClick={() => onDelete(editing.id)}>
                  Eliminar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outlined"
                  color="success"
                  onClick={() => onRestore(editing.id)}>
                  Restaurar
                </Button>
              )}
              <Button size="sm" onClick={onSave} loading={saving}>
                Guardar
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1.25}>
            <FormControl>
              <FormLabel>Asunto</FormLabel>
              <Input
                value={form.asunto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, asunto: e.target.value }))
                }
                placeholder="Asunto del correo (acepta {{placeholders}})"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Cuerpo (HTML con {placeholders})</FormLabel>
              <Textarea
                minRows={10}
                value={form.cuerpo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cuerpo: e.target.value }))
                }
                placeholder="<p>Hola {{empleado_nombre}}, ...</p>"
              />
            </FormControl>

            {/* Variables detectadas */}
            {placeholders.length > 0 && (
              <Stack
                direction="row"
                gap={1}
                flexWrap="wrap"
                alignItems="center">
                <Chip size="sm" startDecorator={<Braces size={14} />}>
                  Variables detectadas
                </Chip>
                {placeholders.map((v) => (
                  <Chip
                    key={v}
                    size="sm"
                    variant="soft"
                    color="neutral"
                    sx={{
                      fontFamily: "var(--joy-fontFamily-code)",
                    }}>{`{{${v}}}`}</Chip>
                ))}
              </Stack>
            )}

            {/* ===== METADATA ===== */}
            <FormControl error={!!metadataError}>
              <FormLabel>Metadata (JSON)</FormLabel>
              <Textarea
                minRows={8}
                value={metadataStr}
                onChange={(e) => setMetadataStr(e.target.value)}
                slotProps={{
                  textarea: {
                    style: { fontFamily: "var(--joy-fontFamily-code)" },
                  },
                }}
                placeholder={`{\n  "default_payload": { "empresa": "Tecnasa" },\n  "subject_prefix": "[FLOTA] "\n}`}
              />
              {metadataError ? (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  {metadataError}
                </Typography>
              ) : (
                <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                  Usa JSON válido. Campos comunes: <code>default_payload</code>,{" "}
                  <code>subject_prefix</code>.
                </Typography>
              )}
            </FormControl>

            <Divider />

            <Typography level="title-sm">Preview rápido</Typography>
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: 12,
                p: 2,
                bgcolor: "background.body",
                overflow: "auto",
                maxHeight: 360,
              }}>
              {rendered.subject && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}>
                  <Stack spacing={0.25}>
                    <Typography level="body-xs" color="neutral">
                      Asunto
                    </Typography>
                    <Typography level="body-sm">{rendered.subject}</Typography>
                  </Stack>
                  <Tooltip title="Copiar asunto">
                    <IconButton
                      size="sm"
                      variant="outlined"
                      onClick={() =>
                        copyToClipboard(rendered.subject, "subject")
                      }>
                      {copied.subject ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              <Typography level="body-xs" color="neutral">
                Cuerpo
              </Typography>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 10,
                    p: 1.5,
                    bgcolor: "#fff",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: rendered.html || "(sin preview aún)",
                  }}
                />
                <Tooltip title="Copiar HTML">
                  <IconButton
                    size="sm"
                    variant="outlined"
                    onClick={() => copyToClipboard(rendered.html, "html")}
                    sx={{ position: "absolute", top: 8, right: 8 }}>
                    {copied.html ? <Check size={14} /> : <Copy size={14} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Sheet>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              sx={{ mt: 1 }}>
              <Card variant="soft" sx={{ flex: 1 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Payload de prueba (JSON)
                </Typography>
                <FormControl error={!!payloadError}>
                  <Textarea
                    minRows={10}
                    value={payloadStr}
                    onChange={(e) => setPayloadStr(e.target.value)}
                    slotProps={{
                      textarea: {
                        style: { fontFamily: "var(--joy-fontFamily-code)" },
                      },
                    }}
                  />
                  {payloadError && (
                    <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                      {payloadError}
                    </Typography>
                  )}
                </FormControl>
              </Card>

              <Card variant="soft" sx={{ width: { xs: "100%", md: 320 } }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Acciones
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="solid"
                    startDecorator={<Send size={14} />}
                    loading={testing}
                    onClick={async () => {
                      if (!editing) return;
                      const email = window.prompt("Enviar prueba a (correo):");
                      if (!email) return;
                      try {
                        setTesting(true);
                        const [payloadUser, pErr] = safeParse(payloadStr);
                        if (pErr) {
                          showToast("Payload inválido", "danger");
                          return;
                        }
                        await apiTestPlantilla(editing.id, {
                          to_email: email,
                          payload: payloadUser,
                        });
                        showToast("Prueba enviada", "success");
                      } finally {
                        setTesting(false);
                      }
                    }}>
                    Enviar prueba
                  </Button>
                  <Button
                    variant="outlined"
                    loading={publishing}
                    onClick={onPublish}
                    disabled={!editing}>
                    Publicar como default
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

// ====== Modal: Crear/Editar Grupo ======
function GrupoModal({ open, onClose, initial, onSaved }) {
  const { showToast } = useToast();
  const isEdit = !!initial?.id;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  useEffect(() => {
    if (open) {
      setForm({
        nombre: initial?.nombre || "",
        descripcion: initial?.descripcion || "",
        activo: initial?.activo !== 0,
      });
    }
  }, [open, initial]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      showToast("El nombre es requerido", "warning");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateGrupo(initial.id, form);
      } else {
        await createGrupo(form);
      }
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e.message || "Error al guardar grupo", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog component="form" onSubmit={onSubmit} sx={{ width: 520 }}>
        <Typography level="title-lg">
          {isEdit ? "Editar grupo" : "Nuevo grupo"}
        </Typography>
        <Divider />
        <Stack spacing={1.25} mt={1}>
          <FormControl required>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              minRows={2}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </FormControl>
          <FormControl orientation="horizontal" sx={{ alignItems: "center" }}>
            <FormLabel>Activo</FormLabel>
            <Switch
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
          </FormControl>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Guardar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

// ====== Vista: Grupos ======
function GruposView() {
  const { showToast } = useToast();
  const [searchingUsers, setSearchingUsers] = useState(false);

  // listados
  const [filtro, setFiltro] = useState({ q: "", activo: "" }); // ''=solo activos (default), true=todos, false=inactivos
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [sel, setSel] = useState(null); // grupo seleccionado (objeto)

  // detalles del grupo
  const [miembros, setMiembros] = useState([]);
  const [canales, setCanales] = useState([]); // [{canal, enabled/habilitado, min_severity/severidad_min}]
  const [savingGrupo, setSavingGrupo] = useState(false);

  // modal crear/editar grupo
  const [openGrupo, setOpenGrupo] = useState(false);
  const [editGrupo, setEditGrupo] = useState(null);
  const [formGrupo, setFormGrupo] = useState({ nombre: "", descripcion: "" });

  // modal miembros
  const [openMiembros, setOpenMiembros] = useState(false);
  const [buscaUser, setBuscaUser] = useState("");
  const [resultUsers, setResultUsers] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);

  // canales (solo email por ahora)
  const [emailCfg, setEmailCfg] = useState({
    enabled: false,
    min_severity: "low",
  });
  const [savingChannel, setSavingChannel] = useState(false);

  const loadGrupos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGrupos({
        q: filtro.q,
        activo: filtro.activo,
        page: 1,
        limit: 200,
      });
      setGrupos(data.rows || []);
      // autoselect
      if (!sel && data.rows?.length) {
        setSel(data.rows[0]);
      }
    } catch (e) {
      showToast("No se pudieron cargar grupos", "danger");
    } finally {
      setLoading(false);
    }
  }, [filtro, sel, showToast]);

  // carga inicial y al cambiar filtro
  useEffect(() => {
    loadGrupos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro.q, filtro.activo]);

  // cargar detalles (miembros/canales) al cambiar seleccionado
  useEffect(() => {
    if (!sel) return;
    (async () => {
      try {
        const [m, c] = await Promise.all([
          listMiembros(sel.id, { page: 1, limit: 200 }),
          getCanales(sel.id),
        ]);
        setMiembros(
          Array.isArray(m?.rows) ? m.rows : Array.isArray(m) ? m : []
        );
        setCanales(c || []);
        const email = (c || []).find((x) => x.canal === "email");
        setEmailCfg({
          enabled: !!email?.habilitado || !!email?.enabled,
          min_severity: email?.severidad_min || email?.min_severity || "low",
        });
      } catch (e) {
        showToast("No se pudo cargar detalle del grupo", "danger");
      }
    })();
  }, [sel, showToast]);

  // ---- handlers: grupos
  function abrirNuevoGrupo() {
    setEditGrupo(null);
    setFormGrupo({ nombre: "", descripcion: "" });
    setOpenGrupo(true);
  }
  function abrirEditarGrupo(g) {
    setEditGrupo(g);
    setFormGrupo({ nombre: g.nombre || "", descripcion: g.descripcion || "" });
    setOpenGrupo(true);
  }
  async function onSubmitGrupo(e) {
    e.preventDefault();
    setSavingGrupo(true);
    try {
      if (editGrupo) {
        await updateGrupo(editGrupo.id, formGrupo);
        showToast("Grupo actualizado", "success");
      } else {
        await createGrupo(formGrupo);
        showToast("Grupo creado", "success");
      }
      setOpenGrupo(false);
      await loadGrupos();
    } catch (e) {
      showToast(e.message || "Error al guardar grupo", "danger");
    } finally {
      setSavingGrupo(false);
    }
  }
  async function onEliminarGrupo(g) {
    if (!g) return;
    if (!window.confirm("¿Enviar a papelera este grupo (inactivar)?")) return;
    try {
      await deleteGrupo(g.id);
      showToast("Grupo inactivado", "success");
      await loadGrupos();
      setSel(null);
    } catch (e) {
      showToast(e.message || "No se pudo inactivar", "danger");
    }
  }
  async function onRestaurarGrupo(g) {
    try {
      await setGrupoEstado(g.id, true);
      showToast("Grupo restaurado", "success");
      await loadGrupos();
      setSel(g);
    } catch (e) {
      showToast(e.message || "No se pudo restaurar", "danger");
    }
  }

  // ---- handlers: miembros
  async function buscarUsuarios() {
    const q = (buscaUser || "").trim();
    if (q.length < 2) {
      setResultUsers([]);
      showToast("Escribe al menos 2 caracteres", "warning");
      return;
    }
    setSearchingUsers(true);
    try {
      const rs = await listUsuarios({ q, limit: 200 });
      const arr = Array.isArray(rs)
        ? rs
        : Array.isArray(rs?.rows)
        ? rs.rows
        : [];

      const norm = (s = "") =>
        s
          .toString()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      const nq = norm(q);

      const filtered = arr.filter((u) => {
        const nombre = norm(u.nombre);
        const email = norm(u.email);
        const user = norm(u.username);
        return nombre.includes(nq) || email.includes(nq) || user.includes(nq);
      });

      setResultUsers(filtered);
    } catch {
      setResultUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  }

  async function agregarMiembrosSeleccionados(ids) {
    if (!sel) return;
    setAddingMembers(true);
    try {
      await addMiembros(sel.id, ids);
      const m = await listMiembros(sel.id, { page: 1, limit: 200 });
      setMiembros(Array.isArray(m?.rows) ? m.rows : []);
      showToast("Miembros agregados", "success");
    } catch (e) {
      showToast(e.message || "No se pudieron agregar", "danger");
    } finally {
      setAddingMembers(false);
    }
  }

  async function quitarMiembro(u) {
    if (!sel) return;
    try {
      await removeMiembro(sel.id, u.id_usuario);
      setMiembros((prev) => prev.filter((x) => x.id_usuario !== u.id_usuario));
    } catch (e) {
      showToast(e.message || "No se pudo quitar", "danger");
    }
  }

  // ---- handlers: canales (email)
  async function guardarCanalEmail() {
    if (!sel) return;
    setSavingChannel(true);
    try {
      await saveCanales(sel.id, [
        {
          canal: "email",
          habilitado: emailCfg.enabled,
          severidad_min: emailCfg.min_severity,
        },
      ]);
      const c = await getCanales(sel.id);
      setCanales(c || []);
      showToast("Canal guardado", "success");
    } catch (e) {
      showToast(e.message || "No se pudo guardar", "danger");
    } finally {
      setSavingChannel(false);
    }
  }
  async function eliminarCanalEmail() {
    setEmailCfg({ enabled: false, min_severity: "low" });
    await guardarCanalEmail();
  }

  return (
    <Box className="grupos-view" sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        {/* ===== Sidebar: listado de grupos ===== */}
        <Card
          variant="outlined"
          sx={{
            width: { xs: "100%", md: 360 },
            flexShrink: 0,
            borderRadius: 16,
            boxShadow: "sm",
          }}>
          {/* Toolbar sidebar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}>
            <Typography
              level="title-md"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Users size={16} /> Grupos
            </Typography>
            <Button
              size="sm"
              startDecorator={<Plus size={14} />}
              onClick={abrirNuevoGrupo}>
              Nuevo
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Input
              placeholder="Buscar…"
              value={filtro.q}
              onChange={(e) => setFiltro((f) => ({ ...f, q: e.target.value }))}
              startDecorator={<SearchIcon size={14} />}
              size="sm"
              variant="soft"
            />
            <Select
              value={String(filtro.activo)}
              onChange={(_, v) =>
                setFiltro((f) => ({
                  ...f,
                  activo: v === "true" ? true : v === "false" ? false : "",
                }))
              }
              size="sm"
              variant="soft"
              sx={{ minWidth: 140 }}>
              <Option value="">Activos</Option>
              <Option value="true">Todos</Option>
              <Option value="false">Inactivos</Option>
            </Select>
            <IconButton
              size="sm"
              variant="outlined"
              onClick={loadGrupos}
              title="Recargar">
              <RefreshCw size={14} />
            </IconButton>
          </Stack>

          <Sheet
            variant="soft"
            sx={{
              borderRadius: 12,
              border: "1px solid",
              borderColor: "divider",
              maxHeight: 420,
              overflow: "auto",
            }}>
            {loading ? (
              <Stack alignItems="center" p={2}>
                <CircularProgress />
              </Stack>
            ) : grupos.length ? (
              grupos.map((g) => (
                <Sheet
                  key={g.id}
                  variant={sel?.id === g.id ? "soft" : "plain"}
                  sx={{
                    px: 1,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "background.level2" },
                  }}
                  onClick={() => setSel(g)}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {!g.activo && (
                      <Chip size="sm" variant="soft" color="neutral">
                        inactivo
                      </Chip>
                    )}
                    <Typography level="body-sm" fontWeight={600}>
                      {g.nombre}
                    </Typography>
                    {typeof g.cantidad_miembros === "number" && (
                      <Chip
                        size="sm"
                        variant="soft"
                        color="neutral"
                        sx={{ ml: "auto" }}>
                        {g.cantidad_miembros} miembros
                      </Chip>
                    )}
                  </Stack>
                  {g.descripcion ? (
                    <Typography level="body-xs" color="neutral">
                      {g.descripcion}
                    </Typography>
                  ) : null}
                </Sheet>
              ))
            ) : (
              <Typography level="body-sm" sx={{ p: 1 }}>
                No hay grupos con ese filtro.
              </Typography>
            )}
          </Sheet>
        </Card>

        {/* ===== Panel derecho: detalle del grupo ===== */}
        <Card
          variant="outlined"
          sx={{ flex: 1, borderRadius: 16, boxShadow: "sm" }}>
          {!sel ? (
            <Sheet sx={{ p: 3, textAlign: "center" }}>
              Selecciona un grupo…
            </Sheet>
          ) : (
            <Stack spacing={1.25}>
              {/* header acciones */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography level="title-md">{sel.nombre}</Typography>
                <Stack direction="row" spacing={1}>
                  {sel.activo ? (
                    <Button
                      size="sm"
                      variant="outlined"
                      color="danger"
                      startDecorator={<Trash2 size={14} />}
                      onClick={() => onEliminarGrupo(sel)}>
                      Eliminar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outlined"
                      color="success"
                      onClick={() => onRestaurarGrupo(sel)}>
                      Restaurar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="solid"
                    onClick={() => abrirEditarGrupo(sel)}>
                    Editar
                  </Button>
                </Stack>
              </Stack>

              <Divider />

              {/* Miembros */}
              <Typography level="title-sm">Miembros</Typography>
              <Sheet variant="soft" sx={{ p: 1.5, borderRadius: 12 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}>
                  <Typography level="body-sm" color="neutral">
                    {miembros.length} miembros
                  </Typography>
                  <Button
                    size="sm"
                    onClick={() => setOpenMiembros(true)}
                    startDecorator={<Plus size={14} />}>
                    Agregar miembros
                  </Button>
                </Stack>
                <Table size="sm" hoverRow>
                  <thead>
                    <tr>
                      <th style={{ width: 220 }}>Nombre</th>
                      <th>Email</th>
                      <th>Usuario</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(miembros) ? miembros : []).map((m) => (
                      <tr key={m.id_usuario}>
                        <td>{m.nombre}</td>
                        <td>{m.email}</td>
                        <td>{m.username}</td>
                        <td>
                          <Tooltip title="Quitar">
                            <IconButton
                              size="sm"
                              color="danger"
                              variant="soft"
                              onClick={() => quitarMiembro(m)}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}

                    {(!Array.isArray(miembros) || miembros.length === 0) && (
                      <tr>
                        <td colSpan={4}>
                          <Typography level="body-sm" color="neutral">
                            Sin miembros todavía.
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Sheet>

              {/* Canales */}
              <Typography level="title-sm" sx={{ mt: 1 }}>
                Canales
              </Typography>
              <Sheet variant="soft" sx={{ p: 1.5, borderRadius: 12 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ flexWrap: "wrap" }}>
                  <Chip size="sm" variant="soft" color="primary">
                    <Mail size={12} /> email
                  </Chip>
                  <Switch
                    checked={emailCfg.enabled}
                    onChange={(e) =>
                      setEmailCfg((c) => ({ ...c, enabled: e.target.checked }))
                    }
                  />
                  <Typography level="body-sm">Habilitado</Typography>
                  <Divider orientation="vertical" />
                  <Typography level="body-sm">Severidad mínima</Typography>
                  <Select
                    size="sm"
                    value={emailCfg.min_severity}
                    onChange={(_, v) =>
                      setEmailCfg((c) => ({ ...c, min_severity: v }))
                    }>
                    <Option value="low">low</Option>
                    <Option value="medium">medium</Option>
                    <Option value="high">high</Option>
                    <Option value="critical">critical</Option>
                  </Select>
                  <Button
                    size="sm"
                    variant="outlined"
                    startDecorator={<SaveIcon size={14} />}
                    loading={savingChannel}
                    onClick={guardarCanalEmail}>
                    Guardar
                  </Button>
                  {canales.find((x) => x.canal === "email") && (
                    <Button
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={eliminarCanalEmail}>
                      Eliminar
                    </Button>
                  )}
                </Stack>
              </Sheet>
            </Stack>
          )}
        </Card>
      </Stack>

      {/* ===== Modal Crear/Editar Grupo ===== */}
      <Modal open={openGrupo} onClose={() => setOpenGrupo(false)}>
        <ModalDialog
          component="form"
          onSubmit={onSubmitGrupo}
          sx={{ width: { xs: "100%", sm: 520 } }}>
          <Typography level="title-lg">
            {editGrupo ? "Editar grupo" : "Nuevo grupo"}
          </Typography>
          <Divider />
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <FormControl required>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={formGrupo.nombre}
                onChange={(e) =>
                  setFormGrupo((f) => ({ ...f, nombre: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                minRows={3}
                value={formGrupo.descripcion}
                onChange={(e) =>
                  setFormGrupo((f) => ({ ...f, descripcion: e.target.value }))
                }
              />
            </FormControl>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ mt: 2 }}>
            <Button variant="plain" onClick={() => setOpenGrupo(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={savingGrupo}>
              Guardar
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* ===== Modal Agregar Miembros ===== */}
      <Modal open={openMiembros} onClose={() => setOpenMiembros(false)}>
        <ModalDialog sx={{ width: { xs: "100%", sm: 680 } }}>
          <Typography level="title-lg">Agregar miembros al grupo</Typography>
          <Divider />
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Input
                placeholder="Buscar por nombre, email o usuario…"
                value={buscaUser}
                onChange={(e) => setBuscaUser(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    buscarUsuarios();
                  }
                }}
                startDecorator={<SearchIcon size={14} />}
              />

              <Button
                variant="outlined"
                startDecorator={<RefreshCw size={14} />}
                loading={searchingUsers}
                onClick={buscarUsuarios}>
                Buscar
              </Button>
            </Stack>

            <Sheet
              variant="soft"
              sx={{ borderRadius: 12, p: 1, maxHeight: 320, overflow: "auto" }}>
              <Table size="sm" hoverRow>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Usuario</th>
                    <th style={{ width: 110 }}>Agregar</th>
                  </tr>
                </thead>
                <tbody>
                  {(resultUsers || []).map((u) => {
                    const yaEsta = miembros.some(
                      (m) => m.id_usuario === u.id_usuario
                    );
                    return (
                      <tr key={u.id_usuario}>
                        <td>{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>{u.username}</td>
                        <td>
                          <Button
                            size="sm"
                            variant={yaEsta ? "soft" : "outlined"}
                            color={yaEsta ? "success" : "neutral"}
                            disabled={yaEsta}
                            startDecorator={yaEsta ? <Check size={14} /> : null}
                            onClick={() =>
                              agregarMiembrosSeleccionados([u.id_usuario])
                            }>
                            {yaEsta ? "Agregado" : "Agregar"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!resultUsers || resultUsers.length === 0) && (
                    <tr>
                      <td colSpan={4}>
                        <Typography level="body-sm" color="neutral">
                          Sin resultados. Escribe un criterio y pulsa Buscar.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Sheet>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="plain" onClick={() => setOpenMiembros(false)}>
                Cerrar
              </Button>
              <Button
                variant="solid"
                loading={addingMembers}
                onClick={() => setOpenMiembros(false)}>
                Listo
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default function Notificaciones() {
  const [active, setActive] = useState("dashboard");

  return (
    <Box>
      <TopBar />

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 2,
          pt: 2,
          borderRadius: "lg",
        }}>
        <Tabs
          value={active}
          onChange={(_, v) => setActive(v)}
          sx={{
            "--Tabs-gap": "12px",
            "--Tab-minHeight": "40px",
            "--Tab-radius": "999px", // control del redondeado global
            bgcolor: "Background.surface",
            borderRadius: "lg",
          }}>
          <TabList
            disableUnderline
            aria-label="Navegación de Notificaciones"
            variant="plain"
            size="md"
            sx={{
              mb: 2,
              p: 1,
              gap: 0.5,
              maxWidth: "100%",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              "--TabsIndicator-thickness": "0px", // sin subrayado
            }}>
            {/* estilo base tipo Tailwind mock: borde claro, fondo blanco; activo: indigo sólido */}
            <Tab
              value="dashboard"
              disableIndicator
              sx={{
                gap: 0.5,
                px: 1.25,
                py: 0.75,
                borderRadius: "12px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "#e2e8f0",
                bgcolor: "#ffffff",
                color: "#475569",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#ffffff" },
                '&[aria-selected="true"]': {
                  bgcolor: "#4f46e5",
                  color: "#ffffff",
                  borderColor: "#4f46e5",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.25)",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(79,70,229,0.35)",
                },
              }}>
              <LayoutDashboard size={16} /> Dashboard
            </Tab>

            <Tab
              value="eventos"
              disableIndicator
              sx={{
                gap: 0.5,
                px: 1.25,
                py: 0.75,
                borderRadius: "12px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "#e2e8f0",
                bgcolor: "#ffffff",
                color: "#475569",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#ffffff" },
                '&[aria-selected="true"]': {
                  bgcolor: "#4f46e5",
                  color: "#ffffff",
                  borderColor: "#4f46e5",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.25)",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(79,70,229,0.35)",
                },
              }}>
              <Link2 size={16} /> Eventos & ruteo
            </Tab>

            <Tab
              value="plantillas"
              disableIndicator
              sx={{
                gap: 0.5,
                px: 1.25,
                py: 0.75,
                borderRadius: "12px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "#e2e8f0",
                bgcolor: "#ffffff",
                color: "#475569",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#ffffff" },
                '&[aria-selected="true"]': {
                  bgcolor: "#4f46e5",
                  color: "#ffffff",
                  borderColor: "#4f46e5",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.25)",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(79,70,229,0.35)",
                },
              }}>
              <FileText size={16} /> Plantillas
            </Tab>

            <Tab
              value="grupos"
              disableIndicator
              sx={{
                gap: 0.5,
                px: 1.25,
                py: 0.75,
                borderRadius: "12px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "#e2e8f0",
                bgcolor: "#ffffff",
                color: "#475569",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#ffffff" },
                '&[aria-selected="true"]': {
                  bgcolor: "#4f46e5",
                  color: "#ffffff",
                  borderColor: "#4f46e5",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.25)",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(79,70,229,0.35)",
                },
              }}>
              <Users size={16} /> Grupos
            </Tab>
          </TabList>

          <TabPanel value="dashboard" sx={{ p: 0 }}>
            <DashboardView />
          </TabPanel>
          <TabPanel value="eventos" sx={{ p: 0 }}>
            <EventosView />
          </TabPanel>
          <TabPanel value="plantillas" sx={{ p: 0 }}>
            <PlantillasView />
          </TabPanel>
          <TabPanel value="grupos" sx={{ p: 0 }}>
            <GruposView />
          </TabPanel>
        </Tabs>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pb: 3 }}>
        <Typography level="body-xs" color="neutral">
          Admin · Notificaciones · Joy UI
        </Typography>
      </Box>
    </Box>
  );
}
