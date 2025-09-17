// src/pages/SoporteAdmin/ChangelogsAdminPage.jsx
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
  Switch,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/joy";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";

import { listChangelogs } from "../../services/help.api.js";
import {
  createChangelog,
  updateChangelog,
  deleteChangelog,
} from "../../services/helpAdmin.api.js";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StatusCard from "../../components/common/StatusCard";

/* ---------------- utils ---------------- */
const TYPE_OPTIONS = [
  { value: "Added", label: "Added" },
  { value: "Changed", label: "Changed" },
  { value: "Fixed", label: "Fixed" },
  { value: "Removed", label: "Removed" },
  { value: "Performance", label: "Performance" },
  { value: "Security", label: "Security" },
  { value: "Deprecated", label: "Deprecated" },
];

const AUDIENCE = [
  { value: "all", label: "Todos" },
  { value: "admins", label: "Admins" },
  { value: "customers", label: "Customers" },
  { value: "internal", label: "Internal" },
];

function slugify(s = "") {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 160);
}

// por robustez, aunque el backend ya devuelve boolean:
const asPinned = (v) => v === true || v === 1 || v === "1";

/* -------------- pager simple -------------- */
function SimplePager({ page, totalPages, onPage }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        size="sm"
        variant="plain"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}>
        Anterior
      </Button>
      <Typography level="body-sm">
        Página {page} / {Math.max(totalPages, 1)}
      </Typography>
      <Button
        size="sm"
        variant="plain"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}>
        Siguiente
      </Button>
    </Stack>
  );
}

/* -------------- form modal -------------- */
function ChangelogFormModal({ open, onClose, onSave, initial }) {
  const [date, setDate] = useState(
    initial?.date || new Date().toISOString().slice(0, 10)
  );
  // El backend espera exactamente uno de TYPE_OPTIONS
  const [type, setType] = useState(initial?.type || "Added");
  const [audience, setAudience] = useState(initial?.audience || "all");
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [pinned, setPinned] = useState(!!initial?.pinned);
  const [slug, setSlug] = useState(initial?.slug || "");
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    setDate(initial?.date || new Date().toISOString().slice(0, 10));
    setType(initial?.type || "Added");
    setAudience(initial?.audience || "all");
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setPinned(!!initial?.pinned);
    setSlug(initial?.slug || "");
    setSaving(false);
  }, [open, initial]);

  const submit = async () => {
    if (!title.trim()) {
      showToast("El título es obligatorio", "warning");
      return;
    }
    if (!date) {
      showToast("La fecha es obligatoria", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date, // YYYY-MM-DD
        type, // "Added" | ...
        audience, // "all" | ...
        title: title.trim(),
        description: description?.trim() || null,
        pinned: pinned ? 1 : 0, // el backend acepta 0/1 o boolean
        slug: slug.trim() || slugify(title),
      };
      await onSave(payload);
      onClose?.();
    } catch (e) {
      showToast(e?.message || "No se pudo guardar", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 720, maxWidth: "96vw" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">
            {initial ? "Editar novedad" : "Nueva novedad"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.25}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Fecha</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
              <FormLabel>Tipo</FormLabel>
              <Select value={type} onChange={(_, v) => setType(v)}>
                {TYPE_OPTIONS.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
              <FormLabel>Audiencia</FormLabel>
              <Select value={audience} onChange={(_, v) => setAudience(v)}>
                {AUDIENCE.map((a) => (
                  <Option key={a.value} value={a.value}>
                    {a.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <FormControl required>
            <FormLabel>Título</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Nuevo dashboard de reportes"
              slotProps={{ input: { maxLength: 160 } }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Descripción (opcional)</FormLabel>
            <Textarea
              minRows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumen de la novedad, links, notas, etc."
            />
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ width: { xs: "100%", sm: 200 } }}>
              <FormLabel>Fijado</FormLabel>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={!!pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <Chip
                  size="sm"
                  variant="soft"
                  startDecorator={<PushPinRoundedIcon fontSize="sm" />}>
                  {pinned ? "Fijado" : "No fijado"}
                </Chip>
              </Stack>
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Slug (opcional — se genera del título)</FormLabel>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nuevo-dashboard-reportes"
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

/* -------------- main -------------- */
export default function ChangelogsAdminPage() {
  const { hasPermiso, userData, checkingSession } = useAuth();
  const { showToast } = useToast();

  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso?.(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("help_manage");
  const canCreate = can("help_manage");
  const canEdit = can("help_manage");
  const canDelete = can("help_manage");

  // filtros
  const [q, setQ] = useState("");
  const [type, setType] = useState("all"); // "all" | Allowed types
  const [audience, setAudience] = useState("all");
  const [pinned, setPinned] = useState("all"); // "all" | "1" | "0"

  // paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // data
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // ui state
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // modal
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = useCallback(async () => {
    if (checkingSession) return;

    if (!canView) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      setFetchError(null);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const res = await listChangelogs({
        q: q || undefined,
        type: type === "all" ? undefined : type,
        audience: audience === "all" ? undefined : audience,
        pinned: pinned === "all" ? undefined : pinned,
        page,
        limit,
        _ts: Date.now(), // evita caché del público
      });
      const items = res?.items || [];
      setRows(items);
      setTotal(Number(res?.total || items.length));
    } catch (e) {
      const msg = e?.message || "No se pudieron cargar las novedades";
      setFetchError(msg);
      setRows([]);
      setTotal(0);
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  }, [
    checkingSession,
    canView,
    q,
    type,
    audience,
    pinned,
    page,
    limit,
    showToast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit) || 1;

  const onCreate = () => {
    if (!canCreate) {
      showToast("No tienes permiso para crear novedades", "warning");
      return;
    }
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (row) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar", "warning");
      return;
    }
    setEditing(row);
    setOpenForm(true);
  };

  const onDeleteRow = async (row) => {
    if (!canDelete) {
      showToast("No tienes permiso para eliminar", "warning");
      return;
    }
    if (!confirm(`¿Eliminar la novedad "${row.title}"?`)) return;
    try {
      await deleteChangelog(row.id);
      showToast("Eliminado", "success");
      fetchData();
    } catch (e) {
      showToast(e?.message || "No se pudo eliminar", "danger");
    }
  };

  const onTogglePinned = async (row) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar", "warning");
      return;
    }
    try {
      const next = asPinned(row.pinned) ? 0 : 1;
      await updateChangelog(row.id, { pinned: next });
      // Optimista + normaliza
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, pinned: !!next } : r))
      );
      // sincroniza contra backend (evita caché)
      fetchData();
    } catch (e) {
      showToast(e?.message || "No se pudo actualizar", "danger");
    }
  };

  const onSaveForm = async (payload) => {
    if (!canEdit && !canCreate) throw new Error("Sin permiso");
    if (editing) {
      await updateChangelog(editing.id, payload); // payload.type ya es Allowed
      showToast("Actualizado", "success");
    } else {
      await createChangelog(payload);
      showToast("Creado", "success");
      setPage(1);
    }
    fetchData();
  };

  // ===== View state =====
  const isNetworkErr = /conexión|failed to fetch|network/i.test(
    fetchError || ""
  );
  const viewState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : fetchError
    ? "error"
    : loading
    ? "loading"
    : rows.length === 0
    ? "empty"
    : "data";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h4" mb={1}>
        Administración de Novedades (Changelogs)
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: 2 }}>
          {/* filtros */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}>
            <Input
              placeholder="Buscar (título o descripción)…"
              startDecorator={<SearchRoundedIcon />}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              sx={{ flex: 1, minWidth: 220 }}
              disabled={viewState !== "data" && viewState !== "empty"}
            />

            <Select
              value={type}
              onChange={(_, v) => {
                setType(v);
                setPage(1);
              }}
              sx={{ width: 200 }}
              disabled={viewState !== "data" && viewState !== "empty"}>
              <Option value="all">Tipo (todos)</Option>
              {TYPE_OPTIONS.map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>

            <Select
              value={audience}
              onChange={(_, v) => {
                setAudience(v);
                setPage(1);
              }}
              sx={{ width: 200 }}
              disabled={viewState !== "data" && viewState !== "empty"}>
              <Option value="all">Audiencia (todas)</Option>
              {AUDIENCE.map((a) => (
                <Option key={a.value} value={a.value}>
                  {a.label}
                </Option>
              ))}
            </Select>

            <Select
              value={pinned}
              onChange={(_, v) => {
                setPinned(v);
                setPage(1);
              }}
              sx={{ width: 200 }}
              disabled={viewState !== "data" && viewState !== "empty"}>
              <Option value="all">Fijado (todos)</Option>
              <Option value="1">Solo fijados</Option>
              <Option value="0">No fijados</Option>
            </Select>

            <Select
              value={String(limit)}
              onChange={(_, v) => {
                setLimit(Number(v));
                setPage(1);
              }}
              sx={{ width: 140 }}
              disabled={viewState !== "data" && viewState !== "empty"}>
              <Option value="10">10 / pág</Option>
              <Option value="20">20 / pág</Option>
              <Option value="50">50 / pág</Option>
            </Select>

            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <SimplePager
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
              <Tooltip
                title={canCreate ? "Crear novedad" : "Sin permiso"}
                variant="solid"
                placement="bottom-end">
                <span>
                  <Button
                    startDecorator={<AddRoundedIcon />}
                    onClick={onCreate}
                    disabled={!canCreate}
                    aria-disabled={!canCreate}
                    variant={canCreate ? "solid" : "soft"}
                    color={canCreate ? "primary" : "neutral"}>
                    Nueva
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Estados */}
          {viewState === "checking" && (
            <StatusCard
              title="Verificando sesión…"
              description={<CircularProgress size="sm" />}
            />
          )}

          {viewState === "no-permission" && (
            <StatusCard
              color="danger"
              title="Sin permisos para administrar novedades"
              description="Consulta con un administrador para obtener acceso."
            />
          )}

          {viewState === "error" && (
            <StatusCard
              color={isNetworkErr ? "warning" : "danger"}
              icon={
                isNetworkErr ? (
                  <WifiOffRoundedIcon />
                ) : (
                  <ErrorOutlineRoundedIcon />
                )
              }
              title={
                isNetworkErr
                  ? "Problema de conexión"
                  : "No se pudo cargar la lista"
              }
              description={fetchError}
              actions={
                <Button
                  startDecorator={<RestartAltRoundedIcon />}
                  onClick={fetchData}
                  variant="soft">
                  Reintentar
                </Button>
              }
            />
          )}

          {viewState === "empty" && (
            <StatusCard
              color="neutral"
              icon={<InfoOutlinedIcon />}
              title="No hay novedades"
              description="Crea la primera."
            />
          )}

          {viewState === "loading" && (
            <Sheet p={3} sx={{ textAlign: "center" }}>
              <Stack spacing={1} alignItems="center">
                <CircularProgress />
                <Typography level="body-sm">Cargando…</Typography>
              </Stack>
            </Sheet>
          )}

          {viewState === "data" && (
            <Sheet variant="plain" sx={{ overflowX: "auto" }}>
              <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 980 }}>
                <thead>
                  <tr>
                    <th style={{ width: 110 }}>Fecha</th>
                    <th>Título</th>
                    <th style={{ width: 140 }}>Tipo</th>
                    <th style={{ width: 140 }}>Audiencia</th>
                    <th style={{ width: 120 }}>Fijado</th>
                    <th style={{ width: 220, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {typeof r.date === "string"
                          ? r.date
                          : new Date(r.date).toISOString().slice(0, 10)}
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {r.title}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          {r.description
                            ? r.description.length > 88
                              ? `${r.description.slice(0, 88)}…`
                              : r.description
                            : "—"}
                        </Typography>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {r.type}
                        </Chip>
                      </td>
                      <td>{r.audience}</td>
                      <td>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="sm"
                            variant={asPinned(r.pinned) ? "solid" : "soft"}
                            color={asPinned(r.pinned) ? "success" : "neutral"}
                            startDecorator={
                              <PushPinRoundedIcon fontSize="sm" />
                            }>
                            {asPinned(r.pinned) ? "Sí" : "No"}
                          </Chip>
                          <Tooltip title="Alternar fijado" variant="soft">
                            <span>
                              <IconButton
                                size="sm"
                                onClick={() => onTogglePinned(r)}
                                disabled={!canEdit}>
                                <PushPinRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end">
                          <Tooltip
                            title={canEdit ? "Editar" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                size="sm"
                                onClick={() => onEdit(r)}
                                disabled={!canEdit}
                                aria-disabled={!canEdit}
                                variant={canEdit ? "soft" : "plain"}
                                color={canEdit ? "primary" : "neutral"}>
                                <EditRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={canDelete ? "Eliminar" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                size="sm"
                                color="danger"
                                onClick={() => onDeleteRow(r)}
                                disabled={!canDelete}
                                aria-disabled={!canDelete}>
                                <DeleteRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}
        </CardContent>
      </Card>

      {/* Modal crear/editar */}
      <ChangelogFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSave={onSaveForm}
      />
    </Box>
  );
}
