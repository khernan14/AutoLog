// src/components/SoporteAdmin/FAQFormModal.jsx

import React, { useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Checkbox,
  Button,
  Stack,
} from "@mui/joy";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

// Esquema de validación con Yup
const validationSchema = Yup.object({
  question: Yup.string()
    .trim()
    .required("La pregunta es obligatoria")
    .max(255, "La pregunta no puede exceder los 255 caracteres"),
  answer: Yup.string().trim().required("La respuesta es obligatoria"),
  category: Yup.string()
    .trim()
    .required("La categoría es obligatoria")
    .max(100, "La categoría no puede exceder los 100 caracteres"),
  order: Yup.number()
    .integer("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .nullable(), // Permite que sea nulo si no se especifica
  isActive: Yup.boolean().required("El estado activo es obligatorio"),
});

export default function FAQFormModal({ open, onClose, onSave, faq }) {
  // Inicialización de Formik
  const formik = useFormik({
    initialValues: {
      id: faq?.id || null, // Si es edición, tendrá un ID
      question: faq?.question || "",
      answer: faq?.answer || "",
      category: faq?.category || "",
      order: faq?.order ?? 0, // Usar 0 como valor por defecto si es null/undefined
      isActive: faq?.isActive ?? true, // Por defecto activo
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        // Llama a la función onSave pasada por el padre
        const result = await onSave(values);
        if (result && !result.error) {
          // onClose se llama en el padre si la operación es exitosa
        }
      } catch (error) {
        // El error ya debería ser manejado por el toast en el padre (FAQsAdminPage)
        console.error("Error al guardar FAQ en modal:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Efecto para resetear el formulario cuando se abre o cambia la FAQ a editar
  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: {
          id: faq?.id || null,
          question: faq?.question || "",
          answer: faq?.answer || "",
          category: faq?.category || "",
          order: faq?.order ?? 0,
          isActive: faq?.isActive ?? true,
        },
      });
    }
  }, [open, faq]); // Dependencias: cuando el modal se abre o la FAQ a editar cambia

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="fullscreen" sx={{ overflowY: "auto" }}>
        <ModalClose />
        <Typography level="h3" sx={{ mb: 2 }}>
          {faq
            ? "Editar Pregunta Frecuente"
            : "Agregar Nueva Pregunta Frecuente"}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <FormControl
              error={
                formik.touched.question && Boolean(formik.errors.question)
              }>
              <FormLabel>Pregunta</FormLabel>
              <Input
                name="question"
                value={formik.values.question}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Escribe la pregunta aquí..."
              />
              {formik.touched.question && formik.errors.question && (
                <Typography color="danger" level="body-xs" sx={{ mt: 0.5 }}>
                  {formik.errors.question}
                </Typography>
              )}
            </FormControl>

            <FormControl
              error={formik.touched.answer && Boolean(formik.errors.answer)}>
              <FormLabel>Respuesta</FormLabel>
              <Textarea
                name="answer"
                value={formik.values.answer}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                minRows={4}
                placeholder="Proporciona la respuesta detallada..."
              />
              {formik.touched.answer && formik.errors.answer && (
                <Typography color="danger" level="body-xs" sx={{ mt: 0.5 }}>
                  {formik.errors.answer}
                </Typography>
              )}
            </FormControl>

            <FormControl
              error={
                formik.touched.category && Boolean(formik.errors.category)
              }>
              <FormLabel>Categoría</FormLabel>
              <Input
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ej. Cuenta, Gestión de Usuarios"
              />
              {formik.touched.category && formik.errors.category && (
                <Typography color="danger" level="body-xs" sx={{ mt: 0.5 }}>
                  {formik.errors.category}
                </Typography>
              )}
            </FormControl>

            <FormControl
              error={formik.touched.order && Boolean(formik.errors.order)}>
              <FormLabel>Orden (Opcional)</FormLabel>
              <Input
                name="order"
                type="number"
                value={formik.values.order ?? ""} // Mostrar vacío si es null
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Número para ordenar FAQs"
              />
              {formik.touched.order && formik.errors.order && (
                <Typography color="danger" level="body-xs" sx={{ mt: 0.5 }}>
                  {formik.errors.order}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <Checkbox
                name="isActive"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Activa"
                sx={{ mt: 1 }}
              />
            </FormControl>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={onClose}
                disabled={formik.isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="solid"
                color="primary"
                loading={formik.isSubmitting}
                disabled={formik.isSubmitting || !formik.isValid}>
                {faq ? "Guardar Cambios" : "Agregar FAQ"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
