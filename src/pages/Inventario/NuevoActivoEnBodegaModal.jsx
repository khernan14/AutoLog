// src/pages/Inventario/NuevoActivoEnBodega.jsx
import { useState, useEffect } from "react";
import {
  createActivoEnBodega,
  getNextActivoCode,
} from "../../services/ActivosBodegaServices";
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
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// 🔹 usamos el select reutilizable y los colores
import CatalogSelect from "@/components/forms/CatalogSelect";
import { ESTATUS_COLOR } from "@/constants/inventario";

export default function NuevoActivoEnBodegaModal({
  open,
  onClose,
  idBodega,
  onSaved,
}) {
  const { userData } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    nombre: "",
    modelo: "",
    serial_number: "",
    tipo: "Otro",
    estatus: "Activo",
  });

  const [saving, setSaving] = useState(false);
  const [nextCode, setNextCode] = useState(""); // 👈 mostrará el siguiente
  const [loadingNext, setLoadingNext] = useState(false);
  const [nextErr, setNextErr] = useState("");

  // Al abrir el modal: traer el próximo código (solo para mostrar)
  useEffect(() => {
    if (!open) return;
    // reset al abrir
    setForm({
      nombre: "",
      modelo: "",
      serial_number: "",
      tipo: "Otro",
      estatus: "Activo",
    });
    setNextErr("");
    setNextCode("");
    setLoadingNext(true);

    getNextActivoCode()
      .then((r) => {
        // depende de cómo lo devuelves en el backend: {next: "1209"} o solo "1209"
        const n = typeof r === "string" ? r : r?.next;
        setNextCode(n ?? "");
      })
      .catch((e) => {
        setNextErr(e?.message || "No se pudo obtener el próximo código");
        setNextCode("");
      })
      .finally(() => setLoadingNext(false));
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!String(form.nombre || "").trim()) {
      showToast("El nombre es requerido", "warning");
      return;
    }

    setSaving(true);
    try {
      // 👇 No enviamos "codigo": el backend lo genera de forma segura
      await createActivoEnBodega({
        nombre: form.nombre.trim(),
        modelo: form.modelo || null,
        serial_number: form.serial_number || null,
        tipo: form.tipo,
        estatus: form.estatus,
        id_bodega: idBodega,
        usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
      });

      showToast("Activo creado en bodega", "success");
      onClose?.();
      onSaved?.();
    } catch (err) {
      showToast(err?.message || "Error al crear activo", "danger");
    } finally {
      setSaving(false);
    }
  }

  const chipColor = nextErr ? "neutral" : ESTATUS_COLOR[form.estatus];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        component="form"
        onSubmit={onSubmit}
        sx={{ width: { xs: "100%", sm: 520 } }}>
        <Typography level="title-lg">Nuevo Activo en Bodega</Typography>
        <Divider />
        <Stack spacing={1.5} mt={1}>
          {/* Código (solo lectura / informativo) */}
          <FormControl>
            <FormLabel>Código</FormLabel>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="md" variant="soft" color={chipColor}>
                {loadingNext
                  ? "Calculando…"
                  : nextCode || (nextErr ? "—" : "—")}
              </Chip>
            </Stack>
            <Typography level="body-xs" sx={{ opacity: 0.8, mt: 0.5 }}>
              {nextErr
                ? "No se pudo previsualizar el próximo código. El sistema lo asignará al guardar."
                : "Este es el próximo código estimado. Puede cambiar si alguien crea otro activo antes que tú."}
            </Typography>
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

          {/* 🔹 Estatus desde catálogo */}
          <FormControl>
            <FormLabel>Estatus</FormLabel>
            <CatalogSelect
              catalog="estatusActivo"
              value={form.estatus}
              onChange={(_, v) => setForm({ ...form, estatus: v })}
              disabled={saving}
            />
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
