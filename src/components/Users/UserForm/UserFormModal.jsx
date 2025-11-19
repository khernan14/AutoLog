import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Autocomplete,
  Button,
} from "@mui/joy";
import CatalogSelect from "@/components/forms/CatalogSelect"; // ajusta ruta si es distinta

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
  onResetPassword, // <-- nuevo callback para enviar correo de reset
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

  // Cuando se abre el modal, setear datos / generar password
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
        password: autoPassword, // se manda al backend y al correo, pero no se muestra
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
    // ya NO validamos password, porque se genera sola para nuevos
    return true;
  }, [form]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;

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
    onResetPassword(form.email);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: { xs: "100%", sm: 640 } }}>
        <Typography level="title-lg">
          {isEditing ? "Editar usuario" : "Nuevo usuario"}
        </Typography>
        <Divider />

        <Stack spacing={1.5} mt={1}>
          <FormControl required>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) =>
                setForm((s) => ({ ...s, nombre: e.target.value }))
              }
              disabled={saving}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
              disabled={saving}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Usuario</FormLabel>
            <Input
              value={form.username}
              onChange={(e) =>
                setForm((s) => ({ ...s, username: e.target.value }))
              }
              disabled={saving}
            />
          </FormControl>

          {/* 🔐 Ya no mostramos campo de contraseña.
              Se genera automáticamente para nuevos usuarios y se manda en el payload. */}

          {/* Rol con Autocomplete vía CatalogSelect */}
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

          {/* Puesto con Autocomplete vía CatalogSelect */}
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

          {/* Ciudad con Autocomplete normal */}
          <FormControl>
            <FormLabel>Ciudad</FormLabel>
            <Autocomplete
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

          {/* Supervisor con Autocomplete normal */}
          <FormControl>
            <FormLabel>Supervisor</FormLabel>
            <Autocomplete
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
        </Stack>

        {/* Footer con botón de reset + acciones */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1.25}
          mt={2}>
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
      </ModalDialog>
    </Modal>
  );
}
