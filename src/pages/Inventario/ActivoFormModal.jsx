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
  const [form, setForm] = useState(editing || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
  }, [editing]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateActivo(editing.id, form);
      showToast("Activo actualizado", "success");
      onClose();
      onSaved();
    } catch (err) {
      showToast(err.message || "Error al actualizar activo", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog component="form" onSubmit={onSubmit}>
        <Typography level="title-lg">Editar Activo</Typography>
        <Divider />
        <Stack spacing={1.5} mt={1}>
          <FormControl>
            <FormLabel>Código</FormLabel>
            <Input
              value={form.codigo || ""}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Modelo</FormLabel>
            <Input
              value={form.modelo || ""}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Serie</FormLabel>
            <Input
              value={form.serial_number || ""}
              onChange={(e) =>
                setForm({ ...form, serial_number: e.target.value })
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tipo</FormLabel>
            <Select
              value={form.tipo || "Otro"}
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
              value={form.estatus || "Activo"}
              onChange={(_, v) => setForm({ ...form, estatus: v })}>
              {ESTATUS.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button variant="plain" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Guardar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
