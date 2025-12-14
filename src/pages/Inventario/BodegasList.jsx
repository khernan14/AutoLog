// src/pages/Bodegas/Bodegas.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next"; // 👈 i18n
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  Typography,
  Stack,
  Button,
  Sheet,
  Table,
  Input,
  IconButton,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Divider,
  CircularProgress,
  Select,
  Option,
  Tooltip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Chip,
  Link,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded"; // Icono empty
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";

// Hooks & Context
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StatusCard from "../../components/common/StatusCard";
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";

// Services
import {
  getBodegas,
  createBodega,
  updateBodega,
} from "../../services/BodegasServices";
import { getCities } from "../../services/LocationServices";

// Normalizador
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// Validación
const validationSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .required("Requerido"),
  descripcion: yup.string().nullable(),
  id_ciudad: yup.string().required("Selecciona una ciudad"),
});

export default function Bodegas() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Permisos ---
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_bodegas") || can("gestionar_bodegas");
  const canCreate = can("crear_bodegas") || can("gestionar_bodegas");
  const canEdit = can("editar_bodegas") || can("gestionar_bodegas");

  // --- Estado ---
  const [rows, setRows] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // --- Carga Inicial ---
  const loadData = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [bodegasData, citiesData] = await Promise.all([
        getBodegas(),
        getCities(),
      ]);
      setRows(Array.isArray(bodegasData) ? bodegasData : []);
      setCitiesList(Array.isArray(citiesData) ? citiesData : []);
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("warehouses.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Filtrado ---
  const filtered = useMemo(() => {
    const s = normalize(search);
    return rows.filter(
      (r) =>
        normalize(r.nombre).includes(s) ||
        normalize(r.ciudad).includes(s) ||
        normalize(r.descripcion).includes(s)
    );
  }, [rows, search]);

  // --- Highlight Logic ---
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: filtered,
    matchRow: (r, token) =>
      String(r.id) === token || normalize(r.nombre) === normalize(token),
    getRowId: (r) => r.id,
    highlightMs: 4000,
  });

  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
    setSearch("");
    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // --- Acciones ---
  const handleNew = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditing(null);
    setOpenModal(true);
  };

  const handleEdit = (bodega) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditing(bodega);
    setOpenModal(true);
  };

  const handleRowClick = (id) => {
    navigate(`${id}`);
  };

  // --- Formulario (Formik) ---
  const formik = useFormik({
    initialValues: { nombre: "", descripcion: "", id_ciudad: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
        id_ciudad: values.id_ciudad,
      };

      try {
        if (editing) {
          await updateBodega(editing.id, payload);
          showToast(t("warehouses.success.updated"), "success");
        } else {
          await createBodega(payload);
          showToast(t("warehouses.success.created"), "success");
        }
        setOpenModal(false);
        loadData();
      } catch (e) {
        showToast(e?.message || t("warehouses.errors.save_failed"), "danger");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (openModal) {
      formik.setValues({
        nombre: editing?.nombre || "",
        descripcion: editing?.descripcion || "",
        id_ciudad: editing?.id_ciudad ? String(editing.id_ciudad) : "",
      });
      formik.setTouched({});
    }
  }, [openModal, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Render Status ---
  const viewState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : error
    ? "error"
    : loading
    ? "loading"
    : filtered.length === 0 && !search
    ? "empty"
    : "data";

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
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        mb={3}>
        <Box>
          <Typography level="h3" fontSize="xl2" fontWeight="lg">
            {t("warehouses.title")}
          </Typography>
          <Typography level="body-sm" color="neutral">
            {t("warehouses.subtitle")}
          </Typography>
        </Box>
        {canCreate && (
          <Button
            startDecorator={<AddRoundedIcon />}
            onClick={handleNew}
            variant="solid"
            color="primary">
            {t("warehouses.actions.new")}
          </Button>
        )}
      </Stack>

      {/* TOOLBAR */}
      <Box sx={{ mb: 3 }}>
        <Input
          placeholder={t("warehouses.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<SearchRoundedIcon />}
          endDecorator={
            search && (
              <IconButton
                size="sm"
                variant="plain"
                onClick={() => setSearch("")}>
                <ClearIcon />
              </IconButton>
            )
          }
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* CONTENT TABLE */}
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
              description={error}
              actions={
                <Button
                  startDecorator={<RestartAltRoundedIcon />}
                  onClick={loadData}
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
              icon={<WarehouseRoundedIcon />}
              title={t("warehouses.empty.title")}
              description={t("warehouses.empty.desc")}
            />
          </Box>
        )}

        {viewState === "data" && (
          <>
            <Table
              stickyHeader
              hoverRow
              sx={{
                "--TableCell-paddingX": "24px",
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
                  <th style={{ width: "30%" }}>
                    {t("warehouses.columns.name")}
                  </th>
                  <th style={{ width: "25%" }}>
                    {t("warehouses.columns.city")}
                  </th>
                  <th style={{ width: "35%" }}>
                    {t("warehouses.columns.description")}
                  </th>
                  <th style={{ width: "10%", textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isHighlighted = r.id === highlightId;
                  return (
                    <tr
                      key={r.id}
                      ref={isHighlighted ? focusedRef : null}
                      onClick={() => handleRowClick(r.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isHighlighted
                          ? "var(--joy-palette-primary-50)"
                          : undefined,
                      }}>
                      <td>
                        <Typography
                          fontWeight="lg"
                          level="title-sm"
                          component={Link}
                          to={`/inventario/bodegas/${r.id}`}
                          sx={{
                            textDecoration: "none",
                            color: "text.primary",
                            "&:hover": {
                              color: "primary.500",
                              textDecoration: "none",
                            },
                          }}>
                          {r.nombre}
                        </Typography>
                      </td>
                      <td>
                        {r.ciudad ? (
                          <Chip size="sm" variant="soft" color="primary">
                            {r.ciudad}
                          </Chip>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          noWrap
                          sx={{ maxWidth: 300, color: "text.secondary" }}>
                          {r.descripcion || "—"}
                        </Typography>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Dropdown>
                          <MenuButton
                            onClick={(e) => e.stopPropagation()} // Evitar navegación al abrir menú
                            slots={{ root: IconButton }}
                            slotProps={{
                              root: {
                                variant: "plain",
                                color: "neutral",
                                size: "sm",
                              },
                            }}>
                            <MoreHorizRoundedIcon />
                          </MenuButton>
                          <Menu placement="bottom-end">
                            {canEdit && (
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(r);
                                }}>
                                <EditRoundedIcon /> {t("common.actions.edit")}
                              </MenuItem>
                            )}
                          </Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {filtered.length === 0 && (
              <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
                <Typography level="h4" color="neutral">
                  🔍 {t("common.no_data_title")}
                </Typography>
                <Typography level="body-md">
                  {t("common.no_data_desc")}
                </Typography>
                <Button
                  variant="soft"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSearch("");
                  }}>
                  {t("common.clear_filters")}
                </Button>
              </Box>
            )}
          </>
        )}
      </Sheet>

      {/* MODAL CREAR/EDITAR */}
      <Modal
        open={openModal}
        onClose={() => !formik.isSubmitting && setOpenModal(false)}>
        <ModalDialog sx={{ width: { xs: "100%", sm: 450 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}>
            <Typography level="h4">
              {editing
                ? t("warehouses.edit_title")
                : t("warehouses.create_title")}
            </Typography>
            <ModalClose
              disabled={formik.isSubmitting}
              onClick={() => setOpenModal(false)}
            />
          </Stack>
          <Divider />

          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} mt={2}>
              <FormControl
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                required>
                <FormLabel>{t("warehouses.form.name")}</FormLabel>
                <Input
                  autoFocus
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("nombre", true)}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <Typography level="body-xs" color="danger">
                    {formik.errors.nombre}
                  </Typography>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>{t("warehouses.form.description")}</FormLabel>
                <Input
                  name="descripcion"
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("descripcion", true)}
                  disabled={formik.isSubmitting}
                />
              </FormControl>

              <FormControl
                error={
                  formik.touched.id_ciudad && Boolean(formik.errors.id_ciudad)
                }
                required>
                <FormLabel>{t("warehouses.form.city")}</FormLabel>
                <Select
                  name="id_ciudad"
                  value={formik.values.id_ciudad}
                  onChange={(_, value) =>
                    formik.setFieldValue("id_ciudad", value)
                  }
                  onBlur={() => formik.setFieldTouched("id_ciudad", true)}
                  placeholder={t("warehouses.form.select_city")}
                  disabled={formik.isSubmitting}>
                  {citiesList.map((city) => (
                    <Option key={city.id} value={String(city.id)}>
                      {city.ciudad}
                    </Option>
                  ))}
                </Select>
                {formik.touched.id_ciudad && formik.errors.id_ciudad && (
                  <Typography level="body-xs" color="danger">
                    {formik.errors.id_ciudad}
                  </Typography>
                )}
              </FormControl>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1}
                mt={1}>
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={() => setOpenModal(false)}
                  disabled={formik.isSubmitting}>
                  {t("common.actions.cancel")}
                </Button>
                <Button type="submit" loading={formik.isSubmitting}>
                  {t("common.actions.save")}
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
