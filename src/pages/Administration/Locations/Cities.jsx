// src/pages/Administration/Locations/Cities.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  Select,
  Option,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Chip,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded"; // Icono empty
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";

// Hooks & Context
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import StatusCard from "../../../components/common/StatusCard";

// Services
import {
  getCities,
  getCountries,
  addCity,
  updateCity,
  deleteCity,
} from "../../../services/LocationServices";

// --- Validaciones ---
const validationSchema = yup.object({
  nombre: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, "Mínimo 2 caracteres")
    .required("Requerido"),
  id_pais: yup.string().required("Debes seleccionar un país"),
});

export default function Cities() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  // --- Permisos ---
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_ciudades");
  const canCreate = can("crear_ciudades");
  const canEdit = can("editar_ciudades");
  const canDelete = can("eliminar_ciudades") || canEdit;

  // --- Estado ---
  const [cities, setCities] = useState([]);
  const [countriesList, setCountriesList] = useState([]); // Para el select
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

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
      // Cargamos Ciudades y Países en paralelo
      const [citiesData, countriesData] = await Promise.all([
        getCities(),
        getCountries(),
      ]);

      setCities(Array.isArray(citiesData) ? citiesData : []);
      setCountriesList(Array.isArray(countriesData) ? countriesData : []);
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("locations.cities.errors.load_failed")
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
    const s = search.toLowerCase();
    return cities.filter((c) => {
      const cityName = (c.nombre || c.ciudad || "").toLowerCase();
      // Asumiendo que el backend devuelve el nombre del país en 'pais_nombre' o similar,
      // ajusta según tu API. Si no, filtra solo por ciudad.
      const countryName = (c.pais || c.pais_nombre || "").toLowerCase();
      return cityName.includes(s) || countryName.includes(s);
    });
  }, [cities, search]);

  // --- Acciones ---
  const handleNew = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditingCity(null);
    setOpenModal(true);
  };

  const handleEdit = (city) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditingCity(city);
    setOpenModal(true);
  };

  const handleDelete = async (city) => {
    if (!canDelete) return showToast(t("common.no_permission"), "warning");

    const res = await Swal.fire({
      title: t("common.confirm_delete"),
      text: t("locations.cities.delete_confirm", { name: city.nombre }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: t("common.actions.delete"),
      cancelButtonText: t("common.actions.cancel"),
    });

    if (!res.isConfirmed) return;

    try {
      const r = await deleteCity(city.id);
      if (r && !r.error) {
        showToast(t("locations.cities.success.deleted"), "success");
        setCities((prev) => prev.filter((c) => c.id !== city.id));
      } else {
        showToast(t("locations.cities.errors.delete_failed"), "danger");
      }
    } catch {
      showToast(t("locations.cities.errors.delete_failed"), "danger");
    }
  };

  // --- Formulario (Formik) ---
  const formik = useFormik({
    initialValues: { nombre: "", id_pais: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        nombre: values.nombre.trim(),
        id_pais: values.id_pais,
      };

      try {
        if (editingCity) {
          // Update
          const r = await updateCity(editingCity.id, {
            id: editingCity.id,
            ...payload,
          });
          if (r && !r.error) {
            showToast(t("locations.cities.success.updated"), "success");
            setOpenModal(false);
            loadData(); // Recargar para actualizar nombres de país si cambiaron
          } else {
            showToast(t("locations.cities.errors.update_failed"), "danger");
          }
        } else {
          // Create
          const r = await addCity(payload);
          if (r && !r.error) {
            showToast(t("locations.cities.success.created"), "success");
            setOpenModal(false);
            loadData();
          } else {
            showToast(t("locations.cities.errors.create_failed"), "danger");
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
      formik.setValues({
        nombre: editingCity?.nombre || editingCity?.ciudad || "", // Ajusta según tu API
        id_pais: editingCity?.id_pais ? String(editingCity.id_pais) : "",
      });
      formik.setTouched({});
    }
  }, [openModal, editingCity]); // eslint-disable-line react-hooks/exhaustive-deps

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
            {t("locations.cities.title")}
          </Typography>
          <Typography level="body-sm" color="neutral">
            {t("locations.cities.subtitle")}
          </Typography>
        </Box>
        {canCreate && (
          <Button
            startDecorator={<AddRoundedIcon />}
            onClick={handleNew}
            variant="solid"
            color="primary">
            {t("locations.cities.actions.new")}
          </Button>
        )}
      </Stack>

      {/* TOOLBAR */}
      <Box sx={{ mb: 3 }}>
        <Input
          placeholder={t("locations.cities.search_placeholder")}
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
              icon={<LocationCityRoundedIcon />}
              title={t("locations.cities.empty.title")}
              description={t("locations.cities.empty.desc")}
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
                <th style={{ width: "40%" }}>
                  {t("locations.cities.columns.name")}
                </th>
                <th style={{ width: "40%" }}>
                  {t("locations.cities.columns.country")}
                </th>
                <th style={{ width: "20%", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((city) => (
                <tr key={city.id}>
                  <td>
                    <Typography fontWeight="md">
                      {city.nombre || city.ciudad}
                    </Typography>
                  </td>
                  <td>
                    {city.pais || city.pais_nombre ? (
                      <Chip size="sm" variant="soft" color="neutral">
                        {city.pais || city.pais_nombre}
                      </Chip>
                    ) : (
                      "—"
                    )}
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
                          <MenuItem onClick={() => handleEdit(city)}>
                            <EditRoundedIcon /> {t("common.actions.edit")}
                          </MenuItem>
                        )}
                        {canDelete && (
                          <MenuItem
                            onClick={() => handleDelete(city)}
                            color="danger">
                            <DeleteOutlineRoundedIcon />{" "}
                            {t("common.actions.delete")}
                          </MenuItem>
                        )}
                      </Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "center", padding: "40px" }}>
                    <Typography color="neutral">
                      {t("locations.cities.empty.no_matches")}
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
              {editingCity
                ? t("locations.cities.edit_title")
                : t("locations.cities.create_title")}
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
                <FormLabel>{t("locations.cities.form.name")}</FormLabel>
                <Input
                  autoFocus
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  // 🟢 Corrección del "Enter key crash":
                  onBlur={() => formik.setFieldTouched("nombre", true)}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <Typography level="body-xs" color="danger">
                    {formik.errors.nombre}
                  </Typography>
                )}
              </FormControl>

              <FormControl
                error={formik.touched.id_pais && Boolean(formik.errors.id_pais)}
                required>
                <FormLabel>{t("locations.cities.form.country")}</FormLabel>
                <Select
                  name="id_pais"
                  value={formik.values.id_pais}
                  onChange={(_, value) =>
                    formik.setFieldValue("id_pais", value)
                  }
                  // 🟢 Corrección del "Enter key crash" para Select:
                  onBlur={() => formik.setFieldTouched("id_pais", true)}
                  placeholder={t("locations.cities.form.select_country")}
                  disabled={formik.isSubmitting}>
                  {countriesList.map((country) => (
                    <Option key={country.id} value={String(country.id)}>
                      {country.nombre}
                    </Option>
                  ))}
                </Select>
                {formik.touched.id_pais && formik.errors.id_pais && (
                  <Typography level="body-xs" color="danger">
                    {formik.errors.id_pais}
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
