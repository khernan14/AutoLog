import { useState, useEffect, useMemo } from "react";
import Drawer from "@mui/joy/Drawer";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import ModalClose from "@mui/joy/ModalClose";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Divider from "@mui/joy/Divider";
import { useFormik } from "formik";
import * as yup from "yup";

import { getUbicaciones as defaultGetUbicaciones } from "../../services/VehiculosService";

const validationSchema = yup.object({
  placa: yup.string().trim().required("La placa es requerida"),
  marca: yup.string().trim().required("La marca es requerida"),
  modelo: yup.string().trim().required("El modelo es requerido"),
  estado: yup.string().required("El estado es requerido"),
  id_ubicacion_actual: yup
    .number()
    .typeError("La ubicación es requerida")
    .required("La ubicación es requerida"),
});

export default function VehiculoModal({
  open,
  onClose,
  onSubmit,
  ubicaciones: ubicacionesProp,
  loadingUbicaciones: loadingUbicacionesProp,
  fetchUbicaciones = defaultGetUbicaciones,
  saving = false,
  initialValues = {
    id: null,
    placa: "",
    marca: "",
    modelo: "",
    estado: "Disponible",
    id_ubicacion_actual: null,
  },
  title, // opcional: sobreescribe el título
}) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);

  const useExternalUbics = Array.isArray(ubicacionesProp);
  const isUbicacionesLoading =
    typeof loadingUbicacionesProp === "boolean"
      ? loadingUbicacionesProp
      : loadingUbicaciones;

  // Cargar ubicaciones si no vienen por props
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (useExternalUbics) {
        setUbicaciones(ubicacionesProp || []);
        setLoadingUbicaciones(false);
        return;
      }
      setLoadingUbicaciones(true);
      try {
        const data = await fetchUbicaciones();
        if (!cancelled) setUbicaciones(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setUbicaciones([]);
      } finally {
        if (!cancelled) setLoadingUbicaciones(false);
      }
    }
    if (open) load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, useExternalUbics, ubicacionesProp]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit?.(values);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const isBusy = saving || formik.isSubmitting;
  const canClose = !isBusy;

  // Mapea ubicaciones a opciones (memo)
  const ubicOptions = useMemo(() => {
    return (useExternalUbics ? ubicacionesProp : ubicaciones) || [];
  }, [useExternalUbics, ubicacionesProp, ubicaciones]);

  return (
    <Drawer
      anchor="right"
      size="md"
      variant="plain"
      open={!!open}
      onClose={canClose ? onClose : undefined}
      slotProps={{
        content: {
          sx: {
            bgcolor: "transparent",
            p: { md: 3, sm: 0, xs: 0 },
            boxShadow: "none",
          },
        },
      }}>
      <Sheet
        component="form"
        onSubmit={formik.handleSubmit}
        variant="outlined"
        sx={{
          borderRadius: { xs: 0, md: "md" },
          width: { xs: "100%", sm: 760 },
          maxWidth: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.body",
          boxShadow: "lg",
          overflow: "hidden",
        }}>
        {/* Header */}
        <Sheet
          variant="plain"
          sx={{
            p: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <Typography level="title-lg">
            {title ||
              (initialValues?.id ? "Editar vehículo" : "Agregar vehículo")}
          </Typography>
          <ModalClose disabled={!canClose} />
        </Sheet>

        {/* Contenido scrollable */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 1.5,
          }}>
          <Typography level="body-sm" sx={{ opacity: 0.8, mb: 1 }}>
            Los campos marcados con * son obligatorios.
          </Typography>

          {/* Grid responsive: 1 col en móvil, 2 cols en sm+ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr", // siempre UNA sola columna
              gap: 1.5,
            }}>
            {/* Placa */}
            <FormControl
              required
              error={formik.touched.placa && !!formik.errors.placa}
              sx={{ width: "100%" }}>
              <FormLabel>Placa</FormLabel>
              <Input
                name="placa"
                value={formik.values.placa}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ej. ABC123"
                disabled={isBusy}
                autoFocus
              />
              {formik.touched.placa && formik.errors.placa && (
                <FormHelperText color="danger">
                  {formik.errors.placa}
                </FormHelperText>
              )}
            </FormControl>

            {/* Marca */}
            <FormControl
              required
              error={formik.touched.marca && !!formik.errors.marca}
              sx={{ width: "100%" }}>
              <FormLabel>Marca</FormLabel>
              <Input
                name="marca"
                value={formik.values.marca}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ej. Toyota"
                disabled={isBusy}
              />
              {formik.touched.marca && formik.errors.marca && (
                <FormHelperText color="danger">
                  {formik.errors.marca}
                </FormHelperText>
              )}
            </FormControl>

            {/* Modelo */}
            <FormControl
              required
              error={formik.touched.modelo && !!formik.errors.modelo}
              sx={{ width: "100%" }}>
              <FormLabel>Modelo</FormLabel>
              <Input
                name="modelo"
                value={formik.values.modelo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ej. Corolla"
                disabled={isBusy}
              />
              {formik.touched.modelo && formik.errors.modelo && (
                <FormHelperText color="danger">
                  {formik.errors.modelo}
                </FormHelperText>
              )}
            </FormControl>

            {/* Estado */}
            <FormControl
              required
              error={formik.touched.estado && !!formik.errors.estado}
              sx={{ width: "100%" }}>
              <FormLabel>Estado</FormLabel>
              <Select
                value={formik.values.estado || null}
                onChange={(_, value) => formik.setFieldValue("estado", value)}
                onBlur={formik.handleBlur}
                disabled={isBusy}
                placeholder="Selecciona estado">
                <Option value="Disponible">Disponible</Option>
                <Option value="En Uso">En Uso</Option>
              </Select>
              {formik.touched.estado && formik.errors.estado && (
                <FormHelperText color="danger">
                  {formik.errors.estado}
                </FormHelperText>
              )}
            </FormControl>

            {/* Ubicación */}
            <FormControl
              required
              error={
                formik.touched.id_ubicacion_actual &&
                !!formik.errors.id_ubicacion_actual
              }
              sx={{ width: "100%" }}>
              <FormLabel>Ubicación actual</FormLabel>
              <Select
                value={
                  formik.values.id_ubicacion_actual !== null
                    ? formik.values.id_ubicacion_actual
                    : null
                }
                onChange={(_, value) =>
                  formik.setFieldValue(
                    "id_ubicacion_actual",
                    typeof value === "string" ? Number(value) : value
                  )
                }
                onBlur={formik.handleBlur}
                disabled={isBusy || isUbicacionesLoading}
                placeholder={
                  isUbicacionesLoading
                    ? "Cargando ubicaciones…"
                    : "Selecciona ubicación"
                }
                endDecorator={
                  isUbicacionesLoading ? <CircularProgress size="sm" /> : null
                }>
                {ubicOptions.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.nombre_ubicacion}
                  </Option>
                ))}
              </Select>
              {formik.touched.id_ubicacion_actual &&
                formik.errors.id_ubicacion_actual && (
                  <FormHelperText color="danger">
                    {formik.errors.id_ubicacion_actual}
                  </FormHelperText>
                )}
            </FormControl>
          </Box>
        </Box>

        <Divider />

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ p: 1.5 }}>
          <Button
            variant="plain"
            color="neutral"
            onClick={onClose}
            disabled={!canClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isBusy}>
            {initialValues?.id ? "Actualizar" : "Guardar"}
          </Button>
        </Stack>
      </Sheet>
    </Drawer>
  );
}
