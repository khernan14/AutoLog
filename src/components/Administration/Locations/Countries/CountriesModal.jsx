import { useEffect, useCallback } from "react";
import {
  Modal,
  ModalClose,
  Sheet,
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
  nombre: yup.string().required("El nombre del país es requerido"),
});

export default function CountriesModal({
  open,
  onClose,
  onSubmit,
  initialValues = { id: null, nombre: "" },
}) {
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    formik.resetForm();
    onClose();
  }, [formik, onClose]);

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
      <Sheet
        variant="outlined"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 400,
          width: "90%",
          p: 3,
          borderRadius: "md",
          boxShadow: "lg",
          bgcolor: "background.body",
        }}>
        <ModalClose />
        <Typography id="modal-title" level="h5" mb={2}>
          {initialValues?.id ? "Editar País" : "Agregar País"}
        </Typography>

        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <FormControl required>
              <FormLabel>País</FormLabel>
              <Input
                name="nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                placeholder="Ej. Honduras"
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <Typography level="body-xs" color="danger" mt={0.5}>
                  {formik.errors.nombre}
                </Typography>
              )}
            </FormControl>

            <Button type="submit" variant="solid" color="primary">
              {initialValues?.id ? "Actualizar" : "Agregar"}
            </Button>
          </Stack>
        </form>
      </Sheet>
    </Modal>
  );
}
