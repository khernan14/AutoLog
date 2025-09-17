// src/pages/SoporteAdmin/FAQsAdminPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
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
  Chip,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
  Switch,
  Tooltip,
  CircularProgress,
} from "@mui/joy";
import Autocomplete from "@mui/joy/Autocomplete";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { listFaqs } from "../../services/help.api";
import { createFaq, updateFaq, deleteFaq } from "../../services/helpAdmin.api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StatusCard from "../../components/common/StatusCard";

/* ---------------- utils ---------------- */
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

// Normaliza a array de strings (seguro para JSON)
function toTagArray(value) {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((t) => String(t).trim()).filter(Boolean);
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    if (s.startsWith("[") || s.startsWith("{")) {
      try {
        const j = JSON.parse(s);
        return Array.isArray(j) ? j.map((t) => String(t).trim()) : [];
      } catch {
        // cae a CSV
      }
    }
    return s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

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
function FaqFormModal({ open, onClose, onSave, initial, tagOptions = [] }) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [answer, setAnswer] = useState(initial?.answer || "");
  const [category, setCategory] = useState(initial?.category || "General");
  const [visibility, setVisibility] = useState(initial?.visibility || "public");
  const [tags, setTags] = useState(toTagArray(initial?.tags));
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? 1);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    setQuestion(initial?.question || "");
    setAnswer(initial?.answer || "");
    setCategory(initial?.category || "General");
    setVisibility(initial?.visibility || "public");
    setTags(toTagArray(initial?.tags));
    setOrder(initial?.order ?? 0);
    setIsActive(initial?.isActive ?? 1);
    setSaving(false);
  }, [open, initial]);

  const submit = async () => {
    if (!question.trim() || !answer.trim()) {
      showToast("Pregunta y respuesta son obligatorias", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || "General",
        visibility,
        order: Number(order) || 0,
        isActive: isActive ? 1 : 0,
        tags, // array → el controller la guarda como JSON
        slug: initial?.slug || slugify(question),
      };
      await onSave(payload);
      showToast("Guardado correctamente", "success");
      onClose?.();
    } catch (e) {
      showToast(e?.message || "No se pudo guardar", "danger");
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
            {initial ? "Editar FAQ" : "Nueva FAQ"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.25}>
          <FormControl required>
            <FormLabel>Pregunta</FormLabel>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej. ¿Cómo cambio mi contraseña?"
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Respuesta</FormLabel>
            <Textarea
              minRows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Describe los pasos o la explicación…"
            />
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Categoría</FormLabel>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Cuentas & Acceso"
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
              <FormLabel>Visibilidad</FormLabel>
              <Select value={visibility} onChange={(_, v) => setVisibility(v)}>
                <Option value="public">Público</Option>
                <Option value="internal">Interno</Option>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Tags</FormLabel>
              <Autocomplete
                multiple
                freeSolo
                limitTags={2}
                placeholder="Escribe y presiona Enter…"
                options={tagOptions}
                value={tags}
                onChange={(_, newValue) =>
                  setTags(newValue.map((t) => String(t).trim()).filter(Boolean))
                }
                getOptionLabel={(opt) => String(opt)}
                isOptionEqualToValue={(opt, val) => String(opt) === String(val)}
                slotProps={{
                  listbox: { sx: { maxHeight: 240 } },
                  chip: { size: "sm", variant: "soft", color: "neutral" },
                }}
                sx={{ "--Input-minHeight": "40px" }}
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
            <FormControl sx={{ width: { xs: "100%", sm: 160 } }}>
              <FormLabel>Activo</FormLabel>
              <Switch
                checked={!!isActive}
                onChange={(e) => setIsActive(e.target.checked ? 1 : 0)}
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
export default function FAQsAdminPage() {
  const { hasPermiso, userData, checkingSession } = useAuth();
  const { showToast } = useToast();

  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso?.(p),
    [isAdmin, hasPermiso]
  );

  // Permisos (mismo patrón que ActivosList)
  const canView = can("help_manage"); // ver listado
  const canCreate = can("help_manage");
  const canEdit = can("help_manage");
  const canDelete = can("help_manage");

  // tabla
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // filtros
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState("all"); // all | public | internal
  const [active, setActive] = useState("all"); // all | 1 | 0

  // paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // loading / error
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // sort simple por "order"
  const [sort, setSort] = useState({ key: "order", dir: "asc" });

  // modal
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = useCallback(async () => {
    if (checkingSession) return; // espera a que termine la verificación

    if (!canView) {
      // Sin permisos: no intentamos llamar al backend
      setRows([]);
      setTotal(0);
      setLoading(false);
      setFetchError(null);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const params = {
        page,
        limit,
        q: q || undefined,
        visibility: visibility === "all" ? undefined : visibility,
        isActive: active === "all" ? undefined : active,
      };
      const res = await listFaqs(params);
      const items = res?.items || [];
      setRows(items);
      setTotal(Number(res?.total || items.length));
    } catch (e) {
      setRows([]);
      setTotal(0);
      const msg = e?.message || "No se pudieron cargar las FAQs";
      setFetchError(msg);
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, page, limit, q, visibility, active, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedRows = useMemo(() => {
    const src = rows.slice();
    const { key, dir } = sort;
    src.sort((a, b) => {
      const va = a?.[key] ?? "";
      const vb = b?.[key] ?? "";
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return src;
  }, [rows, sort]);

  const totalPages = Math.ceil(total / limit) || 1;

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const onCreate = () => {
    if (!canCreate) {
      showToast("No tienes permiso para crear FAQs", "warning");
      return;
    }
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (row) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar FAQs", "warning");
      return;
    }
    setEditing(row);
    setOpenForm(true);
  };

  const onDeleteRow = async (row) => {
    if (!canDelete) {
      showToast("No tienes permiso para eliminar FAQs", "warning");
      return;
    }
    if (!confirm(`¿Eliminar la FAQ "${row.question}"?`)) return;
    try {
      await deleteFaq(row.id);
      showToast("Eliminado", "success");
      fetchData();
    } catch (e) {
      showToast(e?.message || "No se pudo eliminar", "danger");
    }
  };

  const onQuickToggleActive = async (row) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar FAQs", "warning");
      return;
    }
    try {
      await updateFaq(row.id, { isActive: row.isActive ? 0 : 1 });
      setRows((rs) =>
        rs.map((r) =>
          r.id === row.id ? { ...r, isActive: r.isActive ? 0 : 1 } : r
        )
      );
    } catch (e) {
      showToast(e?.message || "No se pudo actualizar", "danger");
    }
  };

  const onQuickToggleVisibility = async (row) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar FAQs", "warning");
      return;
    }
    const next = row.visibility === "public" ? "internal" : "public";
    try {
      await updateFaq(row.id, { visibility: next });
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, visibility: next } : r))
      );
    } catch (e) {
      showToast(e?.message || "No se pudo actualizar", "danger");
    }
  };

  const onSaveForm = async (payload) => {
    if (!canEdit && !canCreate) throw new Error("Sin permiso");
    if (editing) {
      await updateFaq(editing.id, payload);
      showToast("Actualizado", "success");
    } else {
      await createFaq(payload);
      showToast("Creado", "success");
    }
    fetchData();
  };

  // Opciones de tags deduplicadas desde las filas cargadas
  const tagOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      toTagArray(r.tags).forEach((t) => set.add(t));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // ===== View state (igual patrón que ActivosList) =====
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
    : sortedRows.length === 0
    ? "empty"
    : "data";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h4" mb={1}>
        Administración de FAQs
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: 2 }}>
          {/* filtros */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}>
            <Input
              placeholder="Buscar (pregunta, respuesta, categoría, tag)…"
              startDecorator={<SearchRoundedIcon />}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              sx={{ flex: 1, minWidth: 200 }}
              disabled={viewState !== "data" && viewState !== "empty"}
            />

            <Select
              value={visibility}
              onChange={(_, v) => {
                setVisibility(v);
                setPage(1);
              }}
              sx={{ width: 180 }}
              disabled={viewState !== "data" && viewState !== "empty"}>
              <Option value="all">Todas</Option>
              <Option value="public">Públicas</Option>
              <Option value="internal">Internas</Option>
            </Select>

            <Select
              value={active}
              onChange={(_, v) => {
                setActive(v);
                setPage(1);
              }}
              sx={{ width: 180 }}
              disabled={viewState !== "data" && viewState !== "empty"}>
              <Option value="all">Todas</Option>
              <Option value="1">Activas</Option>
              <Option value="0">Inactivas</Option>
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
                title={
                  canCreate
                    ? "Crear FAQ"
                    : "No tienes permiso para crear. Solicítalo al administrador."
                }
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
                    Nueva FAQ
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Estados con StatusCard */}
          {viewState === "checking" && (
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
          )}

          {viewState === "no-permission" && (
            <StatusCard
              color="danger"
              icon={<LockPersonRoundedIcon />}
              title="Sin permisos para administrar FAQs"
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
              title="No hay FAQs"
              description="Ajusta los filtros o crea la primera."
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
              <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 1040 }}>
                <thead>
                  <tr>
                    <th style={{ width: 54 }}>ID</th>
                    <th>Pregunta</th>
                    <th>Categoría</th>
                    <th>Visibilidad</th>
                    <th>Activo</th>
                    <th
                      style={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        width: 110,
                      }}
                      onClick={() => toggleSort("order")}>
                      <Stack direction="row" spacing={0.25} alignItems="center">
                        <span>Orden</span>
                        {sort.key === "order" ? (
                          sort.dir === "asc" ? (
                            <ArrowDropUpIcon fontSize="sm" />
                          ) : (
                            <ArrowDropDownIcon fontSize="sm" />
                          )
                        ) : null}
                      </Stack>
                    </th>
                    <th style={{ width: 220, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {r.question}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          {r.answer?.slice(0, 88)}
                          {r.answer?.length > 88 ? "…" : ""}
                        </Typography>

                        {/* Tags */}
                        {toTagArray(r.tags).length > 0 && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ mt: 0.5, flexWrap: "wrap" }}>
                            {toTagArray(r.tags)
                              .slice(0, 6)
                              .map((t, i) => (
                                <Chip
                                  key={`${r.id}-tag-${i}`}
                                  size="sm"
                                  variant="outlined">
                                  #{t}
                                </Chip>
                              ))}
                          </Stack>
                        )}
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {r.category || "General"}
                        </Chip>
                      </td>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            r.visibility === "public" ? "success" : "neutral"
                          }>
                          {r.visibility}
                        </Chip>
                      </td>
                      <td>
                        <Switch
                          checked={!!r.isActive}
                          onChange={() => onQuickToggleActive(r)}
                          disabled={!canEdit}
                          slotProps={{ track: { sx: { minWidth: 36 } } }}
                        />
                      </td>
                      <td>{r.order ?? 0}</td>
                      <td style={{ textAlign: "right" }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end">
                          <Tooltip
                            title={
                              r.visibility === "public"
                                ? "Hacer interna"
                                : "Hacer pública"
                            }
                            variant="soft">
                            <span>
                              <IconButton
                                size="sm"
                                onClick={() => onQuickToggleVisibility(r)}
                                disabled={!canEdit}>
                                {r.visibility === "public" ? (
                                  <VisibilityOffRoundedIcon />
                                ) : (
                                  <VisibilityRoundedIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>

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
      <FaqFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSave={onSaveForm}
        tagOptions={tagOptions}
      />
    </Box>
  );
}
