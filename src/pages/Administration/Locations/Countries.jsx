import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next"; // 👈 i18n
import { useFormik } from "formik";
import * as yup from "yup";
import Swal from "sweetalert2";

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
  Tooltip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded"; // Icono para empty state
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";

// Hooks & Context
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import useIsMobile from "@/hooks/useIsMobile";
import StatusCard from "@/components/common/StatusCard";

// Services
import {
  getCountries,
  addCountry,
  updateCountry,
  deleteCountry,
} from "../../../services/LocationServices";

// --- Validaciones ---
const validationSchema = yup.object({
  nombre: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, "Mínimo 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .required("Requerido"),
});

export default function Countries() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isMobile = useIsMobile(); // Hook para detectar móvil

  // --- Permisos ---
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_paises");
  const canCreate = can("crear_paises");
  const canEdit = can("editar_paises");
  const canDelete = can("eliminar_paises") || canEdit; // Fallback

  // --- Estado ---
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);

  // --- Carga ---
  const loadCountries = useCallback(async () => {
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
      const data = await getCountries();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("locations.countries.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, t]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // --- Filtrado ---
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return countries.filter((c) => (c.nombre || "").toLowerCase().includes(s));
  }, [countries, search]);

  // --- Acciones ---
  const handleNew = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditingCountry(null);
    setOpenModal(true);
  };

  const handleEdit = (country) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditingCountry(country);
    setOpenModal(true);
  };

  const handleDelete = async (country) => {
    if (!canDelete) return showToast(t("common.no_permission"), "warning");

    const res = await Swal.fire({
      title: t("common.confirm_delete"),
      text: t("locations.countries.delete_confirm", { name: country.nombre }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: t("common.actions.delete"),
      cancelButtonText: t("common.actions.cancel"),
    });

    if (!res.isConfirmed) return;

    try {
      const r = await deleteCountry(country.id);
      if (r && !r.error) {
        showToast(t("locations.countries.success.deleted"), "success");
        setCountries((prev) => prev.filter((c) => c.id !== country.id));
      } else {
        showToast(t("locations.countries.errors.delete_failed"), "danger");
      }
    } catch {
      showToast(t("locations.countries.errors.delete_failed"), "danger");
    }
  };

  // --- Formulario (Formik) ---
  const formik = useFormik({
    initialValues: { nombre: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = { ...values, nombre: values.nombre.trim() };

      try {
        if (editingCountry) {
          // Update
          const r = await updateCountry(editingCountry.id, {
            id: editingCountry.id,
            ...payload,
          });
          if (r && !r.error) {
            showToast(t("locations.countries.success.updated"), "success");
            setOpenModal(false);
            loadCountries();
          } else {
            showToast(t("locations.countries.errors.update_failed"), "danger");
          }
        } else {
          // Create
          const r = await addCountry(payload);
          if (r && !r.error) {
            showToast(t("locations.countries.success.created"), "success");
            setOpenModal(false);
            loadCountries();
          } else {
            showToast(t("locations.countries.errors.create_failed"), "danger");
          }
        }
      } catch (e) {
        showToast(t("common.unknown_error"), "danger");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Reset form al abrir/cerrar
  useEffect(() => {
    if (openModal) {
      formik.setValues({ nombre: editingCountry?.nombre || "" });
      formik.setTouched({});
    }
  }, [openModal, editingCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Render ---
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
        maxWidth: 1000,
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
            {t("locations.countries.title")}
          </Typography>
          <Typography level="body-sm" color="neutral">
            {t("locations.countries.subtitle")}
          </Typography>
        </Box>
        {canCreate && (
          <Button
            startDecorator={<AddRoundedIcon />}
            onClick={handleNew}
            variant="solid"
            color="primary">
            {t("locations.countries.actions.new")}
          </Button>
        )}
      </Stack>

      {/* TOOLBAR */}
      <Box sx={{ mb: 3 }}>
        <Input
          placeholder={t("locations.countries.search_placeholder")}
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

      {/* CONTENT */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          overflow: "hidden",
          bgcolor: "background.surface",
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
                  onClick={loadCountries}
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
              icon={<PublicRoundedIcon />}
              title={t("locations.countries.empty.title")}
              description={t("locations.countries.empty.desc")}
            />
          </Box>
        )}

        {viewState === "data" && (
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
                <th>{t("locations.countries.columns.name")}</th>
                <th style={{ width: 100, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((country) => (
                <tr key={country.id}>
                  <td>
                    <Typography fontWeight="md">{country.nombre}</Typography>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Dropdown>
                      <MenuButton
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
                          <MenuItem onClick={() => handleEdit(country)}>
                            <EditRoundedIcon /> {t("common.actions.edit")}
                          </MenuItem>
                        )}
                        {/* {canDelete && (
                          <MenuItem
                            onClick={() => handleDelete(country)}
                            color="danger">
                            <DeleteOutlineRoundedIcon />{" "}
                            {t("common.actions.delete")}
                          </MenuItem>
                        )} */}
                      </Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{ textAlign: "center", padding: "40px" }}>
                    <Typography color="neutral">
                      {t("locations.countries.empty.no_matches")}
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Sheet>

      {/* MODAL CREAR/EDITAR */}
      <Modal
        open={openModal}
        onClose={() => !formik.isSubmitting && setOpenModal(false)}>
        <ModalDialog sx={{ width: { xs: "100%", sm: 400 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}>
            <Typography level="h4">
              {editingCountry
                ? t("locations.countries.edit_title")
                : t("locations.countries.create_title")}
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
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}>
                <FormLabel>{t("locations.countries.form.name")}</FormLabel>
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
