// src/pages/SoporteAdmin/TutorialsAdminPage.jsx
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
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import AttachmentRoundedIcon from "@mui/icons-material/AttachmentRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import UnpublishedRoundedIcon from "@mui/icons-material/UnpublishedRounded";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";

import StatusCard from "@/components/common/StatusCard";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CircularProgress from "@mui/joy/CircularProgress";

import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

// Servicios
import { listTutorials, getTutorialBySlug } from "@/services/help.api";
import {
  createTutorial,
  updateTutorial,
  deleteTutorial,
  replaceTutorialSteps,
  replaceTutorialAttachments,
} from "@/services/helpAdmin.api";

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

function formatDateISO(d) {
  try {
    return (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
  } catch {
    return "";
  }
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

/* -------------- modal: crear/editar tutorial -------------- */
function TutorialFormModal({
  open,
  onClose,
  onSave,
  initial,
  tagOptions = [],
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [visibility, setVisibility] = useState(initial?.visibility || "public");
  const [tags, setTags] = useState(toTagArray(initial?.tags));
  const [durationSeconds, setDurationSeconds] = useState(
    initial?.duration_seconds || 0
  );
  const [publishedDate, setPublishedDate] = useState(
    initial?.publishedDate ? formatDateISO(initial.publishedDate) : ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setVideoUrl(initial?.videoUrl || "");
    setImageUrl(initial?.imageUrl || "");
    setCategory(initial?.category || "");
    setVisibility(initial?.visibility || "public");
    setTags(toTagArray(initial?.tags));
    setDurationSeconds(initial?.duration_seconds || 0);
    setPublishedDate(
      initial?.publishedDate ? formatDateISO(initial.publishedDate) : ""
    );
    setSaving(false);
  }, [open, initial]);

  const submit = async () => {
    if (!title.trim()) return;
    if (!videoUrl.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description?.trim() || "",
        videoUrl: videoUrl.trim(),
        imageUrl: imageUrl?.trim() || null,
        category: category?.trim() || null,
        visibility,
        tags,
        duration_seconds: Number(durationSeconds) || null,
        publishedDate: publishedDate || null,
        slug: initial?.slug || slugify(title),
      };
      await onSave(payload);
      onClose?.();
    } catch (e) {
      // lo maneja el caller con toast
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = () => {
    if (publishedDate) {
      setPublishedDate("");
    } else {
      setPublishedDate(formatDateISO(new Date()));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 760, maxWidth: "96vw" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">
            {initial ? "Editar tutorial" : "Nuevo tutorial"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.25}>
          <FormControl required>
            <FormLabel>Título</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. ¿Cómo recuperar mi contraseña?"
            />
          </FormControl>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Video URL</FormLabel>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
              />
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Imagen (opcional)</FormLabel>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../cover.jpg"
              />
            </FormControl>
          </Stack>

          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              minRows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumen del tutorial…"
            />
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Categoría</FormLabel>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Cuentas, Reservas…"
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
              <FormLabel>Visibilidad</FormLabel>
              <Select value={visibility} onChange={(_, v) => setVisibility(v)}>
                <Option value="public">Público</Option>
                <Option value="internal">Interno</Option>
              </Select>
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 240 } }}>
              <FormLabel>Duración (segundos)</FormLabel>
              <Input
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
              />
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Tags</FormLabel>
              <Autocomplete
                multiple
                freeSolo
                limitTags={2}
                placeholder="Escribe un tag y Enter…"
                options={tagOptions}
                value={tags}
                onChange={(_, newValue) =>
                  setTags(newValue.map((t) => String(t).trim()).filter(Boolean))
                }
                slotProps={{
                  listbox: { sx: { maxHeight: 240 } },
                  chip: { size: "sm", variant: "soft", color: "neutral" },
                }}
                sx={{ "--Input-minHeight": "40px" }}
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
              <FormLabel>Fecha publicación</FormLabel>
              <Input
                type="date"
                value={publishedDate || ""}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", sm: 160 } }}>
              <FormLabel>Publicado</FormLabel>
              <Switch
                checked={!!publishedDate}
                onChange={togglePublished}
                startDecorator={
                  publishedDate ? (
                    <PublishedWithChangesRoundedIcon />
                  ) : (
                    <UnpublishedRoundedIcon />
                  )
                }
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

/* -------- modal: gestionar pasos -------- */
function StepsModal({ open, onClose, tutorial, onSave }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    // si el back no trae steps en el list, el admin puede abrir desde un detalle previo.
    setItems(
      Array.isArray(tutorial?.steps)
        ? tutorial.steps.map((s) => ({
            id: s.id || null,
            step_no: s.step_no || 1,
            title: s.title || "",
            body: s.body || "",
            imageUrl: s.imageUrl || "",
          }))
        : []
    );
  }, [open, tutorial]);

  const add = () =>
    setItems((arr) => [
      ...arr,
      {
        id: null,
        step_no: (arr[arr.length - 1]?.step_no || 0) + 1,
        title: "",
        body: "",
        imageUrl: "",
      },
    ]);

  const move = (idx, dir) => {
    setItems((arr) => {
      const next = arr.slice();
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      // renumerar
      next.forEach((s, i) => (s.step_no = i + 1));
      return next;
    });
  };

  const remove = (idx) =>
    setItems((arr) =>
      arr.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_no: i + 1 }))
    );

  const updateField = (idx, key, value) =>
    setItems((arr) => {
      const next = arr.slice();
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const save = () => {
    const payload = items.map(({ title, body, imageUrl, step_no }) => ({
      title: String(title || ""),
      body: String(body || ""),
      imageUrl: imageUrl || null,
      step_no: Number(step_no) || 1,
    }));
    onSave(payload);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 860, maxWidth: "96vw" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">Pasos del tutorial</Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        {/* zona scrolleable */}
        <Box
          sx={{
            maxHeight: { xs: "60vh", md: "65vh" },
            overflowY: "auto",
            pr: 1,
          }}>
          <Stack spacing={1}>
            {items.length === 0 && (
              <Sheet variant="soft" sx={{ p: 2, borderRadius: "md" }}>
                <Typography level="body-sm" color="neutral">
                  Aún no hay pasos. Agrega el primero.
                </Typography>
              </Sheet>
            )}
            {items.map((s, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                    <FormControl sx={{ width: 100 }}>
                      <FormLabel>#</FormLabel>
                      <Input
                        type="number"
                        value={s.step_no}
                        onChange={(e) =>
                          updateField(idx, "step_no", Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Título</FormLabel>
                      <Input
                        value={s.title}
                        onChange={(e) =>
                          updateField(idx, "title", e.target.value)
                        }
                      />
                    </FormControl>
                  </Stack>

                  <FormControl sx={{ mt: 1 }}>
                    <FormLabel>Contenido</FormLabel>
                    <Textarea
                      minRows={3}
                      value={s.body}
                      onChange={(e) => updateField(idx, "body", e.target.value)}
                    />
                  </FormControl>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    mt={1}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Imagen (opcional)</FormLabel>
                      <Input
                        value={s.imageUrl || ""}
                        onChange={(e) =>
                          updateField(idx, "imageUrl", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </FormControl>

                    <Stack direction="row" spacing={0.5} alignItems="flex-end">
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => move(idx, -1)}>
                        Subir
                      </Button>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => move(idx, +1)}>
                        Bajar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="soft"
                        onClick={() => remove(idx)}>
                        Eliminar
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* footer */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          mt={1}>
          <Button startDecorator={<PlaylistAddRoundedIcon />} onClick={add}>
            Añadir paso
          </Button>
          <Stack direction="row" spacing={1}>
            <Button variant="plain" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={save} startDecorator={<SaveRoundedIcon />}>
              Guardar
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

/* -------- modal: gestionar adjuntos -------- */
function AttachmentsModal({ open, onClose, tutorial, onSave }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    setItems(
      Array.isArray(tutorial?.attachments)
        ? tutorial.attachments.map((a) => ({
            id: a.id || null,
            name: a.name || "",
            url: a.url || "",
            mime_type: a.mime_type || "",
            size_kb: a.size_kb || null,
          }))
        : []
    );
  }, [open, tutorial]);

  const add = () =>
    setItems((arr) => [
      ...arr,
      { id: null, name: "", url: "", mime_type: "", size_kb: null },
    ]);

  const remove = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx));

  const updateField = (idx, key, value) =>
    setItems((arr) => {
      const next = arr.slice();
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });

  const save = () => {
    const payload = items.map(({ name, url, mime_type, size_kb }) => ({
      name: String(name || ""),
      url: String(url || ""),
      mime_type: mime_type || null,
      size_kb: size_kb ? Number(size_kb) : null,
    }));
    onSave(payload);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 760, maxWidth: "96vw" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">Adjuntos del tutorial</Typography>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1}>
          {items.length === 0 && (
            <Sheet variant="soft" sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="body-sm" color="neutral">
                Aún no hay adjuntos. Agrega el primero.
              </Typography>
            </Sheet>
          )}

          {items.map((a, idx) => (
            <Card key={idx} variant="outlined">
              <CardContent sx={{ p: 1.5 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Nombre</FormLabel>
                    <Input
                      value={a.name}
                      onChange={(e) => updateField(idx, "name", e.target.value)}
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 2 }}>
                    <FormLabel>URL</FormLabel>
                    <Input
                      value={a.url}
                      onChange={(e) => updateField(idx, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </FormControl>
                </Stack>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  mt={1}>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>MIME type</FormLabel>
                    <Input
                      value={a.mime_type || ""}
                      onChange={(e) =>
                        updateField(idx, "mime_type", e.target.value)
                      }
                      placeholder="application/pdf, image/png…"
                    />
                  </FormControl>
                  <FormControl sx={{ width: 180 }}>
                    <FormLabel>Tamaño (KB)</FormLabel>
                    <Input
                      type="number"
                      value={a.size_kb || ""}
                      onChange={(e) =>
                        updateField(idx, "size_kb", e.target.value)
                      }
                    />
                  </FormControl>

                  <Stack direction="row" spacing={0.5} alignItems="flex-end">
                    <Button
                      size="sm"
                      color="danger"
                      variant="soft"
                      onClick={() => remove(idx)}>
                      Eliminar
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Stack
            direction="row"
            spacing={1}
            justifyContent="space-between"
            mt={1}>
            <Button startDecorator={<UploadFileRoundedIcon />} onClick={add}>
              Añadir adjunto
            </Button>
            <Stack direction="row" spacing={1}>
              <Button variant="plain" onClick={onClose}>
                Cerrar
              </Button>
              <Button onClick={save} startDecorator={<SaveRoundedIcon />}>
                Guardar
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

/* -------------- main -------------- */
export default function TutorialsAdminPage() {
  const { showToast } = useToast();
  const { hasPermiso, userData, checkingSession } = useAuth();
  const canManage =
    hasPermiso?.("help_manage") ||
    (userData?.rol || "").toLowerCase() === "admin";

  // data
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // filtros
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState("all"); // all | public | internal
  const [category, setCategory] = useState("");

  // paginación manual
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // loading / estado
  const [loading, setLoading] = useState(true);
  const [viewError, setViewError] = useState(null);

  // sort simple
  const [sort, setSort] = useState({ key: "title", dir: "asc" });

  // modals
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [openSteps, setOpenSteps] = useState(false);
  const [openAttachments, setOpenAttachments] = useState(false);
  const [selected, setSelected] = useState(null); // tutorial seleccionado para steps/attachments

  const fetchData = useCallback(async () => {
    if (checkingSession) return;

    if (!canManage) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      setViewError(null);
      return;
    }

    setLoading(true);
    setViewError(null);
    try {
      const params = {
        page,
        limit,
        q: q || undefined,
        category: category || undefined,
        visibility: visibility === "all" ? undefined : visibility,
      };
      const res = await listTutorials(params);
      const items = res?.items || [];
      setRows(items);
      setTotal(Number(res?.total || items.length));
    } catch (e) {
      const msg = e?.message || "No se pudieron cargar los tutoriales";
      setViewError(msg);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, category, visibility, canManage, checkingSession]);

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
    if (!canManage) {
      showToast("No tienes permiso para gestionar tutoriales", "warning");
      return;
    }
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (row) => {
    if (!canManage) {
      showToast("No tienes permiso para gestionar tutoriales", "warning");
      return;
    }
    setEditing(row);
    setOpenForm(true);
  };

  const onDeleteRow = async (row) => {
    if (!canManage) {
      showToast("No tienes permiso para gestionar tutoriales", "warning");
      return;
    }
    if (!confirm(`¿Eliminar el tutorial "${row.title}"?`)) return;
    try {
      await deleteTutorial(row.id);
      showToast("Eliminado", "success");
      fetchData();
    } catch (e) {
      showToast(e?.message || "No se pudo eliminar", "danger");
    }
  };

  const onQuickToggleVisibility = async (row) => {
    if (!canManage) {
      showToast("No tienes permiso", "warning");
      return;
    }
    const next = row.visibility === "public" ? "internal" : "public";
    try {
      await updateTutorial(row.id, { visibility: next });
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, visibility: next } : r))
      );
    } catch (e) {
      showToast(e?.message || "No se pudo actualizar", "danger");
    }
  };

  const onQuickTogglePublished = async (row) => {
    if (!canManage) {
      showToast("No tienes permiso", "warning");
      return;
    }
    const next = row.publishedDate ? null : formatDateISO(new Date());
    try {
      await updateTutorial(row.id, { publishedDate: next });
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, publishedDate: next } : r))
      );
    } catch (e) {
      showToast(e?.message || "No se pudo actualizar publicación", "danger");
    }
  };

  const onSaveForm = async (payload) => {
    if (!canManage) throw new Error("Sin permiso");
    try {
      if (editing) {
        await updateTutorial(editing.id, payload);
        showToast("Tutorial actualizado", "success");
      } else {
        await createTutorial(payload);
        showToast("Tutorial creado", "success");
      }
      fetchData();
    } catch (e) {
      showToast(e?.message || "No se pudo guardar", "danger");
      throw e;
    }
  };

  const openStepsFor = async (row) => {
    try {
      const full = await getTutorialBySlug(row.slug);
      setSelected(full); // full.steps viene poblado
      setOpenSteps(true);
    } catch (e) {
      showToast("No pude cargar los pasos del tutorial", "danger");
    }
  };

  const openAttachmentsFor = async (row) => {
    try {
      const full = await getTutorialBySlug(row.slug);
      setSelected(full); // full.attachments viene poblado
      setOpenAttachments(true);
    } catch (e) {
      showToast("No pude cargar los adjuntos del tutorial", "danger");
    }
  };

  const saveSteps = async (stepsPayload) => {
    try {
      await replaceTutorialSteps(selected.id, stepsPayload);
      showToast("Pasos guardados", "success");
      setOpenSteps(false);
    } catch (e) {
      showToast(e?.message || "No se pudieron guardar los pasos", "danger");
    }
  };

  const saveAttachments = async (attPayload) => {
    try {
      await replaceTutorialAttachments(selected.id, attPayload);
      showToast("Adjuntos guardados", "success");
      setOpenAttachments(false);
    } catch (e) {
      showToast(e?.message || "No se pudieron guardar los adjuntos", "danger");
    }
  };

  // Opciones de tags deduplicadas
  const tagOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => toTagArray(r.tags).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // Estado de vista (como Activos/FAQs)
  const viewState = checkingSession
    ? "checking"
    : !canManage
    ? "no-permission"
    : viewError
    ? "error"
    : loading
    ? "loading"
    : rows.length === 0
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
          icon={<ErrorOutlineRoundedIcon />}
          title="Sin permisos para gestionar tutoriales"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (viewState === "error") {
      const isNetwork = /failed to fetch|conexión/i.test(viewError || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={
            isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetwork ? "Problema de conexión" : "No se pudo cargar la lista"
          }
          description={viewError}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={fetchData}
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
          title="No hay tutoriales todavía"
          description="Crea el primero con el botón 'Nuevo'."
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h4" mb={1}>
        Administración de Tutoriales
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: 2 }}>
          {/* filtros */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}>
            <Input
              placeholder="Buscar (título, descripción, categoría, tag)…"
              startDecorator={<SearchRoundedIcon />}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <Input
              placeholder="Categoría"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              sx={{ width: 220 }}
            />

            <Select
              value={visibility}
              onChange={(_, v) => {
                setVisibility(v);
                setPage(1);
              }}
              sx={{ width: 180 }}>
              <Option value="all">Todas</Option>
              <Option value="public">Públicas</Option>
              <Option value="internal">Internas</Option>
            </Select>

            <Select
              value={String(limit)}
              onChange={(_, v) => {
                setLimit(Number(v));
                setPage(1);
              }}
              sx={{ width: 140 }}>
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
              <Button
                startDecorator={<AddRoundedIcon />}
                onClick={onCreate}
                disabled={!canManage}>
                Nuevo
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {viewState !== "data" ? (
            <Box p={1}>{renderStatus()}</Box>
          ) : (
            <Sheet variant="plain" sx={{ overflowX: "auto" }}>
              <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 1100 }}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Visibilidad</th>
                    <th
                      style={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        width: 120,
                      }}
                      onClick={() => toggleSort("publishedDate")}>
                      <Stack direction="row" spacing={0.25} alignItems="center">
                        <span>Publicado</span>
                        {sort.key === "publishedDate" ? (
                          sort.dir === "asc" ? (
                            <ArrowDropUpIcon fontSize="sm" />
                          ) : (
                            <ArrowDropDownIcon fontSize="sm" />
                          )
                        ) : null}
                      </Stack>
                    </th>
                    <th>Duración</th>
                    <th style={{ width: 260, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {r.title}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          {r.description?.slice(0, 88)}
                          {r.description?.length > 88 ? "…" : ""}
                        </Typography>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {r.category || "—"}
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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={r.publishedDate ? "success" : "neutral"}>
                            {r.publishedDate
                              ? formatDateISO(r.publishedDate)
                              : "—"}
                          </Chip>
                          <Switch
                            checked={!!r.publishedDate}
                            onChange={() => onQuickTogglePublished(r)}
                            slotProps={{ track: { sx: { minWidth: 36 } } }}
                          />
                        </Stack>
                      </td>
                      <td>
                        {r.duration_seconds
                          ? `${Math.round(r.duration_seconds / 60)} min`
                          : "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end">
                          <IconButton
                            size="sm"
                            title={
                              r.visibility === "public"
                                ? "Hacer interno"
                                : "Hacer público"
                            }
                            onClick={() => onQuickToggleVisibility(r)}
                            disabled={!canManage}>
                            {r.visibility === "public" ? (
                              <VisibilityOffRoundedIcon />
                            ) : (
                              <VisibilityRoundedIcon />
                            )}
                          </IconButton>

                          <IconButton
                            size="sm"
                            onClick={() => onEdit(r)}
                            disabled={!canManage}>
                            <EditRoundedIcon />
                          </IconButton>

                          <IconButton
                            size="sm"
                            onClick={() => openStepsFor(r)}
                            disabled={!canManage}
                            title="Gestionar pasos">
                            <PlaylistAddRoundedIcon />
                          </IconButton>

                          <IconButton
                            size="sm"
                            onClick={() => openAttachmentsFor(r)}
                            disabled={!canManage}
                            title="Gestionar adjuntos">
                            <AttachmentRoundedIcon />
                          </IconButton>

                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => onDeleteRow(r)}
                            disabled={!canManage}>
                            <DeleteRoundedIcon />
                          </IconButton>
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
      <TutorialFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSave={onSaveForm}
        tagOptions={tagOptions}
      />

      {/* Modales de pasos y adjuntos */}
      <StepsModal
        open={openSteps}
        onClose={() => setOpenSteps(false)}
        tutorial={selected}
        onSave={saveSteps}
      />
      <AttachmentsModal
        open={openAttachments}
        onClose={() => setOpenAttachments(false)}
        tutorial={selected}
        onSave={saveAttachments}
      />
    </Box>
  );
}
