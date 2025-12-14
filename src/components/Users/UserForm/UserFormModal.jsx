// src/components/Users/UserForm/UserFormModal.jsx
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";

import {
  Drawer,
  Sheet,
  DialogTitle,
  ModalClose,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Autocomplete,
  Button,
  Typography,
  FormHelperText,
  CircularProgress,
  Box,
} from "@mui/joy";

import CatalogSelect from "@/components/forms/CatalogSelect";

function generateSecurePassword(length = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const specials = "@#$%&*_-+!";
  const all = upper + lower + numbers + specials;
  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += specials[Math.floor(Math.random() * specials.length)];
  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Esquema de validación Yup
const validationSchema = yup.object({
  nombre: yup.string().trim().required("Requerido"),
  email: yup.string().email("Email inválido").required("Requerido"),
  username: yup
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .required("Requerido"),
  // Password es requerido solo al crear (se genera auto, pero validamos por si acaso)
  // En edición es opcional/ignorado por el backend si no se envía
});

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initialValues = null,
  ciudades = [],
  supervisores = [],
  saving = false,
  onResetPassword,
}) {
  const { t } = useTranslation();
  const isEditing = !!initialValues?.id_usuario;

  // --- Formik ---
  const formik = useFormik({
    initialValues: {
      nombre: "",
      email: "",
      username: "",
      password: "", // Solo se usa al crear
      rol: "",
      puesto: "",
      ciudad: "", // ID ciudad
      supervisor_id: "", // ID supervisor
    },
    validationSchema,
    onSubmit: (values) => {
      // Preparamos payload
      const payload = {
        id_usuario: initialValues?.id_usuario,
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        username: values.username.trim(),
        // En edición no mandamos password (undefined). Al crear mandamos la generada.
        password: isEditing ? undefined : values.password,
        rol: values.rol || null,
        puesto: values.puesto || null,
        id_ciudad: values.ciudad || null,
        supervisor_id: values.supervisor_id || null,
      };
      onSubmit?.(payload);
    },
  });

  // --- Efecto al abrir: Cargar datos o resetear ---
  useEffect(() => {
    if (open) {
      if (isEditing) {
        formik.setValues({
          nombre: initialValues.nombre || "",
          email: initialValues.email || "",
          username: initialValues.username || "",
          password: "", // No mostramos password
          rol: initialValues.rol || "",
          puesto: initialValues.puesto || "",
          ciudad: initialValues.id_ciudad
            ? String(initialValues.id_ciudad)
            : initialValues.ciudad
            ? String(initialValues.ciudad)
            : "",
          supervisor_id: initialValues.supervisor_id
            ? String(initialValues.supervisor_id)
            : "",
        });
      } else {
        // Modo Crear: Generar password automático
        const autoPwd = generateSecurePassword();
        formik.resetForm();
        formik.setFieldValue("password", autoPwd);
      }
      formik.setTouched({}); // Limpiar errores visuales
    }
  }, [open, isEditing, initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResetClick = () => {
    if (!onResetPassword || !formik.values.email) return;
    onClose?.(); // Cerrar modal primero
    setTimeout(() => onResetPassword(formik.values.email), 0);
  };

  return (
    <Drawer
      open={open}
      onClose={() => !saving && onClose()}
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
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography level="h4">
          {isEditing
            ? t("users.form.edit_title")
            : t("users.form.create_title")}
        </Typography>
        <ModalClose disabled={saving} onClick={onClose} />
      </Stack>
      <Divider />

      {/* Formulario */}
      <Stack
        component="form"
        onSubmit={formik.handleSubmit}
        spacing={2}
        sx={{ flex: 1, overflowY: "auto", px: 1, pt: 1 }}>
        <Typography level="body-xs" sx={{ opacity: 0.7 }}>
          {t("users.form.required_fields")}
        </Typography>

        <FormControl
          required
          error={formik.touched.nombre && Boolean(formik.errors.nombre)}>
          <FormLabel>{t("users.form.fields.name")}</FormLabel>
          <Input
            name="nombre"
            value={formik.values.nombre}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={saving}
          />
          {formik.touched.nombre && formik.errors.nombre && (
            <FormHelperText>{formik.errors.nombre}</FormHelperText>
          )}
        </FormControl>

        <FormControl
          required
          error={formik.touched.email && Boolean(formik.errors.email)}>
          <FormLabel>{t("users.form.fields.email")}</FormLabel>
          <Input
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={saving}
          />
          {formik.touched.email && formik.errors.email && (
            <FormHelperText>{formik.errors.email}</FormHelperText>
          )}
        </FormControl>

        <FormControl
          required
          error={formik.touched.username && Boolean(formik.errors.username)}>
          <FormLabel>{t("users.form.fields.username")}</FormLabel>
          <Input
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={saving}
          />
          {formik.touched.username && formik.errors.username && (
            <FormHelperText>{formik.errors.username}</FormHelperText>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>{t("users.form.fields.role")}</FormLabel>
          <CatalogSelect
            catalog="rolesUsuario"
            value={formik.values.rol}
            onChange={(v) => formik.setFieldValue("rol", v)}
            disabled={saving}
            allowEmpty
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t("users.form.fields.position")}</FormLabel>
          <CatalogSelect
            catalog="puestosUsuario"
            value={formik.values.puesto}
            onChange={(v) => formik.setFieldValue("puesto", v)}
            disabled={saving}
            allowEmpty
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t("users.form.fields.city")}</FormLabel>
          <Autocomplete
            placeholder={t("common.search_placeholder")}
            options={ciudades}
            getOptionLabel={(opt) => opt?.nombre ?? opt?.ciudad ?? ""}
            value={
              ciudades.find(
                (c) => String(c.id) === String(formik.values.ciudad)
              ) || null
            }
            onChange={(_, opt) =>
              formik.setFieldValue(
                "ciudad",
                opt ? String(opt.id ?? opt.id_ciudad) : ""
              )
            }
            disabled={saving}
            autoHighlight
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t("users.form.fields.supervisor")}</FormLabel>
          <Autocomplete
            placeholder={t("common.search_placeholder")}
            options={supervisores}
            getOptionLabel={(opt) => opt?.nombre ?? ""}
            value={
              supervisores.find(
                (s) => String(s.id) === String(formik.values.supervisor_id)
              ) || null
            }
            onChange={(_, opt) =>
              formik.setFieldValue("supervisor_id", opt ? String(opt.id) : "")
            }
            disabled={saving}
            autoHighlight
          />
        </FormControl>
      </Stack>

      {/* Footer */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        pt={2}>
        {isEditing && onResetPassword ? (
          <Button
            variant="soft"
            color="warning"
            onClick={handleResetClick}
            disabled={saving || !formik.values.email}>
            {t("users.actions.reset_pass")}
          </Button>
        ) : (
          <Box />
        )}{" "}
        {/* Spacer si no hay botón izquierdo */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="plain"
            color="neutral"
            onClick={onClose}
            disabled={saving}>
            {t("common.actions.cancel")}
          </Button>
          <Button onClick={formik.handleSubmit} loading={saving}>
            {t("common.actions.save")}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
