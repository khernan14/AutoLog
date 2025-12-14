// src/pages/Administration/Locations/Parkings.jsx
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
import LocalParkingRoundedIcon from "@mui/icons-material/LocalParkingRounded"; // Icono empty
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";

// Hooks & Context
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import StatusCard from "../../../components/common/StatusCard";

// Services
import {
  getParkings,
  addParking,
  updateParking,
  deleteParking,
} from "../../../services/ParkingServices";
import { getCities } from "../../../services/LocationServices";

// --- Validaciones ---
const validationSchema = yup.object({
  nombre_ubicacion: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, "Mínimo 2 caracteres")
    .required("Requerido"),
  id_ciudad: yup.string().required("Debes seleccionar una ciudad"),
});

export default function Parkings() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  // --- Permisos ---
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_estacionamientos");
  const canCreate = can("crear_estacionamiento");
  const canEdit = can("editar_estacionamiento");
  const canDelete = can("eliminar_estacionamiento");

  // --- Estado ---
  const [parkings, setParkings] = useState([]);
  const [citiesList, setCitiesList] = useState([]); // Para el select
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingParking, setEditingParking] = useState(null);

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
      // Cargamos Parkings y Ciudades en paralelo
      const [parkingsData, citiesData] = await Promise.all([
        getParkings(),
        getCities(),
      ]);

      setParkings(Array.isArray(parkingsData) ? parkingsData : []);
      setCitiesList(Array.isArray(citiesData) ? citiesData : []);
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("locations.parkings.errors.load_failed")
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
    return parkings.filter((p) => {
      const name = (p.nombre_ubicacion || "").toLowerCase();
      // Asumiendo que el backend devuelve el nombre de la ciudad
      const cityName = (p.ciudad || p.nombre_ciudad || "").toLowerCase();
      return name.includes(s) || cityName.includes(s);
    });
  }, [parkings, search]);

  // --- Acciones ---
  const handleNew = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditingParking(null);
    setOpenModal(true);
  };

  const handleEdit = (parking) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditingParking(parking);
    setOpenModal(true);
  };

  const handleDelete = async (parking) => {
    if (!canDelete) return showToast(t("common.no_permission"), "warning");

    const res = await Swal.fire({
      title: t("common.confirm_delete"),
      text: t("locations.parkings.delete_confirm", {
        name: parking.nombre_ubicacion,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: t("common.actions.delete"),
      cancelButtonText: t("common.actions.cancel"),
    });

    if (!res.isConfirmed) return;

    try {
      const r = await deleteParking(parking.id);
      if (r && !r.error) {
        showToast(t("locations.parkings.success.deleted"), "success");
        setParkings((prev) => prev.filter((p) => p.id !== parking.id));
      } else {
        showToast(t("locations.parkings.errors.delete_failed"), "danger");
      }
    } catch {
      showToast(t("locations.parkings.errors.delete_failed"), "danger");
    }
  };

  // --- Formulario (Formik) ---
  const formik = useFormik({
    initialValues: { nombre_ubicacion: "", id_ciudad: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        nombre_ubicacion: values.nombre_ubicacion.trim(),
        id_ciudad: values.id_ciudad,
      };

      try {
        if (editingParking) {
          // Update
          const r = await updateParking(editingParking.id, {
            id: editingParking.id,
            ...payload,
          });
          if (r && !r.error) {
            showToast(t("locations.parkings.success.updated"), "success");
            setOpenModal(false);
            loadData();
          } else {
            showToast(t("locations.parkings.errors.update_failed"), "danger");
          }
        } else {
          // Create
          const r = await addParking(payload);
          if (r && !r.error) {
            showToast(t("locations.parkings.success.created"), "success");
            setOpenModal(false);
            loadData();
          } else {
            showToast(t("locations.parkings.errors.create_failed"), "danger");
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
        nombre_ubicacion: editingParking?.nombre_ubicacion || "",
        id_ciudad: editingParking?.id_ciudad
          ? String(editingParking.id_ciudad)
          : "",
      });
      formik.setTouched({});
    }
  }, [openModal, editingParking]);

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
            {t("locations.parkings.title")}
          </Typography>
          <Typography level="body-sm" color="neutral">
            {t("locations.parkings.subtitle")}
          </Typography>
        </Box>
        {canCreate && (
          <Button
            startDecorator={<AddRoundedIcon />}
            onClick={handleNew}
            variant="solid"
            color="primary">
            {t("locations.parkings.actions.new")}
          </Button>
        )}
      </Stack>

      {/* TOOLBAR */}
      <Box sx={{ mb: 3 }}>
        <Input
          placeholder={t("locations.parkings.search_placeholder")}
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
              icon={<LocalParkingRoundedIcon />}
              title={t("locations.parkings.empty.title")}
              description={t("locations.parkings.empty.desc")}
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
                  {t("locations.parkings.columns.name")}
                </th>
                <th style={{ width: "40%" }}>
                  {t("locations.parkings.columns.city")}
                </th>
                <th style={{ width: "20%", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((parking) => (
                <tr key={parking.id}>
                  <td>
                    <Typography fontWeight="md">
                      {parking.nombre_ubicacion}
                    </Typography>
                  </td>
                  <td>
                    {parking.ciudad || parking.nombre_ciudad ? (
                      <Chip size="sm" variant="soft" color="primary">
                        {parking.ciudad || parking.nombre_ciudad}
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
                          <MenuItem onClick={() => handleEdit(parking)}>
                            <EditRoundedIcon /> {t("common.actions.edit")}
                          </MenuItem>
                        )}
                        {canDelete && (
                          <MenuItem
                            onClick={() => handleDelete(parking)}
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
                      {t("locations.parkings.empty.no_matches")}
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
              {editingParking
                ? t("locations.parkings.edit_title")
                : t("locations.parkings.create_title")}
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
                error={
                  formik.touched.nombre_ubicacion &&
                  Boolean(formik.errors.nombre_ubicacion)
                }
                required>
                <FormLabel>{t("locations.parkings.form.name")}</FormLabel>
                <Input
                  autoFocus
                  name="nombre_ubicacion"
                  value={formik.values.nombre_ubicacion}
                  onChange={formik.handleChange}
                  onBlur={() =>
                    formik.setFieldTouched("nombre_ubicacion", true)
                  }
                  disabled={formik.isSubmitting}
                />
                {formik.touched.nombre_ubicacion &&
                  formik.errors.nombre_ubicacion && (
                    <Typography level="body-xs" color="danger">
                      {formik.errors.nombre_ubicacion}
                    </Typography>
                  )}
              </FormControl>

              <FormControl
                error={
                  formik.touched.id_ciudad && Boolean(formik.errors.id_ciudad)
                }
                required>
                <FormLabel>{t("locations.parkings.form.city")}</FormLabel>
                <Select
                  name="id_ciudad"
                  value={formik.values.id_ciudad}
                  onChange={(_, value) =>
                    formik.setFieldValue("id_ciudad", value)
                  }
                  onBlur={() => formik.setFieldTouched("id_ciudad", true)}
                  placeholder={t("locations.parkings.form.select_city")}
                  disabled={formik.isSubmitting}>
                  {citiesList.map((city) => (
                    <Option key={city.id} value={String(city.id)}>
                      {city.nombre || city.ciudad}
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
