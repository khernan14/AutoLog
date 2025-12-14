// src/pages/SoporteAdmin/FAQsAdminPage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";

import {
  Box,
  Typography,
  Stack,
  Table,
  Sheet,
  Input,
  Select,
  Option,
  Button,
  IconButton,
  Chip,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
  Switch,
  Tooltip,
  CircularProgress,
  Autocomplete,
  Drawer,
  ModalClose,
  FormHelperText,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import HelpCenterRoundedIcon from "@mui/icons-material/HelpCenterRounded"; // Icono empty
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";

// Services & Context
import { listFaqs } from "../../services/help.api";
import { createFaq, updateFaq, deleteFaq } from "../../services/helpAdmin.api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StatusCard from "../../components/common/StatusCard";
import PaginationLite from "../../components/common/PaginationLite";

// --- Utils ---
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

function toTagArray(value) {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((t) => String(t).trim()).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* ignore */
    }
    return value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

// --- Esquema de Validación ---
const validationSchema = yup.object({
  question: yup.string().required("La pregunta es requerida"),
  answer: yup.string().required("La respuesta es requerida"),
  category: yup.string().required("La categoría es requerida"),
  order: yup.number().typeError("Debe ser un número").integer().min(0),
});

// --- Componente Formulario (Drawer) ---
function FaqFormDrawer({ open, onClose, onSave, initial, tagOptions = [] }) {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      question: initial?.question || "",
      answer: initial?.answer || "",
      category: initial?.category || "General",
      visibility: initial?.visibility || "public",
      tags: toTagArray(initial?.tags),
      order: initial?.order ?? 0,
      isActive: initial?.isActive ?? 1,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          tags: values.tags, // Array
          slug: initial?.slug || slugify(values.question),
          isActive: values.isActive ? 1 : 0,
        };
        await onSave(payload);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => !formik.isSubmitting && onClose()}
      size="md"
      slotProps={{
        content: {
          sx: {
            bgcolor: "background.surface",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "xl",
          },
        },
      }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography level="h4">
          {initial
            ? t("support.faqs.edit_title")
            : t("support.faqs.create_title")}
        </Typography>
        <ModalClose disabled={formik.isSubmitting} onClick={onClose} />
      </Stack>
      <Divider />

      <Stack
        component="form"
        onSubmit={formik.handleSubmit}
        spacing={2}
        sx={{ flex: 1, overflowY: "auto", px: 1, pt: 1 }}>
        <FormControl
          required
          error={formik.touched.question && Boolean(formik.errors.question)}>
          <FormLabel>{t("support.faqs.form.question")}</FormLabel>
          <Input
            name="question"
            value={formik.values.question}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.question && (
            <FormHelperText>{formik.errors.question}</FormHelperText>
          )}
        </FormControl>

        <FormControl
          required
          error={formik.touched.answer && Boolean(formik.errors.answer)}>
          <FormLabel>{t("support.faqs.form.answer")}</FormLabel>
          <Textarea
            name="answer"
            minRows={6}
            value={formik.values.answer}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.answer && (
            <FormHelperText>{formik.errors.answer}</FormHelperText>
          )}
        </FormControl>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl
            required
            sx={{ flex: 1 }}
            error={formik.touched.category && Boolean(formik.errors.category)}>
            <FormLabel>{t("support.faqs.form.category")}</FormLabel>
            <Autocomplete
              freeSolo
              options={["General", "Cuentas", "Técnico", "Facturación"]} // Sugerencias básicas
              value={formik.values.category}
              onInputChange={(_, v) => formik.setFieldValue("category", v)}
            />
          </FormControl>

          <FormControl sx={{ width: { xs: "100%", sm: 200 } }}>
            <FormLabel>{t("support.faqs.form.visibility")}</FormLabel>
            <Select
              name="visibility"
              value={formik.values.visibility}
              onChange={(_, v) => formik.setFieldValue("visibility", v)}>
              <Option value="public">
                {t("support.faqs.visibility.public")}
              </Option>
              <Option value="internal">
                {t("support.faqs.visibility.internal")}
              </Option>
            </Select>
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>{t("support.faqs.form.tags")}</FormLabel>
          <Autocomplete
            multiple
            freeSolo
            options={tagOptions}
            value={formik.values.tags}
            onChange={(_, v) => formik.setFieldValue("tags", v)}
            placeholder={t("support.faqs.form.tags_placeholder")}
          />
        </FormControl>

        <Stack direction="row" spacing={3}>
          <FormControl>
            <FormLabel>{t("support.faqs.form.order")}</FormLabel>
            <Input
              type="number"
              name="order"
              value={formik.values.order}
              onChange={formik.handleChange}
              sx={{ width: 100 }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t("support.faqs.form.active")}</FormLabel>
            <Switch
              checked={Boolean(formik.values.isActive)}
              onChange={(e) =>
                formik.setFieldValue("isActive", e.target.checked)
              }
            />
          </FormControl>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="flex-end" spacing={1} pt={2}>
        <Button
          variant="plain"
          color="neutral"
          onClick={onClose}
          disabled={formik.isSubmitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button
          startDecorator={<SaveRoundedIcon />}
          onClick={formik.handleSubmit}
          loading={formik.isSubmitting}>
          {t("common.actions.save")}
        </Button>
      </Stack>
    </Drawer>
  );
}

// --- Componente Principal ---
export default function FAQsAdminPage() {
  const { t } = useTranslation();
  const { hasPermiso, userData, checkingSession } = useAuth();
  const { showToast } = useToast();

  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso?.(p),
    [isAdmin, hasPermiso]
  );

  // Permisos
  const canView = can("help_manage");
  const canCreate = can("help_manage");
  const canEdit = can("help_manage");
  const canDelete = can("help_manage");

  // Estado
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Filtros
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [active, setActive] = useState("all");

  // Paginación y Orden
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState({ key: "order", dir: "asc" });

  // Modal
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    if (checkingSession) return;
    if (!canView) {
      setRows([]);
      setTotal(0);
      setLoading(false);
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
      setFetchError(t("support.faqs.errors.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, page, limit, q, visibility, active, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Helpers ---
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

  const tagOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => toTagArray(r.tags).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [rows]);

  // --- Handlers ---
  const onCreate = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (row) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditing(row);
    setOpenForm(true);
  };

  const onDeleteRow = async (row) => {
    if (!canDelete) return showToast(t("common.no_permission"), "warning");
    if (!confirm(t("support.faqs.delete_confirm"))) return;
    try {
      await deleteFaq(row.id);
      showToast(t("support.faqs.success.deleted"), "success");
      fetchData();
    } catch (e) {
      showToast(t("support.faqs.errors.delete_failed"), "danger");
    }
  };

  const onQuickToggleActive = async (row) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    try {
      await updateFaq(row.id, { isActive: row.isActive ? 0 : 1 });
      setRows((rs) =>
        rs.map((r) =>
          r.id === row.id ? { ...r, isActive: r.isActive ? 0 : 1 } : r
        )
      );
    } catch {
      showToast(t("support.faqs.errors.update_failed"), "danger");
    }
  };

  const onSaveForm = async (payload) => {
    try {
      if (editing) {
        await updateFaq(editing.id, payload);
        showToast(t("support.faqs.success.updated"), "success");
      } else {
        await createFaq(payload);
        showToast(t("support.faqs.success.created"), "success");
      }
      fetchData();
    } catch (e) {
      throw e; // Formik handlea el error visualmente si se quiere, aquí lanzamos para que el modal lo cachee
    }
  };

  // --- Render Status ---
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
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
        pb: 4,
        px: { xs: 2, md: 4 },
        minHeight: "auto",
        bgcolor: "background.body",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1400 }}>
        {/* HEADER */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={3}>
          <Box>
            <Typography level="h3" fontWeight="lg">
              {t("support.faqs.title")}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {t("support.faqs.subtitle")}
            </Typography>
          </Box>

          {/* FILTROS */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap">
            <Input
              placeholder={t("support.faqs.search_placeholder")}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                q && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    onClick={() => setQ("")}>
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: 260 } }}
            />

            <Select
              value={visibility}
              onChange={(_, v) => {
                setVisibility(v);
                setPage(1);
              }}
              sx={{ width: 140 }}>
              <Option value="all">{t("common.status.all")}</Option>
              <Option value="public">
                {t("support.faqs.visibility.public")}
              </Option>
              <Option value="internal">
                {t("support.faqs.visibility.internal")}
              </Option>
            </Select>

            <Select
              value={active}
              onChange={(_, v) => {
                setActive(v);
                setPage(1);
              }}
              sx={{ width: 140 }}>
              <Option value="all">{t("common.status.all")}</Option>
              <Option value="1">{t("common.status.active")}</Option>
              <Option value="0">{t("common.status.inactive")}</Option>
            </Select>

            {canCreate && (
              <Button
                startDecorator={<AddRoundedIcon />}
                onClick={onCreate}
                variant="solid"
                color="primary">
                {t("support.faqs.actions.new")}
              </Button>
            )}
          </Stack>
        </Stack>

        {/* CONTENT */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "lg",
            overflow: "hidden",
            bgcolor: "background.surface",
            minHeight: "auto",
          }}>
          {viewState === "loading" && (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </Box>
          )}
          {viewState === "error" && (
            <Box p={4} display="flex" justifyContent="center">
              <StatusCard
                color="danger"
                icon={<ErrorOutlineRoundedIcon />}
                title={t("common.error_title")}
                description={fetchError}
                actions={
                  <Button
                    startDecorator={<RestartAltRoundedIcon />}
                    onClick={fetchData}
                    variant="soft">
                    {t("common.retry")}
                  </Button>
                }
              />
            </Box>
          )}
          {viewState === "empty" && (
            <Box p={4} display="flex" justifyContent="center">
              <StatusCard
                color="neutral"
                icon={<HelpCenterRoundedIcon />}
                title={t("support.faqs.empty.title")}
                description={t("support.faqs.empty.desc")}
              />
            </Box>
          )}
          {viewState === "no-permission" && (
            <Box p={4} display="flex" justifyContent="center">
              <StatusCard
                color="danger"
                icon={<LockPersonRoundedIcon />}
                title={t("common.no_permission")}
                description={t("common.contact_admin")}
              />
            </Box>
          )}
          {viewState === "checking" && (
            <Box p={4} display="flex" justifyContent="center">
              <StatusCard
                icon={<HourglassEmptyRoundedIcon />}
                title={t("common.verifying_session")}
                description={<CircularProgress size="sm" />}
              />
            </Box>
          )}

          {viewState === "data" && (
            <>
              <Table
                stickyHeader
                hoverRow
                sx={{
                  "--TableCell-paddingX": "16px",
                  "--TableCell-paddingY": "12px",
                  "& thead th": {
                    bgcolor: "background.level1",
                    color: "text.tertiary",
                    fontWeight: "md",
                    textTransform: "uppercase",
                    fontSize: "xs",
                    letterSpacing: "0.05em",
                  },
                }}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th style={{ width: "25%" }}>
                      {t("support.faqs.columns.question")}
                    </th>
                    <th style={{ width: "30%" }}>
                      {t("support.faqs.columns.answer")}
                    </th>
                    <th>{t("support.faqs.columns.category")}</th>
                    <th>{t("support.faqs.columns.visibility")}</th>
                    <th>{t("support.faqs.columns.status")}</th>
                    <th
                      style={{ cursor: "pointer", width: 100 }}
                      onClick={() => toggleSort("order")}>
                      <Stack direction="row" alignItems="center">
                        {t("support.faqs.columns.order")}
                        {sort.key === "order" &&
                          (sort.dir === "asc" ? (
                            <ArrowDropUpIcon fontSize="sm" />
                          ) : (
                            <ArrowDropDownIcon fontSize="sm" />
                          ))}
                      </Stack>
                    </th>
                    <th style={{ width: 120, textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>
                        <Typography fontWeight="md">{r.question}</Typography>
                      </td>
                      <td>
                        <Tooltip
                          title={r.answer}
                          variant="soft"
                          placement="top-start"
                          sx={{ maxWidth: 400 }}>
                          <Typography
                            level="body-sm"
                            noWrap
                            sx={{ maxWidth: 300, cursor: "help" }}>
                            {r.answer}
                          </Typography>
                        </Tooltip>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          mt={0.5}
                          flexWrap="wrap">
                          {toTagArray(r.tags).map((tag, i) => (
                            <Chip key={i} size="sm" variant="outlined">
                              #{tag}
                            </Chip>
                          ))}
                        </Stack>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {r.category}
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
                          slotProps={{ track: { sx: { minWidth: 32 } } }}
                        />
                      </td>
                      <td>{r.order}</td>
                      <td>
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.5}>
                          {canEdit && (
                            <Tooltip
                              title={t("common.actions.edit")}
                              variant="soft">
                              <IconButton size="sm" onClick={() => onEdit(r)}>
                                <EditRoundedIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canEdit && (
                            <Tooltip
                              title={
                                r.visibility === "public"
                                  ? t("support.faqs.make_internal")
                                  : t("support.faqs.make_public")
                              }
                              variant="soft">
                              <IconButton
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await updateFaq(r.id, {
                                      visibility:
                                        r.visibility === "public"
                                          ? "internal"
                                          : "public",
                                    });
                                    fetchData();
                                  } catch {}
                                }}>
                                {r.visibility === "public" ? (
                                  <VisibilityOffRoundedIcon />
                                ) : (
                                  <VisibilityRoundedIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete && (
                            <Tooltip
                              title={t("common.actions.delete")}
                              variant="soft">
                              <IconButton
                                size="sm"
                                color="danger"
                                onClick={() => onDeleteRow(r)}>
                                <DeleteRoundedIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Footer Paginación */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <PaginationLite
                  page={page}
                  count={totalPages}
                  onChange={setPage}
                />
                <Select
                  size="sm"
                  value={limit}
                  onChange={(_, v) => {
                    setLimit(v);
                    setPage(1);
                  }}
                  sx={{ width: 80 }}>
                  <Option value={10}>10</Option>
                  <Option value={25}>25</Option>
                  <Option value={50}>50</Option>
                </Select>
              </Stack>
            </>
          )}
        </Sheet>

        {/* Form Drawer */}
        <FaqFormDrawer
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSave={onSaveForm}
          initial={editing}
          tagOptions={tagOptions}
        />
      </Box>
    </Sheet>
  );
}
