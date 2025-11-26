import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Sheet,
  DialogTitle,
  DialogContent,
  ModalClose,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Autocomplete,
  Button,
  Typography,
} from "@mui/joy";

import CatalogSelect from "@/components/forms/CatalogSelect";

// 🔐 Generador de contraseña segura (12 caracteres, con mayúsculas, minúsculas, números y símbolos)
function generateSecurePassword(length = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const specials = "@#$%&*_-+!";
  const all = upper + lower + numbers + specials;

  let pwd = "";
  // al menos uno de cada tipo
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += specials[Math.floor(Math.random() * specials.length)];

  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // mezclar
  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initialValues = null, // user para editar o null para crear
  ciudades = [],
  supervisores = [],
  saving = false,
  onResetPassword, // callback que maneja SweetAlert y API en el padre
}) {
  const isEditing = !!initialValues?.id_usuario;

  const [form, setForm] = useState({
    id_usuario: null,
    nombre: "",
    email: "",
    username: "",
    password: "",
    rol: "",
    puesto: "",
    ciudad: "", // id ciudad
    supervisor_id: "", // id supervisor
  });

  // Cuando se abre el Drawer, setear datos / generar password
  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      setForm({
        id_usuario: initialValues.id_usuario,
        nombre: initialValues.nombre || "",
        email: initialValues.email || "",
        username: initialValues.username || "",
        // en edición NO cambiamos password desde aquí
        password: "",
        rol: initialValues.rol || "",
        puesto: initialValues.puesto || "",
        ciudad: String(initialValues.id_ciudad ?? initialValues.ciudad ?? ""),
        supervisor_id:
          initialValues.supervisor_id != null
            ? String(initialValues.supervisor_id)
            : "",
      });
    } else {
      // Nuevo usuario → generar contraseña automáticamente (no visible)
      const autoPassword = generateSecurePassword(12);
      setForm({
        id_usuario: null,
        nombre: "",
        email: "",
        username: "",
        password: autoPassword, // se manda al backend y al correo, pero NO se muestra
        rol: "",
        puesto: "",
        ciudad: "",
        supervisor_id: "",
      });
    }
  }, [open, isEditing, initialValues]);

  const canSubmit = useMemo(() => {
    if (!form.nombre.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.username.trim()) return false;
    return true;
  }, [form]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit || saving) return;

    const payload = {
      id_usuario: form.id_usuario || undefined,
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      // en edición no tocamos password (queda undefined)
      password: isEditing ? undefined : form.password,
      rol: form.rol || undefined,
      puesto: form.puesto || undefined,
      id_ciudad: form.ciudad || undefined,
      supervisor_id: form.supervisor_id || undefined,
    };

    onSubmit?.(payload);
  };

  const handleResetClick = () => {
    if (!onResetPassword || !form.email) return;

    onClose?.();

    setTimeout(() => {
      onResetPassword(form.email);
    }, 0);
  };

  return (
    <Drawer
      open={open}
      onClose={saving ? undefined : onClose}
      anchor="right"
      size="md"
      variant="plain"
      slotProps={{
        content: {
          sx: {
            bgcolor: "transparent",
            p: { xs: 0, sm: 2 },
            boxShadow: "none",
          },
        },
      }}>
      <Sheet
        component="form"
        onSubmit={handleSubmit}
        sx={{
          borderRadius: { xs: 0, sm: "md" },
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          height: "100%",
          minWidth: { xs: "100dvw", sm: 360 },
          bgcolor: "background.surface",
          boxShadow: "lg",
        }}>
        <DialogTitle>
          {isEditing ? "Editar usuario" : "Nuevo usuario"}
        </DialogTitle>
        <ModalClose disabled={saving} />
        <Divider />

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}>
          <Typography level="body-xs" sx={{ opacity: 0.7, mb: 0.5 }}>
            Los campos marcados con * son obligatorios.
          </Typography>

          <BoxLikeGrid>
            {/* Nombre */}
            <FormControl required>
              <FormLabel>Nombre</FormLabel>
              <Input
                size="sm"
                value={form.nombre}
                onChange={(e) =>
                  setForm((s) => ({ ...s, nombre: e.target.value }))
                }
                disabled={saving}
              />
            </FormControl>

            {/* Email */}
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input
                size="sm"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
                disabled={saving}
              />
            </FormControl>

            {/* Usuario */}
            <FormControl required>
              <FormLabel>Usuario</FormLabel>
              <Input
                size="sm"
                value={form.username}
                onChange={(e) =>
                  setForm((s) => ({ ...s, username: e.target.value }))
                }
                disabled={saving}
              />
            </FormControl>

            {/* Rol */}
            <FormControl>
              <FormLabel>Rol</FormLabel>
              <CatalogSelect
                catalog="rolesUsuario"
                value={form.rol || ""}
                onChange={(v) =>
                  setForm((s) => ({
                    ...s,
                    rol: v || "",
                  }))
                }
                placeholder="Selecciona rol"
                disabled={saving}
                allowEmpty
              />
            </FormControl>

            {/* Puesto */}
            <FormControl>
              <FormLabel>Puesto</FormLabel>
              <CatalogSelect
                catalog="puestosUsuario"
                value={form.puesto || ""}
                onChange={(v) =>
                  setForm((s) => ({
                    ...s,
                    puesto: v || "",
                  }))
                }
                placeholder="Selecciona puesto"
                disabled={saving}
                allowEmpty
              />
            </FormControl>

            {/* Ciudad */}
            <FormControl>
              <FormLabel>Ciudad</FormLabel>
              <Autocomplete
                size="sm"
                placeholder="Selecciona ciudad"
                options={ciudades}
                getOptionLabel={(opt) => opt?.nombre ?? opt?.ciudad ?? ""}
                value={
                  ciudades.find(
                    (c) =>
                      String(c.id) === String(form.ciudad) ||
                      String(c.id_ciudad) === String(form.ciudad)
                  ) || null
                }
                onChange={(_, opt) =>
                  setForm((s) => ({
                    ...s,
                    ciudad: opt ? String(opt.id ?? opt.id_ciudad) : "",
                  }))
                }
                disabled={saving}
                clearOnBlur={false}
              />
            </FormControl>

            {/* Supervisor */}
            <FormControl>
              <FormLabel>Supervisor</FormLabel>
              <Autocomplete
                size="sm"
                placeholder="Selecciona supervisor"
                options={supervisores}
                getOptionLabel={(opt) => opt?.nombre ?? ""}
                value={
                  supervisores.find(
                    (sup) => String(sup.id) === String(form.supervisor_id)
                  ) || null
                }
                onChange={(_, opt) =>
                  setForm((s) => ({
                    ...s,
                    supervisor_id: opt ? String(opt.id) : "",
                  }))
                }
                disabled={saving}
                clearOnBlur={false}
              />
            </FormControl>
          </BoxLikeGrid>
        </DialogContent>

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1.25}
          mt={1}>
          {isEditing && onResetPassword && (
            <Button
              variant="soft"
              color="warning"
              disabled={saving || !form.email}
              onClick={handleResetClick}>
              Reiniciar contraseña
            </Button>
          )}

          <Stack direction="row" spacing={1.25}>
            <Button variant="plain" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={!canSubmit || saving}>
              Guardar
            </Button>
          </Stack>
        </Stack>
      </Sheet>
    </Drawer>
  );
}

// Pequeño wrapper para el grid sin ensuciar arriba
function BoxLikeGrid({ children }) {
  return (
    <Stack
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 1.5,
        width: "100%",
      }}>
      {children}
    </Stack>
  );
}
