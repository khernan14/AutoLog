import { useState } from "react";
import { createActivoEnBodega } from "../../services/ActivosBodegaServices";
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
import { useAuth } from "../../context/AuthContext";
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

export default function NuevoActivoEnBodegaModal({
  open,
  onClose,
  idBodega,
  onSaved,
}) {
  const { userData } = useAuth();
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

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim()) {
      showToast("Código y nombre son requeridos", "warning");
      return;
    }
    setSaving(true);
    try {
      await createActivoEnBodega({
        ...form,
        id_bodega: idBodega,
        usuario_responsable: userData?.id_usuario,
      });
      showToast("Activo creado en bodega", "success");
      onClose();
      onSaved();
    } catch (err) {
      showToast(err.message || "Error al crear activo", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        component="form"
        onSubmit={onSubmit}
        sx={{ width: { xs: "100%", sm: 520 } }}>
        <Typography level="title-lg">Nuevo Activo en Bodega</Typography>
        <Divider />
        <Stack spacing={1.5} mt={1}>
          <FormControl required>
            <FormLabel>Código</FormLabel>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
          </FormControl>
          <FormControl required>
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
