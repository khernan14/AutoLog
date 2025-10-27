// src/pages/Inventario/ActivoFormModal.jsx
import { useState, useEffect } from "react";
import { updateActivo } from "../../services/ActivosServices";
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
  Chip,
} from "@mui/joy";
import { useToast } from "../../context/ToastContext";

const ESTATUS = [
  "Activo",
  "Inactivo",
  "Arrendado",
  "En Mantenimiento",
  "Reciclado",
];

const TIPOS = [
  "Impresora",
  "ATM",
  "Escáner",
  "UPS",
  "Silla",
  "Mueble",
  "Laptop",
  "Desktop",
  "Mesa",
  "Audifonos",
  "Monitor",
  "Mochila",
  "Escritorio",
  "Celular",
  "Otro",
];

export default function ActivoFormModal({ open, onClose, editing, onSaved }) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    // codigo vendrá de editing y no será editable
    codigo: "",
    nombre: "",
    modelo: "",
    serial_number: "",
    tipo: "Otro",
    estatus: "Activo",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        codigo: editing.codigo || "",
        nombre: editing.nombre || "",
        modelo: editing.modelo || "",
        serial_number: editing.serial_number || "",
        tipo: editing.tipo || "Otro",
        estatus: editing.estatus || "Activo",
      });
    }
  }, [editing]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.nombre.trim()) {
      showToast("El nombre es requerido", "warning");
      return;
    }

    setSaving(true);
    try {
      // Enviamos el mismo código original (no editable)
      await updateActivo(editing.id, {
        ...form,
        codigo: editing.codigo,
      });
      showToast("Activo actualizado", "success");
      onClose?.();
      onSaved?.();
    } catch (err) {
      showToast(err?.message || "Error al actualizar activo", "danger");
    } finally {
      setSaving(false);
    }
  }

  // colorcito para el chip del estatus (opcional, se ve nice)
  const chipColorByStatus =
    form.estatus === "Activo"
      ? "success"
      : form.estatus === "Arrendado"
      ? "primary"
      : form.estatus === "En Mantenimiento"
      ? "warning"
      : form.estatus === "Inactivo"
      ? "danger"
      : "neutral";

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        component="form"
        onSubmit={onSubmit}
        sx={{ width: { xs: "100%", sm: 520 } }}>
        <Typography level="title-lg">Editar Activo</Typography>
        <Divider />
        <Stack spacing={1.5} mt={1}>
          {/* Código como label + Chip (solo lectura) */}
          <FormControl>
            <FormLabel>Código</FormLabel>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="md" variant="soft" color="success">
                {form.codigo || "—"}
              </Chip>
            </Stack>
          </FormControl>

          <FormControl>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Modelo</FormLabel>
            <Input
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Serie</FormLabel>
            <Input
              value={form.serial_number}
              onChange={(e) =>
                setForm({ ...form, serial_number: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Tipo</FormLabel>
            <Select
              value={form.tipo}
              onChange={(_, v) => setForm({ ...form, tipo: v })}>
              {TIPOS.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Estatus</FormLabel>
            <Select
              value={form.estatus}
              onChange={(_, v) => setForm({ ...form, estatus: v })}>
              {ESTATUS.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
            <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                Estado actual:
              </Typography>
              <Chip size="sm" variant="soft" color={chipColorByStatus}>
                {form.estatus}
              </Chip>
            </Stack>
          </FormControl>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} disabled={saving}>
            Guardar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
