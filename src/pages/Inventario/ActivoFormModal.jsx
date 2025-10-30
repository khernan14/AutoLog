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
  Button,
  Chip,
} from "@mui/joy";
import { useToast } from "../../context/ToastContext";

// 🔹 Nuevo: Select centralizado y mapa de colores por estatus
import CatalogSelect from "@/components/forms/CatalogSelect";
import { ESTATUS_COLOR } from "@/constants/inventario";

export default function ActivoFormModal({ open, onClose, editing, onSaved }) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
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

    if (!String(form.nombre || "").trim()) {
      showToast("El nombre es requerido", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateActivo(editing.id, {
        ...form,
        // código no editable: respeta el original
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

  const chipColor = ESTATUS_COLOR[form.estatus] || "neutral";

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

          <FormControl required>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={saving}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Modelo</FormLabel>
            <Input
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              disabled={saving}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Serie</FormLabel>
            <Input
              value={form.serial_number}
              onChange={(e) =>
                setForm({ ...form, serial_number: e.target.value })
              }
              disabled={saving}
            />
          </FormControl>

          {/* 🔹 Tipo desde catálogo */}
          <FormControl>
            <FormLabel>Tipo</FormLabel>
            <CatalogSelect
              catalog="tiposActivo"
              value={form.tipo}
              onChange={(_, v) => setForm({ ...form, tipo: v })}
              disabled={saving}
            />
          </FormControl>

          {/* 🔹 Estatus desde catálogo + chip con color centralizado */}
          <FormControl>
            <FormLabel>Estatus</FormLabel>
            <CatalogSelect
              catalog="estatusActivo"
              value={form.estatus}
              onChange={(_, v) => setForm({ ...form, estatus: v })}
              disabled={saving}
            />
            <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                Estado actual:
              </Typography>
              <Chip size="sm" variant="soft" color={chipColor}>
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
