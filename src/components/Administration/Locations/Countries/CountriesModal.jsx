import { useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
} from "@mui/joy";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  nombre: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, "Debe tener al menos 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .required("El nombre del país es requerido"),
});

export default function CountriesModal({
  open,
  onClose,
  onSubmit,
  initialValues = { id: null, nombre: "" },
  saving, // opcional: si el padre quiere forzar el loading externo
}) {
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        // Enviamos con nombre ya "trimeado"
        await onSubmit?.({ ...values, nombre: values.nombre.trim() });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const isSaving = saving || formik.isSubmitting;

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (isSaving) return; // no cerrar mientras guarda
    formik.resetForm();
    onClose?.();
  }, [isSaving, formik, onClose]);

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="country-modal-title">
      <ModalDialog
        variant="outlined"
        sx={{ width: { xs: "100%", sm: 480 } }}
      >
        <ModalClose disabled={isSaving} />
        <Typography id="country-modal-title" level="h5" mb={1.5}>
          {initialValues?.id ? "Editar País" : "Agregar País"}
        </Typography>

        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <FormControl
              required
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
            >
              <FormLabel htmlFor="country-name">País</FormLabel>
              <Input
                id="country-name"
                name="nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ej. Honduras"
                autoFocus
                aria-describedby={
                  formik.touched.nombre && formik.errors.nombre
                    ? "country-name-error"
                    : undefined
                }
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <Typography
                  id="country-name-error"
                  level="body-xs"
                  color="danger"
                  sx={{ mt: 0.5 }}
                >
                  {formik.errors.nombre}
                </Typography>
              )}
            </FormControl>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="plain" onClick={handleClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSaving} disabled={isSaving}>
                {initialValues?.id ? "Actualizar" : "Agregar"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
