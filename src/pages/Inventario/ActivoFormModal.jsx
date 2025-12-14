// src/pages/Inventario/ActivoFormModal.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";

import {
  Drawer,
  Typography,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Chip,
  ModalClose,
  CircularProgress,
} from "@mui/joy";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Services
import {
  createActivoEnBodega,
  getNextActivoCode,
} from "../../services/ActivosBodegaServices";
import { updateActivo } from "../../services/ActivosServices";

// Componentes
import CatalogSelect from "../../components/forms/CatalogSelect";
import { ESTATUS_COLOR } from "../../constants/inventario";

// Esquema de validación
const validationSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es requerido"),
  modelo: yup.string().nullable(),
  serial_number: yup.string().nullable(),
  tipo: yup.string().required("El tipo es requerido"),
  estatus: yup.string().required("El estado es requerido"),
});

export default function ActivoFormModal({
  open,
  onClose,
  onSaved,
  idBodega,
  editing,
}) {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { showToast } = useToast();

  const isEditing = !!editing;
  const isCreating = !isEditing && !!idBodega;

  const [nextCode, setNextCode] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);
  const [nextErr, setNextErr] = useState("");

  const formik = useFormik({
    initialValues: {
      nombre: "",
      modelo: "",
      serial_number: "",
      tipo: "Otro",
      estatus: "Activo",
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const payload = {
          nombre: values.nombre.trim(),
          modelo: values.modelo || null,
          serial_number: values.serial_number || null,
          tipo: values.tipo,
          estatus: values.estatus,
          usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
        };

        if (isEditing) {
          await updateActivo(editing.id, payload);
          showToast(t("inventory.asset_form.success.updated"), "success");
        } else if (isCreating) {
          await createActivoEnBodega({ ...payload, id_bodega: idBodega });
          showToast(t("inventory.asset_form.success.created"), "success");
        }

        onSaved?.();
        onClose?.();
      } catch (err) {
        showToast(
          err?.message || t("inventory.asset_form.errors.save_failed"),
          "danger"
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      return;
    }

    if (isEditing) {
      formik.setValues({
        nombre: editing.nombre || "",
        modelo: editing.modelo || "",
        serial_number: editing.serial_number || "",
        tipo: editing.tipo || "Otro",
        estatus: editing.estatus || "Activo",
      });
      setNextCode(editing.codigo || "");
    } else if (isCreating) {
      formik.resetForm();
      setNextCode("");
      setLoadingNext(true);
      setNextErr("");

      getNextActivoCode()
        .then((r) => {
          const code = typeof r === "string" ? r : r?.next;
          setNextCode(code ?? "");
        })
        .catch((e) => {
          setNextErr(t("inventory.asset_form.errors.code_failed"));
          console.error(e);
        })
        .finally(() => setLoadingNext(false));
    }
  }, [open, editing, idBodega]); // eslint-disable-line react-hooks/exhaustive-deps

  const chipColor = isCreating
    ? nextErr
      ? "neutral"
      : "primary"
    : ESTATUS_COLOR[formik.values.estatus] || "neutral";

  return (
    <Drawer
      open={open}
      onClose={() => !formik.isSubmitting && onClose()}
      anchor="right"
      size="md"
      slotProps={{
        content: {
          sx: {
            bgcolor: "background.surface",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "xl",
          },
        },
      }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography level="h4">
          {isEditing
            ? t("inventory.asset_form.edit_title")
            : t("inventory.asset_form.create_title")}
        </Typography>
        <ModalClose disabled={formik.isSubmitting} onClick={onClose} />
      </Stack>
      <Divider />

      {/* --- FORMULARIO VERTICAL --- */}
      <Stack
        component="form"
        onSubmit={formik.handleSubmit}
        spacing={2}
        sx={{ flex: 1, overflowY: "auto", px: 1, pt: 1 }}>
        {/* Código */}
        <FormControl>
          <FormLabel>{t("inventory.asset_form.fields.code")}</FormLabel>
          <Stack direction="row" spacing={1} alignItems="center">
            {isCreating && loadingNext ? (
              <CircularProgress size="sm" thickness={3} />
            ) : (
              <Chip
                size="lg"
                variant="soft"
                color={chipColor}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "md",
                  px: 2,
                  width: "100%",
                }} // Ancho completo para uniformidad
              >
                {nextCode || (nextErr ? "—" : "—")}
              </Chip>
            )}
          </Stack>
          <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
            {isEditing
              ? t("inventory.asset_form.hints.code_fixed")
              : nextErr
              ? nextErr
              : t("inventory.asset_form.hints.code_auto")}
          </Typography>
        </FormControl>

        {/* Nombre */}
        <FormControl
          required
          error={formik.touched.nombre && Boolean(formik.errors.nombre)}>
          <FormLabel>{t("inventory.asset_form.fields.name")}</FormLabel>
          <Input
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

        {/* Modelo (Ahora vertical) */}
        <FormControl>
          <FormLabel>{t("inventory.asset_form.fields.model")}</FormLabel>
          <Input
            name="modelo"
            value={formik.values.modelo}
            onChange={formik.handleChange}
            onBlur={() => formik.setFieldTouched("modelo", true)}
            disabled={formik.isSubmitting}
          />
        </FormControl>

        {/* Serie (Ahora vertical) */}
        <FormControl>
          <FormLabel>{t("inventory.asset_form.fields.serial")}</FormLabel>
          <Input
            name="serial_number"
            value={formik.values.serial_number}
            onChange={formik.handleChange}
            onBlur={() => formik.setFieldTouched("serial_number", true)}
            disabled={formik.isSubmitting}
          />
        </FormControl>

        {/* Tipo */}
        <FormControl required>
          <FormLabel>{t("inventory.asset_form.fields.type")}</FormLabel>
          <CatalogSelect
            catalog="tiposActivo"
            value={formik.values.tipo}
            onChange={(v) => formik.setFieldValue("tipo", v)}
            disabled={formik.isSubmitting}
          />
        </FormControl>

        {/* Estatus */}
        <FormControl required>
          <FormLabel>{t("inventory.asset_form.fields.status")}</FormLabel>
          <CatalogSelect
            catalog="estatusActivo"
            value={formik.values.estatus}
            onChange={(v) => formik.setFieldValue("estatus", v)}
            disabled={formik.isSubmitting}
          />
        </FormControl>
      </Stack>

      <Stack direction="row" justifyContent="flex-end" spacing={1} pt={2}>
        <Button
          variant="plain"
          color="neutral"
          onClick={onClose}
          disabled={formik.isSubmitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button onClick={formik.handleSubmit} loading={formik.isSubmitting}>
          {t("common.actions.save")}
        </Button>
      </Stack>
    </Drawer>
  );
}
