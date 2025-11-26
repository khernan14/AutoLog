import { useState, useEffect } from "react";
import { createBodega, updateBodega } from "../../services/BodegasServices";
import { getCities } from "../../services/LocationServices";
import {
  Drawer,
  Sheet,
  ModalClose,
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

export default function BodegaFormModal({ open, onClose, editing, onSaved }) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_ciudad: "",
  });
  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        nombre: editing.nombre,
        descripcion: editing.descripcion || "",
        id_ciudad: editing.id_ciudad || "",
      });
    } else {
      setForm({ nombre: "", descripcion: "", id_ciudad: "" });
    }
  }, [editing]);

  useEffect(() => {
    loadCities();
  }, []);

  async function loadCities() {
    try {
      const data = await getCities();
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Error al cargar ciudades", "danger");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      showToast("El nombre es requerido", "warning");
      return;
    }
    if (!form.id_ciudad) {
      showToast("Debe seleccionar una ciudad", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateBodega(editing.id, form);
        showToast("Bodega actualizada", "success");
      } else {
        await createBodega(form);
        showToast("Bodega creada", "success");
      }
      onClose && onClose();
      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Error al guardar bodega", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      anchor="right"
      size="md"
      variant="plain"
      open={open}
      onClose={saving ? undefined : onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: "transparent",
            p: { md: 3, sm: 0, xs: 0 },
            boxShadow: "none",
          },
        },
      }}>
      <Sheet
        component="form"
        onSubmit={onSubmit}
        variant="outlined"
        sx={{
          borderRadius: { xs: 0, md: "md" },
          width: { xs: "100%", sm: 520 },
          maxWidth: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.surface",
          overflow: "hidden",
        }}>
        {/* Header */}
        <Sheet
          variant="plain"
          sx={{
            p: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <Typography level="title-lg">
            {editing ? "Editar Bodega" : "Nueva Bodega"}
          </Typography>
          <ModalClose disabled={saving} />
        </Sheet>

        {/* Contenido scrollable */}
        <Stack
          spacing={1.5}
          sx={{
            p: 1.5,
            flex: 1,
            overflow: "auto",
          }}>
          <FormControl required>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              disabled={saving}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Input
              value={form.descripcion}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descripcion: e.target.value }))
              }
              disabled={saving}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Ciudad</FormLabel>
            <Select
              placeholder="Selecciona una ciudad"
              value={form.id_ciudad || ""}
              onChange={(_, v) =>
                setForm((prev) => ({ ...prev, id_ciudad: v || "" }))
              }
              disabled={saving}>
              {cities.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.ciudad}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider />

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ p: 1.5 }}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} disabled={saving}>
            Guardar
          </Button>
        </Stack>
      </Sheet>
    </Drawer>
  );
}
