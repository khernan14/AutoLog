// src/components/VehiculosForm/VehiculosModal.jsx
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
import { useTranslation } from "react-i18next";

import { getUbicaciones as defaultGetUbicaciones } from "../../services/VehiculosService";

export const validationSchemaFactory = (t) =>
  yup.object({
    placa: yup
      .string()
      .trim()
      .required(t("vehiculos.modal.validation.placa", "La placa es requerida")),
    marca: yup
      .string()
      .trim()
      .required(t("vehiculos.modal.validation.marca", "La marca es requerida")),
    modelo: yup
      .string()
      .trim()
      .required(
        t("vehiculos.modal.validation.modelo", "El modelo es requerido")
      ),
    estado: yup
      .string()
      .required(
        t("vehiculos.modal.validation.estado", "El estado es requerido")
      ),
    id_ubicacion_actual: yup
      .number()
      .typeError(
        t("vehiculos.modal.validation.ubicacion", "La ubicación es requerida")
      )
      .required(
        t("vehiculos.modal.validation.ubicacion", "La ubicación es requerida")
      ),
  });

/**
 * VehiculoModal
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: async (values) => {}
 * - ubicaciones?: array (optional)
 * - loadingUbicaciones?: boolean (optional)
 * - fetchUbicaciones?: function to load ubicaciones
 * - saving?: boolean (saving state)
 * - initialValues?: object
 * - title?: string (override)
 */
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
  title, // optional override
}) {
  const { t } = useTranslation();

  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);

  const useExternalUbics = Array.isArray(ubicacionesProp);
  const isUbicacionesLoading =
    typeof loadingUbicacionesProp === "boolean"
      ? loadingUbicacionesProp
      : loadingUbicaciones;

  // cargar ubicaciones si no vienen por props
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

  // estados permitidos (coinciden con ENUM DB)
  const STATE_OPTIONS = useMemo(
    () => ["Disponible", "En Uso", "En Mantenimiento", "Reservado", "Inactivo"],
    []
  );

  const validationSchema = useMemo(() => validationSchemaFactory(t), [t]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit?.(values);
      } catch (err) {
        // si el back devuelve errores, puedes mapearlos aquí usando helpers.setErrors(...)
        // mostramos error en aria-live (si necesitas)
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const isBusy = saving || formik.isSubmitting;
  const canClose = !isBusy;

  // opciones de ubicaciones mapeadas (id,value,label)
  const ubicOptions = useMemo(() => {
    const arr = useExternalUbics ? ubicacionesProp || [] : ubicaciones;
    return Array.isArray(arr) ? arr : [];
  }, [useExternalUbics, ubicacionesProp, ubicaciones]);

  // pequeña helper para disabled close cuando isBusy
  const handleClose = () => {
    if (!canClose) return;
    onClose?.();
  };

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
              (initialValues?.id
                ? t("vehiculos.modal.title_edit", "Editar vehículo")
                : t("vehiculos.modal.title_add", "Agregar vehículo"))}
          </Typography>
          <ModalClose disabled={!canClose} onClick={handleClose} />
        </Sheet>

        {/* Contenido scrollable */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
          }}>
          <Typography level="body-sm" sx={{ opacity: 0.8, mb: 1 }}>
            {t(
              "vehiculos.modal.required_note",
              "Los campos marcados con * son obligatorios."
            )}
          </Typography>

          {/* Grid responsive: 1 col en móvil, 2 cols en sm+ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 2,
            }}>
            {/* Placa */}
            <FormControl
              required
              error={formik.touched.placa && !!formik.errors.placa}>
              <FormLabel>
                {t("vehiculos.modal.labels.placa", "Placa")}
              </FormLabel>
              <Input
                name="placa"
                value={formik.values.placa}
                onChange={formik.handleChange}
                onBlur={() => formik.setFieldTouched("placa", true)}
                placeholder={t(
                  "vehiculos.modal.placeholders.placa",
                  "Ej. ABC123"
                )}
                disabled={isBusy}
                autoFocus
                inputProps={{
                  "aria-label": t("vehiculos.modal.aria.placa", "Placa"),
                }}
              />
              {formik.touched.placa && formik.errors.placa && (
                <FormHelperText
                  color="danger"
                  role="alert"
                  aria-live="assertive">
                  {formik.errors.placa}
                </FormHelperText>
              )}
            </FormControl>

            {/* Marca */}
            <FormControl
              required
              error={formik.touched.marca && !!formik.errors.marca}>
              <FormLabel>
                {t("vehiculos.modal.labels.marca", "Marca")}
              </FormLabel>
              <Input
                name="marca"
                value={formik.values.marca}
                onChange={formik.handleChange}
                onBlur={() => formik.setFieldTouched("marca", true)}
                placeholder={t(
                  "vehiculos.modal.placeholders.marca",
                  "Ej. Toyota"
                )}
                disabled={isBusy}
                inputProps={{
                  "aria-label": t("vehiculos.modal.aria.marca", "Marca"),
                }}
              />
              {formik.touched.marca && formik.errors.marca && (
                <FormHelperText
                  color="danger"
                  role="alert"
                  aria-live="assertive">
                  {formik.errors.marca}
                </FormHelperText>
              )}
            </FormControl>

            {/* Modelo */}
            <FormControl
              required
              error={formik.touched.modelo && !!formik.errors.modelo}>
              <FormLabel>
                {t("vehiculos.modal.labels.modelo", "Modelo")}
              </FormLabel>
              <Input
                name="modelo"
                value={formik.values.modelo}
                onChange={formik.handleChange}
                onBlur={() => formik.setFieldTouched("modelo", true)}
                placeholder={t(
                  "vehiculos.modal.placeholders.modelo",
                  "Ej. Corolla"
                )}
                disabled={isBusy}
                inputProps={{
                  "aria-label": t("vehiculos.modal.aria.modelo", "Modelo"),
                }}
              />
              {formik.touched.modelo && formik.errors.modelo && (
                <FormHelperText
                  color="danger"
                  role="alert"
                  aria-live="assertive">
                  {formik.errors.modelo}
                </FormHelperText>
              )}
            </FormControl>

            {/* Estado */}
            <FormControl
              required
              error={formik.touched.estado && !!formik.errors.estado}>
              <FormLabel>
                {t("vehiculos.modal.labels.estado", "Estado")}
              </FormLabel>
              <Select
                value={formik.values.estado || null}
                onChange={(_, value) => formik.setFieldValue("estado", value)}
                onBlur={() => formik.setFieldTouched("estado", true)}
                disabled={isBusy}
                placeholder={t(
                  "vehiculos.modal.placeholders.estado",
                  "Selecciona estado"
                )}
                aria-label={t("vehiculos.modal.aria.estado", "Estado")}>
                {STATE_OPTIONS.map((s) => (
                  <Option key={s} value={s}>
                    {t(
                      `vehiculos.states.${s
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`,
                      s
                    )}
                  </Option>
                ))}
              </Select>
              {formik.touched.estado && formik.errors.estado && (
                <FormHelperText
                  color="danger"
                  role="alert"
                  aria-live="assertive">
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
              }>
              <FormLabel>
                {t("vehiculos.modal.labels.ubicacion", "Ubicación actual")}
              </FormLabel>
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
                onBlur={() =>
                  formik.setFieldTouched("id_ubicacion_actual", true)
                }
                disabled={isBusy || isUbicacionesLoading}
                placeholder={
                  isUbicacionesLoading
                    ? t(
                        "vehiculos.modal.loading_ubicaciones",
                        "Cargando ubicaciones…"
                      )
                    : t(
                        "vehiculos.modal.placeholders.ubicacion",
                        "Selecciona ubicación"
                      )
                }
                aria-label={t(
                  "vehiculos.modal.aria.ubicacion",
                  "Ubicación actual"
                )}
                endDecorator={
                  isUbicacionesLoading ? <CircularProgress size="sm" /> : null
                }>
                {ubicOptions.length === 0 && !isUbicacionesLoading ? (
                  <Option value={""} disabled>
                    {t(
                      "vehiculos.modal.no_ubicaciones",
                      "No hay ubicaciones disponibles"
                    )}
                  </Option>
                ) : (
                  ubicOptions.map((u) => (
                    <Option key={u.id} value={u.id}>
                      {u.nombre_ubicacion}
                    </Option>
                  ))
                )}
              </Select>
              {formik.touched.id_ubicacion_actual &&
                formik.errors.id_ubicacion_actual && (
                  <FormHelperText
                    color="danger"
                    role="alert"
                    aria-live="assertive">
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
            onClick={handleClose}
            disabled={!canClose}>
            {t("vehiculos.modal.cancel", "Cancelar")}
          </Button>
          <Button type="submit" loading={isBusy} aria-disabled={isBusy}>
            {initialValues?.id
              ? t("vehiculos.modal.update", "Actualizar")
              : t("vehiculos.modal.save", "Guardar")}
          </Button>
        </Stack>
      </Sheet>
    </Drawer>
  );
}
