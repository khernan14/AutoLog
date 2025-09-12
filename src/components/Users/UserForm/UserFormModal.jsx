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
  Select,
  Option,
  Button,
} from "@mui/joy";

const ROLES_DEFAULT = ["Empleado", "Supervisor"]; // 🔧 ajusta si tienes roles fijos desde backend

// Lista de puestos por defecto (puedes editarla aquí)
const PUESTOS_DEFAULT = [
  "Gerente de Ingeniería",
  "Gerente de Finanzas",
  "Oficial de servicios",
  "Supervisor Tecnico - ATM",
  "Supervisor Tecnico - Microsistemas",
  "Técnico de ATM",
  "Técnico de Microsistemas",
  "Técnico de Alta Disponibilidad",
  "Técnico de Soporte",
  "Técnico de Inventario",
  "Asistente de Contabilidad",
  "Asistente de Cuentas por Cobrar",
  "Especialista de Soluciones",
];

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initialValues = null, // user para editar o null para crear
  ciudades = [],
  supervisores = [],
  puestosOptions = PUESTOS_DEFAULT, // <- opcional: pasar desde el padre
  saving = false,
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

  useEffect(() => {
    if (!open) return;
    if (isEditing) {
      setForm({
        id_usuario: initialValues.id_usuario,
        nombre: initialValues.nombre || "",
        email: initialValues.email || "",
        username: initialValues.username || "",
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
      setForm({
        id_usuario: null,
        nombre: "",
        email: "",
        username: "",
        password: "",
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
    if (!isEditing && !form.password.trim()) return false;
    return true;
  }, [form, isEditing]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;

    const payload = {
      id_usuario: form.id_usuario || undefined,
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password || undefined,
      rol: form.rol || undefined,
      puesto: form.puesto || undefined,
      id_ciudad: form.ciudad || undefined,
      supervisor_id: form.supervisor_id || undefined,
    };
    onSubmit?.(payload);
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

          {!isEditing && (
            <FormControl required>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((s) => ({ ...s, password: e.target.value }))
                }
                disabled={saving}
              />
            </FormControl>
          )}

          <FormControl>
            <FormLabel>Rol</FormLabel>
            <Select
              value={form.rol || ""}
              onChange={(_, v) => setForm((s) => ({ ...s, rol: v || "" }))}
              disabled={saving}
              placeholder="Selecciona rol">
              <Option value="">—</Option>
              {ROLES_DEFAULT.map((r) => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </FormControl>

          {/* Puesto como Select */}
          <FormControl>
            <FormLabel>Puesto</FormLabel>
            <Select
              value={form.puesto || ""}
              onChange={(_, v) => setForm((s) => ({ ...s, puesto: v || "" }))}
              disabled={saving}
              placeholder="Selecciona puesto">
              <Option value="">—</Option>
              {puestosOptions.map((p) => (
                <Option key={p} value={p}>
                  {p}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Ciudad</FormLabel>
            <Select
              value={form.ciudad || ""}
              onChange={(_, v) => setForm((s) => ({ ...s, ciudad: v || "" }))}
              disabled={saving}
              placeholder="Selecciona ciudad">
              <Option value="">—</Option>
              {ciudades.map((c) => (
                <Option key={c.id} value={String(c.id)}>
                  {c.nombre /* si tu API usa c.ciudad, cámbialo */}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Supervisor</FormLabel>
            <Select
              value={form.supervisor_id || ""}
              onChange={(_, v) =>
                setForm((s) => ({ ...s, supervisor_id: v || "" }))
              }
              disabled={saving}
              placeholder="Selecciona supervisor">
              <Option value="">—</Option>
              {supervisores.map((s) => (
                <Option key={s.id} value={String(s.id)}>
                  {s.nombre}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1.25} mt={2}>
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
      </ModalDialog>
    </Modal>
  );
}
