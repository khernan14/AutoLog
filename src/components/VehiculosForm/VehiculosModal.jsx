import { useState, useEffect, useMemo } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
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
  // Si ya tienes ubicaciones desde el padre, pásalas aquí y evitamos fetch interno.
  ubicaciones: ubicacionesProp,
  // Si quieres controlar loading desde arriba, pásalo; si no, manejamos interno.
  loadingUbicaciones: loadingUbicacionesProp,
  // Por si quieres inyectar tu propio fetch:
  fetchUbicaciones = defaultGetUbicaciones,
  // Para deshabilitar controles mientras guardas desde el padre:
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
    validateOnChange: false, // menos ruido
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit?.(values);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const isBusy = saving || formik.isSubmitting;
  const canClose = !isBusy; // si quieres bloquear el cierre mientras guarda

  // Mapea ubicaciones a opciones (memo)
  const ubicOptions = useMemo(() => {
    return (useExternalUbics ? ubicacionesProp : ubicaciones) || [];
  }, [useExternalUbics, ubicacionesProp, ubicaciones]);

  return (
    <Modal open={!!open} onClose={canClose ? onClose : undefined}>
      <ModalDialog
        layout="center"
        variant="outlined"
        sx={{
          width: "min(760px, 92vw)",
          borderRadius: "lg",
          boxShadow: "lg",
          bgcolor: "background.body",
        }}
      >
        <ModalClose disabled={!canClose} />
        <DialogTitle>
          {title || (initialValues?.id ? "Editar vehículo" : "Agregar vehículo")}
        </DialogTitle>
        <DialogContent>
          <Typography level="body-sm" sx={{ opacity: 0.8, mb: 1 }}>
            Los campos marcados con * son obligatorios.
          </Typography>

          <form onSubmit={formik.handleSubmit} noValidate>
            {/* Grid responsive: 1 col en móvil, 2 cols en sm+ */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              {/* Placa */}
              <FormControl
                required
                sx={{ gridColumn: { sm: "1 / -1" } }}
                error={formik.touched.placa && !!formik.errors.placa}
              >
                <FormLabel>Placa *</FormLabel>
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
              >
                <FormLabel>Marca *</FormLabel>
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
              >
                <FormLabel>Modelo *</FormLabel>
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
              >
                <FormLabel>Estado *</FormLabel>
                <Select
                  value={formik.values.estado || null}
                  onChange={(_, value) => formik.setFieldValue("estado", value)}
                  onBlur={formik.handleBlur}
                  disabled={isBusy}
                  placeholder="Selecciona estado"
                >
                  <Option value="Disponible">Disponible</Option>
                  <Option value="En Uso">En Uso</Option>
                  {/* <Option value="En mantenimiento">En mantenimiento</Option> */}
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
              >
                <FormLabel>Ubicación actual *</FormLabel>
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
                    isUbicacionesLoading ? (
                      <CircularProgress size="sm" />
                    ) : null
                  }
                >
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

            <DialogActions sx={{ mt: 2 }}>
              <Button
                variant="plain"
                color="neutral"
                onClick={onClose}
                disabled={!canClose}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={isBusy}>
                {initialValues?.id ? "Actualizar" : "Guardar"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
